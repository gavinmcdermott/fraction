'use strict'

// Globals
import _ from 'lodash'
import assert from 'assert'
import bodyParser from 'body-parser'
import express from 'express'
import moment from 'moment'
import mongoose from 'mongoose'
import q from 'q'
import requestP from 'request-promise'
import request from 'request'
import validator from 'validator'

// Locals
import { wrap } from './../../middleware/errorHandler'
import ensureFractionAdmin from './../../middleware/ensureFractionAdmin'
import fractionErrors from './../../utils/fractionErrors'
import serviceRegistry  from './../serviceRegistry'
import ensureAuth from './../common/passportJwt'

// DB Models
import Offering from './offeringModel'


// Use Q promises
mongoose.Promise = require('q').Promise

// The current service registry 
let registry = serviceRegistry.registry


// Constants

// Shares
const MIN_PROPERTY_SHARES = 1
const MAX_PROPERTY_SHARES = 1000

// naming
const SVC_NAME = 'offerings'
const SVC_BASE_URL = serviceRegistry.registry.apis.baseV1 + '/' + SVC_NAME

// routes
const ROUTE_CREATE_OFFERING = '/'
const ROUTE_GET_OFFERINGS = '/'
const ROUTE_GET_OFFERING = '/:offeringId'

const ROUTE_ADD_BACKER = '/:offeringId/backers'
const ROUTE_DELETE_BACKER = '/:offeringId/backers/:backerId'
const ROUTE_UPDATE_BACKER = '/:offeringId/backers/:backerId'


// Router 

// Expose a router to plug into the main express app
// The router serves as the interface for this service to the outside world
let router = express.Router()

// Middleware

// parse application/x-www-form-urlencoded
router.use(bodyParser.urlencoded({ extended: true }))
// parse application/json
router.use(bodyParser.json())


// API Routes

/**
 * Create a new offering for a property
 *
 * @param {req} obj Express request object
 * @param {res} obj Express response object
 * @returns {promise}
 */
function createOffering(req, res) {

  // used in the creation of a new offering
  let propertyId
  let price
  let quantity
  let token
  let userId

  if (req.error) {
    throw req.error
  }

  try {
    assert(req.user)
    assert(req.token)
    token = req.token
    userId = req.user.id
  } catch(e) {
    new fractionErrors.Unauthorized('invalid token')
  }

  try {
    assert(_.has(req.body, 'property'))
    propertyId = req.body.property
  } catch(e) {
    throw new fractionErrors.Invalid('invalid property')
  }

  try {
    assert(_.has(req.body, 'price'))
    assert(validator.isFloat(req.body.price))
    price = parseFloat(req.body.price).toFixed(2)
    assert(validator.isDecimal(price))
  } catch(e) {
    throw new fractionErrors.Invalid('invalid price')
  }  

  try {
    assert(_.has(req.body, 'quantity'))
    assert(validator.isInt(req.body.quantity, {
      min: MIN_PROPERTY_SHARES,
      max: MAX_PROPERTY_SHARES
    }))
    quantity = parseInt(req.body.quantity, 10)
  } catch(e) {
    throw new fractionErrors.Invalid('invalid quantity')
  }  

  // 1
  // Check if it's a real property  
  let getPropertyRoute = process.config.apiServer + serviceRegistry.registry.apis.baseV1 + '/properties/' + propertyId
  let getPropertyToken = token
  let getPropertyOptions = {
    method: 'GET',
    uri: getPropertyRoute,
    headers: { authorization: getPropertyToken }
  }

  return requestP(getPropertyOptions)
    // handle the property not existing
    .catch((err) => {
      let errorMessage = JSON.parse(err.error).message
      throw new fractionErrors.NotFound(errorMessage)
    })

    // 2
    // Check for prior offerings on this property to:
    // verify shares that can be offered, if another offering is open
    .then((returnedProp) => {
      return Offering.find({ property: propertyId })
    })
    .then((offerings) => {
      let partitionedOfferings = _.partition(offerings, offering => offering.status === Offering.status.open)
      let openOfferings = partitionedOfferings[0]
      let closedOfferings = partitionedOfferings[1]
      
      // Ensure no other open offerings exist 
      if (openOfferings.length) {
        throw new fractionErrors.Forbidden('existing open offering for this property')
      }

      // Ensure that the 1000 share aggregate limit is enforced
      let sharesIssued = _.reduce(closedOfferings, (result, offering, key) => {
        return result + offering.filled
      }, 0)
      if ((sharesIssued + quantity) > 1000) {
        throw new fractionErrors.Forbidden('aggregate shares issued cannot exceed 1000')
      }

      return true
    })
    .catch((err) => {
      if (err instanceof fractionErrors.BaseError) {
        throw err
      }
      throw new Error(err.message)
    })

    // 3
    // Save the new offering
    .then((data) => {
      let offering = {
        // description?
        // name?
        property: propertyId,
        addedBy: userId,
        price: price,
        status: Offering.status.open,
        quantity: quantity,
        filled: 0,
        remaining: quantity,
        dateOpened: moment.utc().valueOf(),
        dateClosed: null,
        backers: []
      }
      return Offering.create(offering)
    })
    .then((newOffering) => {
      return res.json({ offering: newOffering.toPublicObject() })
    })
    .catch((err) => {
      if (err instanceof fractionErrors.BaseError) {
        throw err
      }
      throw new Error(err.message)
    })
}


/**
 * Get all offerings
 * Can scope by query params: 
 * status: open, closed (if not included, it will retrieve both)
 * property: scope offerings by a property
 *
 * @param {req} obj Express request object
 * @param {res} obj Express response object
 * @returns {promise}
 */
function getOfferings(req, res) {

  // TODO: Add in: pagination; result limit

  let status
  let propertyId
  let query = {}

  if (req.error) {
    throw req.error
  }

  try {
    assert(req.user)
    assert(req.token)
  } catch(e) {
    new fractionErrors.Unauthorized('invalid token')
  }

  // set a status to search by
  if (_.has(req.query, 'status')) {
    try {
      status = req.query.status
      if (_.isString(status)) {
        assert(_.has(Offering.status, status))
        query.status = status
      }
    } catch(e) {
      throw new fractionErrors.Invalid('invalid status')
    }
  }

  // set a property to find by
  if ((_.has(req.query, 'property'))) {
    try {
      propertyId = req.query.property
      assert(_.isString(propertyId))
      query.property = propertyId
    } catch(e) {
      throw new fractionErrors.Invalid('invalid property')
    }
  }

  return Offering.find(query)
    .exec()
    .then((offerings) => {
      let sanitized = _.map(offerings, (offering) => {
        return offering.toPublicObject()
      })
      return res.json({ offerings: sanitized })
    })
    .catch((err) => {
      throw new Error(err.message)
    })
}


/**
 * Get a offerings for a single property
 *
 * @param {req} obj Express request object
 * @param {res} obj Express response object
 * @returns {promise}
 */
function getOffering(req, res) {

  let offeringId
  let query

  if (req.error) {
    throw req.error
  }

  try {
    assert(req.user)
    assert(req.token)
  } catch(e) {
    new fractionErrors.Unauthorized('invalid token')
  }

  try {
    assert(req.params.offeringId)
    offeringId = req.params.offeringId
  } catch (err) {
    throw new fractionErrors.Invalid('invalid offeringId')
  }
  
  query = {
    _id: offeringId
  }

  return Offering.findById(query)
    .exec()
    .then((offering) => {
      if (!offering) {
        throw new fractionErrors.NotFound('offer not found')
      }
      return res.json({ offering: offering.toPublicObject() })
    })
    .catch((err) => {
      if (err instanceof fractionErrors.BaseError) {
        throw err
      }
      throw new Error(err.message)
    })
}


/**
 * Adds a backer to a property's offering
 *
 * @param {req} obj Express request object
 * @param {res} obj Express response object
 * @returns {promise}
 */

function addBacker(req, res) {

  let query
  let backerId
  let offeringId
  let shares

  if (req.error) {
    throw req.error
  }

  try {
    assert(req.user)
    assert(req.token)
  } catch(e) {
    new fractionErrors.Unauthorized('invalid token')
  }

  try {
    assert(req.params.offeringId)
    offeringId = req.params.offeringId
  } catch (err) {
    throw new fractionErrors.Invalid('invalid offeringId')
  }

  try {
    assert(req.body.backer)
    backerId = req.body.backer
  } catch (err) {
    throw new fractionErrors.Invalid('invalid backer')
  }

  try {
    assert(req.body.shares)
    assert(validator.isInt(req.body.shares, {
      min: MIN_PROPERTY_SHARES,
      max: MAX_PROPERTY_SHARES
    }))
    shares = parseInt(req.body.shares, 10)
  } catch (err) {
    throw new fractionErrors.Invalid('invalid shares')
  }

  query = {
    _id: offeringId
  }

  return Offering.findOne(query)
    .then((offering) => {
      // ensure the offering exists
      if (!offering) {
        throw new fractionErrors.NotFound('offering not found')
      }

      // ensure that the backer isnt in the document yet
      let backerExists = _.filter(offering.backers, backer => backer.user.toString() === backerId).length
      if (backerExists) {
        throw new fractionErrors.Forbidden('backer exists')
      }

      // ensure that max of 1000 isn't being exceeded
      let newFillCount = offering.filled + shares
      if (newFillCount > offering.quantity) {
        throw new fractionErrors.Invalid('invalid share quantity')     
      }

      // atomically update the offering
      return Offering.findByIdAndUpdate(
        offeringId, { 
          '$push': { 'backers': { 'user': backerId, 'quantity': shares } },
          '$inc': { 'filled': shares, 'remaining': -shares }
        }, { 
          new: true // return the updated document
        }
      )
    })
    .then((updated) => {
      return res.json({ offering: updated.toPublicObject() })
    })
    .catch((err) => {
      if (err instanceof fractionErrors.BaseError) {
        throw err
      }
      throw new Error(err.message)
    })
}


/**
 * Update a backer in a property's offering
 *
 * @param {req} obj Express request object
 * @param {res} obj Express response object
 * @returns {promise}
 */

function updateBacker(req, res) {
  // TODO : fill in
}


/**
 * Removes a backer to a property's offering
 *
 * @param {req} obj Express request object
 * @param {res} obj Express response object
 * @returns {promise}
 */

function deleteBacker(req, res) {
  // TODO : fill in
}


// Routes

router.post(ROUTE_CREATE_OFFERING, ensureAuth, ensureFractionAdmin, wrap(createOffering))
router.get(ROUTE_GET_OFFERINGS, ensureAuth, wrap(getOfferings))
router.get(ROUTE_GET_OFFERING, ensureAuth, wrap(getOffering))
router.post(ROUTE_ADD_BACKER, ensureAuth, wrap(addBacker))

router.put(ROUTE_UPDATE_BACKER, ensureAuth, wrap(updateBacker))
router.delete(ROUTE_DELETE_BACKER, ensureAuth, ensureFractionAdmin, wrap(deleteBacker))


// Exports
module.exports = {
  name: SVC_NAME,
  url: SVC_BASE_URL,
  router: router,
  endpoints: {
    // Offerings
    createOffering: { protocol: 'HTTP', method: 'POST', name: 'createOffering', url: ROUTE_CREATE_OFFERING },
    getOfferings: { protocol: 'HTTP', method: 'GET', name: 'getOfferings', url: ROUTE_GET_OFFERINGS },
    getOffering: { protocol: 'HTTP', method: 'GET', name: 'getOffering', url: ROUTE_GET_OFFERING },
    // Backers for an offering
    addBacker: { protocol: 'HTTP', method: 'POST', name: 'addBacker', url: ROUTE_ADD_BACKER },
    updateBacker: { protocol: 'HTTP', method: 'PUT', name: 'updateBacker', url: ROUTE_UPDATE_BACKER },
    deleteBacker: { protocol: 'HTTP', method: 'DELETE', name: 'deleteBacker', url: ROUTE_DELETE_BACKER },
  }
}

// Register with the app service registry
serviceRegistry.registry.register(module.exports)

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
import fractionErrors from './../../utils/fractionErrors'
import { requireAuth } from './../../middleware/tokenAuth'
import { wrap } from './../../middleware/errorHandler'
import serviceRegistry  from './../serviceRegistry'

// DB Models
import Offering from './offeringModel'

// Use Q promises
mongoose.Promise = require('q').Promise

// The current service registry 
let registry = serviceRegistry.registry


// Constants

// naming
const SVC_NAME = 'offerings'
const SVC_BASE_URL = serviceRegistry.registry.apis.baseV1 + '/' + SVC_NAME

// routes
const ROUTE_CREATE_OFFERING = '/'
const ROUTE_GET_OFFERINGS = '/'
const ROUTE_GET_OFFERING = '/:offeringId'


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

  try {
    assert(req.body.token)
    assert(req.body.userId)
    token = req.body.token
    userId = req.body.userId
  } catch(e) {
    throw new fractionErrors.Unauthorized('invalid token')
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
      min: 1,
      max: 1000
    }))
    quantity = parseInt(req.body.quantity, 10)
  } catch(e) {
    throw new fractionErrors.Invalid('invalid quantity')
  }  

  // 1
  // Check if it's a real property  
  let getPropertyRoute = process.config.apiServer + serviceRegistry.registry.apis.baseV1 + '/properties/' + propertyId
  let getPropertyToken = 'Bearer ' + token
  let getPropertyOptions = {
    method: 'GET',
    uri: getPropertyRoute,
    headers: { authorization: getPropertyToken }
  }

  return requestP(getPropertyOptions)
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
 *
 * @param {req} obj Express request object
 * @param {res} obj Express response object
 * @returns {promise}
 */
function getOfferings(req, res) {

  // TODO: Add in: pagination; result limit; by house;  by open / closed

  let status
  let propertyId
  let query = {}

  try {
    assert(req.body.userId)
    assert(req.body.token)
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

  try {
    assert(req.body.userId)
    assert(req.body.token)
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
    // status: Offering.status.open,
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







// Routes

router.post(ROUTE_CREATE_OFFERING, requireAuth, wrap(createOffering))
router.get(ROUTE_GET_OFFERINGS, requireAuth, wrap(getOfferings))
router.get(ROUTE_GET_OFFERING, requireAuth, wrap(getOffering))


// Exports
module.exports = {
  name: SVC_NAME,
  url: SVC_BASE_URL,
  router: router,
  endpoints: {
    createOffering: { protocol: 'HTTP', method: 'POST', name: 'createOffering', url: ROUTE_CREATE_OFFERING },
    getOfferings: { protocol: 'HTTP', method: 'GET', name: 'getOfferings', url: ROUTE_GET_OFFERINGS },
    getOffering: { protocol: 'HTTP', method: 'GET', name: 'getOffering', url: ROUTE_GET_OFFERING },
  }
}

// Register with the app service registry
serviceRegistry.registry.register(module.exports)

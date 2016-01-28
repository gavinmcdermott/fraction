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

// configuration for currency validation
let currencyValidationConfig = {
  require_symbol: false,
  symbol_after_digits: false, 
  allow_negatives: false
}


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
    price = req.body.price
    assert(validator.isCurrency(price, currencyValidationConfig))
    assert(!validator.isDecimal(price))
  } catch(e) {
    throw new fractionErrors.Invalid('invalid price')
  }  

  try {
    assert(_.has(req.body, 'quantity'))
    quantity = req.body.quantity
    assert(!validator.isDecimal(quantity))
    assert(quantity <= 1000)
  } catch(e) {
    throw new fractionErrors.Invalid('invalid quantity')
  }  

  // 1
  // Check if it's a real property  
  let getPropertyRoute = process.config.apiServer + serviceRegistry.registry.apis.baseV1 + '/properties/' + property
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
      return Offering.find({ property: property })
    })
    .then((offerings) => {
      console.log('found offerings', offerings)
      // if any are currently open; throw - 2 cannot be open at the same time
      // get the number of shares that have been offered previously in closed ones
      // ensure that we can offer the number we want
      return {
        foo: 123
      }
    })
    .catch((err) => {
      if (err instanceof fractionErrors.BaseError) {
        throw err
      }
      console.log(err.message)
      throw new fractionErrors.NotFound('property not found')
    })

    // 3
    // Save the new offering
    .then((data) => {
      let offering = {
        property: propertyId,
        addedBy: userId,
        price: price,
        quantity: quantity,
        status: Offering.status.open,
        filled: 0,
        remaining: quantity,
        dateOpened: moment.utc().valueOf(),
        dateClosed: null,
        backers: []
      }
      console.log('ABOUT TO SAVE: ', offering)
      console.log('=========')
      console.log('')
      return offering.save()
    })
    .then((newOffering) => {
      console.log('SAVED: ', newOffering)
      return res.json({ offering: newOffering.toPublicObject() })
    })
    .catch((err) => {
      if (err instanceof fractionErrors.BaseError) {
        throw err
      }
      console.log(err.message)
      throw new Error(err)
    })
}


/**
 * Get all offerings or a specifc property
 *
 * @param {req} obj Express request object
 * @param {res} obj Express response object
 * @returns {promise}
 */
function getProperty(req, res) {

  // let propertyId

  // try {
  //   assert(req.body.userId)
  //   assert(req.body.token)
  // } catch(e) {
  //   new fractionErrors.Unauthorized('invalid token')
  // }

  // try {
  //   assert(req.params.propertyId)
  //   propertyId = req.params.propertyId
  // } catch (err) {
  //   throw new fractionErrors.Invalid('invalid propertyId')
  // }

  // return Property.findById({ _id: propertyId })
  //   .exec()
  //   .catch((err) => {
  //     throw new fractionErrors.Invalid('invalid propertyId')
  //   })
  //   .then((property) => {
  //     if (!property) {
  //       throw new fractionErrors.NotFound('property not found')  
  //     }
  //     return res.json({ property: property.toPublicObject() })
  //   })
  //   .catch((err) => {
  //     // console.log(err)
  //     if (err instanceof fractionErrors.BaseError) {
  //       throw err
  //     }
  //     throw new fractionErrors.NotFound('property not found')
  //   })
}







// Routes

router.post(ROUTE_CREATE_OFFERING, requireAuth, wrap(createOffering))


// Exports
module.exports = {
  name: SVC_NAME,
  url: SVC_BASE_URL,
  router: router,
  endpoints: {
    createOffering: { protocol: 'HTTP', method: 'POST', name: 'createOffering', url: ROUTE_CREATE_OFFERING },
  }
}

// Register with the app service registry
serviceRegistry.registry.register(module.exports)

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
import validator from 'validator'

// Locals

import serviceRegistry  from './../serviceRegistry'
import fractionErrors from './../../utils/fractionErrors'
import { requireAuth } from './../../middleware/tokenAuth'
import { wrap } from './../../middleware/errorHandler'
// DB Models
import { Investment, InvestmentInterest } from './investmentModel'

// Use Q promises
mongoose.Promise = require('q').Promise

// The current service registry
let registry = serviceRegistry.registry


// Constants

// naming
const SVC_NAME = 'investments'
const SVC_BASE_URL = serviceRegistry.registry.apis.baseV1 + '/' + SVC_NAME

// routes
const ROUTE_CREATE_INVESTMENT = '/'


// Router

// Expose a router to plug into the main express app
// The router serves as the interface for this service to the outside world
let router = express.Router()


// Middleware

// parse application/x-www-form-urlencoded
router.use(bodyParser.urlencoded({ extended: true }))
// parse application/json
router.use(bodyParser.json())


// Public API Functions

/**
 * Create a new Investment for a user
 *
 * @param {req} obj Express request object
 * @param {res} obj Express response object
 * @returns {promise}
 */
function createInvestment(req, res) {  

  // check if the property exists
  // get fraction's company id?

  let property
  let interests

  // validate property
  try {
    property = req.body.property
    assert(_.isString(property))
  } catch(e) {
    throw new fractionErrors.Invalid('invalid property')
  }

  // validate interests
  try {
    assert(req.body.interests)
    interests = parseInt(req.body.interests, 10)
    assert(_.isNumber(interests))
  } catch(e) {
    throw new fractionErrors.Invalid('invalid interests')
  }

  let now = moment.utc().valueOf()

  let newInvestment = {
    date: now,
    propertyId: property,
    total: interests,
    // ownerId: 456,
    interests: [{
      type: InvestmentInterest.types.newInvestment,
      dateCanSell: now,
      total: interests 
    }]
  }

  return Investment.create(newInvestment)
    .then((investment) => {
      return res.json({ investment: investment.toPublicObject() })
    })
    .catch((err) => {
      if (err instanceof fractionErrors.Forbidden) {
        throw err
      }
      throw new Error(err)
    })
}


router.post(ROUTE_CREATE_INVESTMENT, requireAuth, wrap(createInvestment))


// Exports

module.exports = {
  name: SVC_NAME,
  url: SVC_BASE_URL,
  router: router,
  endpoints: [
    { protocol: 'HTTP', method: 'POST', name: 'CREATE_INVESTMENT', url: ROUTE_CREATE_INVESTMENT }
  ]
}


// Register with the app service registry
serviceRegistry.registry.register(module.exports)

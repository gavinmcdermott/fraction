'use strict'


// Globals
import _ from 'lodash'
import assert from 'assert'
import bodyParser from 'body-parser'
import express from 'express'
import moment from 'moment'
import mongoose from 'mongoose'
import q from 'q'
import validator from 'validator'


// Locals
import fractionErrors from './../../utils/fractionErrors'
import serviceRegistry  from './../serviceRegistry'
import { wrap } from './../../middleware/errorHandler'

import ensureFractionAdmin from './../../middleware/ensureFractionAdmin'

import authUser from './../common/passportLocal'
import ensureAuth from './../common/passportJwt'

// DB Models
import User from './userModel'

// Use Q promises
mongoose.Promise = require('q').Promise


// Constants

// naming
const SVC_NAME = 'users'
const SVC_BASE_URL = serviceRegistry.registry.apis.baseV1 + '/' + SVC_NAME

// routes
const ROUTE_CREATE_USER = '/'
const ROUTE_UPDATE_USER = '/:userId'
const ROUTE_GET_USER = '/:userId'
const ROUTE_LOG_IN_USER = '/login'
const ROUTE_LOG_OUT_USER = '/logout'


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
 * Create a new fraction user
 *
 * @param {req} obj Express request object
 * @param {res} obj Express response object
 * @returns {promise}
 */
function createUser(req, res) {  

  // New user info to be saved
  let email
  let hashedPassword
  let firstName
  let lastName

  if (req.error) {
    throw req.error
  }

  // validate email
  try {
    assert(_.isString(req.body.email))
    email = validator.toString(req.body.email).toLowerCase()
    assert(validator.isEmail(email))
  } catch(e) {
    throw new fractionErrors.Invalid('invalid email')    
  }

  // validate password
  try {
    assert(_.isString(req.body.password))
    hashedPassword = validator.toString(req.body.password)
    assert(hashedPassword.length)
  } catch(e) {
    throw new fractionErrors.Invalid('invalid password')
  }

  // validate names
  try {
    assert(_.isString(req.body.firstName))
    firstName = validator.toString(req.body.firstName)
    assert(firstName.length)
  } catch(e) {
    throw new fractionErrors.Invalid('invalid first name')
  }

  try {
    assert(_.isString(req.body.lastName))
    lastName = validator.toString(req.body.lastName)
    assert(lastName.length)
  } catch(e) {
    throw new fractionErrors.Invalid('invalid last name')
  }  

  let pendingUser = {
    name: {
      first: firstName,
      last: lastName
    },
    email: {
      email: email,
      // TODO(gavin): ENABLE EMAIL VERIFICATION
      verified: true,
      verifyCode: '123',
      verifySentAt: moment.utc().valueOf()
    },
    local: {
      password: hashedPassword
    },
    isActive: true,
    scopes: User.scopes.fraction.user
  }

  return User.findOne({ 'email.email': email })
    .then((user) => {
      if (user) {
        throw new fractionErrors.Forbidden('user exists')
      }
      return User.create(pendingUser)
    })
    .then((newUser) => {
      return res.json({ user: newUser.toPublicObject() })
    })
    .catch((err) => {
      if (err instanceof fractionErrors.Forbidden) {
        throw err
      }
      console.log(err.message)
      throw new Error(err)
    })
}


/**
 * Update an existing fraction user
 *
 * @param {req} obj Express request object
 * @param {res} obj Express response object
 * @returns {promise}
 */
function updateUser(req, res) {

  let userId

  // Will be a Fraction Error instance
  if (req.error) {
    throw req.error
  }

  try {
    assert(req.body.user)
  } catch(e) {
    new fractionErrors.Unauthorized('invalid token')
  }

  try {
    assert(req.params.userId)
    userId = req.params.userId
  } catch (err) {
    throw new fractionErrors.Invalid('invalid userid')
  }

  return User.findById({ _id: userId })
    .exec()
    .catch((err) => {
      // handle case where the user is missing
      throw new fractionErrors.NotFound('user not found')
    })
    .then((existingUser) => {
      
      if (!existingUser) {
        throw new fractionErrors.NotFound('user not found')
      }

      let email = req.body.user.email
      let name = req.body.user.name
      let notifications = req.body.user.notifications

      // Check out the names
      if (_.isObject(name)) {
        if (_.has(name, 'first')) {
          try {
            assert(_.isString(name.first))
            assert(name.first.length)
            existingUser.name.first = name.first
          } catch(e) {
            throw new fractionErrors.Invalid('invalid first name')
          }
        }

        if (_.has(name, 'last')) {
          try {
            assert(_.isString(name.last))
            assert(name.last.length)
            existingUser.name.last = name.last
          } catch(e) {
            throw new fractionErrors.Invalid('invalid last name')
          }
        }
      }

      // Check out the email
      if (_.isObject(email)) {

        if (_.has(email, 'email')) {
          let newEmail = email.email.toLowerCase()
          try {
            assert(_.isString(newEmail))
            assert(validator.isEmail(newEmail))
            existingUser.email.email = newEmail
          } catch(err) {
            throw new fractionErrors.Invalid('invalid email')
          }
        }
      }

      // Check out the notifications
      if (_.isObject(notifications)) {
        
        if (_.has(notifications, 'viaEmail')) {
          try {
            assert(validator.isBoolean(notifications.viaEmail))
            existingUser.notifications.viaEmail = validator.toBoolean(notifications.viaEmail)
          } catch(e) {
            throw new fractionErrors.Invalid('invalid email notification setting')
          }
        }
      }
      return existingUser.save()
    })
    .then((updatedUser) => {
      return res.json({ user: updatedUser.toPublicObject() })
    })
    .catch((err) => {
      if (err instanceof fractionErrors.BaseError) {
        throw err
      }
      console.log(err.message)
      throw new fractionErrors.NotFound('user not found')
    })
}


/**
 * Get a fraction user
 *
 * @param {req} obj Express request object
 * @param {res} obj Express response object
 * @returns {promise}
 */
function getUser(req, res) {

  const FETCH_ME = 'me'
  let idToFetch = req.params.userId

  // Will be a Fraction Error instance
  if (req.error) {
    throw req.error
  }

  try {
    assert(req.user)
  } catch(e) {
    new fractionErrors.Unauthorized('invalid token')
  }

  if (req.params.userId === FETCH_ME) {
    return res.json({ user: req.user })
  }

  return User.findById({ _id: idToFetch })
    .then((user) => {
      if (!user) {
        throw new fractionErrors.NotFound('user not found')
      }
      // sanitize any user's details down to the id for now
      let sanitizedUser = {
        id: user.id
      }
      return res.json({ user: sanitizedUser })
    })
    .catch((err) => {
      if (err instanceof fractionErrors.BaseError) {
        throw err
      }
      throw new fractionErrors.NotFound('user not found')
    })
}


/**
 * Log in a fraction user
 *
 * @param {req} obj Express request object
 * @param {res} obj Express response object
 * @returns {promise}
 */
function logInUser(req, res) {
  if (req.error) {
    throw req.error
  }
  if (req.token && req.user) {
    return res.json({ token: req.token, user: req.user })
  }
}


/**
 * Log out a fraction user
 * TODO: Improve authentication (expire tokens, oauth2, or something else)
 *
 * @param {req} obj Express request object
 * @param {res} obj Express response object
 * @returns {promise}
 */
function logOutUser(req, res) {
  return res.json({ token: null, user: null })
}


// Routes

router.post(ROUTE_CREATE_USER, wrap(createUser))
// remove the ensureAuth
router.post(ROUTE_LOG_IN_USER, authUser, wrap(logInUser))

router.post(ROUTE_LOG_OUT_USER, wrap(logOutUser))
router.put(ROUTE_UPDATE_USER, ensureAuth, wrap(updateUser))
router.get(ROUTE_GET_USER, ensureAuth, wrap(getUser))


// Exports

module.exports = {
  name: SVC_NAME,
  url: SVC_BASE_URL,
  router: router,
  endpoints: {
    createUser: { protocol: 'HTTP', method: 'POST', name: 'createUser', url: ROUTE_CREATE_USER },
    logInUser: { protocol: 'HTTP', method: 'POST', name: 'logInUser', url: ROUTE_LOG_IN_USER },
    logOutUser: { protocol: 'HTTP', method: 'POST', name: 'logOutUser', url: ROUTE_LOG_OUT_USER },
    updateUser: { protocol: 'HTTP', method: 'PUT', name: 'updateUser', url: ROUTE_UPDATE_USER },
    getUser: { protocol: 'HTTP', method: 'GET', name: 'getUser', url: ROUTE_GET_USER }
  }
}


// Register with the app service registry
serviceRegistry.registry.register(module.exports)

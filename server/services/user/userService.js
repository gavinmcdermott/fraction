'use strict'


// Globals

import _ from 'lodash'
import assert from 'assert'
import bodyParser from 'body-parser'
import express from 'express'
import jwt from 'jsonwebtoken'
import moment from 'moment'
import mongoose from 'mongoose'
import q from 'q'
import validator from 'validator'


// Locals

import fractionErrors from './../../utils/fractionErrors'
import serviceRegistry  from './../serviceRegistry'
import { requireAuth } from './../../middleware/tokenAuth'
import { wrap } from './../../middleware/errorHandler'
// DB Models
import User from './userModel'


// Use Q promises
mongoose.Promise = require('q').Promise


// Constants

// naming
const SVC_NAME = 'user'
const SVC_BASE_URL = serviceRegistry.registry.apis.baseV1 + '/' + SVC_NAME

// routes
const ROUTE_CREATE_USER = '/'
const ROUTE_UPDATE_USER = '/:userId'
const ROUTE_GET_USER = '/:userId'
const ROUTE_LOG_IN_USER = '/login'
const ROUTE_LOG_OUT_USER = '/logout'

const FRACTION_TOKEN_SECRET = process.config.fraction.tokenSecret
const FRACTION_TOKEN_ISSUER = process.config.fraction.clientId


// Router

// Expose a router to plug into the main express app
// The router serves as the interface for this service to the outside world
let router = express.Router()


// Middleware

// parse application/x-www-form-urlencoded
router.use(bodyParser.urlencoded({ extended: true }))
// parse application/json
router.use(bodyParser.json())


// Private Helpers
/**
 * Generate a signed jwt for a user
 *
 * @returns {token} string New signed web token
 */
let generateToken = function(userId) {
  assert(userId)
  let now = moment.utc()
  let payload = {
    iss: FRACTION_TOKEN_ISSUER,
    exp: moment(now).add(1, 'day').utc().valueOf(),
    iat: now.valueOf(),
    sub: userId
  }
  return jwt.sign(payload, FRACTION_TOKEN_SECRET)
}


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
    fractionEmployee: false
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

  let userId = req.params.userId
  try {
    assert(userId)
    assert(userId.length)
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
  let idToFetch

  try {
    assert(req.body.userId)
    assert(req.body.token)
  } catch(e) {
    new fractionErrors.Unauthorized('invalid token')
  }

  if (req.params.userId === 'me') {
    idToFetch = req.body.userId
  } else {
    idToFetch = req.params.userId
  }

  if (!idToFetch) {
    throw new fractionErrors.Invalid('invalid userid')
  }

  return User.findById({_id: idToFetch})
    .then((user) => {
      if (!user) {
        throw new fractionErrors.NotFound('user not found')
      }
      // If the request is for the app's current user, send full details
      if (req.params.userId === FETCH_ME) {
        return res.json({ user: user.toPublicObject() })      
      }
      // otherwise sanitize the details
      let sanitizedUser = {
        email: user.email
      }
      return res.json({ user: sanitizedUser })
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
 * Log in a fraction user
 *
 * @param {req} obj Express request object
 * @param {res} obj Express response object
 * @returns {promise}
 */
function logInUser(req, res) {

  let email
  let hashedPassword

  // validate email
  try {
    assert(_.isString(req.body.email))
    email = validator.toString(req.body.email).toLowerCase()
    assert(validator.isEmail(email))
  } catch(e) {
    throw new fractionErrors.Invalid('invalid email')    
  }

  // password
  try {
    assert(_.isString(req.body.password))
    hashedPassword = validator.toString(req.body.password)
    assert(hashedPassword.length)
  } catch(e) {
    throw new fractionErrors.Invalid('invalid password')
  }

  return User.findOne({ 'email.email': email, 'local.password': hashedPassword })
    .then((user) => {
      if (!user) {
        throw new fractionErrors.NotFound('user not found')
      }      
      let token

      try {
        token = generateToken(user._id.toString())
      } catch (err) {
        throw new Error('error generating user token')
      }
      return res.json({ token: token, user: user.toPublicObject() })
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
 * Log out a fraction user
 *
 * @param {req} obj Express request object
 * @param {res} obj Express response object
 * @returns {promise}
 */
function logOutUser(req, res) {

}


// Routes

router.post(ROUTE_LOG_IN_USER, wrap(logInUser))
router.post(ROUTE_LOG_OUT_USER, requireAuth, wrap(logOutUser))

router.post(ROUTE_CREATE_USER, wrap(createUser))
router.put(ROUTE_UPDATE_USER, requireAuth, wrap(updateUser))
router.get(ROUTE_GET_USER, requireAuth, wrap(getUser))


// Exports

module.exports = {
  name: SVC_NAME,
  url: SVC_BASE_URL,
  router: router,
  endpoints: [
    { protocol: 'HTTP', method: 'POST', name: 'CREATE_USER', url: ROUTE_CREATE_USER },
    { protocol: 'HTTP', method: 'PUT', name: 'UPDATE_USER', url: ROUTE_UPDATE_USER },
    { protocol: 'HTTP', method: 'GET', name: 'GET_USER', url: ROUTE_GET_USER },
    { protocol: 'HTTP', method: 'POST', name: 'LOG_IN_USER', url: ROUTE_LOG_IN_USER },
    { protocol: 'HTTP', method: 'POST', name: 'LOG_OUT_USER', url: ROUTE_LOG_OUT_USER }
  ]
}


// Register with the app service registry
serviceRegistry.registry.register(module.exports)

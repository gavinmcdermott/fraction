'use strict'


// Globals

import http from 'http';
import _ from 'lodash';
import assert from 'assert';
import bodyParser from 'body-parser';
import express from 'express';
import jwt from 'jsonwebtoken';
import moment from 'moment';
import requestP from 'request-promise';
import url from 'url';
import validator from 'validator';


// Locals

import fractionErrors from './../../utils/fractionErrors';
import middlewareErrors from './../../middleware/errorHandler';
import middlewareAuth from './../../middleware/tokenAuth';
import serviceRegistry from './../serviceRegistry';


// The current service registry
let registry = serviceRegistry.registry;


// Constants

// secrets
const FRACTION_TOKEN_SECRET = process.config.fraction.tokenSecret;
const FRACTION_TOKEN_ISSUER = process.config.fraction.clientId;

// module naming
const SVC_NAME = 'auth';
const SVC_BASE_URL = registry.apis.baseV1 + '/auth';

// module routes
const ROUTE_LOG_IN = '/login';

// external service route
// TODO: figure out a good config for this
// TODO: figure out a good config for this
// TODO: figure out a good config for this
const ROUTE_CHECK_USER_EXISTS = process.config.apiServer 
                                + serviceRegistry.registry.apis.baseV1 
                                + '/user/internal/check_existence'


// Private Helpers
/**
 * Generate a signed jwt for a user
 *
 * @returns {token} string New signed web token
 */
let generateToken = function(user) {
  assert(user.id)
  let now = moment.utc()
  let payload = {
    iss: FRACTION_TOKEN_ISSUER,
    exp: moment(now).add(1, 'day').utc().valueOf(),
    iat: now.valueOf(),
    sub: user.id
  }
  return jwt.sign(payload, FRACTION_TOKEN_SECRET)
}


// Router

// Expose a router to plug into the main express app
// The router serves as the interface for this service to the outside world
let router = express.Router();


// Middleware

// parse application/x-www-form-urlencoded
router.use(bodyParser.urlencoded({ extended: true }));
// parse application/json
router.use(bodyParser.json());


// API

/**
 * Authenticate a user
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
    assert(_.isString(req.body.email));
    email = validator.toString(req.body.email).toLowerCase();
    assert(validator.isEmail(email));
  } catch(e) {
    throw new fractionErrors.Invalid('invalid email');    
  }

  // password
  try {
    assert(_.isString(req.body.password));
    hashedPassword = validator.toString(req.body.password);
    assert(hashedPassword.length);
  } catch(e) {
    throw new fractionErrors.Invalid('invalid password');
  }

  // Build a request to the user service to check for existence
  var options = {
      method: 'POST',
      uri: ROUTE_CHECK_USER_EXISTS,
      body: {
        findByEmail: true,
        emails: [ email ]
      },
      json: true // requestP now automatically stringifies this to JSON
  }

  // TODO: Add a signed token from this call to allow the other endpoint
  // to know it was called from the fraction service internally

  // Check the user's validity with user service
  return requestP.post(options)
    .then((data) => {
      let user
      let token
      assert(data.users.length === 1)
      // Generate a new token for the user
      try {
        user = _.first(data.users)
        token = generateToken(user)
      } catch (err) {
        throw new Error('error generating user token')
      }
      return res.json({ token: token, user: user })
    })
    .catch((response) => {
      // TODO: handle errors from requestP
      // TODO: handle errors from requestP
      // TODO: handle errors from requestP

      // This will have been formatted by throwing from the
      let errorMessage = (response.error && response.error.message) || response
      if (_.contains(errorMessage, 'invalid')) {
        throw new fractionErrors.Invalid(errorMessage)
      }
      throw new fractionErrors.NotFound(errorMessage)
    })
}


// Routes

router.post(ROUTE_LOG_IN, middlewareErrors.wrap(logInUser));


// Exports

module.exports = {
  name: SVC_NAME,
  url: SVC_BASE_URL,
  router: router,
  endpoints: [
    { protocol: 'HTTP', method: 'POST', name: 'LOG_IN_USER', url: ROUTE_LOG_IN }
  ]
};


// Register with the app service registry
serviceRegistry.registry.register(module.exports);

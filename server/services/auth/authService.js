'use strict'

// Globals
import _ from 'lodash';
import assert from 'assert';
import bodyParser from 'body-parser';
import express from 'express';
import jwt from 'jsonwebtoken';
import moment from 'moment';
import mongoose from 'mongoose';
import q from 'q';
import url from 'url';
import validator from 'validator';

// Locals
import fractionErrors from './../../utils/fractionErrors';
import middlewareErrors from './../../middleware/errorHandler';
import middlewareAuth from './../../middleware/tokenAuth';
import serviceRegistry  from './../serviceRegistry';
// DB Models
import User from './../user/userModel';


// Use Q promises
mongoose.Promise = require('q').Promise;


// Constants

const FRACTION_TOKEN_SECRET = process.config.fraction.tokenSecret;
const FRACTION_TOKEN_ISSUER = process.config.fraction.clientId;

// Naming
const SVC_NAME = 'auth';
const SVC_BASE_URL = serviceRegistry.registry.apis.baseV1 + '/auth';

// Routes
const ROUTE_LOG_IN = '/login';


// Service setup

// Router

// Expose a router to plug into the main express app
// The router serves as the interface for this service to the outside world
let router = express.Router();


// Middleware

// parse application/x-www-form-urlencoded
router.use(bodyParser.urlencoded({ extended: true }));
// parse application/json
router.use(bodyParser.json());


// Private Helpers

/**
 * Generate a signed jwt for a user
 *
 * @returns {token} string New signed web token
 */
let generateToken = function() {
  let now = moment.utc();
  let payload = {
    iss: FRACTION_TOKEN_ISSUER,
    exp: moment(now).add(1, 'day').utc().valueOf(),
    iat: now.valueOf()
  };
  return jwt.sign(payload, FRACTION_TOKEN_SECRET);
}


/**
 * Authenticate a user
 *
 * @param {req} obj Express request object
 * @param {res} obj Express response object
 * @returns {promise}
 */
function logInUser(req, res) {

  let email;
  let hashedPassword;

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

  return User.findOne({ 'email.email': email, 'local.password': hashedPassword })
    .then((user) => {
      if (!user) {
        throw new fractionErrors.NotFound('user not found');
      }

      // Generate a new token for the user
      let token;
      try {
        token = generateToken(req);
      } catch (err) {
        throw new Error('error generating user token');
      }
      return res.json({ token: token, user: user.toPublicObject() });
    })
    .catch((err) => {
      if (err instanceof fractionErrors.NotFound) {
        throw err;
      }
      throw new Error(err.message);
    });
};



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

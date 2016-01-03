'use strict'

// Globals
import _ from 'lodash';
import assert from 'assert';
import bodyParser from 'body-parser';
import express from 'express';
import url from 'url';
import validator from 'validator';

// Locals
import User from './userModel';
import fractionErrors from './../../middleware/errorHandler';
import { registry }  from './../serviceRegistry';
import { verify } from './../../middleware/serviceDispatch';


// Constants

// Naming
const SVC_NAME = 'user';
const SVC_BASE_URL = registry.apis.baseV1 + '/user';

// Routes
const ROUTE_CREATE_USER = '/';


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


// API

/**
 * Create a new fraction user
 *
 * @param {req} obj Express request object
 * @param {res} obj Express response object
 * @returns {promise}
 */
router.post(ROUTE_CREATE_USER, fractionErrors.wrap((req, res) => {  

  // New user info to be saved
  let email;
  let hashedPassword;
  let firstName;
  let lastName;

  // validate email
  try {
    assert(_.isString(req.body.email));
    email = validator.toString(req.body.email);
    assert(validator.isEmail(email));
  } catch(e) {
    throw new fractionErrors.Invalid('invalid email');    
  }

  // validate password
  try {
    assert(_.isString(req.body.password));
    hashedPassword = validator.toString(req.body.password);
    assert(hashedPassword.length);
  } catch(e) {
    throw new fractionErrors.Invalid('invalid password');
  }

  // validate names
  try {
    assert(_.isString(req.body.firstName));
    firstName = validator.toString(req.body.firstName);
    assert(firstName.length);
  } catch(e) {
    throw new fractionErrors.Invalid('invalid first name');
  }

  try {
    assert(_.isString(req.body.lastName));
    lastName = validator.toString(req.body.lastName);
    assert(lastName.length);
  } catch(e) {
    throw new fractionErrors.Invalid('invalid last name');
  }  

  return User
    .findOne({ 'local.id': email })
    .exec()  // `.exec()` gives us a fully-fledged promise
    .then((user) => {
      if (user && user.isActive) {
        throw new fractionErrors.Forbidden('user exists');
      }

      let pendingUser = {
        name: {
          first: firstName,
          last: lastName
        },
        email: {
          email: email,
          // ========================
          // TODO(gavin): ENABLE EMAIL VERIFICATION
          // ========================
          verified: true,
          verifyCode: '123',
          verifySentAt: new Date().toString()
        },
        local: {
          id: email,
          password: hashedPassword
        },
        isActive: true,
        fractionEmployee: false
      };
      return User.create(pendingUser);
    })
    .then((newUser) => {
      return res.json({ user: newUser.toPublicObject() });
    });
}));


// Export the service as an object
module.exports = {
  name: SVC_NAME,
  url: SVC_BASE_URL,
  router: router,
  endpoints: [
    { protocol: 'HTTP', method: 'POST', name: 'CREATE_USER', url: ROUTE_CREATE_USER }
  ]
};

// Register with the app service registry
registry.register(module.exports);

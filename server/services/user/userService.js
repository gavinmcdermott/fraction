'use strict'


// Globals

import _ from 'lodash';
import assert from 'assert';
import bodyParser from 'body-parser';
import express from 'express';
import moment from 'moment';
import mongoose from 'mongoose';
import q from 'q';
import validator from 'validator';


// Locals

import fractionErrors from './../../utils/fractionErrors';
import middlewareAuth from './../../middleware/tokenAuth';
import middlewareErrors from './../../middleware/errorHandler';
import middlewareInternal from './../../middleware/ensureInternal';
import serviceRegistry  from './../serviceRegistry';
// DB Models
import User from './userModel';

// Use Q promises
mongoose.Promise = require('q').Promise;


// Constants

// naming
const SVC_NAME = 'user';
const SVC_BASE_URL = serviceRegistry.registry.apis.baseV1 + '/' + SVC_NAME;

// routes
const ROUTE_CREATE_USER = '/';
const ROUTE_UPDATE_USER = '/:userId';

// internal routes must be protected
const ROUTE_INTERNAL_CHECK_EXISTENCE = '/internal/check_existence';


// Router

// Expose a router to plug into the main express app
// The router serves as the interface for this service to the outside world
let router = express.Router();


// Middleware

// parse application/x-www-form-urlencoded
router.use(bodyParser.urlencoded({ extended: true }));
// parse application/json
router.use(bodyParser.json());


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
  let email;
  let hashedPassword;
  let firstName;
  let lastName;

  // validate email
  try {
    assert(_.isString(req.body.email));
    email = validator.toString(req.body.email).toLowerCase();
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
  };

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
      throw new Error(err)
    });
};


/**
 * Update an existing fraction user
 *
 * @param {req} obj Express request object
 * @param {res} obj Express response object
 * @returns {promise}
 */
function updateUser(req, res) {

  let userId = req.params.userId;
  try {
    assert(userId);
    assert(userId.length);
  } catch (err) {
    throw new fractionErrors.Invalid('user not found');
  }

  return User.findById({ _id: userId })
    .exec()
    .catch((err) => {
      // handle case where the user is missing
      throw new fractionErrors.NotFound('user not found');
    })
    .then((existingUser) => {

      let email = req.body.user.email;
      let name = req.body.user.name;
      let notifications = req.body.user.notifications;

      // Check out the names
      if (_.isObject(name)) {
        if (_.has(name, 'first')) {
          try {
            assert(_.isString(name.first));
            assert(name.first.length);
            existingUser.name.first = name.first;
          } catch(e) {
            throw new fractionErrors.Invalid('invalid first name');
          }
        }

        if (_.has(name, 'last')) {
          try {
            assert(_.isString(name.last));
            assert(name.last.length);
            existingUser.name.last = name.last;
          } catch(e) {
            throw new fractionErrors.Invalid('invalid last name');
          }
        }
      }

      // Check out the email
      if (_.isObject(email)) {

        if (_.has(email, 'email')) {
          let newEmail = email.email.toLowerCase();
          try {
            assert(_.isString(newEmail));
            assert(validator.isEmail(newEmail));
            existingUser.email.email = newEmail;
          } catch(err) {
            throw new fractionErrors.Invalid('invalid email');
          }
        }
      }

      // Check out the notifications
      if (_.isObject(notifications)) {
        
        if (_.has(notifications, 'viaEmail')) {
          try {
            assert(validator.isBoolean(notifications.viaEmail));
            existingUser.notifications.viaEmail = validator.toBoolean(notifications.viaEmail);
          } catch(e) {
            throw new fractionErrors.Invalid('invalid email notification setting');
          }
        }
      }
      return existingUser.save();
    })
    .then((updatedUser) => {
      return res.json({ user: updatedUser.toPublicObject() });
    })
    .catch((err) => {
      if (err instanceof fractionErrors.BaseError) {
        throw err;
      }
      throw new Error(err.message);
    });
};


/**
 * Update an existing fraction user
 *
 * @param {req} obj Express request object
 * @param {res} obj Express response object
 * @returns {promise}
 */
function internalCheckExistence(req, res) {

  let ids
  let emails
  let numToFind
  let query

  // TODO: IMPLEMENT SIGNATURES FOR PROVING INTERNAL CALLS
  assert(req.headers.fraction_verification_token)

  // ensure only searching by email OR id
  try {
    let invalidFindCall = !!(req.body.findByEmail && req.body.findById)
    assert(!invalidFindCall)

    let validFindCall = !!(req.body.findByEmail || req.body.findById)
    assert(validFindCall)
  } catch(e) {
    throw new fractionErrors.Invalid('invalid check params')
  }

  if (req.body.findByEmail) {
    
    // validate email
    try {
      assert(_.isArray(req.body.emails))
      emails = req.body.emails
      _.forEach(emails, (userEmail) => {
        assert(validator.isEmail(userEmail))
      })
      numToFind = emails.length
    } catch(e) {
      throw new fractionErrors.Invalid('invalid email')
    }
    query = { 'email.email': { $in: emails } }

  } else if (req.body.findById) {

    // validate ids
    try {
      assert(_.isArray(req.body.ids))
      ids = _.forEach(req.body.ids, (userId) => {
        assert(_.isString(userId))
        return userId
      })
      numToFind = ids.length
    } catch(e) {
      console.log(e.message)
      throw new fractionErrors.Invalid('invalid user id')
    }
    query = { '_id': { $in: ids } }
  }

  return User.find(query)
    .then((returnedUsers) => {
      if (!returnedUsers.length) {
        throw new fractionErrors.NotFound('user not found');
      }
      
      if (returnedUsers.length !== numToFind) {
        throw new fractionErrors.NotFound('user not found'); 
      }

      if (returnedUsers.length) {
        let sanitizedUsers = _.map(returnedUsers, user => user.toPublicObject())
        return res.json({ users: sanitizedUsers });
      }
    })
    .catch((err) => {
      if (err instanceof fractionErrors.BaseError) {
        throw err;
      }
      throw new Error(err.message);
    });
};


// Routes

router.post(ROUTE_CREATE_USER, middlewareErrors.wrap(createUser));
router.put(ROUTE_UPDATE_USER, middlewareAuth.requireAuth, middlewareErrors.wrap(updateUser));
router.post(ROUTE_INTERNAL_CHECK_EXISTENCE, middlewareInternal.ensureInternal, middlewareErrors.wrap(internalCheckExistence));


// Exports

module.exports = {
  name: SVC_NAME,
  url: SVC_BASE_URL,
  router: router,
  endpoints: [
    { protocol: 'HTTP', method: 'POST', name: 'CREATE_USER', url: ROUTE_CREATE_USER },
    { protocol: 'HTTP', method: 'PUT', name: 'UPDATE_USER', url: ROUTE_UPDATE_USER },
    { protocol: 'HTTP', method: 'POST', name: 'INTERNAL_CHECK_EXISTENCE', url: ROUTE_INTERNAL_CHECK_EXISTENCE }
  ]
};


// Register with the app service registry
serviceRegistry.registry.register(module.exports);

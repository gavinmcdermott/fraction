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
const SVC_NAME = 'user';
const SVC_BASE_URL = registry.apis.baseV1 + '/user';

const ROUTE_CREATE_USER = '/';
const ROUTE_GET_USER = '/:userId';


// Service setup

// Expose a router to plug into the main express app
// The router serves as the interface for this service to the outside world
let router = express.Router();

// parse application/x-www-form-urlencoded
router.use(bodyParser.urlencoded({ extended: true }));
// parse application/json
router.use(bodyParser.json());



// Service API

/**
 * Create a new fraction user
 *
 * @param {req} obj Express request object
 * @param {res} obj Express response object
 * @returns {result} obj Contains new user and a valid JWT
 */
router.post(ROUTE_CREATE_USER, fractionErrors.wrap((req, res) => {

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
    assert(validator.isBase64(hashedPassword));
  } catch(e) {
    throw new fractionErrors.Invalid('invalid password');
  }

  // validate names
  try {
    assert(_.isString(req.body.firstName));
    firstName = validator.toString(req.body.firstName);
  } catch(e) {
    throw new fractionErrors.Invalid('invalid first name');
  }

  try {
    assert(_.isString(req.body.lastName));
    lastName = validator.toString(req.body.lastName);
  } catch(e) {
    throw new fractionErrors.Invalid('invalid last name');
  }  





  return User
  .findOne({ 'local.id': email })
  .exec() // `.exec()` gives us a fully-fledged promise
  .then((user) => {

    console.log('in the promise')

    // check to see if the user exists and simply quit using fraction at
    // some time in the past
    if (user) {
      if (user.isActive) {
        throw new fractionErrors.Forbidden('user exists');
      }
    } else {

      console.log('no user found!')

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
          verifySentAt: 'sfdf'
        },

        local: {
          id: email,
          password: hashedPassword
        },

        fractionEmployee: false
      };


      console.log('I am here now===============')

      // return pendingUser
      // .save()
      // .then((err, user) => {
      //   console.log('ERR: ', err);
      //   console.log('USER: ', user);
        res.json({ greeting: 'CREATE!' });
      // });

    }



  });


  // res.json({ greeting: 'CREATE!' });

}));


router.get(ROUTE_GET_USER, (req, res) => {
  // console.log('in get');
  res.json({ greeting: 'GET!' });
});


// Export the service as an object
module.exports = {
  name: SVC_NAME,
  url: SVC_BASE_URL,
  router: router,
  endpoints: [
    { protocol: 'HTTP', method: 'POST', name: 'CREATE_USER', url: ROUTE_CREATE_USER },
    { protocol: 'HTTP', method: 'GET', name: 'GET_USER', url: ROUTE_GET_USER }
  ]
};

// Register with the app service registry
registry.register(module.exports);

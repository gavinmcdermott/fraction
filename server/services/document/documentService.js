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

import fractionErrors from './../../utils/fractionErrors'
import middlewareAuth from './../../middleware/tokenAuth'
import middlewareErrors from './../../middleware/errorHandler'
import middlewareInternal from './../../middleware/ensureInternal'
import serviceRegistry  from './../serviceRegistry'
// DB Models
import Document from './documentModel'

// Use Q promises
mongoose.Promise = require('q').Promise

// The current service registry
let registry = serviceRegistry.registry;


// Constants

// naming
const SVC_NAME = 'document'
const SVC_BASE_URL = serviceRegistry.registry.apis.baseV1 + '/' + SVC_NAME

// routes
const ROUTE_CREATE_DOC = '/'


// Router

// Expose a router to plug into the main express app
// The router serves as the interface for this service to the outside world
let router = express.Router()


// Middleware

// parse application/x-www-form-urlencoded
router.use(bodyParser.urlencoded({ extended: true }))
// parse application/json
router.use(bodyParser.json())










/**
 * Get the endpoint for checking if a user exists
 * Requires the user service having been registered
 *
 * @returns {url} string Endpoint for checking if a user exists
 */
// TODO: pull names out into a global config possibly -- less strings
// TODO: add a string to reduce the deps for now -- ordering of the services matters
// TODO: add a string to reduce the deps for now -- ordering of the services matters
// TODO: add a string to reduce the deps for now -- ordering of the services matters
// 
function getUserCheckEndpoint() {
  let userService;
  let userCheckEndpointObj;

  userService = registry.services['user'];
  assert(_.isObject(userService));

  userCheckEndpointObj = _.filter(userService.endpoints, (endpoint) => {
    return endpoint.name === 'INTERNAL_CHECK_EXISTENCE';
  })[0];
  assert(userCheckEndpointObj);

  // Build the url
  userCheckEndpoint = process.config.apiServer + userService.url + userCheckEndpointObj.url;
  assert(userCheckEndpoint);
  return userCheckEndpoint;
};

// get the endpoint to check if a user exists
let userCheckEndpoint = getUserCheckEndpoint();












// Public API Functions

/**
 * Create a new Document
 *
 * @param {req} obj Express request object
 * @param {res} obj Express response object
 * @returns {promise}
 */
function createDocument(req, res) {  



  // New user info to be saved
  let newDocument
  let documentType
  let email

  // validate document
  // TODO: FORMAT this pdf into something stroable
  // TODO: FORMAT this pdf into something stroable
  try {
    assert(_.isString(req.body.document))
    newDocument = req.body.document
  } catch(e) {
    throw new fractionErrors.Invalid('invalid document')
  }  

  // validate email
  try {
    assert(_.isString(req.body.email));
    email = validator.toString(req.body.email).toLowerCase();
    assert(validator.isEmail(email));
  } catch(e) {
    throw new fractionErrors.Invalid('invalid email');    
  }

  try {
    assert(_.isString(req.body.type))
    documentType = req.body.type
    assert(Document.hasType(documentType))
  } catch(e) {
    throw new fractionErrors.Invalid('invalid document type')
  }



  // test description and add defaults
  
  // check if there are users coming along with it

  // check if there is a property associated with it
  // attach that if needed

  // infer the state


  // Build a request to the user service to check for existence
  let options = {
      method: 'POST',
      uri: userCheckEndpoint,
      body: { email: email },
      json: true // requestP now automatically stringifies this to JSON
  }

  return requestP.post(options)
    .then((user) => {

      let doc = {
        type: documentType,
        dateUploaded: moment.utc().valueOf(),
        dateModified: moment.utc().valueOf(),
        document: newDocument,
        entities: {
          // property: 
          users: [{
            id: user._id,
            role: Document.getRoles().UPLOADER
          }]
        }
      }

      return Document.create(doc)
    })
    
    // Ensure that the document has a valid property associated with it?
    // Ensure that the document has a valid property associated with it?
    // Ensure that the document has a valid property associated with it?

    .then((createdDoc) => {
      return res.json({ saved: true, id: createdDoc._id })
    })
    .catch((response) => {
      // This will have been formatted by throwing from the
      let errorMessage = response.error.message;
      if (_.contains(errorMessage, 'invalid')) {
        throw new fractionErrors.Invalid(errorMessage);
      }
      throw new fractionErrors.NotFound(errorMessage);
    });



}





router.post(ROUTE_CREATE_DOC, middlewareAuth.requireAuth, middlewareErrors.wrap(createDocument))


// Exports

module.exports = {
  name: SVC_NAME,
  url: SVC_BASE_URL,
  router: router,
  endpoints: [
    { protocol: 'HTTP', method: 'POST', name: 'CREATE_DOC', url: ROUTE_CREATE_DOC }
  ]
}


// Register with the app service registry
serviceRegistry.registry.register(module.exports)



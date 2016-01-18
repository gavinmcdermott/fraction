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
const ROUTE_GET_DOCS = '/'

// external service route
// TODO: figure out a good config for this
// TODO: figure out a good config for this
// TODO: figure out a good config for this
const ROUTE_CHECK_USER_EXISTS = process.config.apiServer 
                                + serviceRegistry.registry.apis.baseV1 
                                + '/user/internal/check_existence'

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
 * Create a new Document
 *
 * @param {req} obj Express request object
 * @param {res} obj Express response object
 * @returns {promise}
 */
function createDocument(req, res) {  

  let doc
  let docDescription
  let docState
  let docType
  let email
  let userId

  assert(req.token)
  assert(req.userId)

  userId = req.userId
 
  // validate document
  // TODO: FORMAT this pdf into something string-able
  // TODO: FORMAT this pdf into something string-able
  // TODO: FORMAT this pdf into something string-able
  try {
    assert(_.isString(req.body.document))
    doc = req.body.document
  } catch(e) {
    throw new fractionErrors.Invalid('invalid document')
  }  

  // validate type
  try {
    assert(_.isString(req.body.type))
    docType = req.body.type
    assert(_.has(Document.constants.types, docType))
  } catch(e) {
    throw new fractionErrors.Invalid('invalid document type')
  }

  // description
  if (req.body.description) {
    try {
      assert(_.isString(req.body.description))
      docDescription = req.body.description
    } catch(e) {
      throw new fractionErrors.Invalid('invalid document description')
    }
  } else {
    docDescription = Document.constants.descriptions[docType]
  }

  // TODO: infer the state based on specific document types?
  // TODO: infer the state based on specific document types?
  // TODO: infer the state based on specific document types?
  docState = 'done'

  let options = {
    method: 'POST',
    uri: ROUTE_CHECK_USER_EXISTS,
    body: { 
      findById: true,
      ids: [ userId ]
    },
    json: true // requestP now automatically stringifies this to JSON
  }

  // Get the user who uploaded the email
  return requestP.post(options)
    .then((data) => {
      let user = _.first(data.users)

      let newDoc = {
        type: docType,
        dateUploaded: moment.utc().valueOf(),
        dateModified: moment.utc().valueOf(),
        document: doc,
        description: docDescription,
        entities: {
          users: [{
            id: user.id,
            role: Document.constants.roles.uploader
          }]
        },
        state: docState
      }
      return Document.create(newDoc)
    })
    .then((createdDoc) => {
      return res.json({ saved: true, document: createdDoc.toPublicObject() })
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

/**
 * Get Documents
 *
 * @param {req} obj Express request object
 * @param {res} obj Express response object
 * @returns {promise}
 */
function getDocuments(req, res) {  
  console.log('aksdnaskj')
}



router.post(ROUTE_CREATE_DOC, middlewareAuth.requireAuth, middlewareErrors.wrap(createDocument))
router.post(ROUTE_GET_DOCS, middlewareAuth.requireAuth, middlewareErrors.wrap(getDocuments))


// Exports

module.exports = {
  name: SVC_NAME,
  url: SVC_BASE_URL,
  router: router,
  endpoints: [
    { protocol: 'HTTP', method: 'POST', name: 'CREATE_DOC', url: ROUTE_CREATE_DOC },
    { protocol: 'HTTP', method: 'GET', name: 'GET_DOCS', url: ROUTE_GET_DOCS }
  ]
}


// Register with the app service registry
serviceRegistry.registry.register(module.exports)



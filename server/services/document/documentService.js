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
import Document from './documentModel'

// Use Q promises
mongoose.Promise = require('q').Promise

// The current service registry
let registry = serviceRegistry.registry


// Constants

// naming
const SVC_NAME = 'document'
const SVC_BASE_URL = serviceRegistry.registry.apis.baseV1 + '/' + SVC_NAME

// routes
const ROUTE_CREATE_DOC = '/'
const ROUTE_GET_DOCS = '/'


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
  let token

  try {
    assert(req.body.token)
    assert(req.body.userId)
  } catch(e) {
    throw new fractionErrors.Unauthorized('invalid token')
  }

  userId = req.body.userId
  token = req.body.token
 
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

  let getUserRoute = process.config.apiServer + serviceRegistry.registry.apis.baseV1 + '/user/' + userId
  let getUserToken = 'Bearer ' + token

  let options = {
    method: 'GET',
    uri: getUserRoute,
    headers: { authorization: getUserToken }
  }

  // Get the user who uploaded the email
  return requestP(options)
    .then((user) => {
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
      // MOVE THIS TO THE POST USER FETCH!!!

      let errorMessage
      try {
        errorMessage = JSON.parse(response.error).message
      } catch(e) {
        errorMessage = response.error && response.error.message
      }

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



router.post(ROUTE_CREATE_DOC, requireAuth, wrap(createDocument))
router.get(ROUTE_GET_DOCS, requireAuth, wrap(getDocuments))


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



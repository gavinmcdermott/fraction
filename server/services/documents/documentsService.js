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
import { wrap } from './../../middleware/errorHandler'
import serviceRegistry  from './../serviceRegistry'
import fractionErrors from './../../utils/fractionErrors'
import ensureAuth from './../common/passportJwt'

// DB Models
import Document from './documentModel'

// Use Q promises
mongoose.Promise = require('q').Promise

// The current service registry
let registry = serviceRegistry.registry


// Constants

// naming
const SVC_NAME = 'documents'
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

  if (req.error) {
    throw req.error
  }

  try {
    assert(req.user)
    assert(req.token)
    token = req.token
    userId = req.user.id
  } catch(e) {
    new fractionErrors.Unauthorized('invalid token')
  }  
 
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

  let getUserRoute = process.config.apiServer + serviceRegistry.registry.apis.baseV1 + '/users/' + userId
  let getUserToken = token

  let options = {
    method: 'GET',
    uri: getUserRoute,
    headers: { authorization: getUserToken }
  }

  // Get the user who uploaded the email
  return requestP(options)
    .catch((response) => {
      let errorMessage = JSON.parse(response.error).message
      throw new fractionErrors.NotFound(errorMessage)
    })
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
      // FaKE A BAD save and see what happens
      return res.json({ saved: true, document: createdDoc.toPublicObject() })
    })
    .catch((err) => {
      if (err instanceof fractionErrors.BaseError) {
        throw err
      }


      console.log(err.error.message)

      // HANDLES SOME INVALID DOCS
      if (_.includes(err, 'invalid')) {
        throw new fractionErrors.Invalid(err)
      }

      // WHAT HAPPENS IF ERROR ON SAVE???
      // WHAT HAPPENS IF ERROR ON SAVE???
      // WHAT HAPPENS IF ERROR ON SAVE???
      // console.log(errorMessage)
      throw new Error(err.message)
      // throw new fractionErrors.NotFound(errorMessage)
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
  // console.log('aksdnaskj')
}



router.post(ROUTE_CREATE_DOC, ensureAuth, wrap(createDocument))
router.get(ROUTE_GET_DOCS, ensureAuth, wrap(getDocuments))


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



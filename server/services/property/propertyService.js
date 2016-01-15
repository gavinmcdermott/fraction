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

// Locals
import fractionErrors from './../../utils/fractionErrors'
import middlewareAuth from './../../middleware/tokenAuth'
import middlewareErrors from './../../middleware/errorHandler'
import middlewareInternal from './../../middleware/ensureInternal'
import serviceRegistry  from './../serviceRegistry'

// DB Models
import Property from './propertyModel'

// Use Q promises
mongoose.Promise = require('q').Promise

// The current service registry 
let registry = serviceRegistry.registry


// Constants

// naming
const SVC_NAME = 'property'
const SVC_BASE_URL = serviceRegistry.registry.apis.baseV1 + '/' + SVC_NAME

// routes
const ROUTE_CREATE_PROPERTY = '/'

// Router 

// Expose a router to plug into the main express app
// The router serves as the interface for this service to the outside world
let router = express.Router()


// Middleware

// parse application/x-www-form-urlencoded
router.use(bodyParser.urlencoded({ extended: true }))
// parse application/json
router.use(bodyParser.json())

function createProperty(req, res) {

	// New property info to be saved
	let newProperty

	// TODO 

	// TODO validate documents with a workaround 
	// like the "check user endpoints" function on
	// line 77 of documentService.js


	// TODO add actual validation for real addresses

	// validate that there is a property
	try {
	    assert(_.has(req.body, 'property'))
	    newProperty = req.body.property
	} catch(e) {
	    throw new fractionErrors.Invalid('invalid property')
	}  

	// validate that there is a user
    try {
      assert(_.has(req.body.property, 'primaryContact'));
    } catch(e) {
      throw new fractionErrors.Invalid('invalid primary contact');    
    }

    // TODO written with the assumption this endpoint exists 
    // TODO and takes in an array of user _ids 
    // console.log(req.body.primaryContact)
	let options = {
      method: 'POST',
      uri: '/api/v1/user/internal/check_existence',
      body: {
      	findById: true,
      	id: req.body.primaryContact
      },
      json: true // requestP now automatically stringifies this to JSON
  	}

  	// TODO
  	// TODO
  	// TODO 
  	// TODO
  	// TODO
  	// THIS TEST NEED TO BE UNCOMMENTED AND 
  	// CHECKED WITH AN UPDATEd VERSION in both files 

		// return requestP.post(options) 
		//  .then(data) =>  {
		//  	  try {
		//     assert(data.length == 1)
		//     } catch(e) {
		//       throw new fractionErrors.Invalid('non-user primary contact');    
		//     }
		//  }

		// TODO still need to validate this is a real location
		// on planet earth or in the US

		// validate that there is a location
		try {
	      assert(_.has(req.body.property, 'location'));
	    } catch(e) {
	      throw new fractionErrors.Invalid('invalid location');    
	    }

   	// validate that the location is formatted correctly
		try {
	      assert(_.isString(req.body.property.location.addressLine1))
	      assert(_.isString(req.body.property.location.city))
	      assert(_.isString(req.body.property.location.state))
	      assert(_.isNumber(req.body.property.location.zip))
	    } catch(e) {
	      throw new fractionErrors.Invalid('invalidly formatted location');    
	    }

    try {
      assert(_.has(req.body.property, details))
    } catch(e) {
      throw new fractionErrors.Invalid('invalid details');    
    }


    // actually upload the document
    // TODO do we need any more info to just create?
    // TODO I need a promise here
  //   return requestP.post(options)
	 //    .then(
		//     let prop = {
		//     	location: req.body.location,
		//     	primaryContact: req.body.primaryContact,
		//     	dateAdded: moment.utc().valueOf()
		//     }

		//     return Property.create(prop)
		// )
		// .then((createdProp) => {
		// 	return res.json({ saved: true, id: createdProp._id })
		// })
		// .catch((response) => {
		//   let errorMessage = response.error.message;
	 //      if (_.contains(errorMessage, 'invalid')) {
	 //        throw new fractionErrors.Invalid(errorMessage);
	 //      }
	 //      throw new fractionErrors.NotFound(errorMessage);
		// })

	
}


router.post(ROUTE_CREATE_PROPERTY, middlewareAuth.requireAuth, middlewareErrors.wrap(createProperty))



// Exports
//console.log("called here")
module.exports = {
  name: SVC_NAME,
  url: SVC_BASE_URL,
  router: router,
  endpoints: [
    { protocol: 'HTTP', method: 'POST', name: 'CREATE_PROPERTY', url: ROUTE_CREATE_PROPERTY }
  ]
}


// Register with the app service registry
serviceRegistry.registry.register(module.exports)
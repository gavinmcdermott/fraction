'use strict'

// Globals
import _ from 'lodash'
import addressValidator from 'address-validator'
import assert from 'assert'
import bodyParser from 'body-parser'
import express from 'express'
import moment from 'moment'
import mongoose from 'mongoose'
import q from 'q'
import requestP from 'request-promise'
import request from 'request'
import validator from 'validator'

// Locals
import fractionErrors from './../../utils/fractionErrors'
import { wrap } from './../../middleware/errorHandler'
import serviceRegistry  from './../serviceRegistry'
import ensureAuth from './../common/passportJwt'

// // DB Models
import Property from './propertyModel'

// Use Q promises
mongoose.Promise = require('q').Promise

// The current service registry 
let registry = serviceRegistry.registry


// Constants

// naming
const SVC_NAME = 'properties'
const SVC_BASE_URL = serviceRegistry.registry.apis.baseV1 + '/' + SVC_NAME

// routes
const ROUTE_CREATE_PROPERTY = '/'
const ROUTE_UPDATE_PROPERTY = '/:propertyId'
const ROUTE_GET_PROPERTY = '/:propertyId'


// Router 

// Expose a router to plug into the main express app
// The router serves as the interface for this service to the outside world
let router = express.Router()

// Middleware

// parse application/x-www-form-urlencoded
router.use(bodyParser.urlencoded({ extended: true }))
// parse application/json
router.use(bodyParser.json())


// API Routes

/**
 * Create a new property
 *
 * @param {req} obj Express request object
 * @param {res} obj Express response object
 * @returns {promise}
 */
function createProperty(req, res) {

	// New property info to be saved
	let property
  let primaryContact
  let location
  let details
  let bedrooms
  let bathrooms
  let sqft
  let token


  // TODO (Gavin): Enforce the specific keys on each object
  // TODO (Gavin): Export these validators to a utility function

  if (req.error) {
    throw req.error
  }

  try {
    assert(req.user)
    assert(req.token)
    token = req.token
  } catch(e) {
    new fractionErrors.Unauthorized('invalid token')
  }

	// validate that there is a property
	try {
    assert(_.has(req.body, 'property'))
    property = req.body.property
	} catch(e) {
    throw new fractionErrors.Invalid('invalid property')
	}  

	// validate that there is a fraction user as the main contact
  try {
    assert(_.has(property, 'primaryContact'))
    primaryContact = property.primaryContact
  } catch(e) {
    throw new fractionErrors.Invalid('invalid primary contact')
  }

	// validate the location
  
  // Notes: 
  // - For some reason _.toNumber was throwing an error when called
  // it on the zip string '55555' but Number() was not, so I'm using 
  // number right now.   
  // - We also only support 5-digit and 9-digit zip codes (which are length 10 b/c of '-')
	try {
    assert(_.has(property, 'location'))
    location = property.location
  } catch(e) {
    throw new fractionErrors.Invalid('invalid location')
  }

	try {
    assert(_.isString(location.address1))
    assert(_.isString(location.address2))
    assert(_.isString(location.city))
    assert(_.isString(location.state))
    assert(_.isString(location.zip))
    assert((
    	((location.zip).length === 5) || 
    	((location.zip).length === 10)
    ))
  } catch(e) {
    throw new fractionErrors.Invalid('invalid location')    
  }

  // validate that there are details
  try {
    assert(_.has(property, 'details'))
    details = property.details
  } catch(e) {
    throw new fractionErrors.Invalid('invalid details')    
  }

  // validate that there are stats
  try {
  	assert(_.has(details, 'stats'))
  } catch(e) {
    throw new fractionErrors.Invalid('invalid stats')    
  }

  // validate bedrooms
  
  // Notes:
  // - Because _.isNumber(NaN) = true and Number() casts a 
  // non-numeric string to NaN, we need to check both in 
  // this next assert
  try {
    assert(_.has(details.stats, 'bedrooms'))
    bedrooms = Number(details.stats.bedrooms)
    assert((!(_.isNaN(bedrooms)) && _.isNumber(bedrooms)))
  } catch(e) {
    throw new fractionErrors.Invalid('invalid bedrooms')    
  }

  // validate bathrooms
  try {
    assert(_.has(details.stats, 'bathrooms'))
    bathrooms = Number(details.stats.bathrooms)
    assert((!(_.isNaN(bathrooms)) && _.isNumber(bathrooms)))
  } catch(e) {
    throw new fractionErrors.Invalid('invalid bathrooms')    
  }

  try {
    assert(_.has(details.stats, 'sqft'))
    sqft = Number(details.stats.sqft)
    assert((!(_.isNaN(sqft)) && _.isNumber(sqft)))
  } catch(e) {
    throw new fractionErrors.Invalid('invalid sqft')    
  }

  // 1
  // Ensure the property is not a duplicate
  return Property.findOne({
      'location.address1': location.address1,
      'location.address2': location.address2,
      'location.city': location.city,
      'location.state': location.state
    })
    .then((property) => {
      if (property) {
        throw new fractionErrors.Forbidden('property exists')
      }
      return true
    })

    // 2
    // Ensure that the primary contact is a Fraction user
    .then((valid) => {
      let getContactRoute = process.config.apiServer + serviceRegistry.registry.apis.baseV1 + '/users/' + primaryContact
      let getContactToken = token
      let getContactOptions = {
        method: 'GET',
        uri: getContactRoute,
        headers: { authorization: getContactToken }
      }
      return requestP(getContactOptions)
    })
    .then((user) => {
      return true
    })
    .catch((err) => {
      console.log('err with validating main user', err.message)
      if (err instanceof fractionErrors.BaseError) {
        throw err
      }
      let errorMessage = JSON.parse(err.error).message
      throw new fractionErrors.NotFound(errorMessage)
    })

    // 3
    // Ensure that the property address is a real address
    .then((user) => {
      // promisify validation function
      let validate = q.denodeify(addressValidator.validate)
      let addressToValidate = new addressValidator.Address({
        street: location.addressLine1 + location.addressLine2,
        city: location.city,
        state: location.state,
        country: 'United States' // hard coded for now
      })
      return validate(addressToValidate, addressValidator.match.streetAddress)
    })
    .then((addresses) => {
      // "addresses" is of the form [[{exact}], [{inexact}], {err}]
      let exactMatch = _.map(addresses[0], address => address.toString())
      
      try {
        // just verify there is an exact match
        assert((exactMatch[0].length > 5))
        // also check zip code, as a double-check
        assert((property.location.zip === addresses[0][0].postalCode))
      } catch (e) {
        throw new fractionErrors.Invalid('address validation failed')
      }
      return true
    })
    .catch((err) => {  
      console.log('err with validating address', err.message)
      if (err instanceof fractionErrors.BaseError) {
        throw err
      }
      throw new fractionErrors.Invalid('address validation failed')
    })
    
    // 4
    // create the property
    .then((addressValid) => {
       let newProperty = {
         location: property.location,
         details: property.details,
         primaryContact: primaryContact,
         dateAdded: moment.utc().valueOf()
       }
       return Property.create(newProperty)
    })
    .then((createdProperty) => {
      return res.json({ property: createdProperty.toPublicObject() })
    })

    // 5
    // Handle all thrown errors in the waterfall
    .catch((error) => {
      // TODO (gavin): Ensure that the final error is an instance that we can manage
      throw error
    })
}


/**
 * Get a property
 *
 * @param {req} obj Express request object
 * @param {res} obj Express response object
 * @returns {promise}
 */
function getProperty(req, res) {

  let propertyId

  if (req.error) {
    throw req.error
  }

  try {
    assert(req.user)
    assert(req.token)
  } catch(e) {
    new fractionErrors.Unauthorized('invalid token')
  }

  try {
    assert(req.params.propertyId)
    propertyId = req.params.propertyId
  } catch (err) {
    throw new fractionErrors.Invalid('invalid propertyId')
  }

  return Property.findById({ _id: propertyId })
    .then((property) => {
      if (!property) {
        throw new fractionErrors.NotFound('property not found')  
      }
      return res.json({ property: property.toPublicObject() })
    })
    .catch((err) => {
      // console.log(err)
      if (err instanceof fractionErrors.BaseError) {
        throw err
      }
      throw new fractionErrors.NotFound('property not found')
    })
}









// function updateProperty(req, res) {
//   let propertyId = req.params.propertyId

//   try {
//     assert(propertyId)
//     assert(propertyId.length)
//   } catch (err) {
//     throw new fractionErrors.Invalid('property not found')
//   }

//   return Property.findById({ _id: propertyId })
//     .exec()
//     .catch((err) => {
//       // handle case where the property is not there
//       throw new fractionErrors.NotFound('property not found')
//     })
//     .then((existingProperty) => {

//       let primaryContact = req.body.property.primaryContact
//       let location = req.body.property.location
//       // TODO actually I want to do more thinking on what 
//       // TODO an update to a house entails, rennovations and 
//       // TODO documents etc. 
//       // TODO e.g., should we require rennovation proof? 

//       //  validate that there is a user
//       if (_.has(req.body.property, 'primaryContact')) {
//         try {
//           assert((req.body.propery.primaryContact.length > 5))
//           existingProperty.primaryContact = primaryContact
//         } catch(e) {
//           throw new fractionErrors.Invalid('invalid primary contact')    
//         }
//       }

//       // check location
//       if (_.has(req.body.property, 'location')) {
//         try {
//           assert(_.isString(req.body.property.location.addressLine1))
//           assert(_.isString(req.body.property.location.city))
//           assert(_.isString(req.body.property.location.state))
//           assert(_.isString(req.body.property.location.zip))
//            NOTE: only supporting 5-digit and 9-digit zip codes 
//            * (which are length 10 b/c of '-')
           
//           assert((
//             ((req.body.property.location.zip).length === 5) || 
//             ((req.body.property.location.zip).length === 10)
//           ))
//           // TODO this overwrites anything in the location that is not 
//           // TODO passed in the update, this should iterate through
//           // TODO all the fields but I'm waiting to see what databases
//           // TODO are used first 
//           existingProperty.location = location
//         } catch(e) {
//           throw new fractionErrors.Invalid('invalidly formatted location')    
//         }
//       }

//       // check bedrooms
//       if (_.has(req.body.property.details.stats, 'bedrooms')) {
//         try {
//           let bedrooms
//           bedrooms = Number(req.body.property.details.stats.bedrooms)
//           // because _.isNumber(NaN) = true and Number() casts a 
//           // non-numeric string to NaN, we need to check both in 
//           // this next assert
//           assert((!(_.isNaN(bedrooms)) && _.isNumber(bedrooms)))
//           existingProperty.details.stats.bedrooms = bedrooms 
//         } catch(e) {
//           throw new fractionErrors.Invalid('invalid bedrooms')    
//         }
//       }

//       // save if all good
//       return existingProperty.save()
//     })
//     .then((updatedProperty) => {
//       return res.json({ property: updatedProperty.toPublicObject() })
//     })
//     .catch((err) => {
//       if (err instanceof fractionErrors.BaseError) {
//         throw err
//       }
//       throw new Error(err.message)
//     })
// }

// Routes

router.post(ROUTE_CREATE_PROPERTY, ensureAuth, wrap(createProperty))
router.get(ROUTE_GET_PROPERTY, ensureAuth, wrap(getProperty))

// router.put(ROUTE_UPDATE_PROPERTY, ensureAuth, wrap(updateProperty))

// Exports
module.exports = {
  name: SVC_NAME,
  url: SVC_BASE_URL,
  router: router,
  endpoints: {
    createProperty: { protocol: 'HTTP', method: 'POST', name: 'createProperty', url: ROUTE_CREATE_PROPERTY },
    // updateProperty: { protocol: 'HTTP', method: 'PUT', name: 'updateProperty', url: ROUTE_UPDATE_PROPERTY },
    getProperty: { protocol: 'HTTP', method: 'GET', name: 'getProperty', url: ROUTE_GET_PROPERTY }
  }
}

// Register with the app service registry
serviceRegistry.registry.register(module.exports)

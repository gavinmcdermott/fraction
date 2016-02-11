'use strict'

// Globals
import _ from 'lodash'
import assert from 'assert'
import bodyParser from 'body-parser'
import express from 'express'
import moment from 'moment'
import mongoose from 'mongoose'
import nodeGeocoder from "node-geocoder"
import q from 'q'
import requestP from 'request-promise'
import request from 'request'
import validator from 'validator'


// Locals
import { wrap } from './../../middleware/errorHandler'
import ensureFractionAdmin from './../../middleware/ensureFractionAdmin'
import fractionErrors from './../../utils/fractionErrors'
import serviceRegistry  from './../serviceRegistry'
import ensureAuth from './../../middleware/passportJwt'

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
const ROUTE_GET_PROPERTIES = '/'
const ROUTE_UPDATE_PROPERTY = '/:propertyId'
const ROUTE_GET_PROPERTY = '/:propertyId'

// Set up the Geocoder - http://nchaulet.github.io/node-geocoder/
const HTTP_ADAPTER = 'https'
const GEOCODER_PROVIDER = 'google'
const GEOCODER_OPTIONS = {
  apiKey: process.config.google.geocoderKey, // Google api key
}
let geocoder = nodeGeocoder(GEOCODER_PROVIDER, HTTP_ADAPTER, GEOCODER_OPTIONS)


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
  let location
  // created after the Google validation
  let sanitizedLocation
  let details
  let bedrooms
  let bathrooms
  let sqft
  let token

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
    let unsafeBeds = details.stats.bedrooms
    assert(unsafeBeds !== '')
    
    bedrooms = Number(unsafeBeds)
    assert((!_.isNaN(bedrooms) && _.isNumber(bedrooms)))
  } catch(e) {
    throw new fractionErrors.Invalid('invalid bedrooms')    
  }

  // validate bathrooms
  try {
    assert(_.has(details.stats, 'bathrooms'))
    let unsafeBaths = details.stats.bathrooms
    assert(unsafeBaths !== '')

    bathrooms = Number(unsafeBaths)
    assert((!_.isNaN(bathrooms) && _.isNumber(bathrooms)))
  } catch(e) {
    throw new fractionErrors.Invalid('invalid bathrooms')    
  }

  try {
    assert(_.has(details.stats, 'sqft'))
    let unsafeSqft = details.stats.sqft
    assert(unsafeSqft !== '')

    sqft = Number(unsafeSqft)
    assert((!_.isNaN(sqft) && _.isNumber(sqft)))
  } catch(e) {
    throw new fractionErrors.Invalid('invalid sqft')    
  }

  // 1
  // Ensure that the property address is a real address through Google

  // Note: Google geocoding does not handle apartment / unit numbers
  // Info: https://developers.google.com/maps/faq#geocoder_queryformat
  let locationString = location.address1 + ' ' + location.city + ' ' + location.state + ' ' + location.zip

  return geocoder.geocode(locationString)
    .then((results) => {
      let addressToSave = _.first(results)

      try {
        // Verify there is an exact match for our property
        assert(_.isObject(addressToSave))
        assert((location.zip === addressToSave.zipcode))
        
        sanitizedLocation = {
          address1: addressToSave.streetNumber + ' ' + addressToSave.streetName,
          address2: location.address2,
          city: addressToSave.city,
          state: addressToSave.administrativeLevels.level1long,
          stateAbbr: addressToSave.administrativeLevels.level1short,
          zip: addressToSave.zipcode,
          formattedAddress: addressToSave.formattedAddress,
          lat: addressToSave.latitude,
          lon: addressToSave.longitude
        }
      } catch (e) {
        throw new fractionErrors.Invalid('address validation failed')
      }
      return true
    })
    .catch((err) => { 
      throw new fractionErrors.Invalid('address validation failed')
    })

    // 2
    // Ensure the property isn't a dupe
    .then((locationWasValid) => {
      return Property.findOne({
        'location.address1': sanitizedLocation.address1,
        'location.city': sanitizedLocation.city,
        'location.state': sanitizedLocation.state
      })
    })
    .catch((response) => {
      if (response instanceof fractionErrors.BaseError) { 
        throw response
      }
      let errorMessage = JSON.parse(response.error).message
      throw new fractionErrors.Invalid(errorMessage)
    })
    .then((foundProp) => {
      if (foundProp) {
        throw new fractionErrors.Forbidden('property exists')
      }
      return true
    })

    // 3
    // create the property
    .then((addressValid) => {
       let newProperty = {
         location: sanitizedLocation,
         details: property.details,
         dateAdded: moment.utc().valueOf()
       }
       return Property.create(newProperty)
    })
    .then((createdProperty) => {
      return res.json({ property: createdProperty.toPublicObject() })
    })

    // 4
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
      console.log('GET PROPERTY ERR: ', err.message)
      if (err instanceof fractionErrors.BaseError) {
        throw err
      }
      throw new fractionErrors.NotFound('property not found')
    })
}


/**
 * Get all properties
 * Can scope by query params: 
 *
 * @param {req} obj Express request object
 * @param {res} obj Express response object
 * @returns {promise}
 */
function getProperties(req, res) {

  // TODO: Add in: pagination; result limit

  let status
  let query = {}

  if (req.error) {
    throw req.error
  }

  try {
    assert(req.user)
    assert(req.token)
  } catch(e) {
    new fractionErrors.Unauthorized('invalid token')
  }

  return Property.find(query)
    .exec()
    .then((properies) => {
      let sanitized = _.map(properies, (property) => {
        return property.toPublicObject()
      })
      return res.json({ properties: sanitized })
    })
    .catch((err) => {
      throw new Error(err.message)
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
//           assert(_.isString(req.body.property.location.address1))
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

router.post(ROUTE_CREATE_PROPERTY, ensureAuth, ensureFractionAdmin, wrap(createProperty))
router.get(ROUTE_GET_PROPERTIES, ensureAuth, wrap(getProperties))
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
    getProperties: { protocol: 'HTTP', method: 'GET', name: 'getProperties', url: ROUTE_GET_PROPERTIES },
    getProperty: { protocol: 'HTTP', method: 'GET', name: 'getProperty', url: ROUTE_GET_PROPERTY }
  }
}

// Register with the app service registry
serviceRegistry.registry.register(module.exports)

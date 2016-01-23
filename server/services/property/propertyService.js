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

// Locals
import fractionErrors from './../../utils/fractionErrors'
import middlewareAuth from './../../middleware/tokenAuth'
import middlewareErrors from './../../middleware/errorHandler'
import middlewareInternal from './../../middleware/ensureInternal'
import serviceRegistry  from './../serviceRegistry'

// // DB Models
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
const ROUTE_CREATE_PROPERTY = '/';
const ROUTE_UPDATE_PROPERTY = '/:propertyId';

// this is probably wrong again? Not sure where we stand on this route
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

function createProperty(req, res) {

	// New property info to be saved
	let newProperty
	let newBedrooms
	let newBathrooms
	let newSqft


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

	// validate that there is a location payload
	try {
     assert(_.has(req.body.property, 'location'));
  } catch(e) {
    throw new fractionErrors.Invalid('invalid location');    
  }

  // validate that the location bits are all there 
 	/* NOTE: for some reason _.toNumber was throwing an error when called
 	 * it on the zip string '55555' but Number() was not, so I'm using 
 	 * number right now. 
 	 */
	try {
    assert(_.isString(req.body.property.location.addressLine1))
    assert(_.isString(req.body.property.location.city))
    assert(_.isString(req.body.property.location.state))
    assert(_.isString(req.body.property.location.zip))
    /* NOTE: only supporting 5-digit and 9-digit zip codes 
     * (which are length 10 b/c of '-')
     */
    assert((
    	((req.body.property.location.zip).length === 5) || 
    	((req.body.property.location.zip).length === 10)
    ))
  } catch(e) {
    throw new fractionErrors.Invalid('invalidly formatted location');    
  }

  // validate that there are details
  try {
    assert(_.has(req.body.property, 'details'))
  } catch(e) {
    throw new fractionErrors.Invalid('invalid details');    
  }

  // validate that there are stats
  try {
  	assert(_.has(req.body.property.details, 'stats'))
  } catch(e) {
    throw new fractionErrors.Invalid('invalid stats');    
  }

  // validate that there are bedrooms and it's a number
  try {
    assert(_.has(req.body.property.details.stats, 'bedrooms'))
    newBedrooms = Number(req.body.property.details.stats.bedrooms)
    // because _.isNumber(NaN) = true and Number() casts a 
    // non-numeric string to NaN, we need to check both in 
    // this next assert
    assert((!(_.isNaN(newBedrooms)) && _.isNumber(newBedrooms)))
  } catch(e) {
    throw new fractionErrors.Invalid('invalid bedrooms');    
  }

  // validate that there is a number of bathrooms
  try {
    assert(_.has(req.body.property.details.stats, 'bathrooms'))
    newBathrooms = Number(req.body.property.details.stats.bathrooms)
    assert((!(_.isNaN(newBathrooms)) && _.isNumber(newBathrooms)))
  } catch(e) {
    throw new fractionErrors.Invalid('invalid bathrooms');    
  }

  try {
    assert(_.has(req.body.property.details.stats, 'sqft'))
    newSqft = Number(req.body.property.details.stats.sqft)
    assert((!(_.isNaN(newSqft)) && _.isNumber(newSqft)))
  } catch(e) {
    throw new fractionErrors.Invalid('invalid sqft');    
  }

  // TODO check to make sure this is not a duplicate of a 
  // TODO property we already have in the database.

  ///////////////////////////////////////////////////////
  // TODO I AM UNABLE TO VALIDATE ANY USERS 
  // (I'm probably making a dumb error but was told 
  // this function is changing again possibly anyway)
  ///////////////////////////////////////////////////////

	// we use these options in the following request to
	// to see if we have a valid primaryUser for the 
	// new property 
	let options = {
    method: 'POST',
    uri: ROUTE_CHECK_USER_EXISTS,
    body: {
    	findById: true,
    	id: req.body.primaryContact
    },
    json: true // requestP now automatically stringifies this to JSON
	}

  // promise-ify the addressValidator
  let addressValidator_validate = q.denodeify(addressValidator.validate)
  // getting our address
  let Address = addressValidator.Address
  let fullStreet
    // necessary if/else, without it addressLine2 appends an 'undefined'
    // to the street address
    if (_.isUndefined(req.body.property.location.addressLine2)) {
      fullStreet = req.body.property.location.addressLine1
    } else {
      fullStreet = req.body.property.location.addressLine1 + req.body.property.location.addressLine2
    }

    let addressToCheck = new Address({
      street: fullStreet,
        city: req.body.property.location.city,
        state: req.body.property.location.state,
        // for the foreseable future country can be hardcoded
        country: 'United States'
      })

  // start of chain of promises
  return addressValidator_validate(addressToCheck, addressValidator.match.streetAddress)
    .catch((e) => {
      // NOTE: because of the dependence of this npm on Google
      // this could potentially also be a different error than
      // just a non-real location, so if something is super weird
      // try console.log(e) and see what's going on. 
      throw new fractionErrors.Invalid('non-real location')
    })
    .then((validations) => {
      // "validations" is of the form [[{exact}], [{inexact}], {err}]
      let exactMatch = _.map(validations[0], function(a) {
                       return a.toString();
                     })
      try {
        // just verify there is an exact match
        assert((exactMatch[0].length > 5))
        // also check zip code, as a double-check
        assert((req.body.property.location.zip === validations[0][0].postalCode))
      } catch (e) {
        throw new fractionErrors.Invalid('non-real location')
      }
    })
    .catch((e) => {
      if (e instanceof fractionErrors.Invalid) {
        throw e
      }
      throw new fractionErrors.Invalid('something wrong with location validator'); 
    })
    ///////////////////////////////////////////////////////////////
    // TODO this portion of the promise chain should be uncommented
    // when user verification is setup
    ///////////////////////////////////////////////////////////////
    // .then(() => {
    //   // see if user exists
    //   let data = requestP.post(options)
    //   return data
    // })
    // .catch((e) => {
    //   // necessary to pass the first error down the chain
    //   if (e instanceof fractionErrors.Invalid) {
    //     throw e
    //   }
    //   // otherwise it was the second error
    //   throw new fractionErrors.Invalid('non-user primary contact');
    // })
    //////////////////////////////////////////////////////////////
    // TODO also uncomment lines within this '.then()' that are 
    // relevant to userId verification
    //////////////////////////////////////////////////////////////
    .then((/*data*/) => {
      //let newPrimaryUser = _.first(data.users)
       let newProperty = {
         location: req.body.property.location,
          // * TODO or NOTE: I did some logic checking on
          // * types of certain things, like that bedrooms is
          // * a valid number, but if that passes I'm passing
          // * this in as a string or whatever the req sent. The
          // * reason for this is that this way we'll take whatever
          // * details are sent, including but not requiring things
          // * not explicitly tested for depending on what the req
          // * sent us, so if extra details are there, we take them in.
         details: req.body.property.details,
         //primaryContact: 'bobadfadfadfadfadfaf', //newPrimaryUser.id,
         dateAdded: moment.utc().valueOf()
       }
       // Actually save the new property
       return Property.create(newProperty)
    })
    .then((createdProperty) => {
      return res.json({ saved: true, property: createdProperty.toPublicObject() })
    })
    // catch any other errors
    .catch((e) => {
      // if it was an error we threw earlier
      if (e instanceof fractionErrors.Invalid) {
        throw e
      }
      // otherwise something else went wrong
      throw new Error(e);
    })
}


function updateProperty(req, res) {
  let propertyId = req.params.propertyId

  try {
    assert(propertyId)
    assert(propertyId.length)
  } catch (err) {
    throw new fractionErrors.Invalid('property not found')
  }

  return Property.findById({ _id: propertyId })
    .exec()
    .catch((err) => {
      // handle case where the property is not there
      throw new fractionErrors.NotFound('property not found');
    })
    .then((existingProperty) => {

      let primaryContact = req.body.property.primaryContact
      let location = req.body.property.location
      // TODO actually I want to do more thinking on what 
      // TODO an update to a house entails, rennovations and 
      // TODO documents etc. 
      // TODO e.g., should we require rennovation proof? 

      //  validate that there is a user
      if (_.has(req.body.property, 'primaryContact')) {
        try {
          assert((req.body.propery.primaryContact.length > 5))
          existingProperty.primaryContact = primaryContact
        } catch(e) {
          throw new fractionErrors.Invalid('invalid primary contact');    
        }
      }

      // check location
      if (_.has(req.body.property, 'location')) {
        try {
          assert(_.isString(req.body.property.location.addressLine1))
          assert(_.isString(req.body.property.location.city))
          assert(_.isString(req.body.property.location.state))
          assert(_.isString(req.body.property.location.zip))
          /* NOTE: only supporting 5-digit and 9-digit zip codes 
           * (which are length 10 b/c of '-')
           */
          assert((
            ((req.body.property.location.zip).length === 5) || 
            ((req.body.property.location.zip).length === 10)
          ))
          // TODO this overwrites anything in the location that is not 
          // TODO passed in the update, this should iterate through
          // TODO all the fields but I'm waiting to see what databases
          // TODO are used first 
          existingProperty.location = location
        } catch(e) {
          throw new fractionErrors.Invalid('invalidly formatted location');    
        }
      }

      // check bedrooms
      if (_.has(req.body.property.details.stats, 'bedrooms')) {
        try {
          let newBedrooms
          newBedrooms = Number(req.body.property.details.stats.bedrooms)
          // because _.isNumber(NaN) = true and Number() casts a 
          // non-numeric string to NaN, we need to check both in 
          // this next assert
          assert((!(_.isNaN(newBedrooms)) && _.isNumber(newBedrooms)))
          existingProperty.details.stats.bedrooms = newBedrooms 
        } catch(e) {
          throw new fractionErrors.Invalid('invalid bedrooms');    
        }
      }

      // save if all good
      return existingProperty.save();
    })
    .then((updatedProperty) => {
      return res.json({ property: updatedProperty.toPublicObject() });
    })
    .catch((err) => {
      if (err instanceof fractionErrors.BaseError) {
        throw err;
      }
      throw new Error(err.message);
    });
}

// Routes

router.post(ROUTE_CREATE_PROPERTY, middlewareAuth.requireAuth, middlewareErrors.wrap(createProperty))
router.put(ROUTE_UPDATE_PROPERTY, middlewareAuth.requireAuth, middlewareErrors.wrap(updateProperty))

// Exports
module.exports = {
  name: SVC_NAME,
  url: SVC_BASE_URL,
  router: router,
  endpoints: [
    { protocol: 'HTTP', method: 'POST', name: 'CREATE_PROPERTY', url: ROUTE_CREATE_PROPERTY },
    { protocol: 'HTTP', method: 'PUT', name: 'UPDATE_PROPERTY', url: ROUTE_UPDATE_PROPERTY }
  ]
}

// Register with the app service registry
serviceRegistry.registry.register(module.exports)
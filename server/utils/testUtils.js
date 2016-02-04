'use strict'


// Globals

import _ from 'lodash'
import assert from 'assert'
import express from 'express'
import jwt from 'jsonwebtoken'
import moment from 'moment'
import mongoose from 'mongoose'
import request from 'supertest'


// Locals

import config from './../config/config'
import dbUtils from './../utils/dbUtils'
import serviceRegistry from './../services/serviceRegistry'


// Constants

const SERVICE_DB = process.config.serviceDb
const FRACTION_TOKEN_SECRET = process.config.fraction.tokenSecret
const FRACTION_TOKEN_ISSUER = process.config.fraction.clientId

// Models to be used later in the helper functions
let Offering
let User


// DB Connections
let serviceDbConnection = mongoose.createConnection(SERVICE_DB, dbUtils.connectCallback)
// attach the connection to our mongoose instance
mongoose.serviceDb = serviceDbConnection


// Test app setup

let app = express()
let requester = request(app)
serviceRegistry.loadServices(app)


// Exports

// App basics
exports.app = app
exports.requester = requester
exports.serviceRegistry = serviceRegistry

// test users
exports.adminUser = {
  email: 'adminUser@foo.com',
  password: 's0m3Passw0rd',
  firstName: 'AdminFirst',
  lastName: 'AdminLast'
}
exports.testUser = {
  email: 'testUser@foo.com',
  password: 's0m3Passw0rd',
  firstName: 'RegularFirst',
  lastName: 'RegularLast'
}

// Test suite initialization
exports.initSuite = (suiteName) => {
  console.log('')
  console.log('')
  console.log('================================================================')
  console.log('Running ' + suiteName + ' service specs')
  console.log('================================================================')
  console.log('')
}


// Tokens

// Generate tokens associated with no user
exports.generateUserNotExistToken = function() {
  let now = moment.utc()
  let payload = {
    iss: FRACTION_TOKEN_ISSUER,
    exp: moment(now).add(1, 'day').utc().valueOf(),
    iat: now.valueOf(),
    sub: '56995219797feefe7770659g'
  }
  return jwt.sign(payload, FRACTION_TOKEN_SECRET)
}

// Generate a valid JWT token for a user 
let generateToken = function(user) {
  let now = moment.utc()
  let payload = {
    iss: FRACTION_TOKEN_ISSUER,
    exp: moment(now).add(1, 'day').utc().valueOf(),
    iat: now.valueOf(),
    sub: user._id.toString(),
    scopes: user.scopes
  }
  return jwt.sign(payload, FRACTION_TOKEN_SECRET)
}


// Properties

// test property objects
exports.properties = {

  validHouses: {
    
    houseA: {
      location: {
        address1: '4583 Trillium Woods',
        address2: '',
        city: 'Lake Oswego',
        state: 'Oregon',
        zip: '97035'
      },
      details: {
        description: "a descrip",
        stats: {
          bedrooms: '5',
          bathrooms: '2',
          sqft: '1420'
        }
      },
      primaryContact: ''
    },
    
    houseB: {
      location: {
        address1: '999 McClean Deluxe Road',
        address2: '',
        city: 'Omaha',
        state: 'Nebraska',
        zip: '68069'
      },
      details: {
        description: "a description",
        stats: {
          bedrooms: '6',
          bathrooms: '7',
          sqft: '7600'
        }
      },
      primaryContact: ''
    }
  },

  invalidLocation: {
    address1: '',
    state: 'Fornicalia',
    zip: '555'
  },

  fakeLocation: {
    address1: '589999898353 Maine Streate',
    address2: '',
    city: 'Fran Sancisco',
    state: 'Fornicalia',
    zip: '55555'
  },

  validLocation: {
    address1: '4583 Trillium Woods',
    address2: '',
    city: 'Lake Oswego',
    state: 'Oregon',
    zip: '97035'
  }
}


// Helper functions

// Helper to blow away the test db between runs
exports.clearLocalTestDatabase = function() {
  
  // Helper to drop/wipe a specific test database
  let clearDb = function(dbName) {
    return new Promise((resolve, reject) => {
      let connections
      let connection

      // Ensure we're attempting to wipe a testDB
      assert(_.includes(dbName, 'test'))

      // Get the connection to the DB we want to drop
      connections = _.filter(mongoose.connections, (con) => {
        return _.includes(dbName, con.name)
      })
      assert(connections.length == 1)

      // Drop/wipe the db and resolve the promise
      connection = _.first(connections)
      connection.db.dropDatabase((err) => {
        if (err) {
          throw new Error('Error when dropping test DB: ', err)
        }
        return resolve()
      })
    })
  }

  return clearDb(SERVICE_DB)
}

// Helper to add a test user
exports.addTestUser = (isFractionAdmin=false, user=exports.testUser) => {
  
  // import the property model to simply inject the property
  User = User || require('./../services/users/userModel')

  let scopes = isFractionAdmin ? User.scopes.fraction.admin : User.scopes.fraction.user
  
  let pendingUser = {
    name: {
      first: user.firstName,
      last: user.lastName
    },
    email: {
      email: user.email,
      // TODO(gavin): ENABLE EMAIL VERIFICATION
      verified: true,
      verifyCode: '123',
      verifySentAt: moment.utc().valueOf()
    },
    local: {
      password: user.password
    },
    isActive: true,
    scopes: scopes
  }

  return User.create(pendingUser)
    .then((newUser) => {
      if (!newUser) {
        throw new Error('Could not create test user!')
      }
      let token = 'Bearer ' + generateToken(newUser)
      return { user: newUser.toPublicObject(), token: token }
    })
    .catch((err) => {
      console.log('Error creating test user: ', err)
      throw err
    })
}




// FIXME: ADD DOCUMENT DIRECT DB UPLOADS
// Add documents that belong to a user
exports.addDocumentForUser = (testDoc, token) => {
  assert(_.isObject(testDoc))
  assert(_.isString(token))
  return new Promise((resolve, reject) => {  
    requester
      .post('/api/v1/document/')
      .set('Authorization', token)
      .send(testDoc)
      .expect(200)
      .end((err, res) => {
        if (err) {
          console.log('')
          throw new Error('Error adding document to user: ' + err.message)
        }
        expect(res.body.saved).toBe(true)
        expect(res.body.document).toBeDefined()
        console.log('added document ', res.body.document.id)
        return resolve(res.body)
      })
  })
}



// Add a test property to the db
exports.addTestProperty = function(userId, houseId='houseA') {
  assert(userId)

  // import the property model to simply inject the property
  let Property = require('./../services/properties/propertyModel')

  let house = exports.properties.validHouses[houseId]
  house.primaryContact = userId

  let newProperty = {
    location: house.location,
    details: house.details,
    primaryContact: userId,
    dateAdded: moment.utc().valueOf()
  }

  return Property.create(newProperty)
    .then((property) => {
      if (!property) {
        throw new Error('Error creating test property: ', err)
      }
      console.log('added property ', property._id)
      return property
    })
}

// add an offering to the platform
exports.addOffering = function(userId, propertyId, quantity, filled, status) {
  assert(userId)
  assert(propertyId)
  assert(_.isNumber(quantity))
  assert(_.isNumber(filled))
  assert(status)

  // import the property model to simply inject the property
  Offering = Offering || require('./../services/markets/offeringModel')

  // let house = exports.properties.validHouses.houseA
  // house.primaryContact = userId

  let offering = {
    // description?
    // name?
    property: propertyId,
    addedBy: userId,
    price: 200,
    status: status,
    quantity: quantity,
    filled: filled,
    remaining: quantity - filled,
    dateOpened: moment.utc().valueOf(),
    dateClosed: status === 'open' ? null : moment.utc().valueOf(),
    backers: []
  }
  
  return Offering.create(offering)
    .then((offering) => {
      if (!offering) {
        throw new Error('Error creating test offering: ', err)
      }
      console.log('added offering ', offering._id)
      return offering
    })
}

// remove an offering from the platform
function removeSingleOffering(offeringId) {
  assert(offeringId)
  return Offering.findById({ _id: offeringId })
    .then((offering) => {
      if (!offering) {
        throw new Error('Error removing offering: ' + offeringId, err + ' does not exist')
      }
      return offering.remove()
    })
    .then((removed) => {
      console.log('removed offering ', offeringId)
      return offeringId
    })
    .catch((err) => {
      throw new Error(err)
    })
}

// remove all offerings from the platform
exports.removeOffering = function(offeringId) {
  // import the property model to simply inject the property
  Offering = Offering || require('./../services/markets/offeringModel')

  if (offeringId) {
    return removeSingleOffering(offeringId)
  }
  return Offering.remove()
    .then((removed) => {
      console.log('removed all offerings')
      return true
    })
    .catch((err) => {
      throw new Error(err)
    })
}


// Initialization

// Initialize the test server before running any service tests
beforeAll((done) => {
  // This is needed to force supertest to listen on a particular port
  // otherwise it uses an ephemeral one - see supertest documentation
  let server = app.listen(process.config.port, () => {
    console.log('Test server listening on port %s', server.address().port)
    done()
  })
})



'use strict';


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


// DB Connections
let serviceDbConnection = mongoose.createConnection(SERVICE_DB, dbUtils.connectCallback)
// attach the connection to our mongoose instance
mongoose.serviceDb = serviceDbConnection


// Test app setup

let app = express()
let requester = request(app)
serviceRegistry.loadServices(app)


// Exports

exports.app = app
exports.requester = requester
exports.serviceRegistry = serviceRegistry

exports.testUser = {
  email: 'testUser@foo.com',
  password: 's0m3Passw0rd',
  firstName: 'Terrence',
  lastName: 'Wundermidst'
}

// Log the beginning of a test suite for developer debugging and readability
exports.initSuite = (suiteName) => {
  console.log('')
  console.log('Starting ' + suiteName + ' service test')
}

// Generate a JWT attached to no user
exports.generateUserNotExistToken = function() {
  let now = moment.utc()
  let payload = {
    iss: 'some issuer',
    exp: moment(now).add(1, 'day').utc().valueOf(),
    iat: now.valueOf(),
    sub: '56995219797feefe7770659g'
  }
  return jwt.sign(payload, FRACTION_TOKEN_SECRET)
}

// Helper to blow away the test db between runs
exports.clearLocalTestDatabase = function() {
  
  // Helper to drop/wipe a specific test database
  let clearDb = function(dbName) {
    return new Promise((resolve, reject) => {
      let connections;
      let connection;

      // Ensure we're attempting to wipe a testDB
      assert(_.includes(dbName, 'test'));

      // Get the connection to the DB we want to drop
      connections = _.filter(mongoose.connections, (con) => {
        return _.includes(dbName, con.name);
      });
      assert(connections.length == 1);

      // Drop/wipe the db and resolve the promise
      connection = _.first(connections);
      connection.db.dropDatabase((err) => {
        if (err) {
          throw new Error('Error when dropping test DB: ', err);
        }
        return resolve();
      });
    });
  };

  return clearDb(SERVICE_DB);
};

// Helper to add a test user
exports.addTestUser = function() {
  return new Promise((resolve, reject) => {  
    requester
      .post('/api/v1/user/') // hard coded for now
      .send(exports.testUser)
      .expect(200)
      .end((err, res) => {
        if (err) {
          throw new Error('Error creating test user: ', err);
        }
        expect(res.body.user).toBeDefined();
        return resolve(res.body.user);
      });
  });
};

// Helper to log in the test user
exports.logInTestUser = function() {
  return new Promise((resolve, reject) => {  
    let trimmedTestUser = {
      email: exports.testUser.email,
      password: exports.testUser.password
    };
    requester
      .post('/api/v1/user/login') // hard coded for now
      .send(trimmedTestUser)
      .expect(200)
      .end((err, res) => {
        if (err) {
          console.log('')
          throw new Error('Error logging in test user: ' + res.body.message);
        }
        expect(res.body.user).toBeDefined();
        expect(res.body.token).toBeDefined();
        return resolve(res.body);
      });
  });
};

// Helper to log in the test user
exports.logInTestUser = () => {
  return new Promise((resolve, reject) => {  
    let trimmedTestUser = {
      email: exports.testUser.email,
      password: exports.testUser.password
    }
    requester
      .post('/api/v1/user/login') // hard coded for now
      .send(trimmedTestUser)
      .expect(200)
      .end((err, res) => {
        if (err) {
          console.log('')
          throw new Error('Error logging in test user: ' + res.body.message)
        }
        expect(res.body.user).toBeDefined()
        expect(res.body.token).toBeDefined()
        return resolve(res.body)
      })
  })
}

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
          throw new Error('Error adding document to user: ' + res.body.message)
        }
        expect(res.body.saved).toBe(true)
        expect(res.body.document).toBeDefined()
        return resolve(res.body)
      })
  })
}


// Initialize the test server before running any service tests
beforeAll((done) => {
  // This is needed to force supertest to listen on a particular port
  // otherwise it uses an ephemeral one - see supertest documentation
  let server = app.listen(process.config.port, () => {
    console.log('Test server listening on port %s', server.address().port);
    done();
  });
});



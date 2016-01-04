'use strict';

// Globals
import _ from 'lodash';
import assert from 'assert';
import mongoose from 'mongoose';

// Locals
import config from './../config/config';
import dbUtils from './../utils/dbUtils';


// Constants
const SERVICE_DB = process.config.serviceDb;


// Test DB setup
let serviceDbConnection = mongoose.createConnection(SERVICE_DB, dbUtils.connectCallback);
// attach the connection to our mongoose instance
mongoose.serviceDb = serviceDbConnection;


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



exports.addTestUser = function(requester) {
  return new Promise((resolve, reject) => {  
    let userService = require('./../services/user/userService');
    let createEndpoint = _.filter(userService.endpoints, (endpoint) => {
      return endpoint.name === 'CREATE_USER';
    })[0];

    requester
      .post(userService.url + createEndpoint.url)
      .send({ email: 'testUser@foo.com', password: 's0m3Passw0rd', firstName: 'Terrence', lastName: 'Wundermidst'  })
      .expect(200)
      .end((err, res) => {
        if (err) {
          throw new Error('Error creating test user: ', err)
        }
        expect(res.body.user).toBeDefined();
        return resolve(res.body.user);
      });
  });
};
























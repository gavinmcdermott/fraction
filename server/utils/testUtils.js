'use strict';

// Globals
import _ from 'lodash';
import assert from 'assert';
import express from 'express';
import mongoose from 'mongoose';
import request from 'supertest';

// Locals
import config from './../config/config';
import dbUtils from './../utils/dbUtils';
import serviceRegistry from './../services/serviceRegistry';


// Constants

const SERVICE_DB = process.config.serviceDb;

exports.testUser = {
  email: 'testUser@foo.com',
  password: 's0m3Passw0rd',
  firstName: 'Terrence',
  lastName: 'Wundermidst'
};

// Test DB Connections

let serviceDbConnection = mongoose.createConnection(SERVICE_DB, dbUtils.connectCallback);
// attach the connection to our mongoose instance
mongoose.serviceDb = serviceDbConnection;


// Test App

let app = express();
let requester = request(app);


// Exports

exports.requester = requester;

exports.loadTestServices = function() {
  serviceRegistry.registry.clearServices(true);
  serviceRegistry.loadServices(app);
};


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


exports.logInTestUser = function() {
  return new Promise((resolve, reject) => {  
    let trimmedTestUser = {
      email: exports.testUser.email.toLowerCase(),
      password: exports.testUser.password
    };
    requester
      .post('/api/v1/user/login')
      .send(trimmedTestUser)
      .expect(200)
      .end((err, res) => {
        if (err) {
          throw new Error('Error logging in test user: ', err);
        }
        expect(res.body.user).toBeDefined();
        expect(res.body.token).toBeDefined();
        return resolve(res.body);
      });
  });
};



























'use strict';

// Globals
import _ from 'lodash';
import assert from 'assert';
import mongoose from 'mongoose';

// Locals
import config from './../config/config';
import dbUtils from './../utils/dbUtils';


const SERVICE_DB = process.config.serviceDb;

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

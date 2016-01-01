'use strict';

// Globals
import mongoose from 'mongoose';

// Locals
import config from './../config/config';
import dbUtils from './../utils/dbUtils';


const SERVICE_DB = process.config.serviceDb;

let serviceDbInstance = mongoose.createConnection(SERVICE_DB, dbUtils.connectCallback);
// attach the connection to our mongoose instance
mongoose.serviceDb = serviceDbInstance;



exports.clearLocalTestDatabase = function() {
  
  let clearDb = function(dbName) {
    return new Promise((resolve, reject) => {
      mongoose[dbName] = mongoose.createConnection(process.config[dbName], () => {
        let db = mongoose[dbName].db;
        db.dropDatabase(() => {
          db.close();
          resolve();
        });
      });
    });
  };

  return clearDb(SERVICE_DB);
};

'use strict';

// Globals
import mongoose from 'mongoose';

// Locals
import config from './../config/config';


let afterResponse = (err) => {
  if (err) {
    console.error('Database connect error: ', err);
    process.exit(-1);
  }
};
let serviceDbInstance = mongoose.createConnection(process.config.serviceDb, afterResponse);
// attach the connection to our mongoose instance
mongoose.serviceDb = serviceDbInstance;


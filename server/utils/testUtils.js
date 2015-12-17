'use strict';

// Globals
import mongoose from 'mongoose';

// Locals
import config from './../config/config';
import dbUtils from './../utils/dbUtils';


let serviceDbInstance = mongoose.createConnection(process.config.serviceDb, dbUtils.connectCallback);
// attach the connection to our mongoose instance
mongoose.serviceDb = serviceDbInstance;


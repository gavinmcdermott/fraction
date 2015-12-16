'use strict';

// Globals
import mongoose from 'mongoose';

// Locals
import config from './../config/config';


let serviceDbInstance = mongoose.createConnection(process.config.serviceDb);
// attach the connection to our mongoose instance
mongoose.serviceDb = serviceDbInstance;


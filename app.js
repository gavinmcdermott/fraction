'use strict';

// System Dependencies
import express from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import path from 'path';
import q from 'q';
import webpack from 'webpack';
import winston from 'winston';
import url from 'url';

// Local Dependencies
// Note: always bring the config in first
import config from './server/config/config';
import dbUtils from './server/utils/dbUtils';
import serviceDispatch from './server/middleware/serviceDispatch';
import serviceRegistry from './server/services/serviceRegistry';

import webpackConfig from './webpack.config';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import webpackMiddlewareConfig from './webpackMiddleware.config';


// Route normalization
const DIST_PATH = path.join(__dirname + '/dist');
const PUBLIC_PATH = path.join(__dirname + '/app');
const SERVICES_PATH = path.join(__dirname + '/server/services');


// Create DB Connections
let serviceDbInstance = mongoose.createConnection(process.config.serviceDb, dbUtils.connectCallback);
// attach the connection to our mongoose instance
mongoose.serviceDb = serviceDbInstance;
// Use Q promises
mongoose.Promise = require('q').Promise;


// Create the app
let app = express();


// Middleware

// Build webpack comiler based on webpack config
let webpackCompiler = webpack(webpackConfig);
// Attach webpack-dev-middleware and webpack-hot-middleware
app.use(webpackDevMiddleware(webpackCompiler, webpackMiddlewareConfig.DEV));
app.use(webpackHotMiddleware(webpackCompiler, webpackMiddlewareConfig.HOT));



// TODO ADD DISTPATCH AT TOP LEVEL?
// TODO ADD DISTPATCH AT TOP LEVEL?
// TODO ADD DISTPATCH AT TOP LEVEL?
// app.use(serviceRegistry.registry.apis.baseV1, serviceDispatch)



// Handle static files
app.use(express.static(PUBLIC_PATH));
app.use('/dist', express.static(DIST_PATH));


// Load services
serviceRegistry.loadServices(app);


// Handle client routes
app.get('/', (req, res) => { 
  res.sendFile(path.join(PUBLIC_PATH + '/index.html')); 
});


// Export our app instance to start from the appropriate point
module.exports = app;

'use strict'

// System Dependencies
import express from 'express'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'
import path from 'path'
import q from 'q'
import webpack from 'webpack'
import winston from 'winston'
import url from 'url'

// Local Dependencies
// Note: always bring the config in first
import config from './server/config/config'
import dbUtils from './server/utils/dbUtils'
import serviceRegistry from './server/services/serviceRegistry'

import webpackConfig from './webpack.config'
import webpackDevMiddleware from 'webpack-dev-middleware'
import webpackHotMiddleware from 'webpack-hot-middleware'
import webpackMiddlewareConfig from './webpackMiddleware.config'


// Route normalization
const DIST_PATH = path.join(__dirname + '/dist');
const PUBLIC_PATH = path.join(__dirname + '/client');
const SERVICES_PATH = path.join(__dirname + '/server/services');


// Create DB Connections
let serviceDbInstance = mongoose.createConnection(process.config.serviceDb, dbUtils.connectCallback);
// attach the connection to our mongoose instance
mongoose.serviceDb = serviceDbInstance;
// Use Q promises
mongoose.Promise = require('q').Promise;


// Create the app
let app = express();


// TODO: ADD CSP AND CLEANER CORS SUPPORT
// TODO: ADD CSP AND CLEANER CORS SUPPORT
// TODO: ADD CSP AND CLEANER CORS SUPPORT
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});


// Middleware

// Build webpack comiler based on webpack config
let webpackCompiler = webpack(webpackConfig);
// Attach webpack-dev-middleware and webpack-hot-middleware
app.use(webpackDevMiddleware(webpackCompiler, webpackMiddlewareConfig.DEV));
app.use(webpackHotMiddleware(webpackCompiler, webpackMiddlewareConfig.HOT));

// Handle static files
app.use('/public', express.static(PUBLIC_PATH));
app.use('/dist', express.static(DIST_PATH));


// Load services
serviceRegistry.loadServices(app);


// Handle client routes
let sendClient = (res) => {
  return res.sendFile(path.join(PUBLIC_PATH + '/index.html'));
};

app.get('/', (req, res) => { sendClient(res); });
app.get('/signup', (req, res) => { sendClient(res); });
app.get('/login', (req, res) => { sendClient(res); });


// Export our app instance to start from the appropriate point
module.exports = app;

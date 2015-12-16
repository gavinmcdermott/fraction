'use strict';

// System Dependencies
import bodyParser from 'body-parser';
import express from 'express';
import mongoose from 'mongoose';
import path from 'path';
import webpack from 'webpack';
import winston from 'winston';
import url from 'url';

// Local Dependencies
// Note: always bring the config in first
import config from './server/config/config';
import errorHandler from './server/middleware/errorHandler';

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

// possibly put in db utils?
let afterResponse = (err) => {
  if (err) {
    console.error('Database connect error: ', err);
    process.exit(-1);
  }
};

let serviceDbInstance = mongoose.createConnection(process.config.serviceDb, afterResponse);
// attach the connection to our mongoose instance
mongoose.serviceDb = serviceDbInstance;


// Create the app
let app = express();


// Add Middlewares
// Build webpack comiler based on webpack config
let webpackCompiler = webpack(webpackConfig);
// Attach webpack-dev-middleware and webpack-hot-middleware
app.use(webpackDevMiddleware(webpackCompiler, webpackMiddlewareConfig.DEV));
app.use(webpackHotMiddleware(webpackCompiler, webpackMiddlewareConfig.HOT));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Verify any api service being called is valid
app.use(serviceDispatch.verify(serviceRegistry));







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

'use strict';

// System Dependencies
import bodyParser from 'body-parser';
import express from 'express';
import path from 'path';
import webpack from 'webpack';
import winston from 'winston';
import url from 'url';

// Local Dependencies
import config from './server/config/config';
import errorHandler from './server/middleware/errorHandler';
import serviceDispatch from './server/middleware/serviceDispatch';
import serviceLoader from './server/services/serviceLoader';
import webpackConfig from './webpack.config';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import webpackMiddlewareConfig from './webpackMiddleware.config';


// Route normalization
const DIST_PATH = path.join(__dirname + '/dist');
const PUBLIC_PATH = path.join(__dirname + '/app');
const SERVICES_PATH = path.join(__dirname + '/server/services');


// Get an App instance and config
let appConfig = config.load();
let app = express();


// Set up app properties
app.set('express_port', process.env.EXPRESS_PORT);


// Add Middlewares
// Build webpack comiler based on webpack config
let webpackCompiler = webpack(webpackConfig);
// Attach webpack-dev-middleware and webpack-hot-middleware
app.use(webpackDevMiddleware(webpackCompiler, webpackMiddlewareConfig.DEV));
app.use(webpackHotMiddleware(webpackCompiler, webpackMiddlewareConfig.HOT));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(serviceDispatch.verify);


// Handle static files
app.use(express.static(PUBLIC_PATH));
app.use('/dist', express.static(DIST_PATH));


// Load services
serviceLoader.load(app);


// Handle client routes
app.get('/', (req, res) => { 
  res.sendFile(path.join(PUBLIC_PATH + '/index.html')); 
});


// Export our app instance to start from the appropriate point
module.exports = app;

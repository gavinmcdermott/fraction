'use strict';

// Dependencies
import bodyParser from 'body-parser';
import config from './server/config/config'
import express from 'express';
import path from 'path';
import routeloader from './server/utils/routeloader';
import webpack from 'webpack';
import webpackConfig from './webpack.config';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import webpackMiddlewareConfig from './webpackMiddleware.config';


// Route normalization
let DIST_PATH = path.join(__dirname + '/dist');
let PUBLIC_PATH = path.join(__dirname + '/app');
let ROUTES_PATH = path.join(__dirname + '/server/routes');


// Instantiate the App
let appConfig = config.init();
let app = express();


// Load routes
routeloader.loadAPI(app, ROUTES_PATH);


// Add Middlewares
// Build webpack comiler based on webpack config
let webpackCompiler = webpack(webpackConfig);
// Attach webpack-dev-middleware and webpack-hot-middleware
app.use(webpackDevMiddleware(webpackCompiler, webpackMiddlewareConfig.DEV));
app.use(webpackHotMiddleware(webpackCompiler, webpackMiddlewareConfig.HOT));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


// Handle static files
app.use(express.static(PUBLIC_PATH));
app.use('/dist', express.static(DIST_PATH));


















// 
app.get('/', (req, res) => { 
  res.sendFile(path.join(PUBLIC_PATH + '/index.html')); 
});











//  TEST STUFF BELOW HERE!!!
app.set('port', process.env.PORT || 3000);




// Export the app to start it up in a different location (useful for testing)
module.exports = app;

'use strict';


// Dependencies
import path from 'path';
import bodyParser from 'body-parser';
import express from 'express';

import webpack from 'webpack';
import webpackConfig from './webpack.config';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';


// Route normalization
let PUBLIC_PATH = path.join(__dirname + '/app');
let DIST_PATH = path.join(__dirname + '/dist');


// Instantiate the App
let app = express();


// 3rd-party middlewares
// app.use(bodyParser.urlencoded());
// app.use(bodyParser.json());


// Webpack build
// Build webpack comiler based on our config
let webpackCompiler = webpack(webpackConfig);

// Webpack middleware
// Attach webpack-dev-middleware and webpack-hot-middleware
// Further reading: https://github.com/glenjamin/webpack-hot-middleware 
app.use(webpackDevMiddleware(webpackCompiler, {
  noInfo: true,
  historyApiFallback: true,
  publicPath: webpackConfig.output.publicPath,
  stats: {colors: true},
  watchOptions: { aggregateTimeout: 1000, poll: 1000 }
}));
app.use(webpackHotMiddleware(webpackCompiler, {
    log: console.log
}));





// Static directories
app.use(express.static(PUBLIC_PATH));
app.use('/dist', express.static(DIST_PATH));
app.get('/', (req, res) => { 
  console.log('This is <G></G>');
  res.sendFile(path.join(PUBLIC_PATH + '/index.html')); 
});


//  TEST STUFF BELOW HERE!!!
app.set('port', process.env.PORT || 3000);

// import routeloader from './lib/routeloader';
// let routesDir = path.join(__dirname, 'routes');

// Export the app to start it up in a different location (useful for testing)
module.exports = app;










// "start": "babel-node server/server.js --presets es2015,stage-2"
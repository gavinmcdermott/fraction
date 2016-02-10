'use strict'

// System Dependencies
import _ from 'lodash'
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
import config from './config/config'
import serviceRegistry from './services/serviceRegistry'
import fractionErrors from './utils/fractionErrors'

import webpackConfig from './../webpack.config'
import webpackDevMiddleware from 'webpack-dev-middleware'
import webpackHotMiddleware from 'webpack-hot-middleware'
import webpackMiddlewareConfig from './../webpackMiddleware.config'


// Route normalization
const DIST_PATH = path.join(__dirname + './../dist')
const PUBLIC_PATH = path.join(__dirname + './../client')


// Use Q promises
mongoose.Promise = require('q').Promise


// Creat the express app
let app = express()

// TODO: ADD CSP AND CLEANER CORS SUPPORT
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
  next()
})

// Build webpack comiler based on webpack config
let webpackCompiler = webpack(webpackConfig)
// Attach webpack-dev-middleware and webpack-hot-middleware
app.use(webpackDevMiddleware(webpackCompiler, webpackMiddlewareConfig.DEV))
app.use(webpackHotMiddleware(webpackCompiler, webpackMiddlewareConfig.HOT))


function loadApp() {
  // Handle client routes
  let sendClient = (req, res) => {
    return res.sendFile(path.join(PUBLIC_PATH + '/index.html'))
  }

  // Load API Routes
  serviceRegistry.loadServices(app)

  // Handle static files
  app.use('/public', express.static(PUBLIC_PATH))
  app.use('/dist', express.static(DIST_PATH))

  app.get('/', (req, res) => sendClient(req, res))
  app.get('/signup', (req, res) => sendClient(req, res))
  app.get('/login', (req, res) => sendClient(req, res))
  app.get('/logout', (req, res) => sendClient(req, res))
  app.get('/investments*', (req, res) => sendClient(req, res))
  app.get('/admin*', (req, res) => sendClient(req, res))
}


// Create DB Connections
let serviceDbInstance = mongoose.createConnection(process.config.serviceDb, loadApp)
// attach the connection to our mongoose instance
mongoose.serviceDb = serviceDbInstance


// Export our app instance to start from the appropriate point
module.exports = app

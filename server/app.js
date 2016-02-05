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
import config from './config/config'
import dbUtils from './utils/dbUtils'
import serviceRegistry from './services/serviceRegistry'
import fractionErrors from './utils/fractionErrors'
import ensureFractionAdmin from './middleware/ensureFractionAdmin'

import webpackConfig from './../webpack.config'
import webpackDevMiddleware from 'webpack-dev-middleware'
import webpackHotMiddleware from 'webpack-hot-middleware'
import webpackMiddlewareConfig from './../webpackMiddleware.config'


// Route normalization
const DIST_PATH = path.join(__dirname + './../dist')
const PUBLIC_PATH = path.join(__dirname + './../client')


// Create DB Connections
let serviceDbInstance = mongoose.createConnection(process.config.serviceDb, dbUtils.connectCallback)
// attach the connection to our mongoose instance
mongoose.serviceDb = serviceDbInstance
// Use Q promises
mongoose.Promise = require('q').Promise


// Create the app
let app = express()


// TODO: ADD CSP AND CLEANER CORS SUPPORT
// TODO: ADD CSP AND CLEANER CORS SUPPORT
// TODO: ADD CSP AND CLEANER CORS SUPPORT
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
  next()
})



// Middleware

// Build webpack comiler based on webpack config
let webpackCompiler = webpack(webpackConfig)
// Attach webpack-dev-middleware and webpack-hot-middleware
app.use(webpackDevMiddleware(webpackCompiler, webpackMiddlewareConfig.DEV))
app.use(webpackHotMiddleware(webpackCompiler, webpackMiddlewareConfig.HOT))


// Load API Routes
serviceRegistry.loadServices(app)






// CLEAN THIS UP!!!
// CLEAN THIS UP!!!
// CLEAN THIS UP!!!
// Handle static files
app.use('/public', express.static(PUBLIC_PATH))
app.use('/dist', express.static(DIST_PATH))


// Handle client routes
let sendClient = (req, res) => {
  return res.sendFile(path.join(PUBLIC_PATH + '/index.html'))
}

app.get('/', (req, res) => sendClient(req, res))
app.get('/signup', (req, res) => sendClient(req, res))
app.get('/login', (req, res) => sendClient(req, res))
app.get('/logout', (req, res) => sendClient(req, res))
app.get('/dashboard*', (req, res) => sendClient(req, res))

app.get('/admin*', ensureFractionAdmin, (req, res) => res.redirect('/logout'))


// CLEAN THIS UP!!!
// CLEAN THIS UP!!!
// CLEAN THIS UP!!!



// Export our app instance to start from the appropriate point
module.exports = app

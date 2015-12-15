'use strict'

// Globals
import _ from 'lodash'
import express from 'express'
import url from 'url';

// Locals
import serviceRegistry from '../serviceRegistry';


// Constants
const SVC_NAME = 'user';
const SVC_BASE_URL = '/user';

const ROUTE_CREATE_USER = '/';
const ROUTE_GET_USER = '/:userId';


// Service setup

// Expose a router to plug into the main express app
// The router serves as the interface for this service to the outside world
let router = express.Router();


// Service API
router.get(ROUTE_CREATE_USER, function(req, res) {
  console.log('in CREATE');
  res.json({ greeting: 'CREATE!' });
});


router.get(ROUTE_GET_USER, function(req, res) {
  console.log('in get');
  res.json({ greeting: 'GET!' });
});


// Export the service as an object
module.exports = {
  name: SVC_NAME,
  url: SVC_BASE_URL,
  router: router,
  endpoints: [
    { protocol: 'HTTP', method: 'POST', url: ROUTE_CREATE_USER },
    { protocol: 'HTTP', method: 'GET', url: ROUTE_GET_USER }
  ]
};

// Register with the app service registry
serviceRegistry.register(module.exports);

'use strict'

// Globals
import _ from 'lodash';
import express from 'express';
import url from 'url';

// Locals
import User from './userModel';
import { registry }  from './../serviceRegistry';
import { wrapError } from './../../middleware/errorHandler';
import { verify } from './../../middleware/serviceDispatch';


// Constants
const SVC_NAME = 'user';
const SVC_BASE_URL = registry.apis.baseV1 + '/user';

const ROUTE_CREATE_USER = '/';
const ROUTE_GET_USER = '/:userId';


// Service setup

// Expose a router to plug into the main express app
// The router serves as the interface for this service to the outside world
let router = express.Router();


// Service API
router.post(ROUTE_CREATE_USER, (req, res) => {
  console.log('in CREATE');
  res.json({ greeting: 'CREATE!' });
});


router.get(ROUTE_GET_USER, (req, res) => {
  console.log('in get');
  res.json({ greeting: 'GET!' });
});


// Export the service as an object
module.exports = {
  name: SVC_NAME,
  url: SVC_BASE_URL,
  router: router,
  endpoints: [
    { protocol: 'HTTP', method: 'POST', name: 'CREATE_USER', url: ROUTE_CREATE_USER },
    { protocol: 'HTTP', method: 'GET', name: 'GET_USER', url: ROUTE_GET_USER }
  ]
};

// Register with the app service registry
registry.register(module.exports);

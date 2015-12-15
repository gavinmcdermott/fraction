'use strict'

import _ from 'lodash'
import express from 'express'
import serviceRegistry from '../serviceRegistry';
import url from 'url';


// set the name of the service to register
const SVC_NAME = _.last(__dirname.split('/'));
const SVC_BASE_URL = '/' + SVC_NAME;


// 
let router = express.Router();


const CREATE_USER_ROUTE = '/';
const GET_USER_ROUTE = '/:userId';



router.get(CREATE_USER_ROUTE, function(req, res) {
  console.log('in CREATE');
  res.json({ greeting: 'CREATE!' });
});


router.get(GET_USER_ROUTE, function(req, res) {
  console.log('in get');
  res.json({ greeting: 'GET!' });
});




console.log('WAAAAT');
serviceRegistry.register({
  name: SVC_NAME, 
  url: SVC_BASE_URL,
  router: router,
  endpoints: [
    { protocol: 'HTTP', method: 'POST', url: CREATE_USER_ROUTE },
    { protocol: 'HTTP', method: 'GET', url: GET_USER_ROUTE }
  ]
});


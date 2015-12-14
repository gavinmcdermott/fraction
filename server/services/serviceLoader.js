'use strict';

// System Dependencies
import _ from 'lodash';
import fs from 'fs';
import path from 'path';
import url from 'url';

// Local Deps
import serviceRegistry from './serviceRegistry'


/**
 * Load all services for the express app
 *
 * @param {app} obj Current instance of the running express app
 * @param {allServices} string Directory path to all services
 */
module.exports.load = (app) => {
  _.forEach(serviceRegistry.services, (svc) => {
    let module = require('./user/userService');

    let urlBase = serviceRegistry.SERVICE_API_BASE_V1 + svc.url;
    app.use(urlBase, svc.router);
    console.log(svc.name.toUpperCase() + ' SERVICE STATUS: Loaded');
  });
};

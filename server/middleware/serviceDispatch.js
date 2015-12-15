'use strict';

// Globals
import _ from 'lodash';
import url from 'url';

// Locals
import serviceRegistry from './../services/serviceRegistry';

let registry = serviceRegistry.registry;


/**
 * Verify that if a url is calling a Fraction service, the
 * service is a valid one
 *
 * @param {req} obj Express request object
 * @param {res} obj Express response object
 * @param {next} obj Express next object
 */
module.exports.verify = (req, res, next) => {
  let parsedUrl = url.parse(req.url);
  let path = parsedUrl.pathname;
  let pathParams = parsedUrl.pathname.split('/');

  // if the request is not for any of our apis / services, bail out
  if (!_.contains(path, registry.apis.baseV1)) {
    return next();
  }
  
  // check to make sure the path has a valid service
  let invalidService = _.filter(pathParams, (param) => {
    return _.has(registry.services, param);
  }).length !== 1;

  if (invalidService) {
    throw new Error('Attempting to call an unregistered service: ' + path);
  }

  next();
};

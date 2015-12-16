'use strict';

// Globals
import _ from 'lodash';
import url from 'url';

/**
 * Verify that if a url is calling a Fraction service, the
 * service is a valid one
 *
 * @param {registry} obj Service registry object
 */
module.exports.verify = (registry) => {
  /**
   * Return function for express middleware
   *
   * @param {req} obj Express request object
   * @param {res} obj Express response object
   * @param {next} obj Express next object
   */
  return (req, res, next) => {
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
  }
};

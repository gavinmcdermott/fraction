'use strict';

import _ from 'lodash';
import url from 'url';

import serviceRegistry from './../services/serviceRegistry';



module.exports.verify = (req, res, next) => {
  let parsedUrl = url.parse(req.url);
  let path = parsedUrl.pathname;

  if (!_.contains(path, serviceRegistry.SERVICE_API_BASE_V1)) {
    return next();
  }
  
  let possibleServices = _.filter(serviceRegistry.services, (svc) => {
    let params = _.trim(path, serviceRegistry.SERVICE_API_BASE_V1).split('/');
    return _.indexOf(params, svc.name) !== -1;
  });
  if (possibleServices.length !== 1) {
    throw new Error('Attempting to call an unregistered service: ' + path);
  }
  next();
};

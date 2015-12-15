'use strict';

import _ from 'lodash';

const SERVICE_API_BASE_V1 = '/api/v1';


class ServiceRegistry {
  
  constructor() {
    this.SERVICE_API_BASE_V1 = SERVICE_API_BASE_V1;
    this.__services = []
  };

  register(registration) {
    var services = _.filter(this.__services, (service) => {
      return service.name === registration.name;
    });
    if (services.length) {
      throw new Error('Attempting to overwrite an existing service. [' + registration.name + '] already exists.');
    }
    _.forEach(registration.endpoints, (endpoint) => {
      console.log(registration.name.toUpperCase(), 'SERVICE LOADING ENDPOINT: ', endpoint.url);
    });
    return this.__services.push(registration);    
  };

  get services() {
    return this.__services;
  };

  clearServices(confirm) {
    if (confirm) {
      return this.__services = [];
    }
  };

}

module.exports = new ServiceRegistry();

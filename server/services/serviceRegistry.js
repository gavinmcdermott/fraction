'use strict';

import _ from 'lodash';

const SERVICE_API_BASE_V1 = '/api/v1';



module.exports = {

  SERVICE_API_BASE_V1: SERVICE_API_BASE_V1,

  register: function(registration) {
    var services = _.filter(this.services, (service) => {
      return service.name === registration.name;
    });
    if (services.length) {
      throw new Error('Attempting to overwrite an existing service. [', registrationObj.name , '] already exists.');
    }
    _.forEach(registration.endpoints, (endpoint) => {
      console.log(registration.name.toUpperCase(), 'SERVICE LOADING ENDPOINT: ', endpoint.url);
    });
    return this.services.push(registration);
  },
  
  services: []
};

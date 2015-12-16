'use strict';

// Globals
import _ from 'lodash';
import fs from 'fs';
import path from 'path';
import assert from 'assert';
import validator from 'validator';

// Locals
import serviceDispatch from './../middleware/serviceDispatch';


// Constants
// Initial service api url base
const API_BASE_V1 = '/api/v1';

// Keys that any service being registered is expected to have
// TODO: sanity check types on the way in
const VALID_KEYS = ['name', 'url', 'router', 'endpoints'];


// Locals
// Lets service consumers know valid service version urls
let apis = { baseV1: API_BASE_V1 };

// Hols all currently registered services in memory
let services = {};

let registry;


/**
 * Class: Service Registry
 * 
 * Handles in-memory registration of app services
 * (to be extracted out to a service when moving to containers)
 */
class ServiceRegistry {

  /**
   * Register a new service for use in the app
   *
   * @param {newService} obj service object to register
   */
  register(newService) {
    // Ensure only/all expected keys exist
    if (_.xor(_.keys(newService), VALID_KEYS).length) {
      throw new Error('Invalid service newService: ' + newService.name + ' service');
    }
    
    // TODO: better sanity checks with validator
    assert(typeof newService.name === 'string');
    assert(typeof newService.url === 'string');
    assert(newService.url === '/' + newService.name);
    assert(typeof newService.router === 'function');
    assert(typeof newService.endpoints === 'object');

    if (_.has(services, newService.name)) {
      throw new Error('Attempting to overwrite an existing service. [' + newService.name + '] already exists.');
    }
    return services[newService.name] = newService;
  };

  /**
   * Return all currently registered services
   */
  get services() {
    return services;
  };

  /**
   * Returns information about the service apis
   */
  get apis() {
    return apis;
  }

  /**
   * Wipes out all registered services
   *
   * @param {confirm} bool Explicit variable to wipe the services
   */
  clearServices(confirm) {
    if ((process.env.NODE_ENV === 'test') && confirm) {
      services = {};
      return true;
    }
    throw new Error('Attempt to clear services in non-test environment');
  };
}
registry = new ServiceRegistry();


/**
 * Dynamically load all services for the express app
 * (to be extracted out to a service when moving to containers)
 *
 * @param {app} obj Current instance of the running express app
 */
let loadServices = (app) => {
  let allItems = fs.readdirSync(__dirname);
  let allFolders = _.filter(allItems, (item) => { return !_.endsWith(item, '.js'); })
  let moduleFolders = _.filter(allFolders, (folder) => { 
    return (fs.lstatSync(__dirname + '/' + folder).isDirectory()) &&
           (folder !== 'test');
  });

  _.forEach(moduleFolders, (moduleName) => {
    let moduleFolderPath = path.join(__dirname, moduleName);
    let loadPath = moduleFolderPath + '/' + moduleName + 'Service';
    let newModule = require(loadPath);
    app.use(newModule.url, newModule.router);
    // Let user know module status
    console.log(moduleName.toUpperCase() + ' SERVICE STATUS: LOADED'); 
  });

  app.use(serviceDispatch.verify(registry));


};


module.exports = {
  registry: registry,
  loadServices: _.once(loadServices)
};

'use strict'

// Globals
import _ from 'lodash'
import fs from 'fs'
import path from 'path'
import assert from 'assert'
import validator from 'validator'
import * as serviceConfig from './serviceConfig'


// Constants

// Initial service api url base
const API_BASE_V1 = '/api/v1'

// Keys that any service being registered is expected to have
// TODO: sanity check types on the way in
const VALID_KEYS = ['name', 'url', 'router', 'endpoints']

const VALID_SERVICES = serviceConfig.services


// Locals
// Lets service consumers know valid service version urls
let apis = { baseV1: API_BASE_V1 }

// Our in-memory registry of services
// NOTE: anything registered will have to be in VALID_SERVICES to be registered
let currentServices = {}

// The service registry instance for the app
let registry


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
    // Ensure
    if (!_.has(VALID_SERVICES, newService.name)) {
      throw new Error('[INVALID SERVICE NAME] Attempted to register: ' + newService.name + ' service.')
    }

    // Ensure only/all expected keys exist
    if (_.xor(_.keys(newService), VALID_KEYS).length) {
      throw new Error('[INVALID SERVICE PROPERTIES] Invalid properties found when registering ' + newService.name + ' service.')
    }
    
    // TODO: better sanity checks with validator!
    assert(typeof newService.name === 'string')
    assert(typeof newService.url === 'string')
    assert(_.startsWith(newService.url, '/'))
    assert(typeof newService.router === 'function')
    assert(typeof newService.endpoints === 'object')

    if (_.has(currentServices, newService.name)) {
      throw new Error('[SERVICE EXISTS] Attempted to overwrite ' + newService.name + ' service.')
    }
    return currentServices[newService.name] = newService
  }

  /**
   * Return all currently registered services
   */
  get services() {
    return currentServices
  }

  /**
   * Returns information about the service apis
   */
  get apis() {
    return apis
  }

  /**
   * Wipes out all registered services
   *
   * @param {confirm} bool Explicit variable to wipe the services
   */
  clearServices(confirm) {
    if ((process.env.NODE_ENV === 'test') && confirm) {
      currentServices = {}
      return true
    }
    throw new Error('Attempt to clear services in non-test environment')
  }
}
registry = new ServiceRegistry()


/**
 * Dynamically load all services for the express app
 * (to be extracted out to a service when moving to containers)
 *
 * @param {app} obj Current instance of the running express app
 */
let loadServices = (app, config) => {
    
  assert(app && _.isObject(app))

  // Helper function to load a single service into the app
  function loadService(service, name) {
    // Attempt to load the service provide a nice error in failure
    let serviceModule = require(service.loadPath)
    app.use(serviceModule.url, serviceModule.router)
    console.log('LOADED: ' + name.toUpperCase() + ' SERVICE')
  }

  _.forIn(VALID_SERVICES, (service, name) => {
    loadService(service, name)
  })
  console.log( _.keys(VALID_SERVICES).length + ' SERVICES READY' + '\n')
  return true
}

module.exports = {
  registry: registry,
  loadServices: loadServices
}

'use strict';

// Globals
import _ from 'lodash'
import express from 'express'
import serviceRegistry from './../serviceRegistry'
import * as serviceConfig from './../serviceConfig'

// Locals
let registry = serviceRegistry.registry
let services = serviceConfig.services

var validServiceA = _.keys(services)[0]
var validServiceB = _.keys(services)[1]


// Service registry test suite
describe('Service Registry', function() {

  let fakeRouter = () => {};

  let missingNameModule = { url: '/test', router: fakeRouter, endpoints: [] };
  
  let missingUrlModule = { name: 'test', router: fakeRouter, endpoints: [] };
  let invalidUrlModule = { name: 'test',url: 'some bad url', router: fakeRouter, endpoints: [] };
  
  let missingRouterModule = { url: '/', name: 'test', endpoints: [] };
  
  let missingEndpointsModule = { name: 'test', router: fakeRouter };
  
  let invalidObjectsModule = { url: 132, name: 132, router: ';', endpoints: 123 };
  
  let validModule1 = { url: '/' + validServiceA, name: validServiceA, router: fakeRouter, endpoints: [] };
  let validModule2 = { url: '/' + validServiceB, name: validServiceB, router: fakeRouter, endpoints: [] };

  beforeAll(() => {
    console.log('');
    console.log('Starting service registry tests');
  });

  afterEach(() => {
    registry.clearServices(true);
  });

  it('should throw if trying to register without a name', () => {
    var thrower = () => { registry.register(missingNameModule); };
    expect(thrower).toThrow();
  });

  it('should throw if trying to register without a url', () => {
    var thrower = () => { registry.register(missingUrlModule); };
    expect(thrower).toThrow();
  });

  it('should throw if trying to register with an invalid url', () => {
    var thrower = () => { registry.register(invalidUrlModule); };
    expect(thrower).toThrow();
  });


  it('should throw if trying to register without a router', () => {
    var thrower = () => { registry.register(missingRouterModule); };
    expect(thrower).toThrow();
  });
  
  it('should throw if trying to register without endpoints', () => {
    var thrower = () => { registry.register(missingEndpointsModule); };
    expect(thrower).toThrow();
  });

  it('should throw if trying to register with invalid objects', () => {
    var thrower = () => { registry.register(invalidObjectsModule); };
    expect(thrower).toThrow();
  });

  it('should throw if attmepting to overwrite a an existing service', () => {
    var thrower = () => { 
      registry.register(validModule1);
      registry.register(validModule1);
    };
    expect(thrower).toThrow();
  });

  it('should register a valid module', () => {
    registry.register(validModule1);
    expect(_.keys(registry.services).length).toBe(1);
  });

  it('should register more than a single valid module', () => {
    registry.register(validModule1);
    registry.register(validModule2);
    expect(_.keys(registry.services).length).toBe(2);
  });

});

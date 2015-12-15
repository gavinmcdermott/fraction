'use strict';

// Globals
import _ from 'lodash';
import express from 'express';
import serviceRegistry from './../serviceRegistry';

// Locals
let registry = serviceRegistry.registry;

// Service registry test suite
describe('Service Registry', function() {

  let missingNameModule = { url: '/test', router: {}, endpoints: [] };

  let missingUrlModule = { name: 'test', router: {}, endpoints: [] };
  let invalidUrlModule = { name: 'test',url: 'some bad url', router: {}, endpoints: [] };
  
  let missingRouterModule = { url: '/', name: 'test', endpoints: [] };
  let missingEndpointsModule = { name: 'test', router: {} };
  
  let invalidObjectsModule = { url: 132, name: 132, router: ';', endpoints: 123 };
  
  let validModule1 = { url: '/test1', name: 'test1', router: {}, endpoints: [] };
  let validModule2 = { url: '/test2', name: 'test2', router: {}, endpoints: [] };

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

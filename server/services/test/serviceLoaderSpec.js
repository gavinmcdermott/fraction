'use strict';

import assert from 'assert';
import sinon from 'sinon';
import express from 'express';

import serviceRegistry from './../serviceRegistry';
import serviceLoader from './../serviceLoader';

describe('Service Loader', function() {

  // Mock request data
  let testApp = express();
  let router = express.Router();

  // ensure next was called when we desire
  let mockApp = sinon.mock(testApp);
  mockApp.expects("use");

  before(() => {
    // Set up any dependencies
    serviceRegistry.register({
      name: 'testService',
      url: '/testService',
      router: router,
      endpoints: []
    })    
  });

  it('should throw if trying to dispatch to an unregistered service', () => {
    serviceLoader.load(mockApp);
    assert(mockApp.use.called)
  });

});

'use strict';

import assert from 'assert';
import sinon from 'sinon';
import serviceDispatch from'./../../middleware/serviceDispatch';
import serviceRegistry from './../../services/serviceRegistry';

describe('Service Dispatch', function() {

  // Mock request data
  let noSvcReq = { url: '/some/non/service/resource' };
  let badSvcReq = { url: serviceRegistry.SERVICE_API_BASE_V1 + '/badService' };
  let goodSvcReq = { url: serviceRegistry.SERVICE_API_BASE_V1 + '/testService' };
  
  // ensure next was called when we desire
  let next = sinon.spy();

  before(() => {
    // Set up any dependencies
    serviceRegistry.register({
      name: 'testService',
      url: '/testService'
    })    
  });

  it('should throw if trying to dispatch to an unregistered service', () => {
    let thrower = () => {
      serviceDispatch.verify(badSvcReq, {}, next);
    }
    assert.throws(thrower);
  });

  it('should call next if there is no service involvement', () => {
    serviceDispatch.verify(noSvcReq, {}, next);
    assert(next.called);
  });

  it('should call next if dispatching to a valid service', () => {
    serviceDispatch.verify(goodSvcReq, {}, next);
    assert(next.called);
  });

});

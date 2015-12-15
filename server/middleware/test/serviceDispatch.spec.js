'use strict';

import serviceDispatch from'./../serviceDispatch';
import serviceRegistry from './../../services/serviceRegistry';

describe('Service Dispatch', function() {

  // Mock request data
  let noSvcReq = { url: '/some/non/service/resource' };
  let badSvcReq = { url: serviceRegistry.SERVICE_API_BASE_V1 + '/badService' };
  let goodSvcReq = { url: serviceRegistry.SERVICE_API_BASE_V1 + '/testService' };
  
  // ensure next was called when we desire
  let next = jasmine.createSpy();

  beforeEach(() => {
    // Set up any dependencies
    serviceRegistry.register({
      name: 'testService',
      url: '/testService'
    })    
  });

  afterEach(() => {
    // Set up any dependencies
    serviceRegistry.clearServices(true);
  });

  it('should throw if trying to dispatch to an unregistered service', () => {
    let thrower = () => {
      serviceDispatch.verify(badSvcReq, {}, next);
    }
    expect(thrower).toThrow();
  });

  it('should call next if there is no service involvement', () => {
    serviceDispatch.verify(noSvcReq, {}, next);
    expect(next).toHaveBeenCalled();
  });

  it('should call next if dispatching to a valid service', () => {
    serviceDispatch.verify(goodSvcReq, {}, next);
    expect(next).toHaveBeenCalled();
  });

});

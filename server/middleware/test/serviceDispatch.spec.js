'use strict';

import serviceDispatch from'./../serviceDispatch';
import serviceRegistry from './../../services/serviceRegistry';


let registry = serviceRegistry.registry;


describe('Service Dispatch', function() {

  // Mock request data
  let noSvcReq = { url: '/some/non/service/resource' };
  let badSvcReq = { url: registry.apis.baseV1 + '/badService/and/some/more' };
  let goodSvcReq = { url: registry.apis.baseV1 + '/testService' };
  
  // ensure next was called when we desire
  let next = jasmine.createSpy();

  beforeEach(() => {
    // Set up any dependencies
    registry.register({
      name: 'testService',
      url: '/testService',
      router: {},
      endpoints: []
    })    
  });

  afterEach(() => {
    // Set up any dependencies
    registry.clearServices(true);
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

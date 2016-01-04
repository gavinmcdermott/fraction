// 'use strict';

// // Globals
// import express from 'express';
// import request from 'supertest';

// // Locals
// import serviceDispatch from'./../serviceDispatch';
// import serviceRegistry from './../../services/serviceRegistry';

// let app = express();
// let registry = serviceRegistry.registry;


// // Service dispatch middleware testing
// describe('Service Dispatch as Plain Object', function() {

//   // Mock request data
//   let noSvcReq = { url: '/some/non/service/resource' };
//   let badSvcReq = { url: registry.apis.baseV1 + '/badService/and/some/more' };
//   let goodSvcReq = { url: registry.apis.baseV1 + '/__testA' };
  
//   beforeEach(() => {
//     // Register a fake service
//     registry.register({
//       name: '__testA',
//       url: '/__testA',
//       router: () => {},
//       endpoints: []
//     });
//   });

//   afterEach(() => {
//     registry.clearServices(true);
//   });

//   it('should throw if trying to dispatch to an unregistered service', () => {
//     let next = jasmine.createSpy();
//     let thrower = () => {
//       serviceDispatch.verify(registry)(badSvcReq, {}, next);
//     }
//     expect(thrower).toThrow();
//   });

//   it('should call next if there is no service involvement', () => {
//     let next = jasmine.createSpy();
//     serviceDispatch.verify(registry)(noSvcReq, {}, next);
//     expect(next).toHaveBeenCalled();
//   });

//   it('should call next if dispatching to a valid service', () => {
//     let next = jasmine.createSpy();
//     serviceDispatch.verify(registry)(goodSvcReq, {}, next);
//     expect(next).toHaveBeenCalled();
//   });

// });

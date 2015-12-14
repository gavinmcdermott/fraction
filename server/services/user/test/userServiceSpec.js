// 'use strict';

// import assert from 'assert';
// import sinon from 'sinon';
// import serviceDispatch from'./../serviceDispatch';
// import serviceRegistry from './../../services/serviceRegistry';

// describe('User Service', function() {

  
//   // ensure next was called when we desire
//   let next = sinon.spy();

//   before(() => {
//     // Set up any dependencies
//     serviceRegistry.register({
//       name: 'testService',
//       url: '/testService'
//     })    
//   });

//   it('should throw if trying to dispatch to an unregistered service', () => {
//     let thrower = () => {
//       serviceDispatch.verify(badSvcReq, {}, next);
//     }
//     assert.throws(thrower);
//   });

//   it('should call next if there is no service involvement', () => {
//     serviceDispatch.verify(noSvcReq, {}, next);
//     assert(next.called);
//   });

//   it('should call next if dispatching to a valid service', () => {
//     serviceDispatch.verify(goodSvcReq, {}, next);
//     assert(next.called);
//   });

// });

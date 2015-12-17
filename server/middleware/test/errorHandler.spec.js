'use strict';

// Globals
import request from 'supertest';
import express from 'express';

// Locals
import testUtils from './../../utils/testUtils';
// Note: Import the one service we want to explicitly test 
// We don't need to load the whole app
import { errorWrap, FractionError } from './../errorHandler';


let app = express();
let requester = request(app);


describe('errorWrap Middleware', () => {
  
  let foo
  let mockReq = {};
  let mockRes = { send: () => {} };

  let errorMsg = 'some thrown error message';
  let innerThrower = () => { throw new Error(errorMsg); };
    

  beforeEach(() => {
    spyOn(mockRes, 'send');
  });
  
  
  it('is something here', (done) => {
    errorWrap(innerThrower)(mockReq, mockRes);
    setTimeout(function() {
      expect(mockRes.send).toHaveBeenCalled();
      done();
    }, 0);
  });
});


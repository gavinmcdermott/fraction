'use strict';

// Globals
import request from 'supertest';
import express from 'express';

// Locals
import testUtils from './../../../utils/testUtils';
import { registry, loadServices } from './../../serviceRegistry';
// Note: Import the one service we want to explicitly test 
// We don't need to load the whole app
import userService from './../userService';


let app = express();
let requester = request(app);

loadServices(app);

describe('Create User', () => {
  
  let postUrl = userService.url + '/';

  beforeEach(()=> {
    
  });

  afterEach(() => {

  });

  it('demo with request', (done) => {
    requester
      .post(postUrl)
      .expect(200)
      .expect('Content-Type', /json/)
      .end((err, res) => {
        expect(res.body.greeting).toBe('CREATE!');
        done();
      });
  });
});


'use strict';

// Globals
import request from 'supertest';
import express from 'express';

// Locals
import userService from './../userService';



let app = express();

app.use(userService.url, userService.router);


describe('Create User', () => {
  
  let postUrl = userService.url + '/';

  // beforeEach(()=> {

  // });

  // afterEach(() => {

  // });

  it('demo with request', (done) => {
    
    request(app)
      .post(postUrl)
      .expect(200)
      .expect('Content-Type', /json/)
      .end((err, res) => {
        
        done();
      });
  });
});


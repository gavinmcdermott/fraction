'use strict';

// Globals
import request from 'supertest';
import express from 'express';

// Locals
import userService from './../userService';



let app = express();

app.use(userService.url, userService.router);


describe('Create User', () => {
  
  let getUrl = userService.url + '/12345';

  beforeEach(()=> {

  });

  afterEach(() => {

  });

  it('demo with request', (done) => {
    request(app)
      .get(getUrl)
      .expect(200)
      .end((err, res) => {
        
        console.log(res.body);
        done();
      });
  });
});


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




describe('User Service', function() {

  // http://bitwiseshiftleft.github.io/sjcl/demo/
  // var bitArray = sjcl.hash.sha256.hash("message");  
  // var digest_sha256 = sjcl.codec.hex.fromBits(bitArray); 
  let validPassword = 'ab530a13e45914982b79f9b7e3fba994cfd1f3fb22f71cea1afbf02b460c6d1d'
  let invalidPassword = 'some_crappy_password';

  let validEmail = 'testUser@foo.com';
  let invalidEmail = 'testUser@foo';

  beforeAll((done) => {
    testUtils
    .clearLocalTestDatabase()
    .then(() => {
      done();
    });
  });





  describe('Create', () => {
    
    let postUrl = userService.url + '/';

    beforeEach(()=> {
      
    });

    afterEach(() => {

    });

    it('fails without an email', (done) => {
      
      requester
        .post(postUrl)
        .send({ password: validPassword })
        .expect(400)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          expect(res.body.message).toBe('invalid email');
          expect(res.body.status).toBe(400);
          done();
        });
    });

    it('fails with an invalid email', (done) => {
      requester
        .post(postUrl)
        .send({ password: validPassword, email: invalidEmail })
        .expect(400)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          expect(res.body.message).toBe('invalid email');
          expect(res.body.status).toBe(400);
          done();
        });
    });

    it('fails without a password', (done) => {
      requester
        .post(postUrl)
        .send({ email: validEmail })
        .expect(400)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          expect(res.body.message).toBe('invalid password');
          expect(res.body.status).toBe(400);
          done();
        });
    });

    it('fails without a first name', (done) => {
      requester
        .post(postUrl)
        .send({ email: validEmail, password: validPassword })
        .expect(400)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          expect(res.body.message).toBe('invalid first name');
          expect(res.body.status).toBe(400);
          done();
        });
    });





  });



  
});





















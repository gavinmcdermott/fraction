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
import User from './../userModel';


let app = express();
let requester = request(app);

loadServices(app);


describe('User Service', function() {

  // http://bitwiseshiftleft.github.io/sjcl/demo/
  // var bitArray = sjcl.hash.sha256.hash("message");  
  // var digest_sha256 = sjcl.codec.hex.fromBits(bitArray); 
  let validPassword = 'ab530a13e45914982b79f9b7e3fba994cfd1f3fb22f71cea1afbf02b460c6d1d'
  let invalidPassword = '';

  let validEmail = 'testUser@foo.com';
  let normalizedValidEmail = validEmail.toLowerCase();
  let invalidEmail = 'testUser@foo';

  let firstName = 'Alan';
  let lastName = 'Kay';

  describe('Create New User', () => {
    
    let postUrl = userService.url + '/';

    beforeAll((done) => {
      testUtils.clearLocalTestDatabase()
      .then(() => {
        done();
      });
    });

    afterAll((done) => {
      testUtils.clearLocalTestDatabase()
      .then(() => {
        done();
      });
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

    it('fails with an invalid password', (done) => {
      requester
        .post(postUrl)
        .send({ email: validEmail, password: invalidPassword })
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

    it('fails without a last name', (done) => {
      requester
        .post(postUrl)
        .send({ email: validEmail, password: validPassword, firstName: firstName })
        .expect(400)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          expect(res.body.message).toBe('invalid last name');
          expect(res.body.status).toBe(400);
          done();
        });
    });

    it('succeeds', (done) => {
      requester
        .post(postUrl)
        .send({ email: validEmail, password: validPassword, firstName: firstName, lastName: lastName  })
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          expect(res.body.user).toBeDefined();
          let newUser = res.body.user;
          
          // Ensure we're returning the new normalized user
          expect(newUser.name).toBeDefined();
          expect(newUser.name.first).toEqual(firstName);
          expect(newUser.name.last).toEqual(lastName);
          
          expect(newUser.email).toBeDefined();
          expect(newUser.email.email).toEqual(normalizedValidEmail);
          expect(newUser.email.verified).toBe(true);

          expect(newUser.local).toBeDefined();
          expect(newUser.local.id).toEqual(normalizedValidEmail);

          expect(newUser.notifications).toBeDefined();
          expect(newUser.notifications.viaEmail).toBe(true);
          done();
        });
    });
  });
  
});

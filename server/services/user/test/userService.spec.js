'use strict';

// Globals
import request from 'supertest';
import express from 'express';

// Locals
import testUtils from './../../../utils/testUtils';
import serviceRegistry from './../../serviceRegistry';
// Note: Import the one service we want to explicitly test 
// We don't need to load the whole app
import userService from './../userService';


let app = express();
let requester = request(app);
serviceRegistry.loadServices(app);


// Service Tests

describe('User Service', function() {

  // http://bitwiseshiftleft.github.io/sjcl/demo/
  // var bitArray = sjcl.hash.sha256.hash("message");  
  // var digest_sha256 = sjcl.codec.hex.fromBits(bitArray); 
  let validPassword = 'ab530a13e45914982b79f9b7e3fba994cfd1f3fb22f71cea1afbf02b460c6d1d';
  let invalidPassword = '';

  let validEmail = 'testUser@foo.com';
  let invalidEmail = 'testUser@foo';
  let normalizedValidEmail = validEmail.toLowerCase();

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

    it('succeeds with valid user data', (done) => {
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

          expect(newUser.id).toBeDefined();

          expect(newUser.notifications).toBeDefined();
          expect(newUser.notifications.viaEmail).toBe(true);
          done();
        });
    });

    it('enforces unique emails as a signup constraint', (done) => {
      requester
        .post(postUrl)
        .send({ email: validEmail, password: validPassword, firstName: firstName, lastName: lastName  })
        .expect(403)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          expect(res.body.status).toBe(403);
          expect(res.body.message).toEqual('user exists');
          done();
        });
    });
  });


  describe('Update Existing User', () => {
    
    let user;
    let updateUrl;
    let badUpdateUrl = userService.url + '/5689a9f38b7512cf1b0e497f23scD';

    let newFirstName = 'Gavin';
    let newLastName = 'McD';
    let newEmail = 'someNewemail@fraction.com';
    let normalizedNewEmail = newEmail.toLowerCase();
    let newEmailNotification = false;

    beforeAll((done) => {
      testUtils.clearLocalTestDatabase()
        .then(() => testUtils.addTestUser(requester))
        .then((testUser) => {
          user = testUser;
          updateUrl = userService.url + '/' + user.id;
          done();
        });
    });

    afterAll((done) => {
      testUtils.clearLocalTestDatabase()
      .then(() => {
        done();
      });
    });

    it('fails without an existing user', (done) => {
      requester
        .put(badUpdateUrl)
        .send()
        .expect(404)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          expect(res.body.message).toBe('missing user');
          expect(res.body.status).toBe(404);
          done();
        });
    });

    it('fails when trying to update to an invalid email', (done) => {
      requester
        .put(updateUrl)
        .send({ user: { email: { email: invalidEmail } } })
        .expect(400)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          expect(res.body.message).toBe('invalid email');
          expect(res.body.status).toBe(400);
          done();
        });
    });

    it('fails when trying to update to an invalid first name', (done) => {
      requester
        .put(updateUrl)
        .send({ user: { name: { first: '', last: 'McD' } } })
        .expect(400)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          expect(res.body.message).toBe('invalid first name');
          expect(res.body.status).toBe(400);
          done();
        });
    });

    it('fails when trying to update to an invalid last name', (done) => {
      requester
        .put(updateUrl)
        .send({ user: { name: { first: 'Gavin', last: '' } } })
        .expect(400)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          expect(res.body.message).toBe('invalid last name');
          expect(res.body.status).toBe(400);
          done();
        });
    });

    it('fails when trying to update with an invalid notification bool', (done) => {
      requester
        .put(updateUrl)
        .send({ user: { notifications: { viaEmail: 'notAbool' } } })
        .expect(400)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          expect(res.body.message).toBe('invalid email notification setting');
          expect(res.body.status).toBe(400);
          done();
        });
    });

    it('updates valid settings: all new settings', (done) => {
      requester
        .put(updateUrl)
        .send({ 
          user: { 
            name: { first: newFirstName, last: newLastName },
            email: { email: newEmail },
            notifications: { viaEmail: newEmailNotification }
          }
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          expect(res.body.user).toBeDefined();
          expect(res.body.user.name.first).toEqual(newFirstName);
          expect(res.body.user.name.last).toEqual(newLastName);
          expect(res.body.user.email.email).toEqual(normalizedNewEmail);
          expect(res.body.user.notifications.viaEmail).toBe(newEmailNotification);
          done();
        });
    });

    it('updates valid settings: a couple new settings', (done) => {
      let first = 'Heythere';
      let last = 'McGillicutty';
      let notifications = true;

      requester
        .put(updateUrl)
        .send({ 
          user: { 
            name: { first: first, last: last },
            notifications: { viaEmail: notifications }
          }
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          expect(res.body.user).toBeDefined();
          expect(res.body.user.name.first).toEqual(first);
          expect(res.body.user.name.last).toEqual(last);
          expect(res.body.user.email.email).toEqual(normalizedNewEmail);
          expect(res.body.user.notifications.viaEmail).toBe(notifications);
          done();
        });
    });

  });
  
});















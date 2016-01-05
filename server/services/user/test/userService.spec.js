'use strict';

// Locals
import testUtils from './../../../utils/testUtils';
// Note: only import the service we want to test 
import userService from './../userService';


// Load the test app for this suite
testUtils.loadTestServices();

// Access the test app's supertest object
let requester = testUtils.requester;

let testUser = testUtils.testUser;


// Service Tests

describe('User Service: ', function() {

  let validPassword = testUser.password;
  let invalidPassword = '';

  let validEmail = testUser.email;
  let invalidEmail = 'testUser@foo';
  let normalizedValidEmail = validEmail.toLowerCase();

  let firstName = testUser.firstName;
  let lastName = testUser.lastName;


  // CREATE

  describe('Create New User: ', () => {

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


  // LOG IN

  describe('Logging In: ', () => {

    let user;
    let token;
    let logInUrl = userService.url + '/login';

    beforeAll((done) => {
      testUtils.clearLocalTestDatabase()
        .then(() => testUtils.addTestUser(userService))
        .then((testUser) => {
          user = testUser;
          done();
        });
    });

    afterAll((done) => {
      testUtils.clearLocalTestDatabase()
      .then(() => {
        done();
      });
    });

    it('does not log in a user that cannot be found', (done) => {
      let nonExistentUser = { email: 'someValid@email.com', password: 'somepassw0rd' };

      requester
        .post(logInUrl)
        .send(nonExistentUser)
        .expect(404)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          expect(res.body.message).toBe('user not found');
          expect(res.body.status).toBe(404);
          done();
        });
    });

    it('logs in an existing valid user', (done) => {
      requester
        .post(logInUrl)
        .send({ email: user.email.email, password: testUser.password })
        .expect(404)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          expect(res.body.token).toBeDefined();
          expect(res.body.user).toBeDefined();
          done();
        });
    });
  });
  

  // UPDATE

  describe('Update Existing User: ', () => {
    
    let user;
    let token;

    let updateUrl;
    let badUpdateUrl = userService.url + '/5689a9f38b7512cf1b0e497f23scD';

    let newFirstName = 'Gavin';
    let newLastName = 'McD';
    let newEmail = 'someNewemail@fraction.com';
    let normalizedNewEmail = newEmail.toLowerCase();
    let newEmailNotification = false;

    beforeAll((done) => {
      testUtils.clearLocalTestDatabase()
        .then(() => {
          return testUtils.addTestUser(userService);
        })
        .then(() => {
          return testUtils.logInTestUser();
        })
        .then((result) => {
          user = result.user;
          token = 'Bearer ' + result.token;
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

    it('fails without a valid token', (done) => {
      requester
        .put(updateUrl)
        // .set('Authorization', token)
        .send()
        .expect(401)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          expect(res.body.message).toBe('invalid token');
          expect(res.body.status).toBe(401);
          done();
        });
    });

    it('fails without an existing user', (done) => {
      requester
        .put(badUpdateUrl)
        .set('Authorization', token)
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
        .set('Authorization', token)
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
        .set('Authorization', token)
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
        .set('Authorization', token)
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
        .set('Authorization', token)
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
        .set('Authorization', token)
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
        .set('Authorization', token)
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




























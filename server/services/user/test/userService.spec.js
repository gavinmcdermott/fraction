'use strict'

// Locals

import testUtils from './../../../utils/testUtils'
import jwt from 'jsonwebtoken'


// Test setup

const FRACTION_TOKEN_SECRET = process.config.fraction.tokenSecret

let app = testUtils.app
let requester = testUtils.requester
let testUser = testUtils.testUser
let serviceRegistry = testUtils.serviceRegistry

// grab an instance of the user service
let userService = serviceRegistry.registry.services['user']


// Service Tests

describe('User Service: ', function() {

  let validPassword = testUser.password
  let invalidPassword = ''

  let validEmail = testUser.email
  let invalidEmail = 'testUser@foo'
  let normalizedValidEmail = validEmail.toLowerCase()
  let nonExistentEmail = 'foo@bar.com'

  let firstName = testUser.firstName
  let lastName = testUser.lastName


  beforeAll(() => {
    testUtils.initSuite(userService.name)
  })

  afterAll((done) => {
    testUtils.clearLocalTestDatabase()
      .then(() => {
        done()
      })
  })

  
  // CREATE

  describe('Create User: ', () => {

    let postUrl = userService.url + '/'

    beforeAll((done) => {
      testUtils.clearLocalTestDatabase()
        .then(() => {
          done()
        })
    })

    afterAll((done) => {
      testUtils.clearLocalTestDatabase()
        .then(() => {
          done()
        })
    })

    it('fails without an email', (done) => {
      requester
        .post(postUrl)
        .send({ password: validPassword })
        .expect(400)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          expect(res.body.message).toBe('invalid email')
          expect(res.body.status).toBe(400)
          done()
        })
    })

    it('fails with an invalid email', (done) => {
      requester
        .post(postUrl)
        .send({ password: validPassword, email: invalidEmail })
        .expect(400)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          expect(res.body.message).toBe('invalid email')
          expect(res.body.status).toBe(400)
          done()
        })
    })

    it('fails without a password', (done) => {
      requester
        .post(postUrl)
        .send({ email: validEmail })
        .expect(400)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          expect(res.body.message).toBe('invalid password')
          expect(res.body.status).toBe(400)
          done()
        })
    })

    it('fails with an invalid password', (done) => {
      requester
        .post(postUrl)
        .send({ email: validEmail, password: invalidPassword })
        .expect(400)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          expect(res.body.message).toBe('invalid password')
          expect(res.body.status).toBe(400)
          done()
        })
    })

    it('fails without a first name', (done) => {
      requester
        .post(postUrl)
        .send({ email: validEmail, password: validPassword })
        .expect(400)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          expect(res.body.message).toBe('invalid first name')
          expect(res.body.status).toBe(400)
          done()
        })
    })

    it('fails without a last name', (done) => {
      requester
        .post(postUrl)
        .send({ email: validEmail, password: validPassword, firstName: firstName })
        .expect(400)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          expect(res.body.message).toBe('invalid last name')
          expect(res.body.status).toBe(400)
          done()
        })
    })

    it('succeeds with valid user data', (done) => {
      requester
        .post(postUrl)
        .send({ email: validEmail, password: validPassword, firstName: firstName, lastName: lastName  })
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          expect(res.body.user).toBeDefined()
          let newUser = res.body.user
          
          // Ensure we're returning the new normalized user
          expect(newUser.name).toBeDefined()
          expect(newUser.name.first).toEqual(firstName)
          expect(newUser.name.last).toEqual(lastName)
          
          expect(newUser.email).toBeDefined()
          expect(newUser.email.email).toEqual(normalizedValidEmail)
          expect(newUser.email.verified).toBe(true)

          expect(newUser.id).toBeDefined()

          expect(newUser.notifications).toBeDefined()
          expect(newUser.notifications.viaEmail).toBe(true)
          done()
        })
    })

    it('enforces unique emails as a signup constraint', (done) => {
      requester
        .post(postUrl)
        .send({ email: validEmail, password: validPassword, firstName: 'Gavin', lastName: 'lastName'  })
        .expect(403)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          expect(res.body.status).toBe(403)
          expect(res.body.message).toEqual('user exists')
          done()
        })
    })
  })


  // LOGIN

  describe('Login User: ', () => {

    let loginUrl = userService.url + '/login'

    beforeAll((done) => {
      testUtils.clearLocalTestDatabase()
        .then(() => {
          return testUtils.addTestUser()
        })
        .then((user) => {
          done()
        })
    })

    afterAll((done) => {
      testUtils.clearLocalTestDatabase()
        .then(() => {
          done()
        })
    })

    let unlockToken =(token) => {
      return jwt.verify(token, FRACTION_TOKEN_SECRET)
    }

    it('fails without an email', (done) => {
      requester
        .post(loginUrl)
        .send({ password: validPassword })
        .expect(400)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          expect(res.body.message).toBe('invalid email')
          expect(res.body.status).toBe(400)
          done()
        })
    })

    it('fails with an invalid email', (done) => {
      requester
        .post(loginUrl)
        .send({ password: validPassword, email: invalidEmail })
        .expect(400)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          expect(res.body.message).toBe('invalid email')
          expect(res.body.status).toBe(400)
          done()
        })
    })

    it('fails without a password', (done) => {
      requester
        .post(loginUrl)
        .send({ email: validEmail })
        .expect(400)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          expect(res.body.message).toBe('invalid password')
          expect(res.body.status).toBe(400)
          done()
        })
    })

    it('fails with an invalid password', (done) => {
      requester
        .post(loginUrl)
        .send({ email: validEmail, password: invalidPassword })
        .expect(400)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          expect(res.body.message).toBe('invalid password')
          expect(res.body.status).toBe(400)
          done()
        })
    })

    it('fails with a missing user', (done) => {
      requester
        .post(loginUrl)
        .send({ email: nonExistentEmail, password: validPassword })
        .expect(404)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          expect(res.body.message).toBe('user not found')
          expect(res.body.status).toBe(404)
          done()
        })
    })

    it('returns a valid token and user upon success', (done) => {
      requester
        .post(loginUrl)
        .send({ email: validEmail, password: validPassword })
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          let token = res.body.token
          let newUser = res.body.user

          expect(token).toBeDefined()
          expect(newUser).toBeDefined()
          
          let tokenSubscriber = unlockToken(token).sub
          expect(tokenSubscriber).toEqual(newUser.id)
          
          // Ensure we're returning the new normalized user
          expect(newUser.name).toBeDefined()
          expect(newUser.name.first).toEqual(firstName)
          expect(newUser.name.last).toEqual(lastName)
          
          expect(newUser.email).toBeDefined()
          expect(newUser.email.email).toEqual(normalizedValidEmail)
          expect(newUser.email.verified).toBe(true)

          expect(newUser.id).toBeDefined()

          expect(newUser.notifications).toBeDefined()
          expect(newUser.notifications.viaEmail).toBe(true)
          done()
        })
    })
  })


  // GET

  describe('Get User: ', () => {
    
    let user
    let token

    let getUrl
    let badGetUrl = userService.url + '/5689a9f38b7512cf1b0e497f'
    let noUserUrl = userService.url + '/ssss'
    let meUrl = userService.url + '/me'


    beforeAll((done) => {
      testUtils.clearLocalTestDatabase()
        .then(() => {
          return testUtils.addTestUser()
        })
        .then(() => {
          return testUtils.logInTestUser()
        })
        .then((result) => {
          user = result.user
          token = 'Bearer ' + result.token
          getUrl = userService.url + '/' + user.id
          done()
        })
    })

    afterAll((done) => {
      testUtils.clearLocalTestDatabase()
      .then(() => {
        done()
      })
    })
    
    it('fails without a valid token', (done) => {
      requester
        .get(getUrl)
        // .set('Authorization', token) // leave out explicitly
        .send()
        .expect(401)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          expect(res.body.message).toBe('invalid token')
          expect(res.body.status).toBe(401)
          done()
        })
    })

    it('fails with a bad userid in the url', (done) => {
      requester
        .get(noUserUrl)
        .set('Authorization', token)
        .send()
        .expect(404)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          expect(res.body.message).toBe('user not found')
          expect(res.body.status).toBe(404)
          done()
        })
    })

    it('fails without an existing user', (done) => {
      requester
        .get(badGetUrl)
        .set('Authorization', token)
        .send()
        .expect(404)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          expect(res.body.message).toBe('user not found')
          expect(res.body.status).toBe(404)
          done()
        })
    })

    it('returns the full user at /me', (done) => {
      requester
        .get(meUrl)
        .set('Authorization', token)
        .send()
        .expect(404)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          let newUser = res.body.user
          
          // Ensure we're returning the new normalized user
          expect(newUser.name).toBeDefined()
          expect(newUser.name.first).toEqual(firstName)
          expect(newUser.name.last).toEqual(lastName)
          
          expect(newUser.email).toBeDefined()
          expect(newUser.email.email).toEqual(normalizedValidEmail)
          expect(newUser.email.verified).toBe(true)

          expect(newUser.id).toBeDefined()

          expect(newUser.notifications).toBeDefined()
          expect(newUser.notifications.viaEmail).toBe(true)
          done()
        })
    })

    it('does not return a full user if fetching a general user', (done) => {
      requester
        .get(getUrl)
        .set('Authorization', token)
        .send()
        .expect(404)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          let newUser = res.body.user
          // Ensure we're returning a sanitized user
          expect(newUser.email).toBeDefined()
          expect(newUser.email.email).toEqual(normalizedValidEmail)

          expect(newUser.name).not.toBeDefined()
          expect(newUser.id).not.toBeDefined()
          expect(newUser.notifications).not.toBeDefined()
          done()
        })
    })
  })


  // UPDATE

  describe('Update User: ', () => {
    
    let user
    let token

    let updateUrl
    let badUpdateUrl = userService.url + '/5689a9f38b7512cf1b0e497f'

    let newFirstName = 'Gavin'
    let newLastName = 'McD'
    let newEmail = 'someNewemail@fraction.com'
    let normalizedNewEmail = newEmail.toLowerCase()
    let newEmailNotification = false

    beforeAll((done) => {
      testUtils.clearLocalTestDatabase()
        .then(() => {
          return testUtils.addTestUser()
        })
        .then(() => {
          return testUtils.logInTestUser()
        })
        .then((result) => {
          user = result.user
          token = 'Bearer ' + result.token
          updateUrl = userService.url + '/' + user.id
          done()
        })
    })

    afterAll((done) => {
      testUtils.clearLocalTestDatabase()
      .then(() => {
        done()
      })
    })

    it('fails without a valid token', (done) => {
      requester
        .put(updateUrl)
        // .set('Authorization', token) // leave out explicitly
        .send()
        .expect(401)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          expect(res.body.message).toBe('invalid token')
          expect(res.body.status).toBe(401)
          done()
        })
    })

    it('fails without an existing user', (done) => {
      requester
        .put(badUpdateUrl)
        .set('Authorization', token)
        .send()
        .expect(404)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          expect(res.body.message).toBe('user not found')
          expect(res.body.status).toBe(404)
          done()
        })
    })

    it('fails when trying to update to an invalid email', (done) => {
      requester
        .put(updateUrl)
        .set('Authorization', token)
        .send({ user: { email: { email: invalidEmail } } })
        .expect(400)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          expect(res.body.message).toBe('invalid email')
          expect(res.body.status).toBe(400)
          done()
        })
    })

    it('fails when trying to update to an invalid first name', (done) => {
      requester
        .put(updateUrl)
        .set('Authorization', token)
        .send({ user: { name: { first: '', last: 'McD' } } })
        .expect(400)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          expect(res.body.message).toBe('invalid first name')
          expect(res.body.status).toBe(400)
          done()
        })
    })

    it('fails when trying to update to an invalid last name', (done) => {
      requester
        .put(updateUrl)
        .set('Authorization', token)
        .send({ user: { name: { first: 'Gavin', last: '' } } })
        .expect(400)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          expect(res.body.message).toBe('invalid last name')
          expect(res.body.status).toBe(400)
          done()
        })
    })

    it('fails when trying to update with an invalid notification bool', (done) => {
      requester
        .put(updateUrl)
        .set('Authorization', token)
        .send({ user: { notifications: { viaEmail: 'notAbool' } } })
        .expect(400)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          expect(res.body.message).toBe('invalid email notification setting')
          expect(res.body.status).toBe(400)
          done()
        })
    })

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
          expect(res.body.user).toBeDefined()
          expect(res.body.user.name.first).toEqual(newFirstName)
          expect(res.body.user.name.last).toEqual(newLastName)
          expect(res.body.user.email.email).toEqual(normalizedNewEmail)
          expect(res.body.user.notifications.viaEmail).toBe(newEmailNotification)
          done()
        })
    })

    it('updates valid settings: a couple new settings', (done) => {
      let first = 'Heythere'
      let last = 'McGillicutty'
      let notifications = true

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
          expect(res.body.user).toBeDefined()
          expect(res.body.user.name.first).toEqual(first)
          expect(res.body.user.name.last).toEqual(last)
          expect(res.body.user.email.email).toEqual(normalizedNewEmail)
          expect(res.body.user.notifications.viaEmail).toBe(notifications)
          done()
        })
    })
  })

})

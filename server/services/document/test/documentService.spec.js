'use strict';

// Locals

import testUtils from './../../../utils/testUtils'

let app = testUtils.app
let requester = testUtils.requester
let testUser = testUtils.testUser
let serviceRegistry = testUtils.serviceRegistry

// grab an instance of the document service
let documentService = serviceRegistry.registry.services['document']


// Service Tests

describe('Document Service: ', () => {
  
  beforeAll(() => {
    // Todo: have test utils init this line! pull it from each test
    console.log('')
    console.log('Starting document service test')
  })

  afterAll((done) => {
    testUtils.clearLocalTestDatabase()
    .then(() => {
      done()
    })
  })

  describe('Create New Documents: ', () => {
    
    let user
    let token

    let postUrl = documentService.url + '/'

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
          done()
        })
    })

    it('fails to create without a valid token', (done) => {
      requester
        .post(postUrl)
        .send({})
        .expect(401)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          expect(res.body.message).toBe('invalid token')
          expect(res.body.status).toBe(401)
          done()
        })
    }) 

    it('fails to create without document', (done) => {
      requester
        .post(postUrl)
        .set('Authorization', token)
        .send({})
        .expect(400)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          expect(res.body.message).toBe('invalid document')
          expect(res.body.status).toBe(400)
          done()
        })
    }) 

    it('fails to create without an uploader email', (done) => {
      requester
        .post(postUrl)
        .set('Authorization', token)
        .send({
          document: 'some document here'
        })
        .expect(400)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          expect(res.body.message).toBe('invalid email')
          expect(res.body.status).toBe(400)
          done()
        })
    }) 

    it('fails to create with a malformed uploader email', (done) => {
      requester
        .post(postUrl)
        .set('Authorization', token)
        .send({
          document: 'some document',
          email: 'testUser.email'
        })
        .expect(400)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          expect(res.body.message).toBe('invalid email')
          expect(res.body.status).toBe(400)
          done()
        })
    }) 

    it('fails to create with an invalid type', (done) => {
      requester
        .post(postUrl)
        .set('Authorization', token)
        .send({
          document: 'some document',
          email: testUser.email,
          type: 'some bad type'
        })
        .expect(400)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          expect(res.body.message).toBe('invalid document type')
          expect(res.body.status).toBe(400)
          done()
        })
    }) 

    it('fails to create with an invalid description', (done) => {
      requester
        .post(postUrl)
        .set('Authorization', token)
        .send({
          document: 'some document',
          email: 'foo@bar.com',
          type: 'deed',
          description: [{}]
        })
        .expect(404)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          expect(res.body.message).toBe('invalid document description')
          expect(res.body.status).toBe(400)
          done()
        })
    }) 

    it('fails to create with a user that does not exist', (done) => {
      requester
        .post(postUrl)
        .set('Authorization', token)
        .send({
          document: 'some document',
          email: 'foo@bar.com',
          type: 'deed'
        })
        .expect(404)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          expect(res.body.message).toBe('user not found')
          expect(res.body.status).toBe(404)
          done()
        })
    }) 

    it('successfully creates new documents', (done) => {
      requester
        .post(postUrl)
        .set('Authorization', token)
        .send({
          document: 'some document text here!',
          email: testUser.email,
          type: 'deed'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          expect(res.body.saved).toBe(true);
          expect(res.body.id).toBeDefined();
          done()
        })
    }) 
  




  })

})





















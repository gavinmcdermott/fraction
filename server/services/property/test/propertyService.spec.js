'use strict'

// Locals

import testUtils from './../../../utils/testUtils'


// Test setup
let app = testUtils.app
let requester = testUtils.requester
let serviceRegistry = testUtils.serviceRegistry

// grab an instance of the property serviceRegistry
let propertyService = serviceRegistry.registry.services['property']

// Service tests

describe('Property Service: ', function() {

	// formatting the output
  beforeAll(() => {
    console.log('')
    console.log('Starting property service tests')
  });

  afterAll((done) => {
    testUtils.clearLocalTestDatabase()
    .then(() => {
      done();
    })
  })

  describe('Create New Property: ', () => {

    // TODO need these - at least token, maybe user too
    let user
    let token
    let testId
    let testLocation

    let postUrl = propertyService.url + '/'

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

    it('fails to create a property without a valid token', (done) => {
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

    it('fails to create without a property', (done) => {
      requester
        .post(postUrl)
        .set('Authorization', token)
        .send({})
        .expect(400)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          expect(res.body.message).toBe('invalid property')
          expect(res.body.status).toBe(400)
          done()
        })
    }) 

    it('fails to create without a primary contact', (done) => {
      requester
        .post(postUrl)
        .set('Authorization', token)
        .send({
          property: 'some property'
        })
        .expect(400)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          expect(res.body.message).toBe('invalid primary contact')
          expect(res.body.status).toBe(400)
          done()
        })
    }) 

    // TODO
    // TODO
    // TODO 
    // TODO
    // TODO
    // THIS TEST NEED TO BE UNCOMMENTED AND 
    // CHECKED WITH AN UPDATEd VERSION in both files

    // it('fails to create without a primary contact who is a user', (done) => {
    //   requester
    //     .post(postUrl)
    //     .set('Authorization', token)
    //     .send({
    //       property: 'some property',
    //       primaryContact: 'fakeid',
    //     })
    //     .expect(400)
    //     .expect('Content-Type', /json/)
    //     .end((err, res) => {
    //       expect(res.body.message).toBe('non-user primary contact')
    //       expect(res.body.status).toBe(400)
    //       done()
    //     })
    // }) 

    // TODO 
    // FROM HERE ON OUT CHECK TO ENSURE VALID FAKE test_id
    // WORKS TO NOT TRIGGER THE ABOVE ERROR TEST

    // TODO
    // This is currently hardcoded because I was having trouble
    // with the scoping of user.id from the beforeAll call on 
    // line 42, so it's valid but not a good idea to leave 
    // hardcoded I think. 

    // TODO create a test house object
    testId = '569893173e5098736865b4af'
    testLocation = {
      addressLine1: '5 Main St',
      city: 'San Francisco',
      state: 'California',
      zip: '55555'
    }


    it('fails to create without a location', (done) => {
      requester
        .post(postUrl)
        .set('Authorization', token)
        .send({
          property: 'some property',
          primaryContact: testId
        })
        .expect(400)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          expect(res.body.message).toBe('invalid location')
          expect(res.body.status).toBe(400)
          done()
        })
    })

    it('fails to create without any location', (done) => {
      requester
        .post(postUrl)
        .set('Authorization', token)
        .send({
          property: 'some property',
          primaryContact: testId
        })
        .expect(400)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          expect(res.body.message).toBe('invalid location')
          expect(res.body.status).toBe(400)
          done()
        })
    })

    // Right now I'm requiring street/city/state/zip and saying 
    // all are strings except the zip
    it('fails to create without a validly formatted location', (done) => {
      requester
        .post(postUrl)
        .set('Authorization', token)
        .send({
          property: 'some property',
          primaryContact: testId,
          location: { 
            foo: 'bar'
          }
        })
        .expect(400)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          expect(res.body.message).toBe('invalid location')
          expect(res.body.status).toBe(400)
          done()
        })
    })

    // it('fails to create without a WHAT', (done) => {
    //   requester
    //     .post(postUrl)
    //     .set('Authorization', token)
    //     .send({
    //       property: 'some property',
    //       primaryContact: testId,
    //       location: testLocation,
    //     })
    //     .expect(400)
    //     .expect('Content-Type', /json/)
    //     .end((err, res) => {
    //       expect(res.body.message).toBe('invalid location')
    //       expect(res.body.status).toBe(400)
    //       done()
    //     })
    // })



    // TODO THIS ONE
    //  it('fails to create without a real  location', (done) => {
    //   requester
    //     .post(postUrl)
    //     .set('Authorization', token)
    //     .send({
    //       property: 'some property',
    //       primaryContact: test_id,
    //       location: { 
    //         foo: 'bar'
    //       }
    //     })
    //     .expect(400)
    //     .expect('Content-Type', /json/)
    //     .end((err, res) => {
    //       expect(res.body.message).toBe('invalid location')
    //       expect(res.body.status).toBe(400)
    //       done()
    //     })
    // })
   


    // make sure we have bedroom, bathroom, sqftage. 





  })

})
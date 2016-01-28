'use strict'

// Globals


// Locals

import testUtils from './../../../utils/testUtils'


// Test setup
let app = testUtils.app
let requester = testUtils.requester
let testUser = testUtils.testUser
let testProperties = testUtils.properties
let serviceRegistry = testUtils.serviceRegistry

// grab an instance of the document service
let offeringsService = serviceRegistry.registry.services['offerings']


// Service Tests

describe('Offerings Service: ', () => {
  
  beforeAll(() => {
    // Todo: have test utils init this line! pull it from each test
    testUtils.initSuite(offeringsService.name)
  })

  afterAll((done) => {
    testUtils.clearLocalTestDatabase()
    .then(() => {
      done()
    })
  })

  describe('Create Offering: ', () => {
    
    let user
    let token
    let testUserId

    let postUrl = offeringsService.url + offeringsService.endpoints.createOffering.url
    
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
          testUserId = user.id
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

  })




})





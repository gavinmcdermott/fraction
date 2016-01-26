'use strict';

// Locals

import testUtils from './../../../utils/testUtils'

let app = testUtils.app
let requester = testUtils.requester
let testUser = testUtils.testUser
let serviceRegistry = testUtils.serviceRegistry

// grab an instance of the document service
let investmentService = serviceRegistry.registry.services['investment']


// Service Tests

describe('Investment Service: ', () => {
  
  beforeAll(() => {
    // Todo: have test utils init this line! pull it from each test
    testUtils.initSuite(investmentService.name)
  })

  afterAll((done) => {
    testUtils.clearLocalTestDatabase()
    .then(() => {
      done()
    })
  })

  describe('Create New Investment: ', () => {
    
    let user
    let token

    let createInvestmentUrl = investmentService.url + '/'

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
        .post(createInvestmentUrl)
        .send({})
        .expect(401)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          expect(res.body.message).toBe('invalid token')
          expect(res.body.status).toBe(401)
          done()
        })
    }) 

    it('fails to create without a property id', (done) => {
      requester
        .post(createInvestmentUrl)
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

    it('fails to create without an interests', (done) => {
      requester
        .post(createInvestmentUrl)
        .set('Authorization', token)
        .send({ 
          property: user.id
        })
        .expect(400)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          expect(res.body.message).toBe('invalid interests')
          expect(res.body.status).toBe(400)
          done()
        })
    }) 

    it('successfully creates a new ownership', (done) => {
      requester
        .post(createInvestmentUrl)
        .set('Authorization', token)
        .send({ 
          property: user.id,
          interests: 1000
        })
        .expect(400)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          console.log(res.body)
          expect(res.body.investment).toBeDefined()
          expect(res.body.investment.interests).toBeDefined()
          expect(res.body.investment.propertyId).toBeDefined()
          expect(res.body.investment.total).toBeDefined()
          done()
        })
    }) 

  })

})





















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
  
  let user
  let token
  let testUserId
  let testProperty

  let testPropertyAName = 'houseA'
  let testPropertyBName = 'houseB'

  beforeAll((done) => {
    // Todo: have test utils init this line! pull it from each test
    testUtils.initSuite(offeringsService.name)
    
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
        return testUtils.addTestProperty(testUserId)
      })
      .then((property) => {
        testProperty = property
        done()
      })
  })

  afterAll((done) => {
    testUtils.clearLocalTestDatabase()
    .then(() => {
      done()
    })
  })

  describe('Create Offering: ', () => {
    
    // offering specific to these tests
    let testOffering

    let postUrl = offeringsService.url + offeringsService.endpoints.createOffering.url

    afterAll(() => {
      testUtils.removeOffering()
        .then((ok) => {
          done()
        })
    })

    it('fails to create a offering without a valid token', (done) => {
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

    it('fails to create without a property passed', (done) => {
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

    it('fails to create without a price passed', (done) => {
      requester
        .post(postUrl)
        .set('Authorization', token)
        .send({
          property: '1233sasfsd3fFd'
        })
        .expect(400)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          expect(res.body.message).toBe('invalid price')
          expect(res.body.status).toBe(400)
          done()
        })
    }) 

    it('fails to create with an invalid price', (done) => {
      requester
        .post(postUrl)
        .set('Authorization', token)
        .send({
          property: '1233sasfsd3fFd',
          price: 'asd'
        })
        .expect(400)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          expect(res.body.message).toBe('invalid price')
          expect(res.body.status).toBe(400)
          done()
        })
    }) 

    it('fails to create without a quantity', (done) => {
      requester
        .post(postUrl)
        .set('Authorization', token)
        .send({
          property: '1233sasfsd3fFd',
          price: 123.34
        })
        .expect(400)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          expect(res.body.message).toBe('invalid quantity')
          expect(res.body.status).toBe(400)
          done()
        })
    }) 

    it('fails to create with an invalid quantity - decimal', (done) => {
      requester
        .post(postUrl)
        .set('Authorization', token)
        .send({
          property: '1233sasfsd3fFd',
          price: 123.34,
          quantity: 123.123
        })
        .expect(400)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          expect(res.body.message).toBe('invalid quantity')
          expect(res.body.status).toBe(400)
          done()
        })
    }) 

    it('fails to create when issuing too many shares', (done) => {
      requester
        .post(postUrl)
        .set('Authorization', token)
        .send({
          property: '1233sasfsd3fFd',
          price: 123.34,
          quantity: 1001
        })
        .expect(400)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          expect(res.body.message).toBe('invalid quantity')
          expect(res.body.status).toBe(400)
          done()
        })
    }) 

    it('fails to create if the propertyId is bad', (done) => {
      requester
        .post(postUrl)
        .set('Authorization', token)
        .send({
          property: '1233sasfsd3fFd',
          price: 123.34,
          quantity: 500
        })
        .expect(404)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          expect(res.body.message).toBe('property not found')
          expect(res.body.status).toBe(404)
          done()
        })
    }) 

    it('fails to create if the property does not exist', (done) => {
      requester
        .post(postUrl)
        .set('Authorization', token)
        .send({
          property: '56aa8a9f8c8d31c107dc4ess',
          price: 123.34,
          quantity: 500
        })
        .expect(404)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          expect(res.body.message).toBe('property not found')
          expect(res.body.status).toBe(404)
          done()
        })
    })

    it('creates a new offering', (done) => {
      requester
        .post(postUrl)
        .set('Authorization', token)
        .send({
          property: testProperty.id,
          price: 123.34,
          quantity: 500
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          expect(res.body.offering).toBeDefined()
          testOffering = res.body.offering
          done()
        })
    }) 

    it('cannot create a second offering while another is open', (done) => {
      requester
        .post(postUrl)
        .set('Authorization', token)
        .send({
          property: testProperty.id,
          price: 200,
          quantity: 225
        })
        .expect(403)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          expect(res.body.message).toBe('existing open offering for this property')
          expect(res.body.status).toBe(403)
          
          // Remove the offering for the next test
          testUtils.removeOffering(testOffering.id)
            .then((ok) => {
              done()
            })
        })
    }) 

    it('cannot create an offering whose share quantity violates the 1000 share aggregate rule', (done) => {
      testUtils.addOffering(testUserId, testProperty.id, 900, 900, 'closed')
        .then((offering) => {
          requester
            .post(postUrl)
            .set('Authorization', token)
            .send({
              property: testProperty.id,
              price: 200,
              quantity: 225
            })
            .expect(403)
            .expect('Content-Type', /json/)
            .end((err, res) => {
              expect(res.body.message).toBe('aggregate shares issued cannot exceed 1000')
              expect(res.body.status).toBe(403)

              // Remove the offering for the next test
              testUtils.removeOffering(offering.id)
                .then((ok) => {
                  done()
                })
            })
        })
    }) 

    it('creates an offering whose share quantity violates the 1000 share aggregate rule', (done) => {
      testUtils.addOffering(testUserId, testProperty.id, 300, 300, 'closed')
        .then((offeringA) => {
          testUtils.addOffering(testUserId, testProperty.id, 300, 300, 'closed')
            .then((offeringB) => {

              requester
                .post(postUrl)
                .set('Authorization', token)
                .send({
                  property: testProperty.id,
                  price: 300,
                  quantity: 401
                })
                .expect(403)
                .expect('Content-Type', /json/)
                .end((err, res) => {
                  expect(res.body.message).toBe('aggregate shares issued cannot exceed 1000')
                  expect(res.body.status).toBe(403)

                  // Remove the offering for the next test
                  testUtils.removeOffering()
                    .then((ok) => {
                      done()
                    })
                })
            })
        })
    }) 
  })


  // GET ALL OFFERINGS
  
  describe('Get Offerings: ', () => {
    
    // offering specific to these tests
    let testOfferingA

    let getAllUrl = offeringsService.url + offeringsService.endpoints.getOfferings.url
    
    beforeAll((done) => {

      // Add first test offering to property A
      testUtils.addOffering(testUserId, testProperty.id, 900, 333, 'open')
        .then((offering) => {
          testOfferingA = offering
          done()
        })
    })

    afterAll(() => {
      testUtils.removeOffering()
        .then((ok) => {
          done()
        })
    })

    it('fails to get all offerings without a valid token', (done) => {
      requester
        .get(getAllUrl)
        .send({})
        .expect(401)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          expect(res.body.message).toBe('invalid token')
          expect(res.body.status).toBe(401)
          done()
        })
    })

    it('fetches ALL OPEN & CLOSED offerings - SINGLE property', (done) => {
      
      // Add a second, closed offering to property A
      testUtils.addOffering(testUserId, testProperty.id, 50, 50, 'closed')
        .then((offering) => {
          requester
            .get(getAllUrl)
            .set('Authorization', token)
            .query({
              property: testProperty.id
            })
            .send({})
            .expect(200)
            .expect('Content-Type', /json/)
            .end((err, res) => {
              expect(res.body.offerings).toBeDefined()
              expect(res.body.offerings.length).toBe(2)
              done()
            })
        })
    })

    it('fetches ALL OPEN offerings - MULTIPLE offerings; MULTIPLE properties', (done) => {
      let testPropertyB
      let testOfferingB

      // Add test property B
      testUtils.addTestProperty(testUserId, testPropertyBName)
        .then((house) => {
          testPropertyB = house

          // Add an open offering for property B
          testUtils.addOffering(testUserId, house.id, 500, 200, 'open')
            .then((offeringB) => {
              testOfferingB = offeringB

              requester
                .get(getAllUrl)
                .set('Authorization', token)
                .query({
                  status: 'open'
                })
                .send({})
                .expect(200)
                .expect('Content-Type', /json/)
                .end((err, res) => {
                  expect(res.body.offerings).toBeDefined()
                  expect(res.body.offerings.length).toBe(2)
                  done()
                })
            })
        })
    })


    it('fetches ALL OPEN & CLOSED offerings - SINGLE property', (done) => {

      // Add a third closed offering to property A
      testUtils.addOffering(testUserId, testProperty.id, 50, 50, 'closed')
        .then((offeringB) => {

          requester
            .get(getAllUrl)
            .query({
              property: testProperty.id
            })
            .set('Authorization', token)
            .send({})
            .expect(200)
            .expect('Content-Type', /json/)
            .end((err, res) => {
              expect(res.body.offerings).toBeDefined()
              expect(res.body.offerings.length).toBe(3)
              done()
            })
        })
    })






    // it('fetches all open offerings - multiple offerings', (done) => {
    //   testUtils.addTestProperty(testUserId, testPropertyBName)
    //     .then((house) => {

    //       testUtils.addOffering(testUserId, house.id, 500, 200, 'open')
    //         .then((offeringB) => {


    //           requester
    //             .get(getOneUrl)
    //             .set('Authorization', token)
    //             .send({})
    //             .expect(200)
    //             .expect('Content-Type', /json/)
    //             .end((err, res) => {
    //               expect(res.body.offerings).toBeDefined()
    //               expect(res.body.offerings.length).toBe(2)
    //               done()
    //             })
    //         })
    //     })
    // })
    // TODO: scope offerings by property!


  })


  // GET SINGLE OFFERING
  
  describe('Get Single Offering: ', () => {
    
    // offering specific to these tests
    let testOffering

    // need to build the url in the before all
    let getOneUrl
    let invalidGetOneUrl = offeringsService.url + '/56abc5d62bb818550d21ssss'
    
    beforeAll((done) => {
      testUtils.addOffering(testUserId, testProperty.id, 900, 333, 'open')
        .then((offering) => {
          testOffering = offering
          // bui;d the url
          getOneUrl = offeringsService.url + '/' + testOffering.id
          done()
        })
    })

    afterAll(() => {
      testUtils.removeOffering()
        .then((ok) => {
          done()
        })
    })

    it('fails to get an offering without a valid token', (done) => {
      requester
        .get(getOneUrl)
        .send({})
        .expect(401)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          expect(res.body.message).toBe('invalid token')
          expect(res.body.status).toBe(401)
          done()
        })
    })

    it('Received an get an offering without a valid offeringId', (done) => {
      requester
        .get(invalidGetOneUrl)
        .set('Authorization', token)
        .expect(404)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          expect(res.body.message).toBe('offer not found')
          expect(res.body.status).toBe(404)
          done()
        })
    })

    it('fetches a single offering by id', (done) => {
      requester
        .get(getOneUrl)
        .set('Authorization', token)
        .send({})
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          expect(res.body.offering).toBeDefined()
          done()
        })
    })
  })









})





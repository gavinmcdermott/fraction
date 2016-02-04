'use strict'

// Globals


// Locals

import testUtils from './../../../utils/testUtils'


// Test setup
let app = testUtils.app
let requester = testUtils.requester
let testUser = testUtils.testUser
let adminUser = testUtils.adminUser
let testProperties = testUtils.properties
let serviceRegistry = testUtils.serviceRegistry

// grab an instance of the document service
let offeringsService = serviceRegistry.registry.services['offerings']


// Service Tests

describe('Offerings Service: ', () => {
  
  let user
  let userToken

  let admin
  let adminToken

  let testPropertyA
  let testPropertyB
  
  let testPropertyAName = 'houseA'
  let testPropertyBName = 'houseB'

  beforeAll((done) => {
    // Todo: have test utils init this line! pull it from each test
    testUtils.initSuite(offeringsService.name)
    
    testUtils.clearLocalTestDatabase()
      .then(() => {
        return testUtils.addTestUser(false, testUser)
      })
      .then((data) => {
        user = data.user
        userToken = data.token
        return testUtils.addTestUser(true, adminUser)
      })
      .then((data) => {
        admin = data.user
        adminToken = data.token
        return testUtils.addTestProperty(user.id)
      })
      .then((property) => {
        testPropertyA = property
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
    let testOfferingA

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
          expect(res.body.message).toBe('No auth token')
          expect(res.body.status).toBe(401)
          done()
        })
    })

    it('fails to create without a property passed', (done) => {
      requester
        .post(postUrl)
        .set('Authorization', adminToken)
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
        .set('Authorization', adminToken)
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
        .set('Authorization', adminToken)
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
        .set('Authorization', adminToken)
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
        .set('Authorization', adminToken)
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
        .set('Authorization', adminToken)
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
        .set('Authorization', adminToken)
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
        .set('Authorization', adminToken)
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
        .set('Authorization', adminToken)
        .send({
          property: testPropertyA.id,
          price: 123.34,
          quantity: 500
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          console.log(err)
          expect(res.body.offering).toBeDefined()
          testOfferingA = res.body.offering
          done()
        })
    }) 

    it('cannot create a second offering while another is open', (done) => {
      requester
        .post(postUrl)
        .set('Authorization', adminToken)
        .send({
          property: testPropertyA.id,
          price: 200,
          quantity: 225
        })
        .expect(403)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          expect(res.body.message).toBe('existing open offering for this property')
          expect(res.body.status).toBe(403)
          
          // Remove the offering for the next test
          testUtils.removeOffering(testOfferingA.id)
            .then((ok) => {
              done()
            })
        })
    }) 

    it('cannot create an offering whose share quantity violates the 1000 share aggregate rule', (done) => {
      testUtils.addOffering(admin.id, testPropertyA.id, 900, 900, 'closed')
        .then((offering) => {
          requester
            .post(postUrl)
            .set('Authorization', adminToken)
            .send({
              property: testPropertyA.id,
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
      testUtils.addOffering(admin.id, testPropertyA.id, 300, 300, 'closed')
        .then((offeringA) => {
          testUtils.addOffering(admin.id, testPropertyA.id, 300, 300, 'closed')
            .then((offeringB) => {

              requester
                .post(postUrl)
                .set('Authorization', adminToken)
                .send({
                  property: testPropertyA.id,
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
    let testOfferingB

    let getAllUrl = offeringsService.url + offeringsService.endpoints.getOfferings.url
    
    beforeAll((done) => {

      // Add first test offering to property A
      testUtils.addOffering(admin.id, testPropertyA.id, 900, 333, 'open')
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
          expect(res.body.message).toBe('No auth token')
          expect(res.body.status).toBe(401)
          done()
        })
    })

    it('fetches ALL OPEN & CLOSED offerings - SINGLE property', (done) => {
      
      // Add a second, closed offering to property A
      testUtils.addOffering(admin.id, testPropertyA.id, 50, 50, 'closed')
        .then((offering) => {
          requester
            .get(getAllUrl)
            .set('Authorization', userToken)
            .query({
              property: testPropertyA.id
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

    it('fetches ALL OPEN offerings - MULTIPLE properties', (done) => {

      // Add test property B
      testUtils.addTestProperty(admin.id, testPropertyBName)
        .then((house) => {
          testPropertyB = house

          // Add an open offering for property B
          testUtils.addOffering(admin.id, house.id, 500, 200, 'open')
            .then((offeringB) => {
              testOfferingB = offeringB

              requester
                .get(getAllUrl)
                .set('Authorization', userToken)
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
      testUtils.addOffering(admin.id, testPropertyA.id, 50, 50, 'closed')
        .then((offeringB) => {

          requester
            .get(getAllUrl)
            .query({
              property: testPropertyA.id
            })
            .set('Authorization', userToken)
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
  })


  // GET SINGLE OFFERING
  
  describe('Get Single Offering: ', () => {
    
    // offering specific to these tests
    let testOfferingA

    // need to build the url in the before all
    let getOneUrl
    let invalidGetOneUrl = offeringsService.url + '/56abc5d62bb818550d21ssss'
    
    beforeAll((done) => {
      testUtils.addOffering(admin.id, testPropertyA.id, 900, 333, 'open')
        .then((offering) => {
          testOfferingA = offering
          // build the url
          getOneUrl = offeringsService.url + '/' + testOfferingA.id
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
          expect(res.body.message).toBe('No auth token')
          expect(res.body.status).toBe(401)
          done()
        })
    })

    it('Received an get an offering without a valid offeringId', (done) => {
      requester
        .get(invalidGetOneUrl)
        .set('Authorization', userToken)
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
        .set('Authorization', userToken)
        .send({})
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          expect(res.body.offering).toBeDefined()
          done()
        })
    })
  })


  // ADD BACKER TO AN OFFERING
  
  describe('Add Backer to an Offering: ', () => {
    
    // offering specific to these tests
    let testOfferingA

    // need to build the url in the before all
    let addBackerUrl
    
    beforeAll((done) => {
      // Set the default to 200 filled shares
      testUtils.addOffering(admin.id, testPropertyA.id, 1000, 200, 'open')
        .then((offering) => {
          testOfferingA = offering
          // build the url
          addBackerUrl = offeringsService.url + '/' + testOfferingA.id + '/backers'
          done()
        })
    })

    afterAll(() => {
      testUtils.removeOffering()
        .then((ok) => {
          done()
        })
    })

    it('fails without a valid token', (done) => {
      requester
        .post(addBackerUrl)
        .send({})
        .expect(401)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          expect(res.body.message).toBe('No auth token')
          expect(res.body.status).toBe(401)
          done()
        })
    })

    it('fails without the new backer\'s user id', (done) => {
      requester
        .post(addBackerUrl)
        .send({})
        .set('Authorization', userToken)
        .expect(400)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          expect(res.body.message).toBe('invalid backer')
          expect(res.body.status).toBe(400)
          done()
        })
    })

    it('fails without the count of shares', (done) => {
      requester
        .post(addBackerUrl)
        .set('Authorization', userToken)
        .send({
          backer: user.id
        })
        .expect(400)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          expect(res.body.message).toBe('invalid shares')
          expect(res.body.status).toBe(400)
          done()
        })
    })

    it('fails with bad shares number', (done) => {
      requester
        .post(addBackerUrl)
        .set('Authorization', userToken)
        .send({
          backer: user.id,
          shares: 10.134
        })
        .expect(400)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          expect(res.body.message).toBe('invalid shares')
          expect(res.body.status).toBe(400)
          done()
        })
    })

    it('fails with too many shares', (done) => {
      requester
        .post(addBackerUrl)
        .set('Authorization', userToken)
        .send({
          backer: user.id,
          shares: 1001
        })
        .expect(400)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          expect(res.body.message).toBe('invalid shares')
          expect(res.body.status).toBe(400)
          done()
        })
    })

    it('fails with too many shares based on what is currently filled', (done) => {
      requester
        .post(addBackerUrl)
        .set('Authorization', userToken)
        .send({
          backer: user.id,
          shares: 900  // currently 200 are filled
        })
        .expect(400)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          expect(res.body.message).toBe('invalid share quantity')
          expect(res.body.status).toBe(400)
          done()
        })
    })

    it('successfully adds a backer', (done) => {
      requester
        .post(addBackerUrl)
        .set('Authorization', userToken)
        .send({
          backer: user.id,
          shares: 300  // currently 200 are filled
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          expect(res.body.offering).toBeDefined()
          let offering = res.body.offering
          
          expect(offering.backers.length).toBe(1)
          expect(offering.remaining).toBe(500)
          expect(offering.filled).toBe(500)

          let backer = offering.backers[0]
          expect(backer.user).toEqual(user.id)
          done()
        })
    })

    it('fails to add a backer twice', (done) => {
      requester
        .post(addBackerUrl)
        .set('Authorization', userToken)
        .send({
          backer: user.id,
          shares: 300  // currently 200 are filled
        })
        .expect(403)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          expect(res.body.message).toBe('backer exists')
          expect(res.body.status).toBe(403)
          done()
        })
    })
  })


  // UPDATE BACKER ON AN OFFERING


  // REMOVE BACKER FROM AN OFFERING

})





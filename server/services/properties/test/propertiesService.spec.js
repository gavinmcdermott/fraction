'use strict'

// Globals

import nock from 'nock'
import _ from 'lodash'

// Locals

import testUtils from './../../../utils/testUtils'


// Test setup
let app = testUtils.app
let requester = testUtils.requester
let testUser = testUtils.testUser
let adminUser = testUtils.adminUser
let testProperties = testUtils.properties
let serviceRegistry = testUtils.serviceRegistry

// grab an instance of the property serviceRegistry
let propertyService = serviceRegistry.registry.services['properties']


// Set up a valid google api intercept
let initGoogleNock = (invalid) => {
  // https://github.com/pgte/nock#restoring
  nock.cleanAll()

  let responseCode = invalid ? 400 : 200

  let responseBodySuccess = {
    "results" : [{
      "address_components" : [
        {
          "long_name" : "4583",
          "short_name" : "4583",
          "types" : [ "street_number" ]
        },
        {
          "long_name" : "Trillium Woods",
          "short_name" : "Trillium Woods",
          "types" : [ "route" ]
        },
        {
          "long_name" : "Lake Oswego",
          "short_name" : "Lake Oswego",
          "types" : [ "locality", "political" ]
        },
        {
          "long_name" : "Oregon",
          "short_name" : "OR",
          "types" : [ "administrative_area_level_1", "political" ]
        },
        {
          "long_name" : "United States",
          "short_name" : "US",
          "types" : [ "country", "political" ]
        },
        {
          "long_name" : "97035",
          "short_name" : "97035",
          "types" : [ "postal_code" ]
        }
      ],
      "formatted_address" : "4583 Trillium Woods, Lake Oswego, OR 97035, USA",
      "geometry" : {
        "location" : {
          "lat" : 37.4224764,
          "lng" : -122.0842499
        },
        "location_type" : "ROOFTOP",
        "viewport" : {
          "northeast" : {
            "lat" : 37.4238253802915,
            "lng" : -122.0829009197085
          },
          "southwest" : {
            "lat" : 37.4211274197085,
            "lng" : -122.0855988802915
          }
        }
      },
      "place_id" : "ChIJ2eUgeAK6j4ARbn5u_wAGqWA",
      "types" : [ "street_address" ]
    }],
    "status" : "OK"
  }

  let responseBody = invalid ? null : responseBodySuccess

  let googleInvalidAddress = nock('http://maps.googleapis.com')
    .get(uri => uri.indexOf('/maps/api/geocode') > -1)
    .reply(responseCode, responseBody)
}


// Service tests

describe('Property Service: ', function() {

  beforeAll(() => {
    testUtils.initSuite(propertyService.name)
  })

  afterAll((done) => {
    testUtils.clearLocalTestDatabase()
    .then(() => {
      done()
    })
  })


  // CREATE

  describe('Create New Property: ', () => {

    let user
    let userToken

    let admin
    let adminToken

    let postUrl = propertyService.url + '/'
    
    beforeAll((done) => {
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
          done()
        })
        .catch((err) => {
          console.log(err)
        })
    })

    it('fails to create a property without a valid token', (done) => {
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

    it('fails to create without a property', (done) => {
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

    it('fails to create without any location', (done) => {
      requester
        .post(postUrl)
        .set('Authorization', adminToken)
        .send({
          property: {
            primaryContact: user.id
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

    it('fails to create with an invalid location', (done) => {
      requester
        .post(postUrl)
        .set('Authorization', adminToken)
        .send({
            property: {
              primaryContact: user.id,
              location: testProperties.invalidLocation
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
    
    it('fails to create without any details received', (done) => {
      requester
        .post(postUrl)
        .set('Authorization', adminToken)
        .send({
          property: {
            primaryContact: user.id,
            location: testProperties.validLocation
          }
        })
        .expect(400)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          expect(res.body.message).toBe('invalid details')
          expect(res.body.status).toBe(400)
          done()
        })
    })

    it('fails to create without any stats recieved', (done) => {
      requester
        .post(postUrl)
        .set('Authorization', adminToken)
        .send({
          property: {
            primaryContact: user.id,
            location: testProperties.validLocation,
            details: 'foo sorry'
          }
        })
        .expect(400)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          expect(res.body.message).toBe('invalid stats')
          expect(res.body.status).toBe(400)
          done()
        })
    })

    it('fails to create without a number of bedrooms received', (done) => {
      requester
        .post(postUrl)
        .set('Authorization', adminToken)
        .send({
          property: {
            primaryContact: user.id,
            location: testProperties.validLocation,
            details: {
              stats: {
                bedrooms: 'sorry'
              }
            }
          }
        })
        .expect(400)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          expect(res.body.message).toBe('invalid bedrooms')
          expect(res.body.status).toBe(400)
          done()
        })
    })

    it('fails to create without a number of bathrooms received', (done) => {
      requester
        .post(postUrl)
        .set('Authorization', adminToken)
        .send({
          property: {
            primaryContact: user.id,
            location: testProperties.validLocation,
            details: {
              stats: {
                bedrooms: '5',
                bathrooms: 'sorry'
              }
            }
          }
        })
        .expect(400)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          expect(res.body.message).toBe('invalid bathrooms')
          expect(res.body.status).toBe(400)
          done()
        })
    })

    it('fails to create without a number for sqft received', (done) => {
      requester
        .post(postUrl)
        .set('Authorization', adminToken)
        .send({
          property: {
            primaryContact: user.id,
            location: testProperties.validLocation,
            details: {
              stats: {
                bedrooms: '5',
                bathrooms: '2',
                sqft: 'sorry'
              }
            }
          }
        })
        .expect(400)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          expect(res.body.message).toBe('invalid sqft')
          expect(res.body.status).toBe(400)
          done()
        })
    })

    it('fails to create without a real location', (done) => {

      initGoogleNock(true)
      
      requester
        .post(postUrl)
        .set('Authorization', adminToken)
        .send({
         property: {
            primaryContact: user.id,
            location: testProperties.fakeLocation,
            details: {
              stats: {
                bedrooms: '5',
                bathrooms: '2',
                sqft: '22'
              }
            }
          }
        })
        .expect(400)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          console.log(err)
          console.log(res.body)
          expect(res.body.message).toBe('address validation failed')
          expect(res.body.status).toBe(400)
          done()
        })
    })

    it('successfully creates a new property', (done) => {

      initGoogleNock()

      requester
        .post(postUrl)
        .set('Authorization', adminToken)
        .send({
          property: {
            primaryContact: user.id,
            location: testProperties.validLocation,
            details: {
              stats: {
                bedrooms: '5',
                bathrooms: '2',
                sqft: '22'
              }
            }
          }
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          expect(res.body.property).toBeDefined()
          done()
        })
    }) 

    it('fails to add a duplicate property', (done) => {

      initGoogleNock()

      requester
        .post(postUrl)
        .set('Authorization', adminToken)
        .send({
          property: {
            primaryContact: user.id,
            location: testProperties.validLocation,
            details: {
              stats: {
                bedrooms: '5',
                bathrooms: '2',
                sqft: '22'
              }
            }
          }
        })
        .expect(403)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          expect(res.body.message).toBe('property exists')
          expect(res.body.status).toBe(403)
          done()
        })
    }) 
  })


  // GET ALL

  describe('Get All Properties: ', () => {

    let user
    let userToken

    let admin
    let adminToken

    let propertyA
    let propertyB

    let getAllPropertiesUrl = propertyService.url + '/'
    
    beforeAll((done) => {
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
          return testUtils.addTestProperty('houseA')
        })
        .then((property) => {
          propertyA = property
          return testUtils.addTestProperty('houseB')
        })
        .then((property) => {
          propertyB = property
          done()
        })
        .catch((err) => {
          console.log(err)
        })
    })

    // it('should fail without a token', (done) => {
    //   requester
    //     .get(getAllPropertiesUrl)
    //     .send({})
    //     .expect(401)
    //     .expect('Content-Type', /json/)
    //     .end((err, res) => {
    //       expect(res.body.message).toBe('No auth token')
    //       expect(res.body.status).toBe(401)
    //       done()
    //     })
    // })

    it('should return all properties', (done) => {
      requester
        .get(getAllPropertiesUrl)
        .set('Authorization', userToken)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          expect(res.body.properties).toBeDefined()
          expect(res.body.properties.length).toEqual(2)
          done()
        })
    })
  })


  // GET ONE

  describe('Get Property: ', () => {

    let user
    let userToken

    let admin
    let adminToken

    let property

    let getUrl = propertyService.url + '/'
    let invalidGetUrl = propertyService.url + '/23423ds'
    let missingGetUrl = propertyService.url + '/56a8703388b05566d1fd3bc2'
    
    beforeAll((done) => {
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
          return testUtils.addTestProperty('houseA')
        })
        .then((property) => {
          property = property
          getUrl += property.id.toString()
          done()
        })
        .catch((err) => {
          console.log(err)
        })
    })

    // it('should fail without a token', (done) => {
    //   requester
    //     .get(getUrl)
    //     .send({})
    //     .expect(401)
    //     .expect('Content-Type', /json/)
    //     .end((err, res) => {
    //       expect(res.body.message).toBe('No auth token')
    //       expect(res.body.status).toBe(401)
    //       done()
    //     })
    // })

    it('should fail with bad propertyid', (done) => {
      requester
        .get(invalidGetUrl)
        .set('Authorization', userToken)
        .expect(404)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          expect(res.body.message).toBe('property not found')
          expect(res.body.status).toBe(404)
          done()
        })
    })

    it('should fail if it cannot find property', (done) => {
      requester
        .get(missingGetUrl)
        .set('Authorization', userToken)
        .expect(404)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          expect(res.body.message).toBe('property not found')
          expect(res.body.status).toBe(404)
          done()
        })
    })

    it('should return a property', (done) => {
      requester
        .get(getUrl)
        .set('Authorization', userToken)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          expect(res.body.property).toBeDefined()
          done()
        })
    })
  })

  









  // describe('Update Existing Property: ', () => {
  //   //console.log('calleddf')
  //   let property
  //   let user
  //   let token

  //   let updateUrl
  //   let badUpdateUrl = propertyService.url + '/5689a9f38b7512cf1b0e497f23scD'

  //   beforeAll((done) => {
  //     testUtils.clearLocalTestDatabase()
  //       .then(() => {
  //         return testUtils.addTestUser()
  //       })
  //       .then(() => {
  //         return testUtils.logInTestUser()
  //       })
  //       .then((result) => {
  //         // console.log('called here!')
  //         user = result.user
  //         token = 'Bearer ' + result.token
  //         return testUtils.addTestProperty()
  //       })
  //       .then((result) => {
  //         property = result
  //         updateUrl = propertyService.url + '/' + property._id
  //         done()
  //       })
  //   })

  //   afterAll((done) => {
  //     testUtils.clearLocalTestDatabase()
  //     .then(() => {
  //       done()
  //     })
  //   })


  //   it('fails without a valid token', (done) => {
  //     requester
  //       .put(updateUrl)
  //       // .set('Authorization', token) leave out explicitly
  //       .send('nully')
  //       .expect(401)
  //       .expect('Content-Type', /json/)
  //       .end((err, res) => {
  //         expect(res.body.message).toBe('invalid token')
  //         expect(res.body.status).toBe(401)
  //         done()
  //       })
  //   })

  //   it('fails without an existing property', (done) => {
  //     requester
  //       .put(badUpdateUrl)
  //       .set('Authorization', token)
  //       .send()
  //       .expect(404)
  //       .expect('Content-Type', /json/)
  //       .end((err, res) => {
  //         expect(res.body.message).toBe('property not found')
  //         expect(res.body.status).toBe(404)
  //         done()
  //       })
  //   })

  //   it('fails to update to a blank primary contact', (done) => {
  //     requester
  //       .put(updateUrl)
  //       .set('Authorization', token)
  //       .send({
  //         property: {
  //           primaryContact: ''
  //         }
  //       })
  //       .expect(400)
  //       .expect('Content-Type', /json/)
  //       .end((err, res) => {
  //         expect(res.body.message).toBe('invalid primary contact')
  //         expect(res.body.status).toBe(400)
  //         done()
  //       })
  //   }) 

  //   it('fails to update without a validly formatted location', (done) => {
  //     requester
  //       .put(updateUrl)
  //       .set('Authorization', token)
  //       .send({
  //           property: {
  //             location: { 
  //               foo: 'bar'
  //             }
  //           }
  //       })
  //       .expect(400)
  //       .expect('Content-Type', /json/)
  //       .end((err, res) => {
  //         expect(res.body.message).toBe('invalidly formatted location')
  //         expect(res.body.status).toBe(400)
  //         done()
  //       })
  //   })

  //   it('fails to update with an invalid bedrooms entry', (done) => {
  //     requester
  //       .put(updateUrl)
  //       .set('Authorization', token)
  //       .send({
  //           property: {
  //             details: {
  //               stats: {
  //                 bedrooms: 'not'
  //               }
  //             }
  //           }
  //       })
  //       .expect(400)
  //       .expect('Content-Type', /json/)
  //       .end((err, res) => {
  //         expect(res.body.message).toBe('invalid bedrooms')
  //         expect(res.body.status).toBe(400)
  //         done()
  //       })
  //   })

  //   it('updates bedrooms properly', (done) => {
  //     requester
  //       .put(updateUrl)
  //       .set('Authorization', token)
  //       .send({
  //           property: {
  //             details: {
  //               stats: {
  //                 bedrooms: '55'
  //               }
  //             }
  //           }
  //       })
  //       .expect(200)
  //       .expect('Content-Type', /json/)
  //       .end((err, res) => {
  //         expect(res.body.property).toBeDefined()
  //         expect(res.body.property.details.stats.bedrooms).toEqual(55)
  //         done()
  //       })
  //   })
  
  // })


})


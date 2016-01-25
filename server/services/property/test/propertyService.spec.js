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
    // TODO a lot of these could vanish with a real house
    // TODO test object returned
    let user
    let token
    let testId

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
          testId = user.id
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
    // This is currently hardcoded because I was having trouble
    // with the scoping of user.id from the beforeAll call on 
    // line 42, so it's valid but not a good idea to leave 
    // hardcoded I think. 

    // TODO create a test house object
    //testId = '5689a9f38b7512cf1b0e497f23scD'

    it('fails to create without any location', (done) => {
      requester
        .post(postUrl)
        .set('Authorization', token)
        .send({
          property: {
            primaryContact: testId
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

    // Right now we're requiring street/city/state/zip and saying 
    // all are strings except the zip which is a number
    it('fails to create without a validly formatted location', (done) => {
      requester
        .post(postUrl)
        .set('Authorization', token)
        .send({
            property: {
              primaryContact: testId,
              location: { 
                foo: 'bar'
              }
            }
        })
        .expect(400)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          expect(res.body.message).toBe('invalidly formatted location')
          expect(res.body.status).toBe(400)
          done()
        })
    })
    
    it('fails to create without any details received', (done) => {
      requester
        .post(postUrl)
        .set('Authorization', token)
        .send({
          property: {
            primaryContact: testId,
            location: testUtils.testRealLocation,
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
        .set('Authorization', token)
        .send({
          property: {
            primaryContact: testId,
            location: testUtils.testRealLocation,
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
        .set('Authorization', token)
        .send({
          property: {
            primaryContact: testId,
            location: testUtils.testRealLocation,
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
        .set('Authorization', token)
        .send({
          property: {
            primaryContact: testId,
            location: testUtils.testRealLocation,
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
        .set('Authorization', token)
        .send({
          property: {
            primaryContact: testId,
            location: testUtils.testRealLocation,
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
     requester
       .post(postUrl)
       .set('Authorization', token)
       .send({
         property: {
            primaryContact: 'fakeID',
            location: testUtils.testUnrealLocation,
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
         expect(res.body.message).toBe('non-real location')
         expect(res.body.status).toBe(400)
         done()
       })
    })

    /////////////////////////////////////////////////////////////////////
    // This test should be uncommented when user verification is working
    /////////////////////////////////////////////////////////////////////
    
    // it('fails to create without a primary contact who is a user', (done) => {
    //   requester
    //     .post(postUrl)
    //     .set('Authorization', token)
    //     .send({
    //       property: {
    //         primaryContact: 'fakeID',
    //         location: testUtils.testRealLocation,
    //         details: {
    //           stats: {
    //             bedrooms: '5',
    //             bathrooms: '2',
    //             sqft: '22'
    //           }
    //         }
    //       }
    //     })
    //     .expect(400)
    //     .expect('Content-Type', /json/)
    //     .end((err, res) => {
    //       //console.log(res.body)
    //       expect(res.body.message).toBe('non-user primary contact')
    //       expect(res.body.status).toBe(400)
    //       done()
    //     })
    // })

    it('successfully creates a new property', (done) => {
      requester
        .post(postUrl)
        .set('Authorization', token)
        .send({
          property: {
            primaryContact: testId,
            location: testUtils.testRealLocation,
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
          expect(res.body.saved).toBe(true);
          expect(res.body.property).toBeDefined();
          done()
        })
    }) 
   
  })

  describe('Update Existing Property: ', () => {
    //console.log('calleddf')
    let property
    let user
    let token

    let updateUrl
    let badUpdateUrl = propertyService.url + '/5689a9f38b7512cf1b0e497f23scD'

    beforeAll((done) => {
      testUtils.clearLocalTestDatabase()
        .then(() => {
          return testUtils.addTestUser();
        })
        .then(() => {
          return testUtils.logInTestUser();
        })
        .then((result) => {
          // console.log('called here!')
          user = result.user;
          token = 'Bearer ' + result.token;
          return testUtils.addTestProperty(user.id, token);
        })
        .then((result) => {
          property = result
          updateUrl = propertyService.url + '/' + property._id
          done()
        })
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
        // .set('Authorization', token) leave out explicitly
        .send('nully')
        .expect(401)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          expect(res.body.message).toBe('invalid token');
          expect(res.body.status).toBe(401);
          done();
        });
    });

    it('fails without an existing property', (done) => {
      requester
        .put(badUpdateUrl)
        .set('Authorization', token)
        .send()
        .expect(404)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          expect(res.body.message).toBe('property not found');
          expect(res.body.status).toBe(404);
          done();
        });
    });

    it('fails to update to a blank primary contact', (done) => {
      requester
        .put(updateUrl)
        .set('Authorization', token)
        .send({
          property: {
            primaryContact: ''
          }
        })
        .expect(400)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          expect(res.body.message).toBe('invalid primary contact')
          expect(res.body.status).toBe(400)
          done()
        })
    }) 

    it('fails to update without a validly formatted location', (done) => {
      requester
        .put(updateUrl)
        .set('Authorization', token)
        .send({
            property: {
              location: { 
                foo: 'bar'
              }
            }
        })
        .expect(400)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          expect(res.body.message).toBe('invalidly formatted location')
          expect(res.body.status).toBe(400)
          done()
        })
    })

    it('fails to update with an invalid bedrooms entry', (done) => {
      requester
        .put(updateUrl)
        .set('Authorization', token)
        .send({
            property: {
              details: {
                stats: {
                  bedrooms: 'not'
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

  it('updates bedrooms properly', (done) => {
      requester
        .put(updateUrl)
        .set('Authorization', token)
        .send({
            property: {
              details: {
                stats: {
                  bedrooms: '55'
                }
              }
            }
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          expect(res.body.property).toBeDefined()
          expect(res.body.property.details.stats.bedrooms).toEqual(55)
          done()
        })
    })


})


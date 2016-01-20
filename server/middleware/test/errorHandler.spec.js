'use strict';

// Globals
import _ from 'lodash';
import q from 'q';
import request from 'supertest';
import express from 'express';

import bodyParser from 'body-parser';


// Locals
import testUtils from './../../utils/testUtils';
// Note: Import the one service we want to explicitly test 
// We don't need to load the whole app
import middlewareError from './../errorHandler';
import fractionErrors from './../../utils/fractionErrors';


// init a basic test app for url hits
let app = express();

// Make sure we use the bodyparser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Attach supertest
let requester = request(app);


// Bad Errors

// raw JS error
let errorRawMsg = 'raw js error message';
let errorRawUrl = '/throwRaw';
let errorRawThrower = (req,res) => {
  throw new Error(errorRawMsg);
};

// String thrown for error
let errorStringMsg = 'String js error message';
let errorStringUrl = '/throwString';
let errorStringThrower = (req,res) => {
  throw 'errorStringMsg';
};

// Object thrown for error (who even does this?!)
let errorObjectMsg = 'Object js error message';
let errorObjectUrl = '/throwObject';
let errorObjectThrower = (req,res) => {
  throw {};
};



// Proper Fraction Errors :)

// 400
let error400msg = '400 error message';
let error400url = '/throw400';
let error400Thrower = (req,res) => {
  throw new fractionErrors.Invalid(error400msg);
};

// 401
let error401msg = '401 error message';
let error401url = '/throw401';
let error401Thrower = (req,res) => {
  throw new fractionErrors.Unauthorized(error401msg);
};

// 403
let error403msg = '403 error message';
let error403url = '/throw403';
let error403Thrower = (req,res) => {
  throw new fractionErrors.Forbidden(error403msg);
};

// 404
let error404msg = '404 error message';
let error404url = '/throw404';
let error404Thrower = (req,res) => {
  throw new fractionErrors.NotFound(error404msg);
};

// success promise
let promiseSuccessMsg = 'promise success!';
let promiseSuccessUrl = '/promiseSuccess';
let promiseSuccessFunc = (req,res) => {
  return new Promise((resolve, reject) => {
    return resolve(res.json({ message: promiseSuccessMsg }));
  });
};

// fail promise
let promiseErrorMsg = 'promise error!';
let promiseErrorUrl = '/promiseError';
let promiseErrorFunc = (req,res) => {
  return new Promise((resolve, reject) => {
    throw new fractionErrors.Invalid(promiseErrorMsg);
  });
};


// Set up a basic routes to test errors
app.get(errorStringUrl, middlewareError.wrap(errorStringThrower));
app.get(errorObjectUrl, middlewareError.wrap(errorObjectThrower));
app.get(errorRawUrl, middlewareError.wrap(errorRawThrower));
app.get(error400url, middlewareError.wrap(error400Thrower));
app.get(error401url, middlewareError.wrap(error401Thrower));
app.get(error403url, middlewareError.wrap(error403Thrower));
app.get(error404url, middlewareError.wrap(error404Thrower));
app.get(promiseSuccessUrl, middlewareError.wrap(promiseSuccessFunc));
app.get(promiseErrorUrl, middlewareError.wrap(promiseErrorFunc));


describe('wrap Middleware', () => {
  
  let mockReq = {};
  let mockRes = { json: () => {}, status: () => {} };
    
  beforeAll(() => {
    console.log('\n' + 'Starting error handler tests');
  });

  beforeEach(() => {
    spyOn(mockRes, 'json');
  });

  // Throwing non-Fraction-based errors
  it('handles a native JS error thrown', (done) => {
    requester
      .get(errorRawUrl)
      .expect(500)
      .expect('Content-Type', /json/)
      .end((err, res) => {
        expect(res.body.status).toBe(500);
        expect(res.body.message).toBe(errorRawMsg);
        done();
      });
  });

  it('handles a raw string thrown in an error', (done) => {
    requester
      .get(errorStringUrl)
      .expect(500)
      .expect('Content-Type', /json/)
      .end((err, res) => {
        expect(res.body.status).toBe(500);
        expect(_.startsWith(res.body.message, '[string_error]')).toBe(true);
        done();
      });
  });

  it('handles an object thrown in an error', (done) => {
    requester
      .get(errorObjectUrl)
      .expect(500)
      .expect('Content-Type', /json/)
      .end((err, res) => {
        expect(res.body.status).toBe(500);
        expect(_.startsWith(res.body.message, '[object_error]')).toBe(true);
        done();
      });
  });


  // Throwing Fraction instance errors - what we want to do :)
  it('handles a 400 invalid error instance thrown', (done) => {
    requester
      .get(error400url)
      .expect(400)
      .expect('Content-Type', /json/)
      .end((err, res) => {
        expect(res.body.status).toBe(400);
        expect(res.body.message).toBe(error400msg);
        done();
      });
  });

  it('handles a 401 unauthorized error instance thrown', (done) => {
    requester
      .get(error401url)
      .expect(401)
      .expect('Content-Type', /json/)
      .end((err, res) => {
        expect(res.body.status).toBe(401);
        expect(res.body.message).toBe(error401msg);
        done();
      });
  });

  it('handles a 403 forbidden error instance thrown', (done) => {
    requester
      .get(error403url)
      .expect(403)
      .expect('Content-Type', /json/)
      .end((err, res) => {
        expect(res.body.status).toBe(403);
        expect(res.body.message).toBe(error403msg);
        done();
      });
  });

  it('handles a 404 not found error instance thrown', (done) => {
    requester
      .get(error404url)
      .expect(404)
      .expect('Content-Type', /json/)
      .end((err, res) => {
        expect(res.body.status).toBe(404);
        expect(res.body.message).toBe(error404msg);
        done();
      });
  });

  it('handles a promise returning an error', (done) => {
    requester
      .get(promiseErrorUrl)
      .expect(500)
      .expect('Content-Type', /json/)
      .end((err, res) => {
        expect(res.body.message).toBe(promiseErrorMsg);
        done();
      });
  });

  it('handles a promise returning success', (done) => {
    requester
      .get(promiseSuccessUrl)
      .expect(200)
      .expect('Content-Type', /json/)
      .end((err, res) => {
        expect(res.body.message).toBe(promiseSuccessMsg);
        done();
      });
  });

});

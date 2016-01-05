'use strict'

// Globals
import _ from 'lodash';
import jwt from 'jsonwebtoken';
import moment from 'moment';

// Locals
import fractionErrors from './../utils/fractionErrors';


// Constants
const FRACTION_TOKEN_SECRET = process.config.fraction.tokenSecret;


/**
 * Middleware for checking auth tokens
 *
 * @param {req} obj Express request object
 * @param {res} obj Express response object
 * @param {next} func Express next function
 */
exports.requireAuth = function(req, res, next) {

  let decodedToken;
  let prependedToken;
  let token;

  // Helper to send back the
  function respondWithError() {
    let invalidTokenError = new fractionErrors.Unauthorized('invalid token');
    let responseError = { status: invalidTokenError.error.status, message: invalidTokenError.error.message };
    res.status(responseError.status);
    return res.json(responseError);
  }

  // check the header for the token
  if (!_.has(req.headers, 'authorization')) {
    return respondWithError();
  }
  prependedToken = req.headers.authorization;

  if (prependedToken.split(' ')[0] !== 'Bearer') {
    return respondWithError();
  } 
  token = prependedToken.split(' ')[1];

  // attempt to decode it
  try {
    decodedToken = jwt.verify(token, FRACTION_TOKEN_SECRET);
  } catch (e) {
    return respondWithError();
  }

  // check if it is expired
  if (moment.utc().valueOf() > decodedToken.exp) {
    return respondWithError();
  }

  // Attach the token to the request
  req.token = token;
  
  next();
};

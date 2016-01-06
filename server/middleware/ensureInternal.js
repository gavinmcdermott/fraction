'use strict'

// Globals
import _ from 'lodash';
import jwt from 'jsonwebtoken';
import moment from 'moment';

// Locals
import fractionErrors from './../utils/fractionErrors';


// Constants
const INTERNAL_API_SECRET = process.config.fraction.internalApiSecret;


let generateToken = function() {
  // TODO: implement
  // TODO: implement
  // TODO: implement
  return 'someSignedToken'
}


/**
 * Middleware for ensuring a call was made from an internal service
 *
 * @param {req} obj Express request object
 * @param {res} obj Express response object
 * @param {next} func Express next function
 */
exports.ensureInternal = function(req, res, next) {

  // TODO: implement
  // TODO: implement
  // TODO: implement

  // Attach the token to the request
  req.headers['fraction_verification_token'] = generateToken();
  
  next();
};

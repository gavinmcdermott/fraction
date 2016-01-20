'use strict'

// Globals
import _ from 'lodash'
import jwt from 'jsonwebtoken'
import moment from 'moment'
// import requestP from 'request-promise'

// Locals
import fractionErrors from './../utils/fractionErrors'
// import serviceRegistry from './../services/serviceRegistry';


// Constants
const FRACTION_TOKEN_SECRET = process.config.fraction.tokenSecret

// const ROUTE_GET_USER = process.config.apiServer 
//                        + serviceRegistry.registry.apis.baseV1 
//                        + '/user'


/**
 * Middleware for checking auth tokens
 *
 * @param {req} obj Express request object
 * @param {res} obj Express response object
 * @param {next} func Express next function
 */
exports.requireAuth = (req, res, next) => {

  let decodedToken
  let prependedToken
  let token

  // Helper to send back the
  let respondWithError = () => {
    let invalidTokenError = new fractionErrors.Unauthorized('invalid token')
    let responseError = { status: invalidTokenError.error.status, message: invalidTokenError.error.message }
    res.status(responseError.status)
    return res.json(responseError)
  }

  // check the header for the token
  if (!_.has(req.headers, 'authorization')) {
    return respondWithError()
  }
  prependedToken = req.headers.authorization

  if (prependedToken.split(' ')[0] !== 'Bearer') {
    return respondWithError()
  } 
  token = prependedToken.split(' ')[1]

  // attempt to decode it
  try {
    decodedToken = jwt.verify(token, FRACTION_TOKEN_SECRET)
  } catch (e) {
    return respondWithError()
  }

  // check if it is expired
  if (moment.utc().valueOf() > decodedToken.exp) {
    return respondWithError()
  }

  req.body.userId = decodedToken.sub
  req.body.token = token

  next()
}

'use strict'

// Globals
import _ from 'lodash'
import assert from 'assert'
import jwt from 'jsonwebtoken'
import moment from 'moment'
import passport from 'passport'
import validator from 'validator'

// Locals
import { Strategy } from 'passport-jwt'
import fractionErrors from './../../utils/fractionErrors'

// DB Models
import User from './../users/userModel'


// Constants

const FRACTION_TOKEN_SECRET = process.config.fraction.tokenSecret
const FRACTION_TOKEN_ISSUER = process.config.fraction.clientId




let opts = {
  secretOrKey: FRACTION_TOKEN_SECRET,
  issuer: FRACTION_TOKEN_ISSUER,
  authScheme: 'Bearer'
}



passport.use(new Strategy(opts, (jwtPayload, done) => {
  if (!jwtPayload) {
    throw new fractionErrors.Unauthorized('invalid token')
  }
  if (moment.utc().valueOf() > jwtPayload.exp) {
    throw new fractionErrors.Unauthorized('invalid token')
  }

  return User.findById({ _id: jwtPayload.sub })
    .then((user) => {
      if (!user) {
        return done(new fractionErrors.NotFound('user not found'))
      }
      return done(null, user.toPublicObject())
    })
  })
)


function exractAuthToken(req) {
  return req.headers.authorization
}


/**
 * Express middleware function that wraps a passport-local middleware implementation
 *
 * @param {req} obj Express request object
 * @param {res} obj Express response object
 * @returns {promise}
 */
function ensureAuth(req, res, next) {

  if (req.user) {
    return next()
  }

  passport.authenticate('jwt', { session: false }, (err, data, info) => {
    // err should be an instance of a fractionError
    if (err) {
      req.error = err
    }
    if (info) {
      req.error = new fractionErrors.Unauthorized(info.message)
    }
    if (data) {
      req.user = data
      req.token = exractAuthToken(req)
    }
    return next()
  })(req, res, next)
}



module.exports = ensureAuth

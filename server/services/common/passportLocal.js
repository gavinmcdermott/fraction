'use strict'

// Globals
import _ from 'lodash'
import assert from 'assert'
import jwt from 'jsonwebtoken'
import moment from 'moment'
import passport from 'passport'
import validator from 'validator'

// Locals
import { Strategy } from 'passport-local'
import fractionErrors from './../../utils/fractionErrors'

// DB Models
import User from './../users/userModel'


// Constants

const FRACTION_TOKEN_SECRET = process.config.fraction.tokenSecret
const FRACTION_TOKEN_ISSUER = process.config.fraction.clientId

/**
 * Generate a signed jwt for a user
 *
 * @returns {token} string New signed web token
 */
let generateToken = function(user) {
  assert(_.isObject(user))
  let now = moment.utc()
  let payload = {
    iss: FRACTION_TOKEN_ISSUER,
    exp: moment(now).add(1, 'day').utc().valueOf(),
    iat: now.valueOf(),
    sub: user._id.toString(),
    scopes: user.scopes
  }
  return jwt.sign(payload, FRACTION_TOKEN_SECRET)
}

/**
 * Passport middleware implementation for passport-local
 * https://github.com/jaredhanson/passport-local
 *
 * @param {Strategy} func Passport local strategy function
 */
passport.use(new Strategy({
    usernameField: 'email',
    passwordField: 'password',
    session: false
  }, (email, password, done) => {

    let scrubbedEmail
    let scrubbedPassword

    // validate email
    try {
      assert(_.isString(email))
      scrubbedEmail = validator.toString(email).toLowerCase()
      assert(validator.isEmail(scrubbedEmail))
    } catch(e) {
      throw new fractionErrors.Invalid('invalid email')
    }

    // password
    try {
      assert(_.isString(password))
      scrubbedPassword = validator.toString(password)
      assert(scrubbedPassword.length)
    } catch(e) {
      throw new fractionErrors.Invalid('invalid password')
    }

    return User.findOne({ 'email.email': scrubbedEmail, 'local.password': scrubbedPassword })
      .then((user) => {
        if (!user) {
          return done(new fractionErrors.NotFound('user not found'))
        }      

        let token
        try {
          token = generateToken(user)
        } catch (err) {
          return done(new fractionErrors.GenericStringError('error generating user token'))
        }
        return done(null, { token: token, user: user.toPublicObject() })
      })
  })
)

/**
 * Express middleware function that wraps a passport-local middleware implementation
 *
 * @param {req} obj Express request object
 * @param {res} obj Express response object
 * @returns {promise}
 */
function authenticateUser(req, res, next) {
  passport.authenticate('local', (err, data, info) => {
    // err should be an instance of a fractionError
    if (err) {
      req.error = err
    }
    if (info) {
      req.error = new fractionErrors.Invalid(info.message)
    }
    if (data) {
      req.user = data.user
      req.token = data.token
    }
    return next()
  })(req, res, next)
}


// Exports

module.exports = authenticateUser

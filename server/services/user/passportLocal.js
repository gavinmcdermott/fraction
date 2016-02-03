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
import User from './userModel'


// Constants

const FRACTION_TOKEN_SECRET = process.config.fraction.tokenSecret
const FRACTION_TOKEN_ISSUER = process.config.fraction.clientId


/**
 * Generate a signed jwt for a user
 *
 * @returns {token} string New signed web token
 */
let generateToken = function(userId) {
  assert(userId)
  let now = moment.utc()
  let payload = {
    iss: FRACTION_TOKEN_ISSUER,
    exp: moment(now).add(1, 'day').utc().valueOf(),
    iat: now.valueOf(),
    sub: userId
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
          token = generateToken(user._id.toString())
        } catch (err) {
          return done(new fractionErrors.GenericStringError('error generating user token'))
        }
        return done(null, { token: token, user: user.toPublicObject() })
      })
  })
)


// Exports

module.exports = passport

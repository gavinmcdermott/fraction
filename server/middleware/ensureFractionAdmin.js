'use strict'

import _ from 'lodash'

// Locals
import fractionErrors from './../utils/fractionErrors'

const FRACTION_ADMIN = 'fraction:admin'

/**
 * Express middleware function to ensure that a user is a Fraction Admin
 *
 * @param {req} obj Express request object
 * @param {res} obj Express response object
 * @returns {promise}
 */
module.exports = function ensureFractionAdmin(req, res, next) {
  let error = new fractionErrors.Unauthorized('unauthorized scope')

  // Let the final wrapped function handle the return 
  if (req.error) {
    return next()
  }

  if (!req.user) {
    req.error = error
  }
  if (req.user && !_.includes(req.user.scopes, FRACTION_ADMIN)) {
    req.error = error
  }

  return next()
}

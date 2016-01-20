'use strict'

// Locals
import errors from './../utils/fractionErrors'
import _ from 'lodash'


/**
 * Middleware for wrapping Fraction Service/API calls
 *
 * @param {func} function A Fraction service/api function (can be regular or Promise)
 * @returns {promise} object
 */
module.exports.wrap = function(func) {
  /**
   * Return function for express middleware
   *
   * @param {req} obj Express request object
   * @param {res} obj Express response object
   */
  return (req, res) => {
    // Convert all passed funcs into promises
    return new Promise((resolve, reject) => {
      let result
      try { 
        result = func(req, res)
      } catch (e) {
        return reject(e)
      }
      return resolve(result)
    })
    .then((response) => {
      return response.body
    })
    .catch((err) => {
      let instance = errors.coerceToError(err)
      res.status(instance.error.status)
      return res.json({ 
        status: instance.error.status,
        message: instance.error.message
      })
    })
  }
}

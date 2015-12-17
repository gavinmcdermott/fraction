'use strict'


/**
 * Class: Fraction Error
 * 
 * Builds a formatted error to be returned to clients
 * calling the Fraction service API
 */
class FractionError {

  _baseError (msg, status) {
    msg = msg || "base_error";
    let error = new Error(msg);
    error.status = status;
    return error;
  }
  
  Invalid(msg) {
    let status = 400;
    return this._baseError(msg, status)
  };

  Unauthorized(msg) {
    let status = 401;
    return this._baseError(msg, status);
  };

  Forbidden(msg) {
    let status = 403;
    return this._baseError(msg, status);
  };

  NotFound(msg) {
    let status = 404;
    return this._baseError(msg, status);
  };

}


/**
 * Coerce an unknown error into a proper error for return
 *
 * @param {req} obj Express request object
 * @param {res} obj Express response object
 * @param {err} obj Error object
 */
let coerceToError = (err) => {
  if (err instanceof FractionError) {
    return err;
  } else if (typeof err === 'string') {
    return new Error('[string_error] ' + err);
  } else if (typeof err === 'object') {
    return new Error('[object_error] ' + JSON.stringify(err) + err.message);
  }
};


/**
 * Express middleware for wrapping Fraction Service/API calls
 *
 * @param {func} function A Fraction service/api function
 * @returns {promise} 
 */
let errorWrap = (func) => {
  // Create a promise version of the function to use later
  let wrappedFunc = new Promise(func);

  /**
   * Return function for express middleware
   *
   * @param {req} obj Express request object
   * @param {res} obj Express response object
   * @param {next} obj Express next object
   */
  return (req, res) => {
    wrappedFunc
    .then((result) => {
      res.send(result);
    })
    .catch((err) => {
      res.send(coerceToError(err));
    })
  };
};


module.exports = {
  errorWrap: errorWrap,
  FractionError: FractionError
};

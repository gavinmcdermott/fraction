'use strict'


/**
 * Class: Fraction Error
 * 
 * Builds a formatted error to be returned to clients
 * calling the Fraction service API
 */
class FractionError {
  constructor(msg, status) {
    msg = msg || "base_error_message";
    this.error = new Error(msg);
    this.error.status = status;
  };
};


// Handlers for if someone throw raw objects, native errors, or strings
class NativeJsErrorHandler extends FractionError {
  constructor(msg) {
    let status = 500;
    super(msg, status);
  };
};

class GenericStringError extends FractionError {
  constructor(msg) {
    let status = 500;
    super(msg, status);
  };
};

class GenericObjectError extends FractionError {
  constructor(msg) {
    let status = 500;
    super(msg, status);
  };
};


// Proper Fraction Errors to throw in the app
class Invalid extends FractionError {
  constructor(msg) {
    let status = 400;
    super(msg, status);
  };
};

class Unauthorized extends FractionError {
  constructor(msg) {
    let status = 401;
    super(msg, status);
  };
};

class Forbidden extends FractionError {
  constructor(msg) {
    let status = 403;
    super(msg, status);
  };
};

class NotFound extends FractionError {
  constructor(msg) {
    let status = 404;
    super(msg, status);
  };
};


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
  } else if (err instanceof Error) {
    // Handle existing Error class instances
    return new NativeJsErrorHandler(err.message);
  } else if (typeof err === 'string') {
    // Handle raw strings that were thrown
    return new GenericStringError('[string_error] ' + JSON.stringify(err));
  } else if (typeof err === 'object') {
    // Handle objects that were thrown
    return new GenericObjectError('[object_error] ' + JSON.stringify(err));
  }
};


// Exports

module.exports = {
  coerceToError: coerceToError,
  Invalid: Invalid,
  Unauthorized: Unauthorized,
  Forbidden: Forbidden,
  NotFound: NotFound
};

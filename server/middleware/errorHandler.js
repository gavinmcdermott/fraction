'use strict'

let Error = (msg, status) => {
  msg = msg || "base_error";
  let error = new Error(msg);
  error.status = status;
  return error;
};

class ErrorHandler {
  Invalid(msg) {
    let status = 400;
    return Error(msg, status)
  }
}






let coerceToError = (req, res, err) => {
  if (err instanceof errorHandler) {
    return err;
  } else if (typeof err === 'string') {
    return new Error('(string_error)' + err);
  } else if (typeof err === 'object') {
    return new Error('(object_error)' + JSON.stringify(err));
  }
};

module.exports.wrapAPI = function(request) {
  return (req, res) => {
    Promise
    .try((result) => {
      res.send(result);
    })
    .catch((err) => {
      return coerceToError(req, res, err);
    })
  };
};

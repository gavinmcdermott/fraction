'use strict';

// Dependencies
import env from './env'


/**
 * A function which sets up the ENV variables for the express app
 *
 * @param {app} obj Current instance of the running express app
 */
exports.init = function() {
  var node_env = process.env.NODE_ENV || 'development';
  return env[node_env];
};

'use strict';

// Dependencies
import env from './env'


/**
 * Sets up the ENV variables for the express app
 */
exports.init = () => {
  var node_env = process.env.NODE_ENV || 'development';
  return env[node_env];
};

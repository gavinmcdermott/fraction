'use strict';

// Local Dependencies
import env from './env'


/**
 * Sets up the ENV variables for the express app
 */
exports.load = () => {
  var node_env = process.env.NODE_ENV || 'development';
  return env[node_env];
};

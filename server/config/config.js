'use strict';

// Globals
import _ from 'lodash';
import fs from 'fs';
import path from 'path';

// Locals
let env = process.env.NODE_ENV || 'development';
let rootPath = path.normalize(path.join(__dirname, './../'));

// Defaults used in all configs regardless of env
let configDefaults = {
  root: rootPath,
  app: {
    name: 'Fraction'
  },
  email: {
    fromFraction: 'Fraction <some_email_we_want@fraction.com>'
  }
};


function AppConfig(config) {
  
  config.development = _.cloneDeep(configDefaults);
  config.development.port = process.env.PORT || 3000;
  config.development.protocol = 'http';
  config.development.domain = 'localhost:3000';
  config.development.apiServer = 'http://localhost:3000';
  config.development.serviceDb = 'mongodb://localhost/fraction_development';

  config.test = _.cloneDeep(configDefaults);
  config.test.port = process.env.PORT || 3000;
  config.test.protocol = 'http';
  config.test.domain = 'localhost:3000';
  config.test.apiServer = 'http://localhost:3000';
  config.test.serviceDb = 'mongodb://localhost/fraction_test';

  // todo fill in production
  config.production = _.cloneDeep(configDefaults);

  return config;
};

process.config = new AppConfig({})[env];
process.root = process.config.root;

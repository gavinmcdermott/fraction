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
  },
  fraction: {
    clientId: 'fraction',
    // temporarily using: https://www.grc.com/passwords.htm
    // TODO(important!): upgrade to keys later
    // TODO(important!): upgrade to keys later
    // TODO(important!): upgrade to keys later
    tokenSecret: 'c1sCtEyAxA75Ecr4FZNK3rbNszaHrx473vsmTMXkzUpEOc0mKzlQPY9OYFj0ZE1',
    internalApiSecret: 'n3UZiR6qdBdlCCk3izYU07tx3vQC8caHEiyLvTd4ErfYZjq7seDQqUcN42FkTBN'
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
  // IMPORTANT: Ensure the test DB has the word 'test' in it
  // Used for safety checks when wiping the test db during testing
  config.test.serviceDb = 'mongodb://localhost/fraction_test';

  // todo fill in production
  config.production = _.cloneDeep(configDefaults);

  return config;
};

process.config = new AppConfig({})[env];
process.root = process.config.root;

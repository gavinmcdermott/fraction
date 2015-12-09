'use strict';

// Import dependencies
import _ from 'lodash';
import fs from 'fs';
import path from 'path';


/**
 * Load all API routes for the express app
 *
 * @param {app} obj Current instance of the running express app
 * @param {routesDir} string Directory path to all API routes
 */
exports.loadAPI = (app, routesDir) => {
  var routes = fs.readdirSync(routesDir);

  _.forEach(routes, (filename) => {
    let modulePath = path.join(routesDir, filename);
    let name = path.basename(modulePath, '.js');
    let ext = path.extname(modulePath);
    let route = name === 'root' ? '/' : '/' + name;

    if (ext === '.js') {
      let routerModule = require(modulePath);
      app.use(route, routerModule);
    }
  });
};

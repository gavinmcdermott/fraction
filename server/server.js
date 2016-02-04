'use strict';

// Local Dependencies
import app from './app';


/**
 * Run the node the server
 *
 * @param {port} string Port to listen on 
 */
let server = app.listen(process.config.port, () => {
  console.log('server started on port %s', server.address().port);
  // provide access to server via exported app for querying and adding listeners
  app.set('server', server);
});


// Exports
module.exports = server;

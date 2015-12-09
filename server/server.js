'use strict';

// Dependencies
import app from '../app';

let port = app.get('express_port');

/**
 * Run the node the server
 *
 * @param {port} string Port to listen on 
 */
let server = app.listen(port, () => {
  console.log('server started on port %s', server.address().port);
  // provide access to server via exported app for querying and adding listeners
  app.set('server', server);
});


// Exports
module.exports = server;

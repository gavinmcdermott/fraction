'use strict';

// Import dependencies
import app from '../app';

let server = app.listen(app.get('port'), () => {
  // server is an http.Server, which extends a net.Server
  console.log('server started on port %s', server.address().port);

  // provide access to server via exported app for querying and adding listeners
  app.set('server', server);
});

'use strict';

const path = require('path')

module.exports = function(server) {
  // Install a `/` route that returns server status
  var router = server.loopback.Router();
  router.get('/', (req, res) => {
    res.sendFile(path.resolve('dist/client/index.html'))
  });
  server.use(router);
};

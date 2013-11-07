var CloudTypes = require('../../../server/main.js');

module.exports = function (server) {
  server.declare('counter', CloudTypes.CInt);
  return server;
};
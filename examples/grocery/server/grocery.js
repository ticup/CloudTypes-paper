/**
 * Created by ticup on 31/10/13.
 */

// CloudTypes Grocery Example Server
////////////////////////////////////
// note: don't forget to run a static file server, see README->Examples
var port = 8080;
var CloudTypes = require('../../../server/main.js');
var server = CloudTypes.createServer();

server.declare('totalItems', CloudTypes.CInt)
      .declare('Grocery', CloudTypes.CEntity([{name: 'String'}], {toBuy: 'CInt'}));

module.exports = server;
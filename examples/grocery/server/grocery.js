/**
 * Created by ticup on 31/10/13.
 */

// CloudTypes Grocery Example Server
////////////////////////////////////
var CloudTypes = require('../../../server/main.js');
var server = CloudTypes.createServer();

server.declare('totalItems', CloudTypes.CInt)
      .declare('Grocery', CloudTypes.CEntity([{name: 'String'}], {toBuy: 'CInt'}));

module.exports = server;
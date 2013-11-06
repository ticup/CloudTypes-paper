/**
 * Created by ticup on 31/10/13.
 */

// CloudTypes Grocery Example Server
////////////////////////////////////
var CloudTypes = require('../../../server/main.js');

function declare(server) {
  return server
      .declare('totalItems', CloudTypes.CInt)
      .declare('Grocery',    CloudTypes.CArray([{name: 'string'}], {toBuy: 'CInt'}));
}

module.exports = declare;
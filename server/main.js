var CServer = require ('./CServer');


exports.createServer = function (state) {
  return new CServer(state);
};

exports.CInt    = require('../shared/CInt');
exports.CString = require('../shared/CString');
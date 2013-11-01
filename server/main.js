var CServer = require ('./CServer');


exports.createServer = function (state) {
  return new CServer(state);
};

exports.CInt    = require('../shared/CInt');
exports.CString = require('../shared/CString');
exports.CEntity = require('../shared/CArray').declare;
exports.CArray  = require('../shared/CEntity').declare;
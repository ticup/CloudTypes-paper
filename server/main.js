var CloudTypeServer = require ('./CloudTypeServer');


exports.createServer = function (state) {
  return new CloudTypeServer(state);
};

exports.CInt    = require('../shared/CInt');
exports.CString = require('../shared/CString');
exports.CEntity = require('../shared/CEntity').declare;
exports.CArray  = require('../shared/CArray').declare;
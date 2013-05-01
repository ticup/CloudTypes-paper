var CServer = require ('./CServer');


exports.createServer = function () {
  return new CServer();
};

exports.CInt = require('../shared/CInt');
var CTServer = require ('./CTServer');


exports.createServer = function () {
  return new CTServer();
};

exports.CInt = require('../shared/CInt');
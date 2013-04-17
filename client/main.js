var CTClient = require ('./CTClient');

var CloudTypes = {};
global.CloudTypes = CloudTypes;

CloudTypes.createClient = function () {
  return new CTClient();
};

exports.CInt = require('../shared/CInt');
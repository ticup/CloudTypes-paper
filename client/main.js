var CTClient = require ('./CTClient');

var CloudTypes = {};
global.CloudTypes = CloudTypes;

console.log("FOO");
CloudTypes.createClient = function () {
  return new CTClient();
};

exports.CInt = require('../shared/CInt');
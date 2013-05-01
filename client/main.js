var CClient = require ('./CClient');

var CloudTypes = {};
global.CloudTypes = CloudTypes;

CloudTypes.createClient = function () {
  return new CClient();
};
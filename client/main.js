var CloudTypesClient = require ('./CloudTypesClient');

var CloudTypes = {};
global.CloudTypes = CloudTypes;

CloudTypes.createClient = function () {
  return new CloudTypesClient();
};

module.exports = CloudTypes;
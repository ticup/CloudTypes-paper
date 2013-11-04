var CloudTypeClient = require('./CloudTypeClient');
var ClientState     = require('./ClientState');

var CInt            = require('../shared/CInt');
var CString         = require('../shared/CString');
var CArray          = require('../shared/CArray');
var CEntity         = require('../shared/CEntity');

var View            = require('./views/View');
var ListView        = require('./views/ListView');
var EntryView       = require('./views/EntryView');

var CloudTypes = {
  // Client
  createClient: function () {
    return new CloudTypeClient();
  },

  // Views
  View: View,
  ListView: ListView,
  EntryView: EntryView

};

global.CloudTypes = CloudTypes;
module.exports = CloudTypes;
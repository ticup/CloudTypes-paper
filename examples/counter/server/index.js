var CloudTypes = require('../../../server/main.js');

// create a new CloudTypes server
var cloudTypes = CloudTypes.createServer();

// Declare the global counter CloudType
cloudTypes.declare('counter', CloudTypes.CInt);

// publish the types on 8080 + server static files from root, also on 8080.
cloudTypes.publish(8080, __dirname + '/../../../');
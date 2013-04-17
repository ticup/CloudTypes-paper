var CloudTypes = require('../../../server/main.js');
var http = require('http');
var static = require('node-static');

// create static server for public files
var file = new static.Server('./');

// http server
var app = http.createServer(function (req, res) {
  console.log(req.url);
  file.serve(req, res);
});
app.listen(8090);

// Cloud Types
var cts = CloudTypes.createServer();
cts.declare('counter', new CloudTypes.CInt());
cts.publish(app);
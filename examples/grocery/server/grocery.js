
// HTTP serving code
/////////////////////
var http  = require('http');
var static = require('node-static');

// create static server for public files
var file = new static.Server('./');

// http server
var app = http.createServer(function (req, res) {
  console.log(req.url);
  file.serve(req, res);
});
app.listen(8090);




// Actual CloudTypes Code
//////////////////////////
var CloudTypes = require('../../../server/main.js').createServer();
cloudTypes.declare('totalItems',
                   new CloudTypes.CInt());
cloudTypes.declare('Grocery',
                    new CloudTypes.Entity(['name'],
                                          ['toBuy']));
cloudTypes.publish(8090);
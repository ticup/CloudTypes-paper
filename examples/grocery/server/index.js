var grocery = require('./grocery');

var file = new (require('node-static').Server)();
var port = process.env.PORT || 8080;

/* setup static file server */
var http = require('http').createServer(function (req, res) {
  req.addListener('end', function () {
    file.serve(req, res);
  }).resume();
}).listen(port);

/* publish grocery cloudtypes through the http server */
grocery.publish(http);
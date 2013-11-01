/**
 * Created by ticup on 01/11/13.
 */
var grocery = require('./grocery');

var file = new (require('node-static').Server)(__dirname + '/../../../');
var port = process.env.PORT || 8080;

/* setup static file server */
var http = require('http').createServer(function (req, res) {
  req.addListener('end', function () {
    file.serve(req, res);
  }).resume();
}).listen(port);

/* publish grocery cloudtypes through the http server */
grocery.publish(http);

// setup xhr-polling only for Heroku
if (process.env.HEROKU) {
  grocery.server.io.configure(function () {
    grocery.server.io.set("transports", ["xhr-polling"]);
    grocery.server.io.set("polling duration", 10);
  });
}

console.log("#### CloudTypes Examples server running on " + port + " ####");
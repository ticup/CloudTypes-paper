/**
 * Created by ticup on 27/10/13.
 */

// var jsdom      = require('jsdom');
var should      = require('should');
var fs          = require('fs');
var Browser     = require('zombie');
var http        = require('http');
var util        = require('util');

var State       = require('./extensions/State');
var ServerState = require('../server/State');
var CloudType   = require('../shared/CloudType');
var CInt        = require('./extensions/CInt');

var CloudTypeServer = require('../server/main.js');
var stubs = require('./stubs');

var bundle = fs.readFileSync('./test/client/bundle.js').toString();
var index  = "<html><head></head><body></body><script src='bundle.js'></script></html>";

var host = 'http://localhost';
var port = 8090;


function createHttpServer(port) {
  var app = http.createServer(function (req, res) {
    if (req.url === '/bundle.js') {
      res.writeHead(200, {'Content-Type': 'text/javascript'});
      res.end(bundle);
    } else {
      res.writeHead(200, {'Content-Type': 'text/html'});
      res.end(index);
    }
  });
  app.listen(port);
  return app;
}

//var httpServer = createHttpServer(8090);
var serverState = ServerState.fromJSON(stubs.stateUnchanged);
var server = CloudTypeServer.createServer(serverState);
server.publish(8090);

require('socket.io-client').connect('http://localhost:8090', function () {
  console.log('sconnnected');
});
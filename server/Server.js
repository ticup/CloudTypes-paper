var IO = require('socket.io');
var util = require('util');
var State = require('../shared/State');
module.exports = Server;

function Server(state) {
  this.state = state;
}

// target: port or http server (default = port 8090)
// staticPath: if given, will serve static files from given path
Server.prototype.open = function (target, staticPath) {
  var self = this;
  var cid  = 0;

  target = target || 8090;

  // setup static file serving
  if (typeof staticPath === 'string') {
    var file = new (require('node-static').Server)(staticPath);
    console.log('starting static file server from ' + staticPath);
    target = require('http').createServer(function (req, res) {
      req.addListener('end', function () {
        file.serve(req, res);
      }).resume();
    }).listen(target);
  }

  // open websockets
  var io = IO.listen(target);
  this.io = io;

  // set up listeners
  io.sockets.on('connection', function (socket) {
    socket.get('cid', function (clientId) {

      // Reconnect: do nothing
      if (clientId !== null) {
        console.log("server detected reconnection: " + clientId);
        return;
      }

      // Initial connect: initialize client
      socket.set('cid', cid++, function () {
        console.log("server detected new connection: " + cid);
        socket.emit('init', { cid: cid, state: self.state.fork() });

        socket.on('YieldPush', function (stateJson, yieldPull) {
    //      console.log('received YieldPush on server: ');
          var state = State.fromJSON(stateJson);
    //      state.print();
    //      console.log("JOINING WITH SERVER: ");
    //      self.state.print();
          self.state.join(state);
    //      console.log("JOINED STATE: ");
    //      self.state.print();
          yieldPull(self.state.fork());
        });

        socket.on('FlushPush', function (stateJson, flushPull) {
          console.log('received FlushPush on server: ' + util.inspect(stateJson));
          var state = State.fromJSON(stateJson);
          self.state.join(state);
          var fork = self.state.fork();
          flushPull(fork);
        });
      });
    });
  });
};

Server.prototype.close = function () {
  this.io.server.close();
};
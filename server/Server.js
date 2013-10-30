var IO = require('socket.io');
var util = require('util');
var State = require('../shared/State');
module.exports = Server;

function Server(state) {
  this.state = state;
}

Server.prototype.open = function (target) {
  var self = this;
  var cid  = 0;
  // target: port or http server
  // default = port 8090
  target = target || 8090;

  // open websockets
  var io = IO.listen(target);
  this.io = io;

  // set up listeners
  io.sockets.on('connection', function (socket) {
    console.log("server deteced connection");
    socket.emit('init', { cid: cid++, state: self.state.fork() });

    socket.on('YieldPush', function (stateJson, yieldPull) {
      console.log('received YieldPush on server: ' + util.inspect(stateJson));
      var state = State.fromJSON(stateJson);
      self.state.print();
      self.state.join(state);
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
};

Server.prototype.close = function () {
  this.io.server.close();
};
var IO = require('socket.io');
var util = require('util');
var State = require('../shared/State');
module.exports = Server;

function Server(state) {
  this.state = state;
}

Server.prototype.open = function (target) {
  var self = this;
  // target: port or http server
  // default = port 8090
  target = target || 8090;

  // open websockets
  var io = IO.listen(target);
  this.io = io;

  // set up listeners
  io.sockets.on('connection', function (socket) {
    socket.emit('init', self.state.fork());

    socket.on('YieldPush', function (map, yieldPull) {
      var state = State.fromJSON(map);
      self.state.join(state);
      yieldPull(self.state.fork());
    });

    socket.on('FlushPush', function (map, flushPull) {
      var state = State.fromJSON(map);
      self.state.join(state);
      flushPull(self.state.fork());
    });
  });
};

Server.prototype.close = function () {
  this.io.server.close();
};
var IO = require('socket.io');
var util = require('util');
var State = require('../shared/State');
module.exports = Server;

function Server(state) {
  this.state = state;
}

Server.prototype.start = function (target) {
  var self = this;
  // target: port or http server
  // default = port 8090
  target = target || 8090;

  // open websockets
  console.log('opening on ' + target);
  var io = IO.listen(target);

  // set up listeners
  io.sockets.on('connection', function (socket) {
    console.log('sending: ' + util.inspect(self.state));
    socket.emit('init', self.state.fork());

    socket.on('YieldPush', function (map) {
      console.log('YieldPush: ' + util.inspect(map));
      var state = State.fromJSON(map);
      self.state.join(state);
      console.log('YieldPush: ' + util.inspect(self.state.map));
      socket.emit('YieldPush', self.state);
    });
  });

  this.state.publish();

};
var State = require('../shared/State');
var ClientState = require('./ClientState');
var io = require('socket.io-client');

global.io = io;

module.exports = Client;

function Client(state) {
  this.state = state;
}

Client.prototype.listen = function (host, callback) {
  var self = this;
  this.socket = io.connect(host);
  this.socket.on('init', function (map) {
    console.log('initing map: ' + JSON.stringify(map));
    self.state.init(map, self);
    callback();
  });
};

Client.prototype.close = function () {
  return this.socket.disconnect();
};

Client.prototype.yieldPush = function () {
  var self = this;
  this.socket.emit('YieldPush', this.state, function yieldPull(map) {
    var state = State.fromJSON(map);
    self.state.yieldPull(state);
  });
};

Client.prototype.flushPush = function () {
  var state = this.state;
  this.socket.emit('FlushPush', this.state, function flushPull(map) {
    var state = State.fromJSON(map);
    self.state.flushPull(state);
  });
};
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
    self.state.init(map, self);
    callback();
  });
};

Client.prototype.close = function () {
  return this.socket.disconnect();
};

Client.prototype.yieldPush = function (pushState) {
  var state = this.state;
  this.socket.emit('YieldPush', pushState, function (map) {
    var pullState = State.fromJSON(map);
    state.yieldPull(pullState);
  });
};

Client.prototype.flushPush = function (pushState, flushPull) {
  var state = this.state;
  this.socket.emit('FlushPush', pushState, function (map) {
    var pullState = State.fromJSON(map);
    flushPull(pullState);
  });
};
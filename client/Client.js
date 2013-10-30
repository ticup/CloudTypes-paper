var State       = require('../shared/State');
var ClientState = require('./ClientState');
var io          = require('socket.io-client');

global.io = io;

module.exports = Client;

function Client() {
}

Client.prototype.connect = function (host, options, callback) {
  var self = this;
  if (typeof callback === 'undefined') {
    callback = options;
    options  = null;
  }
  this.socket = io.connect(host, options);
  this.socket.on('init', function (json) {

    self.state = State.fromJSON(json.state);
    self.state.init(json.cid, self);
    callback(self.state);
  });
};

Client.prototype.close = function () {
  return this.socket.disconnect();
};

Client.prototype.yieldPush = function (pushState) {
  var state = this.state;
  this.socket.emit('YieldPush', pushState, function (stateJson) {
    var pullState = State.fromJSON(stateJson);
    state.yieldPull(pullState);
  });
};

Client.prototype.flushPush = function (pushState, flushPull) {
  var state = this.state;
  this.socket.emit('FlushPush', pushState, function (stateJson) {
    var pullState = State.fromJSON(stateJson);
    flushPull(pullState);
  });
};
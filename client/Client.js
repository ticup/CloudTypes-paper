var State       = require('../shared/State');
var ClientState = require('./ClientState');
var io          = require('socket.io-client');

global.io = io;

module.exports = Client;

function Client() {
  this.initialized = false;
}

Client.prototype.connect = function (host, options, callback) {
  var self = this;
  if (typeof callback === 'undefined') {
    callback = options;
    options  = {};
  }
  options['force new connection'] = options['force new connection'] ? options['force new connection'] : true;
  this.host = host;
  this.options = options;
  this.callback = callback;

  this.socket = io.connect(host, options);
  this.socket.on('init', function (json) {
    var state = State.fromJSON(json.state);

    console.log("got initialized");
    if (self.initialized) {
      return self.state.reinit(json.cid, self, state);
    }

    self.initialized = true;
    self.state = state;
    self.state.init(json.cid, self);
    callback(self.state);
  });
};

Client.prototype.reconnect = function () {
  return this.connect(this.host, this.options, this.callback);
};

Client.prototype.disconnect = function () {
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
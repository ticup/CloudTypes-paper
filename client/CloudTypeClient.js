var State       = require('../shared/State');
var io          = require('socket.io-client');

global.io = io;

module.exports = Client;

function Client() {
  this.initialized = false;
  this.listeners = {};
}

Client.prototype.connect = function (host, options, connected, reconnected) {
  var self = this;
  if (typeof options === 'function') {
    reconnected = connected;
    connected = options;
    options  = {};
  }
  options['force new connection'] = options['force new connection'] ? options['force new connection'] : true;
  options['max reconnection attempts'] = options['max reconnection attempts'] ? options ['max reconnection attempts'] : Infinity;
  this.host = host;
  this.options = options;
  this.connected = connected;
  this.reconnected = reconnected;

  this.socket = io.connect(host, options);
  this.socket.on('init', function (json) {
    var state = State.fromJSON(json.state);

    if (self.initialized) {
      self.state.reinit(json.cid, self, state);
      if (typeof reconnected === 'function') {
        reconnected(self.state);
      }
      return;
    }

    self.initialized = true;
    self.state = state;
    self.state.init(json.cid, self);
    connected(self.state);
  });
};

// only connect/disconnect
Client.prototype.on = function (event, listener) {
  this.listeners[event] = listener;
};

Client.prototype.reconnect = function () {
  console.log('reconnecting: ' + this.options);
  return this.connect(this.host, this.options, this.connected, this.reconnected);
};

Client.prototype.disconnect = function () {
  return this.socket.disconnect();
};

Client.prototype.close = function () {
  return this.disconnect();
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
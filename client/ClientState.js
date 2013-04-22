var State = require('../shared/State');

module.exports = ClientState;

function ClientState() {
  State.call(this);
  this.pending  = false;
  this.received = false;
}

// State in prototype chain
ClientState.prototype = Object.create(State.prototype);

ClientState.prototype.init = function (map, client) {
  this.map    = State.fromJSON(map).map;
  this.client = client;
};

ClientState.prototype.yieldPull = function (state) {
  this.pending  = false;
  this.received = true;
  this.toJoin   = state;
};

ClientState.prototype.yield = function () {
  // (B) Revision from the server arrived, merge
  if (this.received) {
    console.log('yield: got revision from server');
    this.toJoin.joinIn(this);
    this.received = false;
    return this;
  }
  // (C) expecting a revision, but not present yet
  if (this.pending) {
    console.log('yield: waiting for server response');
    return this;
  }
  // (A) Not expecting server response, send state to server
  console.log('yield: pushing to server');
  this.client.yieldPush(this);
  this.applyFork();
  this.pending  = true;
  this.received = false;
};

// callback should take 1 argument that is set if it could not flush with server
ClientState.prototype.flush = function (callback, timeout) {
  var self = this;

  console.log('flush from client');
  timeout = timeout || 3000;
  var offline = setTimeout(function () {
    callback("Flush: cloud not sync on time with server (" + timeout + "ms)");
  }, timeout);

  this.client.flushPush(this, function flushPull(state) {
    // should actually replace this state,
    // but since there should be no operations done merging is the same.
    console.log('received flushpull on client');
    self.replaceBy(state);
    clearTimeout(offline);
    callback();
  });
  return this;
};
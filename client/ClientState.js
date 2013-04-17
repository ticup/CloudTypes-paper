var State = require('../shared/State');

module.exports = ClientState;

function ClientState() {
  State.call(this);
  this.pending = false;
  this.received = false;
}

// "inherit" prototype from State
ClientState.prototype = Object.create(State.prototype);

ClientState.prototype.init = function (map, client) {
  this.map = State.fromJSON(map).map;
  this.client = client;
};

ClientState.prototype.yieldPull  = function (state) {
  this.pending = false;
  this.received = true;
  this.toJoin = state;
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
  this.client.yieldPush();
  this.pending = true;
  this.received = false;
};
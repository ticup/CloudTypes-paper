var State = require('../shared/State');

var util = require('util');

module.exports = ServerState;

function ServerState() {
  State.call(this);
  this.isPublished = false;
}

// "inherit" prototype from State
ServerState.prototype = Object.create(State.prototype);

ServerState.prototype.published = function (server) {
  this.server = server;
  this.publish = true;
};

ServerState.prototype.declare = function (name, ctype) {
  if (this.isPublished)
    throw "Declare: Can not declare types after being published";
  console.log('declaring ' + name);
  this.map[name] = ctype;
  return this;
};

ServerState.prototype.yieldPush = function (state) {
  this.join(state);
  console.log('YieldPush: ' + util.inspect(this.map));
  this.server.yieldPull(this);
};
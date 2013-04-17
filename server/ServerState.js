var State = require('../shared/State');

var util = require('util');

module.exports = ServerState;

function ServerState() {
  State.call(this);
  this.published = false;
}

// "inherit" prototype from State
ServerState.prototype = Object.create(State.prototype);


ServerState.prototype.declare = function (name, ctype) {
  if (this.published)
    throw "Declare: Can not declare types after being published";
  console.log('declaring ' + name);
  this.map[name] = ctype;
  return this;
};

ServerState.prototype.publish = function () {
  console.log(util.inspect(this.map));
  // console.log('publishing: ' + this.toJSON());
  this.published = true;
};
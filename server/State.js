var State = require('../shared/State');

var util = require('util');

module.exports = State;

State.prototype.published = function (server) {
  this.server = server;
  this.publish = true;
};

//ServerState.prototype.declare = function (name, cvar) {
//  if (this.isPublished)
//    throw "Declare: Can not declare types after being published";
//  console.log('declaring ' + name);
//  this.map[name] = cvar;
//  return this;
//};
//
//State.prototype.yieldPush = function (state) {
//  this.join(state);
//  this.server.yieldPull(this);
//};
var CloudType = require('./CloudType');

module.exports = State;

function State(map) {
  this.map = map || {};
}

State.fromJSON = function (json) {
  var map = {};
  Object.keys(json).forEach(function (name) {
    map[name] = CloudType.fromJSON(json[name]);
  });
  return new State(map);
};

State.prototype.toJSON = function () {
  var map = this.map;
  var json = {};
  Object.keys(map).forEach(function (name) {
    json[name] = map[name].toJSON();
  });
  return json;
};


State.prototype.get = function (name) {
  return this.map[name];
};

State.prototype.eachType = function (callback) {
  var keys = Object.keys(this.map);
  var len = keys.length;

  for (var i = 0; i < len; i++) {
    callback(keys[i], this.map[keys[i]]);
  }
};

State.prototype.join = function (rev) {
  this.eachType(function (name, type1) {
    var type2 = rev.get(name);
    type1.join(type2);
  });
  return this;
};

State.prototype.joinIn = function (rev) {
  this.eachType(function (name, type1) {
    var type2 = rev.get(name);
    type1.joinIn(type2);
  });
  return this;
};

State.prototype.fork = function (rev) {
  var map = {};
  this.eachType(function (name, type) {
    map[name] = type.fork();
  });
  return new State(map);
};

State.prototype.applyFork = function () {
  var self = this;
  this.eachType(function (name, type) {
    type.applyFork();
  });
};

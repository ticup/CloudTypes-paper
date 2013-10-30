module.exports = RoundMap;

function RoundMap(map) {
  this.rounds = map || {};
}

RoundMap.prototype.add = function (id, round) {
  this.rounds[id] = round;
  return this;
};

RoundMap.prototype.remove = function (id) {
  delete this.rounds[id];
  return this;
};

RoundMap.prototype.incr = function (id) {
  this.rounds[id] = this.rounds[id] + 1;
  return this;
};

RoundMap.prototype.get = function (id) {
  return this.rounds[id];
};

RoundMap.prototype.serialize = function () {
  return this.rounds;
};
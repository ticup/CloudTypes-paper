var State = require('../../shared/State');

module.exports = State;

State.prototype.isForkOf = function (state) {
  var fState = this;
  var isFork = true;
  // each type in state should have an equivalent forked type in fState
  state.eachType(function (name, type) {
    var fType = fState.get(name);
    if (!fType)
      isFork = false;
    if (!fType.isForkOf(type))
      isFork = false;
  });

  if (state.numTypes() != fState.numTypes())
    isFork = false;


  return isFork;
};

State.prototype.isJoinOf = function (state1, state2) {
  var isJoin = true;
  this.eachType(function (name, jType) {
    var type1 = state1.get(name);
    var type2 = state2.get(name);
    if (!type1 || !type2)
      isJoin = false;
    if (!(jType.isJoinOf(type1, type2)))
      isJoin = false;
  });

  if (state2.numTypes() !== state2.numTypes())
    throw "joined states do not have same number of types";

  if (this.numTypes() !== state1.numTypes())
    isJoin = false;

  return isJoin;
};

State.prototype.isEqual = function (state) {
  var isEqual = true;
  this.eachType(function (name, type1) {
    var type2 = state.get(name);
    if (!type2)
      isEqual = false;
    if (!type1.isEqual(type2))
      isEqual = false;
  });

  if (this.numTypes() !== state.numTypes())
    isEqual = false;

  return isEqual;
};

State.prototype.isConsistent = function (state) {
  var isConsistent = true;
  this.eachType(function (name, type1) {
    var type2 = state.get(name);
    if (!type1.isConsistent(type2))
      isConsistent = false;
  });

  return isConsistent;
};



State.prototype.numTypes = function () {
  var num = 0;
  this.eachType(function (name, type) {
    num += 1;
  });
  return num;
};
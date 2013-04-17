var CInt      = require('../shared/CInt');
var State     = require('../shared/State');
var CloudType = require('../shared/CloudType');

exports.isForkOfState  = isForkOfState;
exports.isForkOfType   = isForkOfType;
exports.isJoinOfStates = isJoinOfStates;

function isForkOfState(fState, state) {
  var isFork = true;

  // each type in state should have an equivalent forked type in fState
  state.eachType(function (name, type) {
    var fType = fState.get(name);
    if (!fType)
      isFork = false;
    if (!isForkOfType(fType, type))
      isFork = false;
  });

  if (numTypes(state) != numTypes(fState))
    isFork = false;


  return isFork;
}

function isForkOfType(fType, type) {
  if (!(fType instanceof type.constructor))
    return false;

  return fType.isForkOf(type);
}


function isJoinOfStates(jState, state1, state2) {
  var isJoin = true;

  jState.eachType(function (name, jType) {
    var type1 = state1.get(name);
    var type2 = state2.get(name);
    if (!type1 || !type2)
      isJoin = false;
    if (!isJoinOfTypes(jType, type1, type2))
      isJoin = false;
  });

  if (numTypes(state1) !== numTypes(state2))
    throw "joined states do not have same number of types";

  if (numTypes(jState) !== numTypes(state1))
    isJoin = false;

  return isJoin;
}

function isJoinOfTypes(jType, type1, type2) {
  if (!(jType instanceof type1.constructor))
    return false;

  return jType.isJoinOf(type1, type2);
}



// Type specific semantics
CInt.prototype.isForkOf = function (type) {
  return ((this.base   === type.base + type.offset) &&
          (this.isSet  === false) &&
          (this.offset === 0));
};

CInt.prototype.isJoinOf = function (type1, type2) {
  if (type2.isSet) {
    return ((this.isSet  === true) &&
            (this.base   === type2.base) &&
            (this.offset === type2.offset));
  }
  return ((this.isSet  === type1.isSet) &&
          (this.base   === type1.base + type2.offset) &&
          (this.offset === type1.offset + type2.offset));
};

// utility
function numTypes(state) {
  var num = 0;
  state.eachType(function (name, type) {
    num += 1;
  });
  return num;
}
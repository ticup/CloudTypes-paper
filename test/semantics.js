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

// To avoid all panic:
// A case on tags is unavoidable, because these tests
// are used in the integration testing where server and
// client types are compared. A CInt from server will not
// equal a CInt from client, because they are loaded differently.
function isForkOfType(fType, type) {
  switch(fType.tag) {
    case CInt.prototype.tag:
      return isForkOfCInt(fType, type);
    default:
      return false;
  }
}

function isJoinOfTypes(jType, type1, type2) {
  switch(jType.tag) {
    case CInt.prototype.tag:
      return isJoinOfCInt(jType, type1, type2);
    default:
      return false;
  }
}



// Type specific semantics
function isForkOfCInt(fType, type) {
  return ((fType.base   === type.base + type.offset) &&
          (fType.isSet  === false) &&
          (fType.offset === 0));
}

function isJoinOfCInt(jType, type1, type2) {
  if (type2.isSet) {
    return ((jType.isSet  === true) &&
            (jType.base   === type2.base) &&
            (jType.offset === type2.offset));
  }
  return ((jType.isSet  === type1.isSet) &&
          (jType.base   === type1.base + type2.offset) &&
          (jType.offset === type1.offset + type2.offset));
}



// utility
function numTypes(state) {
  var num = 0;
  state.eachType(function (name, type) {
    num += 1;
  });
  return num;
}
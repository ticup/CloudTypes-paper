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

  if (numTypes(state) != numTypes(fState))
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

  if (numTypes(state1) !== numTypes(state2))
    throw "joined states do not have same number of types";

  if (numTypes(this) !== numTypes(state1))
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

  if (numTypes(this) !== numTypes(state))
    isEqual = false;

  return isEqual;
};

// To avoid all panic:
// A case on tags is unavoidable, because these tests
// are used in the integration testing where server and
// client types are compared. A CInt from server will not
// equal a CInt from client, because they are loaded differently.
// function isForkOfType(fType, type) {
//   switch(fType.tag) {
//     case CInt.prototype.tag:
//       return isForkOfCInt(fType, type);
//     default:
//       return false;
//   }
// }

// function isJoinOfTypes(jType, type1, type2) {
//   switch(jType.tag) {
//     case CInt.prototype.tag:
//       return isJoinOfCInt(jType, type1, type2);
//     default:
//       return false;
//   }
// }



// utility
function numTypes(state) {
  var num = 0;
  state.eachType(function (name, type) {
    num += 1;
  });
  return num;
}
var State = require('../../shared/State');
var should = require('should');

module.exports = State;

// State.prototype.isForkOf = function (state) {
//   var fState = this;
//   var isFork = true;
//   // each type in state should have an equivalent forked type in fState
//   state.eachType(function (name, type) {
//     var fType = fState.get(name);
//     if (!fType)
//       isFork = false;
//     if (!fType.isForkOf(type))
//       isFork = false;
//   });

//   if (state.numTypes() != fState.numTypes())
//     isFork = false;


//   return isFork;
// };

// State.prototype.isJoinOf = function (state1, state2) {
//   var isJoin = true;
//   this.eachType(function (name, jType) {
//     var type1 = state1.get(name);
//     var type2 = state2.get(name);
//     if (!type1 || !type2)
//       isJoin = false;
//     if (!(jType.isJoinOf(type1, type2)))
//       isJoin = false;
//   });

//   if (state2.numTypes() !== state2.numTypes())
//     throw "joined states do not have same number of types";

//   if (this.numTypes() !== state1.numTypes())
//     isJoin = false;

//   return isJoin;
// };

State.prototype.isForkOf = function (state) {
  var fState = this;
  // each type in state should have an equivalent forked type in fState
  state.eachType(function (name, type) {
    var fType = fState.get(name);
    should.exist(fType);
    fType.isForkOf(type);
  });

  state.numTypes().should.equal(fState.numTypes());
};

State.prototype.isJoinOf = function (state1, state2) {
  this.eachType(function (name, jType) {
    var type1 = state1.get(name);
    var type2 = state2.get(name);
    should.exist(type1);
    should.exist(type2);

    jType.isJoinOf(type1, type2);
  });

  state2.numTypes().should.equal(state2.numTypes());

  this.numTypes().should.equal(state1.numTypes());
};

State.prototype.isEqual = function (state) {
  this.eachType(function (name, type1) {
    var type2 = state.get(name);
    should.exist(type2);
    type1.isEqual(type2);
  });

  this.numTypes().should.equal(state.numTypes());
};

State.prototype.isConsistent = function (state) {
  this.eachType(function (name, type1) {
    var type2 = state.get(name);
    should.exist(type2);
    type1.isConsistent(type2);
  });
};



State.prototype.numTypes = function () {
  var num = 0;
  this.eachType(function (name, type) {
    num += 1;
  });
  return num;
};
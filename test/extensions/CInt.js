// test/extensions/CInt.js
//
// Extends the CInt CloudType with the necessary test
// functionalities for the tests. 
var CInt = require('../../shared/CInt');

module.exports = CInt;


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

CInt.prototype.isEqual = function (cint) {
  return ((this.isSet  === cint.isSet) &&
          (this.base   === cint.base) &&
          (this.offset === cint.offset));
};

CInt.prototype.isConsistent = function (cint) {
  return (this.get() === cint.get());
};
// test/extensions/CInt.js
//
// Extends the CInt CloudType with the necessary test
// functionalities for the tests. 
var CInt = require('../../shared/CInt').CInt;
var should = require('should');

module.exports = CInt;


// Type specific semantics
CInt.prototype.isForkOf = function (type) {
  this.base.should.equal(type.base + type.offset);
  this.isSet.should.equal(false);
  this.offset.should.equal(0);
};

CInt.prototype.isJoinOf = function (type1, type2) {
  if (type2.isSet) {
    this.isSet.should.equal(true);
    this.base.should.equal(type2.base);
    this.offset.should.equal(type2.offset);
  } else {
    this.isSet.should.equal(type1.isSet);
    this.base.should.equal(type1.base);
    this.offset.should.equal(type1.offset + type2.offset);
  }
};

CInt.prototype.isEqual = function (cint) {
  this.isSet.should.equal(cint.isSet);
  this.base.should.equal(cint.base);
  this.offset.should.equal(cint.offset);
};

CInt.prototype.isConsistent = function (cint) {
  this.get().should.equal(cint.get());
};
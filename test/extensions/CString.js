// test/extensions/CString.js
//
// Extends the CString CloudType with the necessary test
// functionalities for the tests. 
var CString = require('../../shared/CString').CString;
var should  = require('should');
var util    = require('util');

module.exports = CString;


// Type specific semantics
CString.prototype.isEqual = function (cstring) {
  this.value.should.equal(cstring.value);
  this.written.should.equal(cstring.written);
  this.cond.should.equal(cstring.cond);
};

CString.prototype.isForkOf = function (cstring) {
  this.value.should.equal(cstring.value);
  this.written.should.equal(false);
  this.cond.should.equal(false);
};


CString.prototype.isJoinOf = function (type1, type2) {
  if (type2.written === 'wr') {
    this.written.should.equal('wr');
    this.value.should.equal(type2.value);
    this.cond.should.equal(false);

  } else if (type1.written === 'wr' && type1.value === '' && type2.written === 'cond') {
    this.written.should.equal('wr');
    this.value.should.equl(type2.cond);
    this.cond.should.equal(false);

  } else if (type1.written === false && type1.value === '' && type2.written === 'cond') {
    this.written.should.equal('cond');
    this.cond.should.equal(type2.cond);
    this.value.should.equal(type2.cond);

  } else if (type1.written === 'wr' && type1.value !== '' && type2.written === 'cond') {
    this.written.should.equal('cond');
    this.cond.should.equal(type2.cond);
    this.value.should.equal(value1.value);

  } else {
    this.written.should.equal(type1.written);
    this.value.should.equal(type1.value);
    this.cond.should.equal(false);
  }
};

CString.prototype.isConsistent = function (cstring) {
//  console.log(this.get() + " =? " + cint.get());
  this.get().should.equal(cstring.get());
};
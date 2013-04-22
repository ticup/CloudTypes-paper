// test/extensions/CString.js
//
// Extends the CString CloudType with the necessary test
// functionalities for the tests. 
var CString = require('../../shared/CString');
var should  = require('should');
var util    = require('util');

module.exports = CString;


// Type specific semantics
CString.prototype.isEqual = function (cstring) {
  this.value.should.equal(cstring.value);
  this.written.should.equal(cstring.written);
  this.cond.should.equal(cstring.cond);
};

// CString.prototype.isForkOf = function (cstring) {
//   return ((this.value   === cstring.value) &&
//           (this.written === false) &&
//           (this.cond    === ''));
// };

// CString.prototype.isJoinOf = function (type1, type2) {
//   if (type2.written === 'written') {
//     return ((this.written === 'wr') &&
//             (this.base    === type2.base));
//   } else if (type1.written === 'wr' && type1.value === '' && type2.written === 'cond') {
//     return ((this.written === 'wr') &&
//             (this.base    === type2.cond));
//   } else if (type1.written === false && type1.value === '' && type2.written === 'cond') {
//     return ((this.written === 'cond') &&
//             (this.cond    === type2.cond) &&
//             (this.value   === type2.cond));
//   } else if (type1.written === 'wr' && type1.value !== '' && type2.written === 'cond') {
//     return ((this.written === 'cond') &&
//             (this.cond    === type2.cond) &&
//             (this.value   === type1.value));
//   } else {
//     return ((this.written === type1.written) &&
//             (this.value   === type1.value));
//   }
// };

CString.prototype.isForkOf = function (cstring) {
  this.value.should.equal(cstring.value);
  this.written.should.equal(false);
  this.cond.should.equal(false);
};


CString.prototype.isJoinOf = function (type1, type2) {
  console.log(util.inspect(this));
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

CString.prototype.isConsistent = function (cint) {
  this.get().should.equal(cint.get());
};
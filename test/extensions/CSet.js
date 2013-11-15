/**
 * Created by ticup on 09/11/13.
 */
// test/extensions/CSet.js
//
// Extends the CSet CloudType with the necessary test
// functionalities for the tests.
var CSetModule = require('../../shared/CSet');
var CSetPrototype = CSetModule.CSetPrototype;
var should  = require('should');
var util    = require('util');

module.exports = CSetModule;


// Type specific semantics
CSetPrototype.isEqual = function (cstring) {
  return true;
};

CSetPrototype.isForkOf = function (cstring) {
  return true;
};

CSetPrototype.isJoinOf = function (type1, type2) {
  return true;
};

CSetPrototype.isConsistent = function (cstring) {
  return true;
};
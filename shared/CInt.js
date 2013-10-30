var CloudType = require('./CloudType');
var util = require('util');
module.exports = CInt;


function CInt(base, offset, isSet) {
  this.base = base || 0;
  this.offset = offset || 0;
  this.isSet = isSet || false;
}

// put CloudType in prototype chain.
CInt.prototype = Object.create(CloudType.prototype);
CInt.prototype.tag = "CInt";

// register for CloudType.fromJSON 
CloudType.register(CInt);
CInt.fromJSON = function (json) {
  return new CInt(json.base, json.offset, json.isSet);
};

// used by the toJSON method of the CloudType prototype.
CInt.prototype._toJSON = function () {
  return {
    base: this.base,
    offset: this.offset,
    isSet: this.isSet
  };
};

// semantic operations
CInt.prototype.set = function (base) {
  if (typeof base !== 'number')
    throw "CInt::set(base) : base should be of type number, given: " + base;
  this.offset = 0;
  this.base = base;
  this.isSet = true;
};

CInt.prototype.get = function () {
  return (this.base + this.offset);
};

CInt.prototype.add = function (offset) {
  if (typeof offset !== 'number')
    throw "CInt::add(base) : offset should be of type number, given: " + offset;
  this.offset += offset;
};

// Defining _join(cint, target) provides the join and joinIn methods
// by the CloudType prototype.
CInt.prototype._join = function (cint, target) {
  if (cint.isSet) {
    target.isSet  = true;
    target.base   = cint.base;
    target.offset = cint.offset;
  } else {
    target.isSet  = this.isSet;
    target.base   = this.base;
    target.offset = this.offset + cint.offset;
  }
};

CInt.prototype.fork = function () {
  var cint = new CInt(this.base + this.offset, 0, false);
  this.applyFork();
  return cint;
};

CInt.prototype.applyFork = function () {
  this.base = this.base + this.offset;
  this.offset = 0;
  this.isSet = false;
  return this;
};

CInt.prototype.replaceBy = function (cint) {
  this.base   = cint.base;
  this.offset = cint.offset;
  this.isSet  = cint.isSet;
};

CInt.prototype.isDefault = function () {
  return (this.get() === 0);
};
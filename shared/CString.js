var CloudType = require('./CloudType');
var util = require('util');
module.exports = CString;


function CString(value, written, cond) {
  this.value   = value   || '';
  this.written = written || false;
  this.cond    = cond    || undefined;
}

// put CloudType in prototype chain.
CInt.prototype = Object.create(CloudType.prototype);
CInt.prototype.tag = "CString";

// register for CloudType.fromJSON 
CloudType.register(CString);
CString.fromJSON = function (json) {
  return new CInt(json.value, json.written, json.cond);
};

// used by the toJSON method of the CloudType prototype.
CString.prototype._toJSON = function () {
  return {
    value: this.value,
    written: this.written,
    cond: this.cond
  };
};

// semantic operations
CString.prototype.set = function (value) {
  this.value   = value;
  this.written = 'cond';
};

CString.prototype.get = function () {
  return this.value;
};

CString.prototype.setIfEmpty = function (value) {
  if (this.written === 'wr' && this.value === '') {
    this.value   = value;
    this.written = 'wr';
    this.cond    = undefined;

  } else if (!this.written && this.value === '') {
    this.value   = value;
    this.written = 'cond';
    this.cond    = value;

  } else if (!this.written && this.value !== '') {
    this.written = 'cond';
    this.cond    = value;

  } else {
    // remain current values
  }
};

// Defining _join(cstring, target) provides the join and joinIn methods
// by the CloudType prototype.
CString.prototype._join = function (cstring, target) {
  if (cstring.written === 'wr') {
    target.written = 'wr';
    target.value   = CString.value;
    
  } else if (this.written === 'wr' && this.value === '' && cstring.written === 'cond') {
    target.written = 'wr';
    target.value   = cstring.cond;

  } else if (!this.written && this.value === '' && cstring.written === 'cond') {
    target.written = 'cond';
    target.cond    = cstring.cond;
    target.value   = cstring.value;

  } else if (!this.written && this.value !== '' && cstring.written === 'cond') {
    target.written = 'cond';
    target.cond    = cstring.cond;
    target.value   = this.value;

  } else {
    target.written = this.written;
    target.cond    = this.cond;
    target.value   = this.value;
  }
};

CString.prototype.fork = function () {
  return new CString(this.value, false, undefined);
};

CInt.prototype.applyFork = function () {
  this.written = false;
  this.cond    = undefined;
  return this;
};
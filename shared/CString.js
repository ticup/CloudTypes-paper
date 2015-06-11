var CloudType = require('./CloudType');
var util = require('util');

exports.CString = CString;
exports.Declaration = CStringDeclaration;


// CIntDeclaration: function that allows the user to declare a property of type CInt
// see CSet as to why this exists (parametrized declarations)
function CStringDeclaration() { }

CStringDeclaration.declare = function () {
  return CString;
};
CStringDeclaration.fromJSON = function () {
  return CString;
};

// register this declaration as usable (will also allow to create CString with CloudType.fromJSON())
CStringDeclaration.tag = "String";
CString.tag = "String";
CloudType.register(CStringDeclaration);


// Actual CString object of which an instance represents a variable of which the property is defined with CStringDeclaration
function CString(value, written, cond) {
  this.value   = value   || '';
  this.written = written || false;
  this.cond    = cond    || false;
}

// put CloudType in prototype chain.
CString.prototype = Object.create(CloudType.prototype);

// Create a new instance of the declared CString for given entryIndex
CString.newFor = function (entryIndex) {
  return new CString();
};

CString.toJSON = function () {
  return { tag: CStringDeclaration.tag };
};

CString.fromJSON = function (json) {
  return new CString(json.value, json.written, json.cond);
};


// Puts the declared type CString into json representation
CString.prototype.toJSON = function () {
  return {
    value: this.value,
    written: this.written,
    cond: this.cond
  };
};

// semantic operations
CString.prototype.set = function (value) {
  this.value   = value;
  this.written = 'wr';
};

CString.prototype.get = function () {
  return this.value;
};

CString.prototype.setIfEmpty = function (value) {
  if (this.written === 'wr' && this.value === '') {
    this.value   = value;
    this.written = 'wr';
    this.cond    = false;

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
    target.value   = cstring.value;
    target.cond    = false;

  } else if (this.written === 'wr' && this.value === '' && cstring.written === 'cond') {
    target.written = 'wr';
    target.value   = cstring.cond;
    target.cond    = false;

  } else if (!this.written && this.value === '' && cstring.written === 'cond') {
    target.written = 'cond';
    target.cond    = cstring.cond;
    target.value   = cstring.cond;

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
  var cstring = new CString(this.value, false, undefined);
  this.applyFork();
  return cstring;
};

CString.prototype.applyFork = function () {
  this.written = false;
  this.cond    = false;
  return this;
};

CString.prototype.replaceBy = function (cstring) {
  this.written = cstring.written;
  this.cond    = cstring.cond;
  this.value   = cstring.value;
};

CString.prototype.isDefault = function () {
  return (this.get() === '');
};

CString.prototype.compare = function (cstring, reverse) {
  return ((reverse ? -1 : 1) * (this.get().localeCompare(cstring.get())));
};
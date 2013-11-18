/**
 * Created by ticup on 15/11/13.
 */
var CloudType = require('./CloudType');
var util = require('util');

exports.CDate = CDate;
exports.Declaration = CDateDeclaration;


// CDateDeclaration: function that allows the user to declare a property of type CDate
// see CSet as to why this exists (parametrized declarations)
function CDateDeclaration() { }
CDateDeclaration.declare = function () {
  return CDate;
};
CDateDeclaration.fromJSON = function () {
  return CDate;
};


// register this declaration as usable (will also allow to create CDate with CloudType.fromJSON())
CDateDeclaration.tag = "CDate";
CDate.tag = "CDate";
CloudType.register(CDateDeclaration);


// Actual CDate object of which an instance represents a variable of which the property is defined with CDateDeclaration
function CDate(value, isSet) {
  this.value = base || new Date();
  this.isSet = isSet || false;
}
// put CloudType in prototype chain.
CDate.prototype = Object.create(CloudType.prototype);

// Create a new instance of the declared CDate for given entryIndex
CDate.newFor = function (entryIndex) {
  return new CDate();
};

// Puts the declared type CDate into json representation
CDate.toJSON = function () {
  return { tag: CDateDeclaration.tag };
};


// Retrieves an instance of a declared type CDate from json
// Not the complement of CDate.toJSON, but complement of CDate.prototype._toJSON!!
CDate.fromJSON = function (json) {
  return new CDate(json.value, json.isSet);
};

// Puts an instance of a declared type CDate to json
CDate.prototype.toJSON = function () {
  return {
    value: this.value.toString(),
    isSet: this.isSet
  };
};

// semantic operations
CDate.prototype.set = function (date) {
  if (! date instanceof Date)
    throw "CDate::set(date) : date should be of type Date, given: " + date;
  this.value = date;
  this.isSet = true;
};

CDate.prototype.get = function () {
  return this.value;
};

// Defining _join(cdate, target) provides the join and joinIn methods
// by the CloudType prototype.
CDate.prototype._join = function (cdate, target) {
  if (cdate.isSet) {
    target.isSet  = true;
    target.value  = cdate.value;
  } else {
    target.isSet  = this.isSet;
    target.value  = this.value;
  }
};

CDate.prototype.fork = function () {
  var cdate = new CDate(new Date(this.value), false);
  this.applyFork();
  return cdate;
};

CDate.prototype.applyFork = function () {
  this.value = this.value;
  this.isSet = false;
  return this;
};

CDate.prototype.replaceBy = function (cdate) {
  this.value  = cdate.value;
  this.isSet  = cdate.isSet;
};

CDate.prototype.isDefault = function () {
  return (this.get() === new Date(0));
};

CDate.prototype.compare = function (cdate, reverse) {
  return ((reverse ? -1 : 1) * (this.get() - cdate.get()));
};
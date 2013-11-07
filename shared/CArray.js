var CloudType     = require('./CloudType');
var Indexes       = require('./Indexes');
var Property      = require('./Property');
var Properties    = require('./Properties');
var CArrayEntry   = require('./CArrayEntry');
var CArrayOrdered = require('./CArrayOrdered');

var util          = require('util');

module.exports = CArray;

// indexNames:  { string: IndexType }
// when declared in a State, the state will add itself and the declared name for this CArray as properties
// to the CArray object.
// todo: create copy of initializers
function CArray(indexes, properties) {
  this.indexes    = (indexes instanceof Indexes) ? indexes : new Indexes(indexes);
  this.properties = properties || new Properties();
  this.isProxy    = false;  // set true by State if used as proxy for global CloudType
}

// properties: { string: string {"int", "string"} }
CArray.declare = function (indexDeclarations, propertyDeclarations) {
  var carray = new CArray(indexDeclarations);
  Object.keys(propertyDeclarations).forEach(function (propName) {
    var cTypeName = propertyDeclarations[propName];
    carray.addProperty(new Property(propName, cTypeName, carray));
  });
  return carray;
};

CArray.prototype.forEachProperty = function (callback) {
  return this.properties.forEach(callback);
};

CArray.prototype.get = function (indexes) {
  return new CArrayEntry(this, indexes);
};

CArray.prototype.entries = function (propertyName) {
  return this.properties.get(propertyName).entries();
};

CArray.prototype.orderBy = function (property, property, dir) {
  return CArrayOrdered(this, property, dir);
};

CArray.prototype.getProperty = function (property) {
  var result = this.properties.get(property);
  if (typeof result === 'undefined') {
    throw Error(this.name + " does not have property " + property);
  }
  return result;
};

CArray.prototype.addProperty = function (property) {
  return this.properties.add(property);
};

CArray.prototype.fork = function () {
  var fIndexes = this.indexes.fork();
  var cArray = new CArray(fIndexes);
  cArray.properties = this.properties.fork(cArray);
  cArray.isProxy = this.isProxy;
  return cArray;
};


CArray.prototype.toJSON = function () {
  return {
    type        : 'Array',
    indexes     : this.indexes.toJSON(),
    properties  : this.properties.toJSON(),
    isProxy     : this.isProxy
  };
};

CArray.fromJSON = function (json) {
  var cArray = new CArray();
  cArray.indexes = Indexes.fromJSON(json.indexes);
  cArray.properties = Properties.fromJSON(json.properties, cArray);
  cArray.isProxy = json.isProxy;
  return cArray;
};
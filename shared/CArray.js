var CloudType   = require('./CloudType');
var Indexes     = require('./Indexes');
var Property    = require('./Property');
var Properties  = require('./Properties');
var CArrayEntry = require('./CArrayEntry');
var util        = require('util');

module.exports = CArray;

// indexNames:  { string: IndexType }
// todo: create copy of initializers
function CArray(name, indexes, properties) {
  this.name       = name;
  this.indexes    = (indexes instanceof Indexes) ? indexes : new Indexes(indexes);
  this.properties = properties || new Properties();
}

// properties: { string: string {"int", "string"} }
CArray.declare = function (name, indexDeclarations, propertyDeclarations) {
  var carray = new CArray(name, indexDeclarations);
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

CArray.prototype.getProperty = function (property) {
  return this.properties.get(property);
};

CArray.prototype.addProperty = function (property) {
  return this.properties.add(property);
};

CArray.prototype.fork = function () {
  var fIndexes = this.indexes.fork();
  var cArray = new CArray(this.name, fIndexes);
  var fProperties = this.properties.fork(cArray);
  cArray.properties = fProperties;
  return cArray;
};


CArray.prototype.toJSON = function () {
  return {
    name        : this.name,
    type        : 'Array',
    indexes     : this.indexes.toJSON(),
    properties  : this.properties.toJSON()
  };
};

CArray.fromJSON = function (json) {
  var cArray = new CArray(json.name);
  cArray.indexes = Indexes.fromJSON(json.indexes);
  cArray.properties = Properties.fromJSON(json.properties, cArray);
  return cArray;
};
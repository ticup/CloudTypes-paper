var CloudType = require('./CloudType');
var CSet      = require('./CSet');

function Property(name, CType, cArray, values) {
  this.name = name;
  this.indexes = cArray.indexes;
  this.cArray = cArray;
  this.CType = CType;
  if (typeof CType === 'string') {
    this.CType = CloudType.declareFromTag(CType);
  }
  if (!CloudType.isCloudType(this.CType)) {
    throw Error ("Unknown property type in declaration (Must be CloudType (CInt, CString, CSet,...)): " + this.CType);
  }
  this.values = values || {};
}

Property.prototype.forEachIndex = function (callback) {
  return Object.keys(this.values).forEach(callback);
};

Property.prototype.saveGet = function (indexes) {
  var index = this.indexes.get(indexes);
  if (this.cArray.state.deleted(index, this.cArray)) {
    return null;
  }
  return this.get(indexes);
};

Property.prototype.get = function (indexes) {
  var index;
  indexes = indexes || [];
  // TODO: perform check on types
  console.log(this.indexes.length());
  console.log(indexes);
  if (indexes.length !== this.indexes.length())
    throw Error("Given indexes do not match declaration of Property: " + indexes);

  if (indexes.length === 0)
    index = 'singleton';
  else
    index = this.indexes.get(indexes);
  return this.getByIndex(index);
};

Property.prototype.getByIndex = function (index) {
  console.log('getting by index: ' + index);
  var ctype = this.values[index];
  if (typeof ctype === 'undefined') {
    ctype = this.CType.newFor(index);
    if (this.CType.prototype !== CSet.CSetPrototype) {
      this.values[index] = ctype;
    }

  }
  return ctype;
};

Property.prototype.entries = function () {
  var self = this;
  var result = [];
  this.forEachIndex(function (index) {
    console.log("____entry checking : " + index + "____");
    console.log("deleted: " + self.cArray.state.deleted(index, self.cArray));
    console.log("default: " + self.cArray.state.isDefault(self.getByIndex(index)));
    if (!self.cArray.state.deleted(index, self.cArray) && !self.cArray.state.isDefault(self.getByIndex(index))) {
      result.push(self.cArray.getByIndex(index));
    }
  });
  return result;
};

Property.prototype.toJSON = function () {
  var self = this;
  var values = {};
  Object.keys(self.values).forEach(function (index) {
    values[index] = self.values[index].toJSON();
  });
  return { name: this.name, type: this.CType.toJSON(), values: values };
};

Property.fromJSON = function (json, cArray) {
  var values = {};
  var CType = CloudType.fromJSON(json.type);
  Object.keys(json.values).forEach(function (index) {
    values[index] = CType.fromJSON(json.values[index], index);
  });
  console.log(CType);
  return new Property(json.name, CType, cArray, values);
};

Property.prototype.fork = function (cArray) {
  var self = this;
  var fProperty = new Property(this.name, this.CType, cArray);
  Object.keys(self.values).forEach(function (index) {
    fProperty.values[index] = self.values[index].fork();
  });
  return fProperty;
};

module.exports = Property;
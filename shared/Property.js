var CloudType = require('./CloudType');

function Property(name, ctypeName, cArray, values) {
  this.name = name;
  this.indexes = cArray.indexes;
  this.cArray = cArray;
  this.ctypeName = ctypeName;
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
  var index = this.indexes.get(indexes);
  var ctype = this.values[index];
  if (typeof ctype === 'undefined') {
    ctype = this.values[index] = new (CloudType.fromTag(this.ctypeName))();
  }
  return ctype;
};

Property.prototype.entries = function () {
  var self = this;
  var result = [];
  this.forEachIndex(function (index) {
//    console.log("____entry checking : " + index + "____");
//    console.log("deleted: " + self.cArray.state.deleted(index, self.cArray));
//    console.log("default: " + self.cArray.state.isDefault(self.get(index)));
    if (!self.cArray.state.deleted(index, self.cArray) && !self.cArray.state.isDefault(self.get(index))) {
      result.push(index);
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
  return { name: this.name, type: this.ctypeName, values: values };
};

Property.fromJSON = function (json, cArray) {
  var values = {};
  Object.keys(json.values).forEach(function (index) {
    values[index] = CloudType.fromJSON(json.values[index]);
  });
  return new Property(json.name, json.type, cArray, values);
};

Property.prototype.fork = function (cArray) {
  var self = this;
  var fProperty = new Property(this.name, this.ctypeName, cArray);
  Object.keys(self.values).forEach(function (index) {
    fProperty.values[index] = self.values[index].fork();
  });
  return fProperty;
};

module.exports = Property;
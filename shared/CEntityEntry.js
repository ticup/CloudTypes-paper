var Indexes     = require('./Indexes');
var CArrayEntry = require('./CArrayEntry');

module.exports = CEntityEntry;

function CEntityEntry(cArray, indexes) {
  CArrayEntry.call(this, cArray, indexes);
//  this.cArray = cArray;
//  this.indexes = Indexes.getIndexes(indexes, cArray);
}

CEntityEntry.prototype = Object.create(CArrayEntry.prototype);


CEntityEntry.prototype.get = function (property) {
  return this.cArray.getProperty(property).saveGet(this.indexes);
};

CEntityEntry.prototype.forEachIndex = function (callback) {
  return this.indexes.slice(1).forEach(callback);
};

CEntityEntry.prototype.forEachKey = function (callback) {
  for (var i = 1; i<this.indexes.length; i++) {
    callback(this.cArray.indexes.getName(i), this.indexes[i]);
  }
};

CEntityEntry.prototype.deleted = function () {
  return (this.cArray.state.deleted(this.indexes, this.cArray));
};

CEntityEntry.prototype.delete = function () {
  return this.cArray.delete(this);
};

CEntityEntry.prototype.toString = function () {
  return Indexes.createIndex(this.indexes);
};
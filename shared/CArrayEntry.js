var Indexes = require('./Indexes');

module.exports = CArrayEntry;

function CArrayEntry(cArray, indexes) {
  this.cArray = cArray;
  this.indexes = Indexes.getIndexes(indexes);
}

CArrayEntry.prototype.get = function (property) {
  return this.cArray.getProperty(property).saveGet(this.indexes);
};

CArrayEntry.prototype.forEachIndex = function (callback) {
  var self = this;
  var i = 0;
  this.indexes.forEach(function (index) {
    var type = self.cArray.indexes.getType(i++);
    callback(type, index);
  });
};

CArrayEntry.prototype.key = function (name) {
  var position = this.cArray.indexes.getPositionOf(name);
  if (position === -1)
    return null;
  return this.indexes[position];
};
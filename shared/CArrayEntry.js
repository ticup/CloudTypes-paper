var Indexes = require('./Indexes');

module.exports = CArrayEntry;

function CArrayEntry(cArray, indexes) {
  this.cArray = cArray;
  this.indexes = indexes;
}

CArrayEntry.prototype.get = function (property) {
  console.log('getting ' + property);
  console.log(this.cArray.getProperty(property));
  return this.cArray.getProperty(property).saveGet(this.indexes);
};

CArrayEntry.prototype.forEachIndex = function (callback) {
  var self = this;
  var i = 0;
  Indexes.getIndexes(this.indexes).forEach(function (index) {
    var type = self.cArray.indexes.getType(i++);
    callback(type, index);
  });
};
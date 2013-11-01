var Indexes = require('./Indexes');

module.exports = CEntityEntry;

function CEntityEntry(cEntity, indexes) {
  this.cEntity = cEntity;
  this.indexes = indexes;
}
//CEntityEntry.prototype = Object.create(CArrayEntry.prototype);


CEntityEntry.prototype.get = function (property) {
  return this.cEntity.getProperty(property).saveGet(this.indexes);
};

CEntityEntry.prototype.forEachIndex = function (callback) {
  var self = this;
  var i = 0;
  Indexes.getIndexes(this.indexes).forEach(function (index) {
    var type = self.cEntity.indexes.getType(i++);
    callback(type, index);
  });
};

CEntityEntry.prototype.delete = function () {
  return this.cEntity.delete(this);
};
var Indexes = require('./Indexes');

module.exports = CEntityEntry;

function CEntityEntry(cEntity, indexes) {
  this.cEntity = cEntity;
  this.indexes = Indexes.getIndexes(indexes, cEntity);
}
//CEntityEntry.prototype = Object.create(CArrayEntry.prototype);


CEntityEntry.prototype.get = function (property) {
  return this.cEntity.getProperty(property).saveGet(this.indexes);
};

CEntityEntry.prototype.key = function (name) {
  var position = this.cEntity.indexes.getPositionOf(name);
  if (position === -1)
    return null;
  return this.indexes[position];
};

CEntityEntry.prototype.forEachIndex = function (callback) {
  var self = this;
  var i = 0;
  Indexes.getIndexes(this.indexes).forEach(function (index) {
    var type = self.cEntity.indexes.getType(i++);
    callback(type, index);
  });
};

CEntityEntry.prototype.deleted = function () {
  return (this.cEntity.state.deleted(this.indexes, this.cEntity));
};

CEntityEntry.prototype.delete = function () {
  return this.cEntity.delete(this);
};
/**
 * Created by ticup on 07/11/13.
 */
module.exports = CArrayQuery;

function CArrayQuery(cArray, filter) {
  this.cArray = cArray;
  this.sumFilter = filter;
  this.orderProperty = false;
  this.orderDir = false;
}

CArrayQuery.prototype.all = function () {
  var self = this;
  var entities = [];
  Object.keys(self.cArray.states).forEach(function (index) {
    if (self.cArray.exists(index) && (typeof self.sumFilter === 'undefined' || self.sumFilter(self.cArray.getByIndex(index))))
      entities.push(self.cArray.getByIndex(index));
  });
  if (self.orderProperty) {
    var property = self.cArray.getProperty(self.orderProperty);
    if (typeof property === 'undefined') {
      throw new Error("orderBy only allowed on properties for the moment");
    }
    return entities.sort(function (entry1, entry2) {
      return entry1.get(self.orderProperty).compare(entry2.get(self.orderProperty), (self.orderDir === "desc"));
    });
  }
  return entities;
};

CArrayQuery.prototype.entries = function (propertyName) {
  var self = this;
  var filtered = [];
  var array = this.cArray.entries(propertyName);
  if (typeof self.sumFilter === 'undefined') {
    filtered = array;
  } else {
    array.forEach(function (entry) {
      if (self.sumFilter(entry))
        filtered.push(entry);
    });
  }

  if (self.orderProperty) {
    var property = self.cArray.get(self.orderProperty);
    if (typeof property === 'undefined') {
      throw new Error("orderBy only allowed on properties for the moment");
    }
    return filtered.sort(function (entry1, entry2) {
      return entry1.get(self.orderProperty).compare(entry2.get(self.orderProperty), (self.orderDir === "desc"));
    });
  }
  return filtered;
};


CArrayQuery.prototype.orderBy = function (propertyName, dir) {
  this.orderProperty = propertyName;
  this.orderDir = dir;
  return this;
};

CArrayQuery.prototype.where = function (newFilter) {
  var sumFilter = this.sumFilter;
  this.sumFilter = function (index) { return (sumFilter(index) && newFilter(index)); };
  return this;
};
/**
 * Created by ticup on 06/11/13.
 */

function CArrayQuery(cArray, property, dir) {
  this.cArray   = cArray;
  this.property = property;
  this.dir      = dir || "asc";
}


CArrayQuery.prototype.entries = function (propertyName) {
  var self = this;
  var array = this.cArray.entries(propertyName);
  return array.sort(function (entry1, entry2) {
    return entry1.get(self.property).compare(entry2.get(self.property), (dir === "desc"));
  });
};
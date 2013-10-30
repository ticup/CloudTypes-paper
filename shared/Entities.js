module.exports = Entities;

function Entities() {
  this.entities = {};
}

Entities.fromJSON = function (json) {

};

Entities.prototype.toJSON = function () {
  var json = { };
  Object.keys(this.entities).forEach(function (index) { json[index] = this.entities[index]; });
  return json;
};
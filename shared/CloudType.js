module.exports = CloudType;

function CloudType() {}

CloudType.types = {};

CloudType.register = function (type) {
  this.types[type.prototype.tag] = type;
};

CloudType.fromJSON = function (json) {
  return this.types[json.type].fromJSON(json.info);
};

CloudType.prototype.toJSON = function () {
  return {
    type: this.tag,
    info: this._toJSON()
  };
};

CloudType.prototype.join = function (cint) {
  this._join(cint, this);
};

CloudType.prototype.joinIn = function (cint) {
  this._join(cint, cint);
};
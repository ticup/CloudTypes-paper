module.exports = CloudType;

function CloudType() {}

CloudType.types = {};

CloudType.register = function (typeDeclaration) {
  console.log("registering " + typeDeclaration.tag);
  CloudType.types[typeDeclaration.tag] = typeDeclaration;
};

CloudType.fromTag = function (tag) {
  console.log("getting " + tag);
  return CloudType.types[tag];
};

// Can only be used for non parametrized declarations (CInt/CString/CTime..)
// By using this users can declare such types by their tag instead of by using the real declaration.
CloudType.declareFromTag = function (tag) {
  console.log("getting " + tag);
  return CloudType.types[tag].declare();
};

CloudType.isCloudType = function (CType) {
  return ((typeof CType.tag !== 'undefined') &&
          (typeof CloudType.types[CType.tag] !== 'undefined'));
};

CloudType.fromJSON = function (json) {
  return CloudType.fromTag(json.tag).fromJSON(json);
};

CloudType.prototype.join = function (cint) {
  this._join(cint, this);
};

CloudType.prototype.joinIn = function (cint) {
  this._join(cint, cint);
};
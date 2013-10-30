var CArray     = require('./CArray');
var Indexes    = require('./Indexes');
var Properties = require('./Properties');
var Property   = require('./Property');
var CEntityEntry = require('./CEntityEntry');

module.exports = CEntity;

var OK = 'ok';
var DELETED = 'deleted';

function CEntity(name, indexes, properties, states) {
  CArray.call(this, name, indexes, properties);
  this.states = {} || states;
  this.uid = 0;
}

CEntity.prototype = Object.create(CArray.prototype);

CEntity.declare = function (name, indexDeclarations, propertyDeclarations) {
  var cEntity = new CEntity(name, [{uid: 'String'}].concat(indexDeclarations));
  Object.keys(propertyDeclarations).forEach(function (propName) {
    var cTypeName = propertyDeclarations[propName];
    cEntity.addProperty(new Property(propName, cTypeName, cEntity));
  });
  return cEntity;
};


CEntity.prototype.create = function (indexes) {
  indexes = (typeof indexes === 'undefined') ? [] : indexes;
  var uid = this.name + ":" + this.state.createUID(this.uid);
  this.uid += 1;
  this.setCreated(uid);
  return this.get([uid].concat(indexes));
};

CEntity.prototype.get = function (indexes) {
  return new CEntityEntry(this, indexes);
};

CEntity.prototype.forEachState = function (callback) {
  return Object.keys(this.states).forEach(callback);
};

CEntity.prototype.setMax = function (entity1, entity2, index) {
  var val1 = entity1.states[index];
  var val2 = entity2.states[index];
  if (val1 === DELETED || val2 === DELETED)
    return this.states[index] = DELETED;
  if (val1 === OK || val2 === OK)
    return this.states[index] = OK;
};

CEntity.prototype.all = function () {
  var self = this;
  var entities = [];
  Object.keys(this.states).forEach(function (index) {
    if (self.states[index] === OK)
      entities.push(self.get(index));
  });
  return entities;
};

CEntity.prototype.setDeleted = function (index) {
  this.states[index] = DELETED;
};

CEntity.prototype.setCreated = function (index) {
  this.states[index] = OK;
};

CEntity.prototype.delete = function (entry) {
  console.log("DELETING " + entry.indexes);
  this.setDeleted(entry.indexes[0]);
  this.state.propagate();
};

CEntity.prototype.exists = function (idx) {
  return (typeof this.states[idx] !== 'undefined' && this.states[idx] === OK);
};

CEntity.prototype.deleted = function (idx) {
  return (this.states[idx] === DELETED)
};

CEntity.prototype.fork = function () {
  var fIndexes = this.indexes.fork();
  var cEntity = new CEntity(this.name, fIndexes);
  cEntity.properties = this.properties.fork(cEntity);
  cEntity.states     = this.states;
  return cEntity;
};

CEntity.fromJSON = function (json) {
  var cEntity = new CEntity(json.name);
  cEntity.indexes = Indexes.fromJSON(json.indexes);
  cEntity.properties = Properties.fromJSON(json.properties, cEntity);
  cEntity.states = json.states;
  return cEntity;
};

CEntity.prototype.toJSON = function () {
  var json = CArray.prototype.toJSON.call(this);
  json.states = this.states;
  json.type = 'Entity';
  return json;
};

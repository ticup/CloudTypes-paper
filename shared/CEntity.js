var CArray     = require('./CArray');
var Indexes    = require('./Indexes');
var Properties = require('./Properties');
var Property   = require('./Property');
var CEntityEntry = require('./CEntityEntry');
var CEntityQuery = require('./CEntityQuery');

module.exports = CEntity;

var OK = 'ok';
var DELETED = 'deleted';

// when declared in a State, the state will add itself and the declared name for this CArray as properties
// to the CEntity object.
function CEntity(indexes, properties, states) {
  CArray.call(this, indexes, properties);
  this.states = {} || states;
  this.uid = 0;
}
CEntity.prototype = Object.create(CArray.prototype);

CEntity.OK = OK;
CEntity.DELETED = DELETED;

CEntity.declare = function (indexDeclarations, propertyDeclarations) {
  var cEntity = new CEntity([{uid: 'string'}].concat(indexDeclarations));
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
  var index = Indexes.createIndex([uid].concat(indexes));
  this.setCreated(index);
  return this.get.apply(this, [uid].concat(indexes));
};

CEntity.prototype.delete = function (entry) {
  console.log("DELETING " + entry.indexes);
  this.setDeleted(Indexes.createIndex(entry.indexes));
  this.state.propagate();
};

// Pure arguments version (user input version)
CEntity.prototype.get = function () {
  return new CEntityEntry(this, Array.prototype.slice.call(arguments));
};

// Flattened index version (internal version)
CEntity.prototype.getByIndex = function (index) {
  return new CEntityEntry(this, index);
};

CEntity.prototype.forEachState = function (callback) {
  return Object.keys(this.states).forEach(callback);
};

CEntity.prototype.setMax = function (entity1, entity2, index) {
  var val1 = entity1.states[index];
  var val2 = entity2.states[index];
  if (val1 === DELETED || val2 === DELETED) {
    return this.states[index] = DELETED;
  }
  if (val1 === OK || val2 === OK) {
    return this.states[index] = OK;
  }

};

CEntity.prototype.where = function (filter) {
  return new CEntityQuery(this, filter);
};

CEntity.prototype.all = function () {
  var self = this;
  var entities = [];
  Object.keys(this.states).forEach(function (index) {
    if (self.states[index] === OK)
      entities.push(self.getByIndex(index));
  });
  return entities;
};

CEntity.prototype.setDeleted = function (index) {
  this.states[index] = DELETED;
};

CEntity.prototype.setCreated = function (index) {
  this.states[index] = OK;
};



CEntity.prototype.exists = function (idx) {
  return (typeof this.states[idx] !== 'undefined' && this.states[idx] === OK);
};

CEntity.prototype.deleted = function (idx) {
  return (this.states[idx] === DELETED)
};

CEntity.prototype.fork = function () {
  var fIndexes = this.indexes.fork();
  var cEntity = new CEntity(fIndexes);
  cEntity.properties = this.properties.fork(cEntity);
  cEntity.states     = this.states;
  return cEntity;
};

CEntity.fromJSON = function (json) {
  var cEntity = new CEntity();
  cEntity.indexes = Indexes.fromJSON(json.indexes);
  cEntity.properties = Properties.fromJSON(json.properties, cEntity);
  cEntity.states = {};
  Object.keys(json.states).forEach(function (index) {
    cEntity.states[index] = json.states[index];
  });
  return cEntity;
};

CEntity.prototype.toJSON = function () {
  return {
    type        : 'Entity',
    indexes     : this.indexes.toJSON(),
    properties  : this.properties.toJSON(),
    states      : this.states

  };
};

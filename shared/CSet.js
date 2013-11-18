/**
 * Created by ticup on 08/11/13.
 */
var CloudType = require('./CloudType');



function CSetDeclaration() { }
// CSetDeclaration: Declare a parametrized CSet type for a property
CSetDeclaration.declare = function (elementType) {
  function CSet(entryIndex) {
    this.type = CSet;
    this.entryIndex = entryIndex;
  }

  // CSet.entity should be set by the state to the entity that is made for this CSet.
  CSet.elementType = elementType;


  CSet.newFor = function (entryIndex) {
    console.log('CREATING CSET for : ' + entryIndex);
    return new CSet(entryIndex);
  };

  // Puts the declared (parametrized) CSet into json
  CSet.toJSON = function () {
    return { tag: CSetDeclaration.tag, elementType: elementType };
  };

  // Retrieves an instance of a declared (parametrized) CSet from json
  CSet.fromJSON = function (json, entryIndex) {
    return new CSet(entryIndex);
  };

  CSet.tag = "CSet";
  CSet.prototype = CSetPrototype;
  return CSet;
}

// called by CloudType to initialize the parametrized CSet for a property
CSetDeclaration.fromJSON = function (json) {
  return CSetDeclaration.declare(json.elementType);
};

// register this declaration as usable (will also allow to create CSet with CloudType.fromJSON())
CSetDeclaration.tag = "CSet";
CloudType.register(CSetDeclaration);



var CSetPrototype = Object.create(CloudType.prototype);

// Operations for the parametrized CSets

// don't need to save anything for a particular CSet instance of a property:
// The info of the particular set is saved in a dedicated CSetEntity
CSetPrototype.toJSON = function () {
  return {  };
};

// semantic operations (all delegated to the dedicated entity)
CSetPrototype.add = function (element) {
  return this.type.entity.create([this.entryIndex, element]);
};

CSetPrototype.contains = function (element) {
  var entryIndex = this.entryIndex;
  var elementType = this.type.elementType;
  return (this.type.entity
      .where(function (entry) {
        console.log(isEntryForElement(entry, entryIndex, elementType, element));
        return isEntryForElement(entry, entryIndex, elementType, element);
      }).all().length !== 0);
};

CSetPrototype.remove = function (element) {
  var entryIndex = this.entryIndex;
  var elementType = this.type.elementType;
  this.type.entity
      .where(function (entry) {
        return isEntryForElement(entry, entryIndex, elementType, element);
      }).all().forEach(function (entry) {
        entry.delete();
      });
};

CSetPrototype.get = function () {
  return this.type.entity.all();
};

function isEntryForElement(entry, entryIndex, elementType, element) {
  console.log( entry.key('entryIndex') + ' ?= ' +  entryIndex + ": " + (entry.key('entryIndex') === entryIndex));
  console.log(entry.key('element') + ' ?= ' + element + ": " + (entry.key('element') === element));
  return (entry.key('entryIndex') === entryIndex &&
      ((elementType === 'string' || elementType === 'int') ?
      (entry.key('element') === element) :
      (entry.key('element').equals(element))));
}

// Defining _join(cint, target) provides the join and joinIn methods
// by the CloudType prototype.
CSetPrototype._join = function (cset, target) {
  // do nothing (everything happens 'automatically' through the cEntityProxy
};

CSetPrototype.fork = function () {
  // do nothing (everything happens 'automatically' through the cEntityProxy
  return this;
};

CSetPrototype.applyFork = function () {
  // do nothing (everything happens 'automatically' through the cEntityProxy
  return this;
};

CSetPrototype.replaceBy = function (cset) {
  // do nothing (everything happens 'automatically' through the cEntityProxy
};

CSetPrototype.isDefault = function () {
  return (this.get().length !== 0);
};

CSetPrototype.compare = function (cset, reverse) {
  return ((reverse ? -1 : 1) * (this.get().length - cset.get().length));
};


exports.Declaration = CSetDeclaration;
exports.CSetPrototype = CSetPrototype;
var CloudType = require('./CloudType');
var CArray    = require('./CArray');
var CEntity   = require('./CEntity');
var CSetPrototype = require('./CSet').CSetPrototype;

module.exports = State;

function State(arrays, entities) {
  this.arrays = arrays || {};
  this.entities = entities || {};
  this.cid = 0;
}


/* User API */
//State.prototype.operation = function (name, indexes, propertyName, op) {
//  return op.apply(this.arrays[name].getProperty(propertyName).get(indexes), [].slice.call(arguments, 4))
//};
State.prototype.get = function (name) {
  var array = this.arrays[name];
  if (typeof array !== 'undefined' && array.isProxy) {
    return array.getProperty('value').get([]);
  }
  return this.arrays[name];
};

State.prototype.declare = function (name, array) {
  var self = this;
  // CArray or CEntity
  if (array instanceof CArray) {
    array.state = this;
    array.name  = name;

    // CSet properties -> declare their proxy Entity and give reference to the CSet properties
    array.forEachProperty(function (property) {
      if (property.CType.prototype === CSetPrototype) {
        console.log('detected CSet');
        self.declare(array.name + property.name, CEntity.declare([{entryIndex: 'string'}, {element: property.CType.elementType}], {}));
        property.CType.entity = self.get(array.name + property.name);
      }
    });
    return this.arrays[name] = array;
  }
  // global (CloudType) => create proxy CArray
  if (typeof array.prototype !== 'undefined' && array.prototype instanceof CloudType) {
    var CType = array;
    array = CArray.declare([], {value: CType.name});
    array.state = this;
    array.name  = name;
    array.isProxy = true;
    return this.arrays[name] = array;
  }
  // Either declare CArray (CEntity is also a CArray) or CloudType, nothing else.
  throw "Need a CArray or CloudType to declare: " + array;
};

State.prototype.isDefault = function (cType) {
  return cType.isDefault();
}

/* Private */

State.prototype.createUID = function (uid) {
  var id = this.cid + "#" + uid;
  console.log("CREATING NEW ENTITY:" + id);
  return id;
}

State.prototype.toJSON = function () {
  var self = this;
  var arrays = {};
  Object.keys(self.arrays).forEach(function (name) {
    return arrays[name] = self.arrays[name].toJSON();
  });
  return {
    arrays: arrays
  };
};

State.fromJSON = function (json) {
  var array, state;
  state = new this();
  Object.keys(json.arrays).forEach(function (name) {
    var arrayJson = json.arrays[name];
    if (arrayJson.type === 'Entity') {
      array = CEntity.fromJSON(arrayJson);
    } else if (arrayJson.type === 'Array') {
      array = CArray.fromJSON(arrayJson);
    } else {
      throw "Unknown type in state: " + json.type;
    }
    state.declare(name, array);
  });

  state.forEachArray(function (array) {
    // special case: CSet properties -> declare their proxy entities and give reference to the CSet properties
    array.forEachProperty(function (property) {
      if (property.CType.prototype === CSetPrototype) {
        property.CType.entity = state.get(array.name + property.name);
      }
    });
  });
  return state;
};

State.prototype.getProperty = function (property) {
  return this.arrays[property.cArray.name].getProperty(property);
};


State.prototype.forEachProperty = function (callback) {
  var self = this;
  Object.keys(self.arrays).forEach(function (name) {
    self.arrays[name].forEachProperty(callback);
  });
};

State.prototype.forEachArray = function (callback) {
  var self = this;
  Object.keys(this.arrays).forEach(function (name) {
    callback(self.arrays[name]);
  });
};

State.prototype.forEachEntity = function (callback) {
  var self = this;
  Object.keys(this.arrays).forEach(function (name) {
    if (self.arrays[name] instanceof CEntity)
      callback(self.arrays[name]);
  });
};

State.prototype.propagate = function () {
  var self = this;
  var changed = false;
  this.forEachEntity(function (entity) {
    entity.forEachState(function (index) {
      if (entity.exists(index) && self.deleted(index, entity)) {
        entity.setDeleted(index);
      }
    });
  });
};

State.prototype.deleted = function (index, entity) {
  var self = this;
  // Entity
  if (typeof entity !== 'undefined' && entity instanceof CEntity) {
    var entry = entity.getByIndex(index);
//    console.log(index + ' of ' + entity.name + ' deleted ?');

    if (entity.deleted(index))
      return true;
    var del = false;
    entry.forEachKey(function (name, value) {
      var type = entity.indexes.getTypeOf(name);
      if (typeof type !== 'undefined')
        type = self.get(type);
//      console.log('index deleted? ' + value + " of type " + type);
      if (self.deleted(value, type))
        del = true;
    });
    return del;
  }

  // Array
  if (typeof entity !== 'undefined' && entity instanceof CArray) {
    var del = false;
    var entry = entity.get(index);
    entry.forEachKey(function (name, value) {
      var type = entity.indexes.getTypeOf(name);
      if (self.deleted(value, type))
        del = true;
    });
    return del;
  }

  // string/int
  return false;
};



State.prototype._join = function (rev, target) {
  var master = (this === target) ? rev : this;
  var self = this;
  master.forEachProperty(function (property) {
    property.forEachIndex(function (index) {
      var joiner = rev.getProperty(property).getByIndex(index);
      var joinee = self.getProperty(property).getByIndex(index);
      var t = target.getProperty(property).getByIndex(index);

//      console.log("joining: " + require('util').inspect(joiner) + " and " + require('util').inspect(joinee) + ' in ' + require('util').inspect(t));
      joinee._join(joiner, t);
//      console.log("joined: " + require('util').inspect(t));
    });
  });
  master.forEachEntity(function (entity) {
    var joiner = rev.get(entity.name);
    var joinee = self.get(entity.name);
    var t = target.get(entity.name);
    entity.forEachState(function (index) {
      t.setMax(joinee, joiner, index);
    });

  });
  target.propagate();
};

State.prototype.joinIn = function (rev) {
  return this._join(rev, rev);
};

State.prototype.join = function (rev) {
  return this._join(rev, this);
};

State.prototype.fork = function () {
  var forked = new State();
  var forker = this;
  forker.forEachArray(function (cArray) {
    var fArray = cArray.fork();
    forked.declare(cArray.name, fArray);
  });
  return forked;
};

State.prototype.applyFork = function () {
  var self = this;
  self.forEachProperty(function (property) {
    property.forEachIndex(function (index) {
      var type = property.getByIndex(index);
      type.applyFork();
    });
  });
};

State.prototype.replaceBy = function (state) {
  var self = this;
  state.forEachProperty(function (property) {
    property.forEachIndex(function (index) {
      var type1 = property.getByIndex(index);
      var type2 = self.getProperty(property).getByIndex(index);
      type2.replaceBy(type1);
    });
  });
  state.forEachEntity(function (entity) {
    self.get(entity.name).states = entity.states;
  });
};

State.prototype.print = function () {
  console.log(require('util').inspect(this.toJSON(), {depth: null}));
};
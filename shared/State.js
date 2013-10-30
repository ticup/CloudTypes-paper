var CloudType = require('./CloudType');
var CArray    = require('./CArray');
var CEntity   = require('./CEntity');

module.exports = State;

function State(arrays, entities) {
  this.arrays = arrays || {};
  this.entities = entities || {};
}


/* User API */
//State.prototype.operation = function (name, indexes, propertyName, op) {
//  return op.apply(this.arrays[name].getProperty(propertyName).get(indexes), [].slice.call(arguments, 4))
//};
State.prototype.get = function (name) {
  return this.arrays[name];
};

State.prototype.declare = function (array) {
  array.state = this;
  return this.arrays[array.name] = array;
};

State.prototype.isDefault = function (cType) {
  return cType.isDefault();
}

/* Private */
State.prototype.toJSON = function () {
  var self = this;
  return {
    arrays: Object.keys(self.arrays).map(function (name) {
      return self.arrays[name].toJSON();
    })
  };
};

State.fromJSON = function (json) {
  var array, state;
  state = new this();
  json.arrays.forEach(function (arrayJson) {
    if (arrayJson.type === 'Entity') {
      array = CEntity.fromJSON(arrayJson);
    } else if (arrayJson.type === 'Array') {
      array = CArray.fromJSON(arrayJson);
    } else {
      throw "Unknown array in state: " + json.type;
    }
    state.declare(array);
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
    entity.forEachProperty(function (property) {
      property.forEachIndex(function (index) {
        if (entity.exists(index) && self.deleted(index, entity)) {
          entity.setDeleted(index);
        }
      })
    })
  })
};

State.prototype.deleted = function (index, entity) {
  var self = this;
  // Entity
  if (typeof entity !== 'undefined' && entity instanceof CEntity) {
    var entry = entity.get(index);
    if (entity.deleted(index))
      return true;
    var del = false;
    entry.forEachIndex(function (type, idx) {
      var entity = self.get(type);
      if (self.deleted(idx, entity))
        del = true;
    });
    return del;
  }

  // Array
  if (typeof entity !== 'undefined' && entity instanceof CArray) {
    var del = false;
    var entry = entity.get(index);
    entry.forEachIndex(function (type, idx) {
      var entity = self.get(type);
      if (self.deleted(idx, entity))
        del = true;
    });
    return del;
  }

  // string/int
  return false;
};



State.prototype._join = function (rev, target) {
  var self = this;
  rev.forEachProperty(function (property) {
    property.forEachIndex(function (index) {
      var joiner = property.get(index);
      var joinee = self.getProperty(property).get(index);
      var t = target.getProperty(property).get(index);

//      console.log("joining: " + require('util').inspect(joiner) + " and " + require('util').inspect(joinee) + ' in ' + require('util').inspect(t));
      joinee._join(joiner, t);
//      console.log("joined: " + require('util').inspect(t));
    });
  });
  rev.forEachEntity(function (entity) {
    entity.forEachState(function (index) {
      var jEntity = self.get(entity.name);
      var t = target.get(entity.name);
      t.setMax(entity, jEntity, index);
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
    forked.declare(fArray);
  });
  return forked;
};

State.prototype.applyFork = function () {
  var self = this;
  self.forEachProperty(function (property) {
    property.forEachIndex(function (index) {
      var type = property.get(index);
      type.applyFork();
    });
  });
};

State.prototype.replaceBy = function (state) {
  var self = this;
  state.forEachProperty(function (property) {
    property.forEachIndex(function (index) {
      var type1 = property.get(index);
      var type2 = self.getProperty(property).get(index);
      type2.replaceBy(type1);
    });
  });
  state.forEachEntity(function (entity) {
    entity.states = state.get(entity.name).states;
  });
};

State.prototype.print = function () {
  console.log(require('util').inspect(this.toJSON(), {depth: null}));
//  console.log("PROPERTIES:");
//  this.forEachProperty(function (property) {
//    console.log(property.name + ": " + property.ctypeName);
//  });
//  this.forEachProperty(function (property) {
//    console.log
//    property.forEachIndex(function (index) {
//      console.log(property.name + "." + index + ": " + require('util').inspect(property.get(index)));
//    });
//  })
};

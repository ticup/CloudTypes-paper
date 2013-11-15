function Indexes(indexes) {
  var self = this;
  this.names  = [];
  this.types  = [];
  if (typeof indexes !== 'undefined') {
    indexes.forEach(function (index) {
      var name = Object.keys(index)[0];
      var type = index[name];
      self.names.push(name);
      self.types.push(type);
    });
  }
}

Indexes.prototype.forEach = function (callback) {
  for (var i = 0; i<this.names.length; i++) {
    console.log('type: ' + this.types[i]);
    callback(this.names[i], this.types[i]);
  }
};

Indexes.prototype.length = function () {
  return this.names.length;
};

Indexes.prototype.getType = function (position) {
  return this.types[position];
};

Indexes.prototype.getName = function (position) {
  return this.names[position];
};

Indexes.prototype.getTypeOf = function (name) {
  var position = this.getPositionOf(name);
  return this.types[position];
};

Indexes.prototype.getPositionOf = function (name) {
  return this.names.indexOf(name);
};

Indexes.prototype.get = function (indexes) {
  var index = Indexes.createIndex(indexes);
  return index;
};

Indexes.createIndex = function createIndex(indexes) {
  if (! (indexes instanceof Array))
    throw Error("createIndex: expects an array of indexes, given: " + indexes);
  return "[" + [].map.call(indexes, function (val) { return val.toString(); }).join(".") + "]";
};

function unParseIndex(string) {
  var count = 0;
  var current = "";
  var parts = [];
  string.split("").forEach(function (letter) {
    if (letter === '.' && count === 1) {
      parts.push(current);
      current = "";
      return;
    }

    if (letter === '[') {
      if (++count === 1) {
        return;
      }
    }

    if (letter === ']') {
      if (count-- === 1) {
        parts.push(current);
        return;
      }
    }

    current += letter;
  });
  return parts;
}

Indexes.getIndexes = function getIndexes(index, cArray) {
  // Flattened string given: unflatten
  if (! (index instanceof Array)) {
    index = unParseIndex(index);
  }

  for (var i = 0; i<index.length; i++) {
    var type = cArray.indexes.getType(i);
    if (type === 'string') {
      continue;
    }
    if (type === 'int') {
      index[i] = parseInt(index[i], 10);
      continue;
    }

    // If entry is given, just store index!
    if (typeof index[i] !== 'string' && typeof index[i] !== 'number')
      index[i] = index[i].index();

  }
  return index;
};

Indexes.prototype.toJSON = function () {
  return {
    names: this.names,
    types: this.types
  };
};

Indexes.fromJSON = function (json) {
  var indexes = new Indexes();
  indexes.names = json.names;
  indexes.types = json.types;
  return indexes;
};

// names can be shared, because they are immutable.
Indexes.prototype.fork = function () {
  var indexes = new Indexes();
  indexes.names = this.names;
  indexes.types = this.types;
  return indexes;
};

module.exports = Indexes;
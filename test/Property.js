var should    = require('should');
var util      = require('util');
var State     = require('./extensions/State');
var CArray    = require('../shared/CArray');
var CloudType = require('../shared/CloudType');
var CInt      = require('./extensions/CInt');
var Property  = require('../shared/Property');
var Indexes   = require('../shared/Indexes');
var stubs     = require('./stubs');

describe('Property state independent operations', function () {
  var indexes, property, cArray, cArray2, state, name;
  var propName = "propertyName";
  var ctypeName =  "CInt";

  beforeEach(function () {
    state = new State();
    var props = {};
    props[propName] = ctypeName;
    cArray = CArray.declare("Customer", [], props);
    state.declare(cArray);
    name = state.arrays.Customer.properties.properties[propName];
  });

  describe('#new(name, ctypeName, cArray)', function () {
    cArray2   = new CArray("Customer", [], {});
    property = new Property(propName, ctypeName, cArray2);

    it('should create a new Property object', function () {
      should.exist(property);
      property.should.be.an.instanceOf(Property);
    });
    it('should have a name property', function () {
      property.should.have.property('name');
      property.name.should.equal(propName);
    });
    it('should have an indexes property', function () {
      property.should.have.property('indexes');
      property.indexes.should.equal(cArray2.indexes);
    });
    it('should have a ctypeName property', function () {
      property.should.have.property('ctypeName');
      property.ctypeName.should.equal(ctypeName);

    });
    it('should have a values property', function () {
      property.should.have.property('values');
    });
  });


  describe('.get(indexes)', function () {
    it('should get a cloud type of given type', function () {
      var ctype = name.get(['foo']);
      should.exist(ctype);
      ctype.should.be.an.instanceof(CInt);
    });

    it('should work for multi-indexes', function () {
      var ctype = name.get(['foo', 'bar']);
      should.exist(ctype);
      ctype.should.be.an.instanceof(CInt);
    });

    it('should return same type everytime', function () {
      var ctype = name.get(['foo']);
      var ctype2 = name.get(['foo']);
      ctype.should.equal(ctype2);
    });
  });

  describe('.forEachIndex(callback)', function () {
    it('should not be called if no indexes are accessed', function () {
      var ctr = 0;
      name.forEachIndex(function (index) {
        ctr++;
      });
      ctr.should.equal(0);
    });

    it('should be called for every index that has been accessed', function () {
      var idxs = [];
      name.get(['foo']);
      name.get(['bar']);
      name.get(['foobar']);
      name.get(['foo']);
      name.forEachIndex(function (index) {
        idxs.push(index);
      });
      idxs.length.should.equal(3);
      idxs.should.include('foo');
      idxs.should.include('bar');
      idxs.should.include('foobar');
    });
  });

  describe('.toJSON()', function () {
    it('should return a json representation', function () {
      var json = name.toJSON();
      should.exist(json);
      json.should.have.property('name');
      json.should.have.property('type');
      json.should.have.property('values');
      json.name.should.equal(propName);
      json.type.should.equal(ctypeName);
      json.values.should.be.an.instanceof(Object);
    });

    it('should include all accessed values', function () {
      var json = name.toJSON();
      Object.keys(json.values).length.should.equal(0);
      name.get(['foo']);
      name.get(['bar']);
      json = name.toJSON();
      Object.keys(json.values).length.should.equal(2);
      name.forEachIndex(function (index) {
        json.values[index].should.eql(name.get([index]).toJSON());
      });
    });
  });

  describe('#fromJSON(json, cArray)', function () {
    it('should create a Property object', function () {
      var json = name.toJSON();
      var convert = Property.fromJSON(json, cArray);
      should.exist(convert);
      convert.should.be.an.instanceof(Property);
    });

    it('should have all accessed properties of the original object', function () {
      name.get(['foo']);
      name.get(['bar']);
      var json = property.toJSON();
      var convert = Property.fromJSON(json, cArray);
      should.exist(convert);
      convert.should.be.an.instanceof(Property);
      name.forEachIndex(function (index) {
        convert.get([index]).should.eql(name.get([index]));
      });
    });

  });

});

describe('Property state dependent operations', function () {
  var state1 = State.fromJSON(stubs.stateUnchanged);
  var state2 = State.fromJSON(stubs.stateChanged);
  var property1 = state1.get('Customer').getProperty('name');
  var property2 = state2.get('Customer').getProperty('name');

  var property3 = state2.get('Order').getProperty('quantity');
  var property4 = state2.get('Order').getProperty('quantity');

  describe('state/property initialisation', function () {
    should.exist(property1);
    should.exist(property2);
  });

  describe('.entries()', function () {
    var entries1 = property1.entries();
    var entries2 = property2.entries();
    var entries3 = property2.entries();
    var entries4 = property2.entries();
    it('should should return all entries that are not deleted or default', function () {
      should.exist(entries1);
      should.exist(entries2);
      should.exist(entries3);
      should.exist(entries4);
      entries1.length.should.equal(0);
      entries2.length.should.equal(2);
    });
  });
});
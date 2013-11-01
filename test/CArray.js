var State       = require('./extensions/State');
var CArray      = require('../shared/CArray');
var Indexes     = require('../shared/Indexes');
var Properties  = require('../shared/Properties');
var Property    = require('../shared/Property');
var CloudType   = require('../shared/CloudType');
var CInt        = require('./extensions/CInt');
var should      = require('should');
var stubs       = require('./stubs');
var util        = require('util');


function createCArray() {
  var indexNames = [{name: "String"}];
  var properties = {toBuy: "CInt", shop: "CString"};
  var array = CArray.declare(indexNames, properties);
  return array;
}

describe('CArray', function () {
  var array;

  beforeEach(function () {
    array = createCArray();
  });

  // Private
  describe('#new(indexes, properties)', function () {
    var indexes = [{name: "String"}];
    var properties = {toBuy: "CInt"};
    var array = new CArray(indexes, properties);
    it('should create a new CArray object', function () {
      array.should.be.an.instanceOf(CArray);
    });
    it('should have properties property', function () {
      array.should.have.property('properties');
      array.properties.should.equal(properties);
    });
    it('should have indexes property', function () {
      array.should.have.property('indexes');
      array.indexes.should.be.an.instanceof(Indexes);
    });
  });

  // Private
  describe('#new(indexes, properties)', function () {
    var indexes = new Indexes();
    var properties = {toBuy: "CInt"};
    var array = new CArray(indexes, properties);
    it('should create a new CArray object', function () {
      array.should.be.an.instanceOf(CArray);
    });
    it('should have properties property', function () {
      array.should.have.property('properties');
      array.properties.should.equal(properties);
    });
    it('should have indexes property', function () {
      array.should.have.property('indexes');
      array.indexes.should.be.an.instanceof(Indexes);
      array.indexes.should.equal(indexes);
    });
  });

  describe('#fromJSON(json)', function () {
    var cArrays = stubs.arrays.map(function (json) {
      return CArray.fromJSON(json);
    });
    it('should create a CArray', function () {
      var json = array.toJSON();
      var array2 = CArray.fromJSON(stubs.groceryUnchanged);
      should.exist(array2);
      array2.should.be.an.instanceof(CArray);
      array2.getProperty('toBuy').should.be.an.instanceof(Property);
    });
    it('should create a CArray for all stubs', function () {
      stubs.arrays.map(function (json) {
        return [json, CArray.fromJSON(json)];
      }).forEach(function (result) {
        var json = result[0];
        var cArray = result[1];
        should.exist(cArray);
        cArray.should.be.an.instanceof(CArray);
        json.properties.forEach(function (jsonProperty) {
          should.exist(cArray.getProperty(jsonProperty.name));
        });
      });
    });
  });

  describe('.toJSON()', function () {
    it('should create a JSON representation', function () {
      var json = array.toJSON();
      should.exist(json);
      should.exist(json.indexes);
      should.exist(json.properties);
      json.indexes.should.eql(array.indexes.toJSON());
      json.properties.should.eql(array.properties.toJSON())
    });
    it('should be complementary with fromJSON for all stubs', function () {
      stubs.arrays.map(function (json) {
        json.should.eql(CArray.fromJSON(json).toJSON());
      });
    });
  });

  // Public
  describe('#declare(indexNames, properties)', function () {
    var indexNames = [{name: "String"}];
    var properties = {toBuy: "CInt"};
    var array = CArray.declare(indexNames, properties);
    it('should create a new CArray object', function () {
      array.should.be.an.instanceOf(CArray);
    });
    it('should have indexes property', function () {
      array.should.have.property('indexes');
      array.indexes.should.be.an.instanceof(Indexes);
    });
    it('should have initialized properties property', function () {
      array.should.have.property('properties');
      array.properties.should.be.instanceof(Properties);
      should.exist(array.properties.get('toBuy'));
      array.properties.get('toBuy').should.be.instanceof(Property);
    });
  });

  describe('.forEachProperty(callback)', function () {
    it('should call the callback for each property', function () {
      var ctr = 0;
      array.forEachProperty(function (property) {
        property.should.be.an.instanceof(Property);
        if (property.name === "toBuy")
          property.ctypeName.should.equal("CInt");

        if (property.name === "shop")
          property.ctypeName.should.equal("CString");
       ctr++;
      });
      ctr.should.equal(2);
    });
  });

  describe('.getProperty', function () {
    describe('.getProperty(propertyName)', function () {
      it('sould return the property with that name', function () {
        var property = array.getProperty('toBuy');
        should.exist(property);
        property.should.be.an.instanceof(Property);
        property.name.should.equal('toBuy');
      });
    });

    describe('.getProperty(property)', function () {
      it('sould return the property with the same name', function () {
        var property = array.getProperty('toBuy');
        var property2 = array.getProperty(property);
        should.exist(property2);
        property2.should.be.an.instanceof(Property);
        property2.name.should.equal('toBuy');
      });
    });
  });






});
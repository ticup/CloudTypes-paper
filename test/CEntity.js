var State       = require('./extensions/State');
var CEntity     = require('../shared/CEntity');
var Indexes     = require('../shared/Indexes');
var Properties  = require('../shared/Properties');
var Property    = require('../shared/Property');
var CloudType   = require('../shared/CloudType');
var CInt        = require('./extensions/CInt');
var should      = require('should');
var stubs       = require('./stubs');
var util        = require('util');
var CEntityEntry = require('../shared/CEntityEntry');

describe('CEntity state independent operations', function () {
  var entity;

  beforeEach(function () {
    var indexNames = [{name: "String"}];
    var properties = {address: "CString"};
    entity = CEntity.declare(indexNames, properties);
  });

  // Private
  describe('#new(indexDeclarations, propertyDeclarations)', function () {
    var indexNames = [{name: "foo", type: "String"}];
    var properties = {address: "CString"};
    var entity = new CEntity(indexNames, properties);
    it('should create a new CEntity object', function () {
      entity.should.be.an.instanceOf(CEntity);
    });
    it('should have properties property', function () {
      entity.should.have.property('properties');
      entity.properties.should.equal(properties);
    });
    it('should have indexes property', function () {
      entity.should.have.property('indexes');
      entity.indexes.should.be.an.instanceof(Indexes);
    });
  });

  // Private
  describe('#new(indexes, PropertyDeclarations)', function () {
    var indexes = new Indexes();
    var properties = {toBuy: "CInt"};
    var entity = new CEntity(indexes, properties);
    it('should create a new CEntity object', function () {
      entity.should.be.an.instanceOf(CEntity);
    });
    it('should have properties property', function () {
      entity.should.have.property('properties');
      entity.properties.should.equal(properties);
    });
    it('should have indexes property', function () {
      entity.should.have.property('indexes');
      entity.indexes.should.be.an.instanceof(Indexes);
      entity.indexes.should.equal(indexes);
    });
  });

  describe('#fromJSON(json)', function () {
    it('should create a CEntity', function () {
      var json = entity.toJSON();
      var entity2 = CEntity.fromJSON(stubs.customerUnchanged);
      should.exist(entity2);
      entity2.should.be.an.instanceof(CEntity);
      entity2.getProperty('name').should.be.an.instanceof(Property);
    });

    it('should create a CEntity for all stubs', function () {
      stubs.entities.map(function (json) {
        return [json, CEntity.fromJSON(json)];
      }).forEach(function (result) {
        var json = result[0];
        var cEntity = result[1];
        should.exist(cEntity);
        cEntity.should.be.an.instanceof(CEntity);
        json.properties.forEach(function (jsonProperty) {
          should.exist(cEntity.getProperty(jsonProperty.name));
       });
     });
    });
  });

  describe('.toJSON()', function () {
    it('should create a JSON representation', function () {
      var json = entity.toJSON();
      should.exist(json);
      should.exist(json.indexes);
      should.exist(json.properties);
      json.indexes.should.eql(entity.indexes.toJSON());
      json.properties.should.eql(entity.properties.toJSON())
    });
    it('should be complementary with fromJSON for all stubs', function () {
      stubs.entities.map(function (json) {
        json.should.eql(CEntity.fromJSON(json).toJSON());
      });
    });
  });

  // Public
  describe('#declare(indexNames, properties)', function () {
    var indexNames = [{name: "String"}];
    var properties = {address: "CString"};
    var entity2 = CEntity.declare(indexNames, properties);
    it('should create a new CEntity object', function () {
      entity2.should.be.an.instanceOf(CEntity);
    });
    it('should have indexes property', function () {
      entity2.should.have.property('indexes');
      entity2.indexes.should.be.an.instanceof(Indexes);
    });
    it('should have initialized properties property', function () {
      entity2.should.have.property('properties');
      entity2.properties.should.be.instanceof(Properties);
      should.exist(entity2.properties.get('address'));
      entity2.properties.get('address').should.be.instanceof(Property);
    });
  });

  describe('.get(index)', function () {
    it('should return a CEntityEntry for that index and cEntity', function () {
      var entry = entity.get('foo');
      should.exist(entry);
      entry.should.be.an.instanceof(CEntityEntry);
      entry.should.have.property('cEntity');
      entry.should.have.property('indexes');
      entry.cEntity.should.equal(entity);
    });
  });

  describe('.all()', function () {
    it('should return an array with all non-deleted entries', function () {
      var entity1 = CEntity.fromJSON(stubs.customerUnchanged);
      var entity2 = CEntity.fromJSON(stubs.customerChanged);
      entity1.all().length.should.equal(1);
      entity2.all().length.should.equal(4);
    });
  });

  describe('.forEachState(callback)', function () {
    it('should call callback for every entry in states', function () {
      var ctr = 0;
      entity.forEachState(function (idx) {
        ctr++
      });
      ctr.should.equal(0);
      var entity2 = CEntity.fromJSON(stubs.customerChanged);
      entity2.forEachState(function (idx) {
        ctr++
      });
      ctr.should.equal(5);
    });
  });

  describe('.forEachProperty(callback)', function () {
    it('should call the callback for each property', function () {
      var ctr = 0;
      entity.forEachProperty(function (property) {
        property.should.be.an.instanceof(Property);
        property.name.should.equal("address");
        property.ctypeName.should.equal("CString");
        ctr++;
      });
      ctr.should.equal(1);
    });
  });

  describe('.getProperty', function () {
    describe('.getProperty(propertyName)', function () {
      it('sould return the property with that name', function () {
        var property = entity.getProperty('address');
        should.exist(property);
        property.should.be.an.instanceof(Property);
        property.name.should.equal('address');
      });
    });

    describe('.getProperty(property)', function () {
      it('sould return the property with the same name', function () {
        var property = entity.getProperty('address');
        var property2 = entity.getProperty(property);
        should.exist(property2);
        property2.should.be.an.instanceof(Property);
        property2.name.should.equal(property.name);
      });
    });
  });


  describe('.setMax(entity1, entity2, index)', function () {
    it('should set the max value of entity1 and entity2 for state of index (max: undefined < OK < DELETED)', function () {
      var entity1 = CEntity.fromJSON(stubs.customerUnchanged);
      var entity2 = CEntity.fromJSON(stubs.customerChanged);

      // undefined < OK
      should.not.exist(entity1.states['Customer:0#1']);
      entity2.states['Customer:0#1'].should.equal("ok");
      entity1.setMax(entity1, entity2, 'Customer:0#1');
      entity1.states['Customer:0#1'].should.equal("ok");

      // OK < DELETED
      entity1.states['Customer:0#0'].should.equal("ok");
      entity2.states['Customer:0#0'].should.equal("deleted");
      entity1.setMax(entity1, entity2, 'Customer:0#0');
      entity1.states['Customer:0#0'].should.equal("deleted");

      // undefined < DELETED
      entity2.states['Customer:0#7'] = "deleted";
      should.not.exist(entity1.states['Customer:0#7']);
      entity1.setMax(entity1, entity2, 'Customer:0#7');
      entity1.states['Customer:0#7'].should.equal("deleted");

    });
  });






});

describe('CEntity state dependent operations: ', function () {
  describe('CEntity initialized in state', function () {
    it('should have a property state', function () {
      var state  = State.fromJSON(stubs.stateChanged);
      var Order = state.get('Order');
      should.exist(state);
      should.exist(Order);
      Order.should.have.property('state');
      Order.state.should.equal(state);
    })
  });

  describe('.where(callback)', function () {
    var state  = State.fromJSON(stubs.stateChanged);
    var Order = state.get('Order');
    var where = Order.where(function (entry) { return true; });

    it('should return an object with methods where and all', function () {
      should.exist(where);
      where.should.have.property('where');
      where.should.have.property('all');
      where.where.should.be.a.Function;
      where.all.should.be.a.Function;
    });

    describe('.all()', function () {
      it('should return all entities that cohere to the previously added filter', function () {
        var all = where.all();
        should.exist(all);
        all.length.should.equal(3);
      });
    });

//    describe('.where(callback)', function () {
//      it('should be chaining all the filters', function () {
//        var all = Customer.where(function (entry) {
//          entry.get('quantity').where(function (entry) { return entry.get('name').get() === 'foo'; }).all();
//        }
//        should.exist(all);
//        all.length.should.equal(1)
//      });
//    });
  });


});
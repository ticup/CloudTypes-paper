/**
 * Created by ticup on 09/11/13.
 */
var State       = require('./extensions/State');
var CEntity     = require('../shared/CEntity');
var CArray      = require('../shared/CArray');
var Indexes     = require('../shared/Indexes');
var Properties  = require('../shared/Properties');
var Property    = require('../shared/Property');
var CloudType   = require('../shared/CloudType');
var CInt        = require('./extensions/CInt');
var CSet        = require('./extensions/CSet').Declaration;
var CString     = require('./extensions/CString');
var should      = require('should');
var stubs       = require('./stubs');
var util        = require('util');
var CEntityEntry = require('../shared/CEntityEntry');

describe('CSet state dependent operations (CSet operations are always state dependent!): ', function () {
  describe('CSet initialized in a state', function () {
    var state = new State();
    var name = "moments";
    var entityName = name+"slots";
    state.declare(name, CArray.declare([{moment: 'string'}], {slots: CSet.declare('int')}));

    it('should add the array to the arrays map with given name', function () {
      state.arrays.should.have.property(name);
    });
    it('should install reference of self in cArray', function () {
      state.arrays[name].state.should.equal(state);
    });
    it('should install reference of name in cArray', function () {
      state.arrays[name].name.should.equal(name);
    });
    it('should add an entity for the slot property with name <array.name><slot.name>', function () {
      should.exist(state.arrays[entityName]);
      state.arrays[entityName].should.be.an.instanceof(CEntity);
    });
    it('sould install a reference to the entity in the CType of the property', function () {
      should.exist(state.arrays[name].properties.get('slots').CType.entity);
      state.arrays[name].properties.get('slots').CType.entity.should.equal(state.arrays[entityName]);
    });
  });

  describe('JSON operations', function () {
    var state1 = new State();
    var name = "moments";
    var entityName = name+"slots";
    state1.declare(name, CArray.declare([{moment: 'string'}], {slots: CSet.declare('int')}));
    var json = state1.toJSON();
    var state2 = State.fromJSON(json);

    it('should add the array to the arrays map with given name', function () {
      state2.arrays.should.have.property(name);
    });
    it('should install reference of self in cArray', function () {
      state2.arrays[name].state.should.equal(state2);
    });
    it('should install reference of name in cArray', function () {
      state2.arrays[name].name.should.equal(name);
    });
    it('should add an entity for the slot property with name <array.name><slot.name>', function () {
      should.exist(state2.arrays[entityName]);
      state2.arrays[entityName].should.be.an.instanceof(CEntity);
    });
    it('sould install a reference to the entity in the CType of the property', function () {
      should.exist(state2.arrays[name].properties.get('slots').CType.entity);
      state2.arrays[name].properties.get('slots').CType.entity.should.equal(state2.arrays[entityName]);
    });
  });

  describe('Retrieving a CSet instance for a particular index', function () {
    var state = new State();
    var name = "moments";
    var entityName = name+"slots";
    var CSetDecl = CSet.declare('int');
    state.declare(name, CArray.declare([{moment: 'string'}], {slots: CSetDecl}));
    var set = state.get(name).get('now').get('slots');

    it('should return an instance of the declared CSet', function () {
      should.exist(set);
      set.should.be.an.instanceof(CSetDecl);
    });

    it('should have a type property pointing to the type of the instance', function () {
      should.exist(set.type);
      set.type.should.equal(CSetDecl);
    });

  });

  describe('.add(element)', function () {
    var state = new State();
    var name = "moments";
    var entityName = name+"slots";
    var CSetDecl = CSet.declare('int');
    state.declare(name, CArray.declare([{moment: 'string'}, {slot: 'int'}], {slots: CSetDecl}));
    var set = state.get(name).get('now', 1).get('slots');
    var entity = state.get(entityName);
    set.add(1);

    it('should create an entity in the dedicated CSet Entity with index [entryIndex, element]', function () {
      var entry = entity.get('now', 1);
      should.exist(entry);
    });
  });

  describe('.contains(element)', function () {
    var state = new State();
    var name = "moments";
    var entityName = name+"slots";
    var CSetDecl = CSet.declare('int');
    state.declare(name, CArray.declare([{moment: 'string'}, {time: 'int'}], {slots: CSetDecl}));
    var set = state.get(name).get('now', 2).get('slots');
    var entity = state.get(entityName);
    set.add(1);

    it('should return false if element has not been added yet', function () {
      set.contains(2).should.equal(false);
    });

    it('should return true if element has been added', function () {
      set.contains(1).should.equal(true);
      set.add(2);
      set.contains(2).should.equal(true);
    });
  });

  describe('.remove(element)', function () {
    var state = new State();
    var name = "moments";
    var entityName = name+"slots";
    var CSetDecl = CSet.declare('int');
    state.declare(name, CArray.declare([{moment: 'string'}, {time: 'int'}], {slots: CSetDecl}));
    var set = state.get(name).get('now', 2).get('slots');
    var entity = state.get(entityName);
    set.add(1);
    it('should remove the element from the set', function () {
      set.contains(1).should.equal(true);
      set.remove(1);
      set.contains(1).should.equal(false);
    });


  });

  describe('subsequent add/delete of same element', function () {
    var state = new State();
    var name = "moments";
    var entityName = name+"slots";
    var CSetDecl = CSet.declare('int');
    state.declare(name, CArray.declare([{moment: 'string'}, {time: 'int'}], {slots: CSetDecl}));
    var set = state.get(name).get('now', 2).get('slots');
    var entity = state.get(entityName);
    it('should keeps its semantics', function () {
      set.contains(1).should.equal(false);
      set.add(1);
      state.print();
      set.contains(1).should.equal(true);
      set.remove(1);
      set.contains(1).should.equal(false);
      set.add(1);
      set.contains(1).should.equal(true);
    });
  });
});
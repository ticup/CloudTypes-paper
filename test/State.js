var State     = require('./extensions/State');
var CloudType = require('../shared/CloudType');
var CArray    = require('../shared/CArray');
var CEntity   = require('../shared/CEntity');
var Property  = require('../shared/Property');
var CInt      = require('./extensions/CInt');
var should    = require('should');
var stubs     = require('./stubs');
var util      = require('util');

describe('State', function () {
  describe('#new()', function () {
    var state = new State();
    it('should create a new State object', function () {
      state.should.be.an.instanceOf(State);
    });
    it('should have an arrays property', function () {
      state.should.have.property('arrays');
      state.arrays.should.be.an.instanceof(Object);
    });
  });

  describe('#new(arrays)', function () {
    var arrays = {};
    var state = new State(arrays);
    it('should create a new State object', function () {
      state.should.be.an.instanceOf(State);
    });
    it('should have given arrays property', function () {
      state.should.have.property('arrays');
      state.arrays.should.equal(arrays);
    });
  });

  describe('#fromJSON(json)', function () {
    var states = stubs.states.map(function (json) {
      return [json, State.fromJSON(json)];
    });
    it('should create a new State object for all stubs', function () {
      states.forEach(function (result) {
        var json = result[0];
        var state = result[1];
        state.should.be.an.instanceOf(State);
      });
    });
    it('should create an Array for all arrays in stubs', function () {
      states.forEach(function (result) {
        var json = result[0];
        var state = result[1];
        Object.keys(json.arrays).forEach(function (name) {
          state.arrays.should.have.property(name);
        });
      });
    });
  });

  describe('.toJSON()', function () {
    var state = State.fromJSON(stubs.stateUnchanged);
    var json  = state.toJSON();
    it('should put the object in JSON representation', function () {
      should.exist(json);
      json.should.eql(stubs.stateUnchanged);
    });
    it('should be complementary with fromJSON for all stubs', function () {
      stubs.states.map(function (json) {
        json.should.eql(State.fromJSON(json).toJSON());
      });
    });
  });

  describe('.declare(name, cArray) (declare CArray/CEntity)', function () {
    var state = new State();
    var name = "Grocery";
    state.declare(name, CArray.fromJSON(stubs.groceryChanged));
    it('should add the array to the arrays map with given name', function () {
       state.arrays.should.have.property(name);
    });
    it('should install reference of self in cArray', function () {
      state.arrays[name].state.should.equal(state);
    });
    it('should install reference of name in cArray', function () {
      state.arrays[name].name.should.equal(name);
    });
  });

  describe('.declare(name, CloudType) (declare global CloudType)', function () {
    var state = new State();
    var counter = state.get("counter");
    state.declare("counter", CInt);

    describe('proxy CArray', function () {
      var proxyArray = state.arrays["counter"];
      var property = proxyArray.getProperty('value');
      it('should be created', function () {
        should.exist(proxyArray);
        proxyArray.should.be.an.instanceof(CArray);
      });

      it('should have a value property', function () {
        should.exist(property);
        property.should.be.an.instanceof(Property);
      });

      describe('value property .get()', function () {
        var cType = property.get();
        var cType2 = property.get();
        it('should return CloudType', function () {
          should.exist(cType);
          cType.should.be.an.instanceof(CInt);
        });
        it('should always return the same CloudType', function () {
          cType.should.equal(cType2);
        });
      });

    });
  });

  describe('.get(cArrayName)', function () {
    var state = new State();
    var name = "Grocery";
    var array1 = CArray.fromJSON(stubs.groceryChanged);
    state.declare(name, array1);
    var array2 = state.get(name);
    it('should return the declared CArray', function () {
      should.exist(array2);
      array1.should.equal(array2);
    });
  });

  describe('.get(cEntityName)', function () {
    var state = new State();
    var name = "Customer";
    var array1 = CEntity.fromJSON(stubs.customerChanged);
    state.declare(name, array1);
    var array2 = state.get(name);
    it('should return the declared CArray', function () {
      should.exist(array2);
      array1.should.equal(array2);
    });
  });

  describe('.get(globalName)', function () {
    var state = new State();
    var name = "counter";
    var cType = CInt;
    state.declare(name, cType);
    var cType2 = state.get(name);
    it('should return the global CloudType which is not the same object as was given!', function () {
      should.exist(cType2);
      cType2.should.be.an.instanceof(CInt);
      cType2.should.not.equal(cType);
    });
  });

  describe('.getProperty(propertyName)', function () {
    var state1 = State.fromJSON(stubs.stateUnchanged);
    var state2 = State.fromJSON(stubs.stateUnchanged);

    var property1 = state1.arrays.Grocery.getProperty('toBuy');
    var property2 = state2.getProperty(property1);
    it('should retrieve the property with that name', function () {
      should.exist(property2);
      property2.should.be.an.instanceOf(Property);
    });
  });

  describe('.forEachProperty(callback)', function () {
    var state1 = State.fromJSON(stubs.stateUnchanged);
    var ctr = 0;
    var total = 0;
    it('should call the callback for each property', function () {
      state1.forEachProperty(function (property) {
        property.should.be.an.instanceof(Property);
        ctr++
      });
      Object.keys(stubs.stateUnchanged.arrays).forEach(function (name) {
        var array = stubs.stateUnchanged.arrays[name];
        total += array.properties.length;
      });
      ctr.should.equal(total);
    });
  });

  describe('.join(state)' ,function () {
    var state1 = State.fromJSON(stubs.stateUnchanged);
    var state2 = State.fromJSON(stubs.stateChanged);
    var jState = State.fromJSON(stubs.stateUnchanged);
    jState.join(state2);
    it('should join the given state into its own state (results in own state)', function () {
      jState.isJoinOf(state1, state2);
    });
  });

  describe('.joinIn(state)', function () {
    var state1 = State.fromJSON(stubs.stateUnchanged);
    var state2 = State.fromJSON(stubs.stateChanged);
    var jState = State.fromJSON(stubs.stateChanged);
    state1.joinIn(jState);

    it('should join the given state into its own state (result in the other state)', function () {
      jState.isJoinOf(state1, state2);
    });
  });

  describe('.fork()', function () {
    var state = State.fromJSON(stubs.stateChanged);
    var fork  = state.fork();
    it('should create a new State', function () {
      fork.should.be.instanceOf(State);
      fork.should.not.be.equal(state);
    });

    it('should return a forked state of given state', function () {
      fork.isForkOf(state);
    });

    it('should return initial state from initial state', function () {
      state = State.fromJSON(stubs.stateUnchanged);
      fork  = state.fork();
      state.isEqual(fork);
    });
  });

  describe('.replaceBy(state)', function () {
    var state1  = State.fromJSON(stubs.stateUnchanged);
    var state2  = State.fromJSON(stubs.stateChanged);
    state1.replaceBy(state2);
    it('should change its own state to given state', function () {
      state1.isEqual(state2);
    });
  });

});
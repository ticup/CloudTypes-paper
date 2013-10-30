var State     = require('./extensions/State');
var CloudType = require('../shared/CloudType');
var CArray    = require('../shared/CArray');
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
        json.arrays.forEach(function (cArrayJson) {
          state.arrays.should.have.property(cArrayJson.name);
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

  describe('.declare(cArray)', function () {
    var state = new State();
    state.declare(CArray.fromJSON(stubs.groceryChanged));
    it('should add the array to the arrays map', function () {
       state.arrays.should.have.property(stubs.groceryUnchanged.name);
    });
    it('should install reference of self in cArray', function () {
      state.arrays[stubs.groceryUnchanged.name].state.should.equal(state);
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
      stubs.stateUnchanged.arrays.forEach(function (array) {
        total += array.properties.length;
      });
      ctr.should.equal(total);
    });
  });

  describe('.join(state)' ,function () {
    var state1 = State.fromJSON(stubs.stateUnchanged);
    var state2 = State.fromJSON(stubs.stateChanged);
    var jState = State.fromJSON(stubs.stateUnchanged);
    console.log("JOIN");
    console.log(state1.arrays.Customer.properties.properties.name.cArray);
    jState.join(state2);
    it('should join the given state into its own state (results in own state)', function () {
      jState.isJoinOf(state1, state2);
    });
  });

  describe('.joinIn(state)', function () {
    var state1 = State.fromJSON(stubs.stateUnchanged);
    var state2 = State.fromJSON(stubs.stateChanged);
    var jState = State.fromJSON(stubs.stateUnchanged);
    state2.joinIn(jState);
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
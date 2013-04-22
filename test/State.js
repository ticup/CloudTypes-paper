var State     = require('./extensions/State');
var CloudType = require('../shared/CloudType');
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
    it('should have a map', function () {
      state.should.have.property('map');
    });
  });

  describe('#new(map)', function () {
    var map   = stubs.unchanged;
    var state = new State(map);
    it('should create a new State object', function () {
      state.should.be.an.instanceOf(State);
    });
    it('should have given map property', function () {
      state.should.have.property('map');
      state.map.should.equal(map);
    });
  });

  describe('#fromJSON(map)', function () {
    var state = State.fromJSON(stubs.unchanged);
    it('should create a new State object', function () {
      state.should.be.an.instanceOf(State);
    });
    it('should have the types in the map', function () {
      Object.keys(stubs.unchanged).forEach(function (name) {
        state.map.should.have.property(name);
      });
    });
  });

  describe('.toJSON()', function () {
    var state = State.fromJSON(stubs.unchanged);
    var map   = state.toJSON();
    it('should put the object in JSON representation', function () {
      Object.keys(stubs.unchanged).forEach(function (name) {
        map.should.have.property(name);
        map[name].toString().should.equal(stubs.unchanged[name].toString());
      });
    });
  });

  describe('.get()', function () {
    var state = State.fromJSON(stubs.unchanged);
    it('should return the type with that name', function () {
      Object.keys(stubs.unchanged).forEach(function (name) {
        var type = CloudType.fromJSON(stubs.unchanged[name]);
        state.get(name).toString().should.equal(type.toString());
      });
    });
  });

  describe('.join(state)' ,function () {
    var state1 = State.fromJSON(stubs.unchanged);
    var state2 = State.fromJSON(stubs.changed);
    var jState = State.fromJSON(stubs.unchanged);
    jState.join(state2);
    it('should join the given state into its own state, result in own state', function () {
      jState.isJoinOf(state1, state2);
    });
  });

  describe('.joinIn(state)', function () {
    var state1 = State.fromJSON(stubs.changed);
    var state2 = State.fromJSON(stubs.unchanged);
    var jState = State.fromJSON(stubs.unchanged);
    state1.joinIn(jState);
    it('should join the given state into its own state, result in the other state', function () {
      jState.isJoinOf(state2, state1);
    });
  });

  describe('.fork()', function () {
    var state = State.fromJSON(stubs.changed);
    var fork  = state.fork();
    it('should create a new State', function () {
      fork.should.be.instanceOf(State);
      fork.should.not.be.equal(state);
    });

    it('should return a forked state of given state', function () {
      fork.isForkOf(state);
    });

    it('should return initial state from initial state', function () {
      state = State.fromJSON(stubs.unchanged);
      fork  = state.fork();
      state.isEqual(fork);
    });
  });

  describe('.applyFork()', function () {
    var state = State.fromJSON(stubs.unchanged);
    var fork  = State.fromJSON(stubs.unchanged);
    fork.applyFork();
    it('should return a forked state of given state', function () {
      fork.isForkOf(state);
    });
  });

});
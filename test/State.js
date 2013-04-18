var State     = require('./extensions/State');
var CInt      = require('./extensions/CInt');
var should    = require('should');
var stubs     = require('./stubs');

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
    var map = {foo: 'bar'};
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
    var cint = new CInt(10);
    var map = {foo: cint.toJSON(), bar: cint.toJSON()};
    var state = State.fromJSON(map);
    it('should create a new State object', function () {
      state.should.be.an.instanceOf(State);
    });
    it('should have the types in the map', function () {
      state.map.should.have.property('foo');
      state.map.should.have.property('bar');
    });
  });

  describe('.toJSON()', function () {
    var map = {foo: (new CInt(10)).toJSON(), bar: (new CInt(20)).toJSON()};
    var state = State.fromJSON(map);
    var map2 = state.toJSON();
    it('should put the object in JSON representation', function () {
      map2.should.have.property('foo');
      map2.foo.toString().should.equal((new CInt(10)).toJSON().toString());
      map2.should.have.property('bar');
      map2.bar.toString().should.equal((new CInt(20)).toJSON().toString());
    });
  });

  describe('.get()', function () {
    var map = {foo: (new CInt(10)).toJSON(), bar: (new CInt(20)).toJSON()};
    var state = State.fromJSON(map);
    it('should return the type with that name', function () {
      state.get('foo').should.be.an.instanceOf(CInt);
      state.get('bar').should.be.an.instanceOf(CInt);
      state.get('foo').get().should.equal(10);
      state.get('bar').get().should.equal(20);
    });
  });

  describe('.join(state)' ,function () {
    var map1 = {foo: (new CInt(10)).toJSON(), bar: (new CInt(20)).toJSON()};
    var cint1 = new CInt();
    var cint2 = new CInt();
    cint1.set(1);
    cint2.set(2);
    var map2 = {foo: cint1.toJSON(), bar: cint2.toJSON()};
    var state1 = State.fromJSON(map1);
    var state2 = State.fromJSON(map2);
    var jState = State.fromJSON(map1);
    jState.join(state2);


    it('should join the given state into its own state, result in own state', function () {
      jState.isJoinOf(state1, state2).should.equal(true);
    });
  });

  describe('.joinIn(state)', function () {
    var map1 = {foo: (new CInt(10)).toJSON(), bar: (new CInt(20)).toJSON()};
    var cint = new CInt();
    cint.set(1);
    var map2 = {foo: cint.toJSON(), bar: (new CInt(2)).toJSON()};
    var state1 = State.fromJSON(map1);
    var state2 = State.fromJSON(map2);
    var jState = State.fromJSON(map2);
    state1.joinIn(jState);

    it('should join the given state into its own state, result in the other state', function () {
      jState.isJoinOf(state1, state2).should.equal(true);
    });
  });

  describe('.fork()', function () {
    var cint1 = new CInt();
    var cint2 = new CInt();
    cint1.set(1);
    cint2.add(2);
    var map = {foo: cint1.toJSON(), bar: cint2.toJSON()};
    var state = State.fromJSON(map);
    var fork = state.fork();

    it('should create a new State', function () {
      fork.should.be.instanceOf(State);
      fork.should.not.be.equal(state);
    });

    it('should return a forked state of given state', function () {
      fork.isForkOf(state).should.equal(true);
    });

    it('should return initial state from initial state', function () {
      var initState = State.fromJSON(stubs.unchanged);
      var f = initState.fork();
      initState.isEqual(f);
    });
  });

});
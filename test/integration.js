// var jsdom      = require('jsdom');
var should      = require('should');
var fs          = require('fs');
var http        = require('http');
var util        = require('util');

var State       = require('./extensions/State');
var CArray      = require('../shared/CArray');
var CEntity     = require('../shared/CEntity');
var ServerState = require('../server/State');
var CloudType   = require('../shared/CloudType');
var CInt        = require('./extensions/CInt');
var CSet        = require('./extensions/CInt');

var CloudTypeServer = require('../server/main.js');
var stubs = require('./stubs');

var CloudTypes = require('../client/main.js');
var CloudTypeClient = require('../client/CloudTypeClient.js');

var host = 'http://localhost';
var port = 8090;

var clientOptions = {
  transports: ['websocket'],
  'force new connection': true
};

function createClient(callback) {
  var client = CloudTypes.createClient();
  client.connect(host + ':' + port, clientOptions, function (state) {
    callback(client, state);
  });
}

function applyChanges(state) {
  var changed = State.fromJSON(stubs.stateChanged);
  state.replaceBy(changed);
}

function waitForTransport(callback) {
  setTimeout(callback, 200);
}

describe('Integration #', function () {
  var server, serverState;

  beforeEach(function () {
    serverState = ServerState.fromJSON(stubs.stateUnchanged);
    server = CloudTypeServer.createServer(serverState);
    server.publish(8090);
  });

  afterEach(function () {
    server.close();
  });

  describe('Client API', function () {
    describe('.createClient()', function () {
      var client = CloudTypes.createClient();

      it('should create a CloudTypeClient object', function () {
        should.exist(client);
        client.should.be.an.instanceOf(CloudTypeClient);
      });
    });

    describe('CloudTypeClient', function () {

      describe('.connect(host:port, callback)', function () {
        var client = CloudTypes.createClient();
        it('should call callback with state when connected to server', function (done) {
          client.connect(host + ':' + port, function (state) {
            should.exist(state);
            client.close();
            done();
          });
        });
      });

      describe('.connect(host:port, options, callback)', function () {
        var client = CloudTypes.createClient();
        it('should call callback when connected to server', function (done) {
          client.connect(host + ':' + port, clientOptions, function () {
            client.close();
            done();
          });
        });
      });
    });
  });

  describe('when connected to server', function () {

    it('should have same state as server', function (done) {
      createClient(function (client, state) {
        state.isEqual(server.state);
        client.close();
        done();
      });
    });

    it('should have forked state of server', function (done) {
      createClient(function (client, state) {
        state.isForkOf(server.state);
        client.close();
        done();
      });
    });

  });

  describe('synchronising changes with yield (stubs.unchangedState -> stubs.changedState) (scenario 1)', function () {

    it('should give eventual consistency with yield (this test could fail if too slow!)', function (done) {
      createClient(function (client1, state1) {
        // client1 state: unchanged -> changed
        applyChanges(state1);
        createClient(function (client2, state2) {
          (function () { state1.isConsistent(server.state); }).should.throwError();
          state2.isConsistent(server.state);

          // yield1 for client1: sends revision client1 -> server
          state1.yield();
          (function () { state1.isConsistent(server.state); }).should.throwError();

          // server synced with client1 after some ms
          waitForTransport(function () {
            server.state.isConsistent(state1);
            (function () { state2.isConsistent(server.state); }).should.throwError();

            // yield1 for client2: sends changes from client2 -> server
            state2.yield();

            // yield2 for client2: does nothing, because it has not received revision of server yet
            state2.yield();
            (function () { state2.isConsistent(server.state); }).should.throwError();

            waitForTransport(function () {
              (function () { state2.isConsistent(server.state); }).should.throwError();

              // yield3 for client2: should have received revision of server by now
              // and thus merges server state with client state. Since no changes are
              // made to client2 in the meantime, states should be consistent.
              state2.yield(); // (this case of yield is synchronous)

              // at this point all states are consistent again.
              state2.isConsistent(server.state);
              state1.isConsistent(server.state);
              client1.close();
              client2.close();
              done();
            });
          });
        });
      });
    });
  });

  describe('synchronising changes with yield (stubs.unchangedState -> stubs.changedState) (scenario 2)', function () {

    it('should give eventual consistency with yield (this test could fail if too slow!)', function (done) {
      createClient(function (client1, state1) {
        // replace the state by a state with the applied
        applyChanges(state1);
        createClient(function (client2, state2) {
          (function () { state1.isConsistent(server.state); }).should.throwError();
          state2.isConsistent(server.state);

          // yield1 for client1: sends revision client1 -> server
          state1.yield();
          (function () { state1.isConsistent(server.state); }).should.throwError();

          // server synced with client1 after some ms
          setTimeout(function () {
            state1.isConsistent(server.state);
            (function () { state2.isConsistent(server.state); }).should.throwError();

            // yield1 for client2: sends changes from client2 -> server
            state2.yield();

            // yield2 for client2: does nothing, because it has not received revision of server yet
            state2.yield();
            (function () { state2.isConsistent(server.state); }).should.throwError();

            setTimeout(function () {
              (function () { state2.isConsistent(server.state); }).should.throwError();

              // yield3 for client2: should have received revision of server by now
              // and thus merges server state with client state. Since no changes are
              // made to client2 in the meantime, states should be consistent.
              state2.yield(); // (this case of yield is synchronous)

              // at this point all states are consistent again.
              state2.isConsistent(server.state);
              state2.isConsistent(server.state);
              client1.close();
              client2.close();
              done();
            }, 500);
          }, 500);
        });
      });
    });
  });

  describe('.flush(callback)', function () {
    describe('syncing 1 client with server', function () {
      it('should call callback when synced with server', function (done) {
        createClient(function (client1, state1) {
          applyChanges(state1);
          state1.flush(function (error) {
            should.not.exist(error);
            state1.isConsistent(server.state);
            client1.close();
            done();
          });
        });
      });
    });
    describe('syncing 2 clients through server', function () {
      it('should call callback when synced with server', function (done) {
        createClient(function (client1, state1) {
          createClient(function (client2, state2) {
            applyChanges(state1);
            state1.flush(function (error) {
              should.not.exist(error);
              state2.flush(function (error) {
                should.not.exist(error);
                state1.isConsistent(server.state);
                state2.isConsistent(server.state);
                client1.close();
                client2.close();
                done();
              });
            });
          });
        });
      });
    });
  });

  describe('complete client/server usage scenario', function () {
    it('should be eventually consistent', function (done) {
      var array, client1, client2, carray, entry;
      server.close();

      // server code
      server = CloudTypeServer.createServer();
      array = CArray.declare([{name: "string"}, {buyer: "string"}], {toBuy: "CInt", fromShop: "CString"});
      server.declare("Product", array);
      server.publish(8001);

      // client setup code
      client1 = CloudTypes.createClient();
      client1.connect(host + ':' + 8001, clientOptions, function (state1) {

        // client use data
        carray = state1.get("Product");
        should.exist(carray);
        entry = carray.get("Napkins", "Mom");
        should.exist(entry);
        should.exist(entry.get('toBuy'));
        entry.get('toBuy').set(10);
        entry.get('fromShop').setIfEmpty("Carrefour");

        // sync with server
        state1.yield();

        setTimeout(function () {
          server.state.isConsistent(state1);
          client1.close();
          done();
        }, 200)
      });

    });

  });

  describe('CEntity client/server usage scenario', function () {
    it('should be eventually consistent', function (done) {
      var array, client1, client2, carray, entry;
      server.close();

      // server code
      server = CloudTypeServer.createServer();
      server.declare("Customer", CEntity.declare([], {name: "CString"}));
      server.declare("Order", CEntity.declare([{customer: "Customer"}], {price: "CInt"}));
      server.publish(8001);

      // client setup code
      client1 = CloudTypes.createClient();
      client1.connect(host + ':' + 8001, clientOptions, function (state1) {

        // client use data
        Customer = state1.get("Customer");
        Order    = state1.get("Order");
        should.exist(Customer);
        should.exist(Order);
        var customer = Customer.create();
        should.exist(customer);
        customer.get('name').set("Jerry");

        // sync with server
        state1.yield();

        setTimeout(function () {
          server.state.isConsistent(state1);
          server.state.get("Customer").all().length.should.equal(1);
          console.log('FOO');
          server.state.print();
          console.log(server.state.get("Customer").all()[0]);
          server.state.get("Customer").all()[0].get('name').get().should.equal("Jerry");

          customer.delete();
          (function () { server.state.isConsistent(state1); }).should.throwError();
          state1.yield();
          state1.yield();
          setTimeout(function () {
            server.state.isConsistent(state1);
            done();
          }, 200);
      }, 200);
      });

    });
  });

  describe('Global CInt client/server semantic scenario:', function () {
    it('should give eventual consistency for all states (this test could fail if too slow!)', function (done) {
      var counter;
      server.close();

      // server code
      server = CloudTypeServer.createServer();
      server.declare('counter', CInt);
      server.publish(port);
      counter = server.state.get('counter');

      // clients server interplay
      createClient(function (client1, state1) {
        var counter1 = state1.get('counter');
        should.exist(counter1);
        counter1.set(100);
        counter1.get().should.equal(100);

        createClient(function (client2, state2) {
          var counter2 = state2.get('counter');
          counter2.get().should.equal(0);
          counter2.add(50);

          // yield 1 for client1: sends revision client1 -> server
          state1.yield();

          // server synced with client1 after some ms
          waitForTransport(function () {
            counter.get().should.equal(100);

            // yield 1 for client2: sends changes from client2 -> server
            state2.yield();

            waitForTransport(function () {
              counter.get().should.equal(150);

              // yield 2 for client 1: merges revision of server
              // note: this revision was sent before client2 sent its revision, therefore
              // another 2 yields will be necessary for complete synchronization.
              state1.yield();
              counter1.get().should.equal(100);

              // yield2 for client2: merge revision of server into client2.
              state2.yield();
              counter2.get().should.equal(150);

              state1.yield();

              waitForTransport(function () {
                state1.yield();
                counter1.get().should.equal(150);

                // at this point all states are consistent again.
                state2.isConsistent(server.state);
                state2.isConsistent(server.state);
                client1.close();
                client2.close();
                done();
              });
            });
          });
        });
      });
    });
  });

  describe('Global CInt client/server semantic scenario:', function () {
    it('should give eventual consistency for all states (this test could fail if too slow!)', function (done) {
      var counter;
      server.close();

      // server code
      server = CloudTypeServer.createServer();
      server.declare('counter', CInt);
      server.publish(port);
      counter = server.state.get('counter');

      // clients/server interplay
      createClient(function (client1, state1) {
        var counter1 = state1.get('counter');
        counter1.set(100);
        counter1.get().should.equal(100);

        createClient(function (client2, state2) {
          var counter2 = state2.get('counter');
          counter2.get().should.equal(0);
          counter2.add(50);

          // yield1 for client2: sends revision client2 -> server
          state2.yield();

          // server synced with client2 after some ms
          waitForTransport(function () {
            counter.get().should.equal(50);

            // yield1 for client1: sends changes from client1 -> server
            state1.yield();

            // yield2 for client2: merges revision of server with client2
            state2.yield();
            // still 50, because revision was sent before merge with client1.
            counter2.get().should.equal(50);

            waitForTransport(function () {
              // the set of client1 has overwritten the add of client2.
              counter.get().should.equal(100);

              // nothing changes for client1 when merged
              state1.yield();
              counter1.get().should.equal(100);

              state2.yield();

              waitForTransport(function () {
                state2.yield();
                counter2.get().should.equal(100);

                // at this point all states are consistent again.
                state2.isConsistent(server.state);
                state1.isConsistent(server.state);
                client1.close();
                client2.close();
                done();
              });
            });
          });
        });
      });
    });
  });
});
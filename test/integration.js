// var jsdom      = require('jsdom');
var should     = require('should');
var fs         = require('fs');
var Browser    = require('zombie');
var http       = require('http');
var util       = require('util');

var State      = require('./extensions/State');
var CloudType  = require('../shared/CloudType');
var CInt       = require('./extensions/CInt');

var CloudTypeServer = require('../server/main.js');
var CloudTypeClient = require('../server/main.js');
var stubs = require('./stubs');

var bundle = fs.readFileSync('./test/client/bundle.js').toString();
var index  = "<html><head></head><body></body><script src='bundle.js'></script></html>";

var host = 'http://localhost';
var port = 8090;

function createHttpServer(port) {
  // http server
  var app = http.createServer(function (req, res) {
    if (req.url == '/bundle.js') {
      res.writeHead(200, {'Content-Type': 'text/javascript'});
      res.end(bundle);
    } else {
      res.writeHead(200, {'Content-Type': 'text/plain'});
      res.end(index);
    }
  });
  app.listen(port);
  return app;
}


function createBrowser(port, callback) {
  var browser = new Browser();
  browser.visit(host + ':' + port, function () {
    callback(browser.window);
  });
}


function createClient(callback) {
  createBrowser(port, function (window) {
    var client = window.CloudTypes.createClient();
    client.listen(host, function () {
      callback(window, client);
    });
  });
}

function applyChanges(client) {
  client.state.init(stubs.changed, client.client);
}


describe('Integration #', function () {
  var httpServer, server;

  beforeEach(function () {
    httpServer = createHttpServer(port);
    server = CloudTypeServer.createServer();

    Object.keys(stubs.unchanged).forEach(function (name) {
      server.declare(name, CloudType.fromJSON(stubs.unchanged[name]));
    });

    // foo = new CInt();
    // bar = new CInt();

    // server.declare('foo', foo);
    // server.declare('bar', bar);

    server.publish(httpServer);
  });

  afterEach(function () {
    server.close();
  });

  it('should have a global "io"', function (done) {
    createBrowser(port, function (window) {
      window.should.have.property('io');
      done();
    });
  });

  it('should have a global "CloudTypes"', function (done) {
    createBrowser(port, function (window) {
      window.should.have.property('CloudTypes');
      done();
    });
    it('should have a property "createClient"', function (done) {
      window.cloudTypes.should.have.property('createClient');
      done();
    });
  });

  it('should call the callback after listening', function (done) {
    createBrowser(port, function (window) {
      var client = window.CloudTypes.createClient();
      client.listen(host, function () {
        client.close();
        done();
      });
    });
  });

  it('should have same state as server', function (done) {
    createClient(function (window, client) {
      client.state.isEqual(server.state);
      client.close();
      done();
    });
  });

  it('should have forked state of server', function (done) {
    createClient(function (window, client) {
      client.state.isForkOf(server.state);
      client.close();
      done();
    });
  });

  it('should give eventual consistency with yield (tested w/ all changes in stubs.js) on one client (1) (this test could fail if too slow!)', function (done) {
    createClient(function (window1, client1) {
      // replace the state by a state with the applied
      applyChanges(client1);
      createClient(function (window2, client2) {
        (function () { client1.state.isConsistent(server.state); }).should.throwError();
        client2.state.isConsistent(server.state);

        // yield1 for client1: sends revision client1 -> server
        client1.yield();
        (function () { client1.state.isConsistent(server.state); }).should.throwError();

        // server synced with client1 after some ms
        setTimeout(function () {
          client1.state.isConsistent(server.state);
          (function () { client2.state.isConsistent(server.state); }).should.throwError();

          // yield1 for client2: sends changes from client2 -> server
          client2.yield();

          // yield2 for client2: does nothing, because it has not received revision of server yet
          client2.yield();
          (function () { client2.state.isConsistent(server.state); }).should.throwError();

          setTimeout(function () {
            (function () { client2.state.isConsistent(server.state); }).should.throwError();

            // yield3 for client2: should have received revision of server by now
            // and thus merges server state with client state. Since no changes are
            // made to client2 in the meantime, states should be consistent.
            client2.yield(); // (this case of yield is synchronous)

            // at this point all states are consistent again.
            client2.state.isConsistent(server.state);
            client1.state.isConsistent(server.state);
            client1.close();
            client2.close();
            done();
          }, 200);
        }, 200);
      });
    });
  });

  it('should give eventual consistency with yield (tested w/ all changes in stubs.js) on one client (2) (this test could fail if too slow!)', function (done) {
    createClient(function (window1, client1) {
      // replace the state by a state with the applied
      applyChanges(client1);
      createClient(function (window2, client2) {
        (function () { client1.state.isConsistent(server.state); }).should.throwError();
        client2.state.isConsistent(server.state);

        // yield1 for client1: sends revision client1 -> server
        client1.yield();
        (function () { client1.state.isConsistent(server.state); }).should.throwError();

        // server synced with client1 after some ms
        setTimeout(function () {
          client1.state.isConsistent(server.state);
          (function () { client2.state.isConsistent(server.state); }).should.throwError();

          // yield1 for client2: sends changes from client2 -> server
          client2.yield();

          // yield2 for client2: does nothing, because it has not received revision of server yet
          client2.yield();
          (function () { client2.state.isConsistent(server.state); }).should.throwError();

          setTimeout(function () {
            (function () { client2.state.isConsistent(server.state); }).should.throwError();

            // yield3 for client2: should have received revision of server by now
            // and thus merges server state with client state. Since no changes are
            // made to client2 in the meantime, states should be consistent.
            client2.yield(); // (this case of yield is synchronous)

            // at this point all states are consistent again.
            client2.state.isConsistent(server.state);
            client1.state.isConsistent(server.state);
            client1.close();
            client2.close();
            done();
          }, 200);
        }, 200);
      });
    });
  });

  it('flush should block until synced with server (1)', function (done) {
    var cint = server.get('cint');
    createClient(function (window1, client1) {
      applyChanges(client1);
      console.log('before flush');
      console.log(util.inspect(client1.state.map));
      client1.flush(function (error) {
        should.not.exist(error);
        console.log('after flush');
        console.log(util.inspect(client1.state.map));
        client1.state.isConsistent(server.state);
        client1.close();
        done();
      });
    });
  });

  it('flush should block until synced with server (2)', function (done) {
    var cint = server.get('cint');
    createClient(function (window1, client1) {
      createClient(function (window2, client2) {
        applyChanges(client1);
        client1.flush(function (error) {
          client2.flush(function (error) {
            client1.state.isConsistent(server.state);
            client2.state.isConsistent(server.state);
            client1.close();
            client2.close();
            done();
          });
        });
      });
    });
  });




  describe('Specific Type Semantic Scenarios:', function () {

    it('should give eventual consistency for all states (2) (this test could fail if too slow!)', function (done) {
      var cint = server.get('cint');
      createClient(function (window1, client1) {
        var cintC1 = client1.get('cint');
        cintC1.set(100);
        cintC1.get().should.equal(100);

        createClient(function (window2, client2) {
          var cintC2 = client2.get('cint');
          cintC2.get().should.equal(0);
          cintC2.add(50);

          // yield1 for client1: sends revision client1 -> server
          client1.yield();

          // server synced with client1 after some ms
          setTimeout(function () {
            cint.get().should.equal(100);

            // yield1 for client2: sends changes from client2 -> server
            client2.yield();

            setTimeout(function () {
              cint.get().should.equal(150);

              // yield2 for client1: merges revision of server
              // note: this revision was sent before client2 sent its revision, therefore
              // another 2 yields will be necessary for complete synchronization.
              client1.yield();
              cintC1.get().should.equal(100);

              // yield2 for client2: merge revision of server into client2.
              client2.yield();
              cintC2.get().should.equal(150);

              client1.yield();

              setTimeout(function () {
                client1.yield();
                cintC1.get().should.equal(150);

                // at this point all states are consistent again.
                client2.state.isConsistent(server.state);
                client1.state.isConsistent(server.state);
                client1.close();
                client2.close();
                done();
              }, 200);
            }, 200);
          }, 200);
        });
      });
    });


    it('should give eventual consistency for all states (3) (this test could fail if too slow!)', function (done) {
      var cint = server.get('cint');
      createClient(function (window1, client1) {
        var cintC1 = client1.get('cint');
        cintC1.set(100);
        cintC1.get().should.equal(100);

        createClient(function (window2, client2) {
          var cintC2 = client2.get('cint');
          cintC2.get().should.equal(0);
          cintC2.add(50);

          // yield1 for client2: sends revision client2 -> server
          client2.yield();

          // server synced with client2 after some ms
          setTimeout(function () {
            cint.get().should.equal(50);

            // yield1 for client1: sends changes from client1 -> server
            client1.yield();

            // yield2 for client2: merges revision of server with client2
            client2.yield();
            // still 50, because revision was sent before merge with client1.
            cintC2.get().should.equal(50);

            setTimeout(function () {
              // the set of client1 has overwritten the add of client2.
              cint.get().should.equal(100);

              // nothing changes for client1 when merged
              client1.yield();
              cintC1.get().should.equal(100);

              client2.yield();

              setTimeout(function () {
                client2.yield();
                cintC2.get().should.equal(100);

                // at this point all states are consistent again.
                client2.state.isConsistent(server.state);
                client1.state.isConsistent(server.state);
                client1.close();
                client2.close();
                done();
              }, 200);
            }, 200);
          }, 200);
        });
      });
    });
  });
});
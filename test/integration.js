// var jsdom      = require('jsdom');
// var should     = require('should');
var fs         = require('fs');
var Browser    = require('zombie');
var http       = require('http');
var util       = require('util');

var State      = require('./extensions/State');
var CInt       = require('./extensions/CInt');

var CloudTypeServer = require('../server/main.js');
var CloudTypeClient = require('../server/main.js');


var bundle = fs.readFileSync('./test/client/bundle.js').toString();
var index  = "<html><head></head><body></body><script src='bundle.js'></script></html>";


var host = 'http://localhost';
var port = 8090;
// function createMinClient(port, callback) {
//   jsdom.env({
//     html: host + ':' + port,
//     src: [bundle],
//     done: function (errors, window) {
//       if (errors)
//         throw errors;
//       callback(window);
//     }
//   });
// }

// function createClient(port, callback) {
//   createMinClient(port, function (window) {
//     var c = window.CloudTypes.createClient();
//     c.listen(host, function () { callback(window); });
//   });
// }

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


describe('Integration #', function () {
  var httpServer, server, foo, bar;

  beforeEach(function () {
    httpServer = createHttpServer(port);
    server = CloudTypeServer.createServer();

    foo = new CInt();
    bar = new CInt();

    server.declare('foo', foo);
    server.declare('bar', bar);

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
      client.state.isEqual(server.state).should.equal(true);
      client.close();
      done();
    });
  });

  it('should have forked state of server', function (done) {
    foo.set(100);
    foo.add(2);
    createClient(function (window, client) {
      client.state.isForkOf(server.state).should.equal(true);
      client.close();
      done();
    });
  });

  it('should eventually sync with yield (test could fail if too slow!)', function (done) {
    createClient(function (window1, client1) {
      var foo1 = client1.get('foo');
      foo1.set(100);
      foo1.get().should.equal(100);
      createClient(function (window2, client2) {
        client1.state.isForkOf(server.state).should.equal(false);
        client2.state.isForkOf(server.state).should.equal(true);

        // yield is asynchronous
        client1.yield();
        client1.state.isEqual(server.state).should.equal(false);

        // server synced with client1 after some ms
        setTimeout(function () {
          client1.state.isEqual(server.state).should.equal(true);
          client2.state.isForkOf(server.state).should.equal(false);

          // first yield will send changes from client -> server
          client2.yield();

          // secon yield will do nothing, because it has not received revision of server
          client2.yield();
          client2.state.isForkOf(server.state).should.equal(false);

          setTimeout(function () {
            client2.state.isForkOf(server.state).should.equal(false);

            // client should have received revision of server, calling yield
            // will join states. States should be consistent here, because
            // no changes are made on the client in the meantime.
            client2.yield();

            console.log('server: ' );
            console.log(util.inspect(server.state.map));
            console.log('client: ' );

            console.log(util.inspect(client2.state.map));
            // this yield is synchronous, because no communication is made with the server at this point!
            client2.state.isForkOf(server.state).should.equal(true);

            client1.close();
            client2.close();
          done();

          }, 200);
        }, 200);
      });
    });
  });
  // describe('Scenario 1', function () {
  //   var httpServer = createHttpServer(port);
  //   var server = CloudTypeServer.createServer();

  //   var foo = new CInt();
  //   var bar = new CInt();
  //   server.declare('foo', foo);
  //   server.declare('bar', bar);

  //   server.publish(httpServer);

  //   createClient(function (window, client) {
  //     client.listen(host, function () {

  //       it('should have the same state of server', function () {
  //         client.state.isEqual(server.state).should.equal(true);
  //       });
  //     });
  //   });
  // });
});
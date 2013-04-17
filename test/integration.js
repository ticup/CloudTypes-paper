// var jsdom      = require('jsdom');
// var should     = require('should');
var fs         = require('fs');
var Browser    = require('zombie');
var http       = require('http');
var util       = require('util');

var State      = require('../shared/State');
var semantics  = require('./semantics');

var CloudTypesServer = require('../server/main.js');
var CloudTypesClient = require('../server/main.js');

var CInt = CloudTypesServer.CInt;

var bundle = fs.readFileSync('./client/bundle.js').toString();
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

describe('CloudType Integration #', function () {
  var httpServer = createHttpServer(port);
  var s = CloudTypesServer.createServer();

  var foo = new CInt();
  var bar = new CInt();

  s.declare('foo', foo);
  s.declare('bar', bar);

  s.publish(httpServer);

  foo.set(100);
  foo.add(2);

  describe('Availability: ', function () {
    describe('Creating Client ->', function () {
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
    });
    describe('Connecting Client ->', function () {
      it('should call the callback after listening', function (done) {
        createBrowser(port, function (window) {
          var c = window.CloudTypes.createClient();
          //window.io.connect(host);
          c.listen(host, done);
        });
      });
      it('should have forked state after callback', function (done) {
        createBrowser(port, function (window) {
          var c = window.CloudTypes.createClient();

          c.listen(host, function () {
            semantics.isForkOfState(c.state, s.state).should.equal(true);
            done();
          });
        });
      });
    });
  });
});
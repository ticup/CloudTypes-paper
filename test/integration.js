var jsdom      = require('jsdom');
var should     = require('should');

var State      = require('../shared/State');
var semantics  = require('./semantics');
var CloudTypes = require('../server/main.js');

var CInt = CloudTypes.CInt;

function createMinClient(port, callback) {
  jsdom.env({
    html: 'http://localhost:' + port,
    scripts: ['../client/bundle.js'],
    done: function (errors, window) {
      if (errors)
        throw errors;
      callback(window);
    }
  });
}

function createClient(port, callback) {
  createMinClient(port, function (window) {
    window.CloudTypes.listen('http://localhost', function () { callback(window); });
  });
}

describe('CloudType Integration #', function () {
  var port = 8090;
  var s = CloudTypes.createServer();

  var foo = new CInt();
  var bar = new CInt();

  s.declare('foo', foo);
  s.declare('bar', bar);

  s.publish(port);

  foo.set(100);
  foo.add(2);

  describe('Availability: ', function () {
    describe('Creating Client ->', function () {
      it('should have a global "CloudTypes"', function (done) {
        createMinClient(port, function (window) {
          window.should.have.property('io');
          //window.should.have.property('CloudTypes');
          done();
        });
      });
    });
    describe('Client connected to server', function () {
      // var c = createClient(port, function (window) {
      //   it('should have a CloudTypes global', function () {
      //     window.should.have.property('CloudTypes');
      //   });
      //   it('should have a forked state of the server', function (done) {
          
      //   });
      // });
    });
  });
});
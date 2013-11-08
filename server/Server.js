var IO = require('socket.io');
var util = require('util');
var State = require('../shared/State');
var shortId = require('shortid');
module.exports = Server;

function Server(state) {
  this.state = state;
  this.clients = {};
}

// target: port or http server (default = port 8090)
// staticPath: if given, will serve static files from given path
Server.prototype.open = function (target, staticPath) {
  var self = this;
  var cid  = 0;

  target = target || 8090;

  // setup static file serving
  if (typeof staticPath === 'string') {
    var file = new (require('node-static').Server)(staticPath);
    console.log('#### Static File Server Added To : ' + target + ' #### ')
    console.log("-> from path: " + staticPath);
    target = require('http').createServer(function (req, res) {
      req.addListener('end', function () {
        file.serve(req, res);
      }).resume();
    }).listen(target);
  }

  // open websockets
  var io = IO.listen(target);
  this.io = io;
  io.set('log level', 1);
  // set up listeners
  io.sockets.on('connection', function (socket) {

    // Initial connect: initialize client with a uid, cid and a fork of current state
    socket.on('init', function (initClient) {
      initClient({ uid: self.generateUID(), cid: cid++, state: self.state.fork() });
    });

    socket.on('YieldPush', function (json, yieldPull) {
      if (!self.exists(json.uid))
        return yieldPull("unrecognized client");
//      console.log('received YieldPush on server: ');
      var state = State.fromJSON(json.state);
//      state.print();
//      console.log("JOINING WITH SERVER: ");
//      self.state.print();
      self.state.join(state);
//      console.log("JOINED STATE: ");
//      self.state.print();
      yieldPull(null, self.state.fork());
    });

    socket.on('FlushPush', function (json, flushPull) {
      if (!self.exists(json.uid))
        return flushPull("unrecognized client");

      var state = State.fromJSON(json.state);
      self.state.join(state);
      var fork = self.state.fork();
      flushPull(null, fork);
    });

  });
};

Server.prototype.close = function () {
  this.io.server.close();
};

Server.prototype.generateUID = function () {
  var uid = shortId.generate();
  this.clients[uid] = true;
  return uid;
};

Server.prototype.exists = function (uid) {
  return this.clients[uid];
};
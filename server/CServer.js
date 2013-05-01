var Server = require('./Server');
var ServerState  = require('./ServerState');

module.exports = CServer;

function CServer(state) {
  this.state  = state || new ServerState();
  this.server = new Server(this.state);
}

CServer.prototype.publish = function (target) {
  this.server.open(target);
  this.state.published(this.server);
};

CServer.prototype.close = function () {
  this.server.close();
};

CServer.prototype.declare = function (name, ctype) {
  this.state.declare(name, ctype);
};

CServer.prototype.get = function (name) {
  return this.state.get(name);
};
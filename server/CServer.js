var Server = require('./Server');
var State  = require('./State');

module.exports = CServer;

function CServer(state) {
  this.state  = state || new State();
  this.server = new Server(this.state);
}

CServer.prototype.publish = function (target) {
  this.server.open(target);
  this.state.published(this.server);
};

CServer.prototype.close = function () {
  this.server.close();
};

CServer.prototype.declare = function (array) {
  this.state.declare(array);
};

CServer.prototype.get = function (name) {
  return this.state.get(name);
};
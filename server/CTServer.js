var Server = require('./Server');
var ServerState  = require('./ServerState');

module.exports = CTServer;

function CTServer() {
  this.state  = new ServerState();
  this.server = new Server(this.state);
}

CTServer.prototype.publish = function (target) {
  this.server.open(target);
  this.state.published(this.server);
};

CTServer.prototype.close = function () {
  this.server.close();
};

CTServer.prototype.declare = function (name, ctype) {
  this.state.declare(name, ctype);
};

CTServer.prototype.get = function (name) {
  this.state.get(name);
};
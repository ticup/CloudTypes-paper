var Client = require('./Client');
var ClientState  = require('./ClientState');

module.exports = CClient;

function CClient() {
  this.state  = new ClientState();
  this.client = new Client(this.state);
}

CClient.prototype.listen = function (host, callback) {
  return this.client.listen(host, callback);
};

CClient.prototype.close = function () {
  return this.client.close();
};

CClient.prototype.get = function (name) {
  return this.state.get(name);
};


CClient.prototype.yield = function () {
  return this.state.yield();
};

CClient.prototype.flush = function (callback, timeout) {
  return this.state.flush(callback, timeout);
};
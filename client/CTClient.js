var Client = require('./Client');
var ClientState  = require('./ClientState');

module.exports = CTClient;

function CTClient() {
  this.state  = new ClientState();
  this.client = new Client(this.state);
}

CTClient.prototype.listen = function (host, callback) {
  return this.client.listen(host, callback);
};

CTClient.prototype.close = function () {
  return this.client.close();
};

CTClient.prototype.get = function (name) {
  return this.state.get(name);
};


CTClient.prototype.yield = function () {
  return this.state.yield();
};

CTClient.prototype.flush = function (callback, timeout) {
  return this.state.flush(callback, timeout);
};
var Client = require('./Client');
var ClientState  = require('./ClientState');

module.exports = CClient;

function CClient() {
  this.client = new Client(this.state);
}

CClient.prototype.connect = function (host, options, callback) {
  return this.client.connect(host, options, callback);
};

CClient.prototype.close = function () {
  this.client.disconnect();
};

CClient.prototype.disconnect = function () {
  this.client.disconnect();
};

CClient.prototype.reconnect = function () {
  this.client.reconnect();
};
/**
 * Created by ticup on 01/11/13.
 */
var trello = require('./trello');

var port = process.env.PORT || 8080;

/* publish grocery cloudtypes through the http server */
trello.publish(port, __dirname + '/../../../');

// setup xhr-polling only for Heroku
if (process.env.HEROKU) {
  trello.server.io.configure(function () {
    trello.server.io.set("transports", ["xhr-polling"]);
    trello.server.io.set("polling duration", 10);
  });
}

console.log("#### CloudTypes Trello Example server running on " + port + " ####");
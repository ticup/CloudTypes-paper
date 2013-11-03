/**
 * Created by ticup on 01/11/13.
 */
var grocery = require('./grocery');

var port = process.env.PORT || 8080;

/* publish grocery cloudtypes through the http server */
grocery.publish(port, __dirname + '/../../../');

// setup xhr-polling only for Heroku
if (process.env.HEROKU) {
  grocery.server.io.configure(function () {
    grocery.server.io.set("transports", ["xhr-polling"]);
    grocery.server.io.set("polling duration", 10);
  });
}

console.log("#### CloudTypes Examples server running on " + port + " ####");
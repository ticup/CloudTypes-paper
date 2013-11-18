/**
 * Created by ticup on 06/11/13.
 */

// This make sure we can run all the examples on one server/heroku instance.
var declareCounter  = require('../examples/counter/server/deploy.js');
var declareGrocery  = require('../examples/grocery/server/grocery.js');
var declareProjects = require('../examples/projects/server/projects.js');
//var declareAgenda   = require('../examples/agenda/server/app.js');

var CloudTypes = require('../server/main.js');

var server = CloudTypes.createServer();
var port = process.env.PORT || 8080;

/* declare the cloudtypes for all examples */
declareCounter(server);
declareGrocery(server);
declareProjects(server);
//declareAgenda(server);

server.publish(port, __dirname + '/../');

// setup xhr-polling only for Heroku
if (process.env.HEROKU) {
  server.server.io.configure(function () {
    server.server.io.set("transports", ["xhr-polling"]);
    server.server.io.set("polling duration", 10);
  });
}

console.log("#### CloudTypes Example server running on " + port + " ####");
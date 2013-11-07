/**
 * Created by ticup on 01/11/13.
 */
var CloudTypes = require('../../../server/main.js');
var makeProjects = require('./projects');

var server = CloudTypes.createServer();
var port = process.env.PORT || 8080;

/* publish grocery cloudtypes through the http server */
makeProjects(server).publish(port, __dirname + '/../../../');

console.log("#### CloudTypes Projects Example server running on " + port + " ####");
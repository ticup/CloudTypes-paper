/**
 * Created by ticup on 01/11/13.
 */
var CloudTypes = require('../../../server/main.js');
var makeGrocery = require('./grocery');

var server = CloudTypes.createServer();
var port = process.env.PORT || 8080;

/* publish grocery cloudtypes through the http server */
makeGrocery(server).publish(port, __dirname + '/../../../');

console.log("#### CloudTypes Examples server running on " + port + " ####");
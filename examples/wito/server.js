/*
 * Created by Wito De Greef
 */

// Load the CloudTypes library
var CloudTypes = require('../../server/main');

// Create server using CloudTypes library
var server = CloudTypes.createServer();

// Declare temperature
server.declare('temperature', CloudTypes.CInt);

server.publish(8080, __dirname + "/../../");
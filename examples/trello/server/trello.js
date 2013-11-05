/**
 * Created by ticup on 31/10/13.
 */

// CloudTypes Grocery Example Server
////////////////////////////////////
var CloudTypes = require('../../../server/main.js');
var server = CloudTypes.createServer();

server.declare('Member'  , CloudTypes.CEntity([], {name: 'CString'}))
      .declare('TaskList', CloudTypes.CEntity([], {title: 'CString'}))
      .declare('Task'    , CloudTypes.CEntity([{assignee: 'Member'}], {description: 'CString'}));

server.state.print();

module.exports = server;
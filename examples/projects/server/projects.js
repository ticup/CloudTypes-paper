/**
 * Created by ticup on 31/10/13.
 */

// CloudTypes Grocery Example
/////////////////////////////
var CloudTypes = require('../../../server/main.js');

function declareProjects(server) {
  return server
      .declare('Member' , CloudTypes.CEntity([], {name: 'CString'}))
      .declare('Project', CloudTypes.CEntity([], {name: 'CString'}))
      .declare('Task'   , CloudTypes.CEntity([{assignee: 'Member'}, {project: 'Project'}], {description: 'CString'}));
}

module.exports = declareProjects;
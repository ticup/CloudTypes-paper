/**
 * Created by ticup on 15/11/13.
 */

// CloudTypes Agenda Example Server
////////////////////////////////////
var CloudTypes = require('../../../server/main.js');

function declare(server) {
  return server
      .declare('AvailableSLot', CloudTypes.CEntity([], {date: }))
      .declare('Slot' , CloudTypes.CEntity([], {description: 'CString', place: 'CString', date: 'CDate'}));
}

module.exports = declare;
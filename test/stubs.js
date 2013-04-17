var CInt = require('../shared/CInt');
var State = require('../shared/State');
// unchanged state
exports.unchanged = State.fromJSON({foo: (new CInt(10)).toJSON(), bar: (new CInt(20)).toJSON()});

// set
var cint = new CInt();
cint.set(1);
exports.set = State.fromJSON({foo: cint.toJSON(), bar: (new CInt(2)).toJSON()});


// add
var cint = new CInt();
var cint2 = new CInt();
cint2.add(2);
exports.add = State.fromJSON({foo: (new CInt(100)).toJSON(), bar: cint2.toJSON()});

// setAdd
var cint1 = new CInt();
var cint2 = new CInt();
cint1.set(1);
cint2.add(2);
exports.setAdd = State.fromJSON({foo: cint1.toJSON(), bar: cint2.toJSON()});

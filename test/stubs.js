var CInt    = require('./extensions/CInt');
var CString = require('./extensions/CString');

// CInt
var cint  = new CInt();
var cint1 = new CInt(10);
var cint2 = new CInt(20);
var cint3 = new CInt(30);

// CString
var cstring  = new CString();
var cstring1 = new CString();
var cstring2 = new CString();
var cstring3 = new CString();

// unchanged state
exports.unchanged = createMap();


// CInt
cint1.set(1);

cint2.add(2);

cint3.set(3);
cint3.add(3);

// CString
cstring1.set('foo');

cstring2.setIfEmpty('bar');

cstring3.set('foo');
cstring3.setIfEmpty('foobar');

exports.changed = createMap();

function createMap() {
  return { 'cint'    : cint.toJSON(),
           'cint1'   : cint1.toJSON(),
           'cint2'   : cint2.toJSON(),
           'cint3'   : cint3.toJSON(),
           'cstring' : cstring.toJSON(),
           'cstring1': cstring1.toJSON(),
           'cstring2': cstring2.toJSON(),
           'cstring3': cstring3.toJSON() };
}

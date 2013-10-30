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

exports.groceryUnchanged = {
  name        : 'Grocery',
  type        : 'Array',
  indexes     : {
    names: ['name'],
    types: ['String']
  },
  properties  : [
    {
      name: 'toBuy',
      type: 'CInt',
      values: {
        'Apples'  : cint.toJSON(),
        'Cows'    : cint1.toJSON(),
        'Napkins' : cint2.toJSON(),
        'Potatoes': cint3.toJSON()
      }
    }
  ]
};

exports.productUnchanged = {
  name        : 'Product',
  type        : 'Array',
  indexes     : {
    names: ['id'],
    types: ['String']
  },
  properties  : [
    {
      name: 'name',
      type: 'CString',
      values: {
        '1': cstring.toJSON(),
        '3': cstring1.toJSON(),
        '4': cstring2.toJSON(),
        '5': cstring3.toJSON()
      }
    },
    {
      name: 'price',
      type: 'CInt',
      values: {
        '1': cint1.toJSON(),
        '2': cint3.toJSON()
      }
    }
  ]
};

exports.customerUnchanged = {
  name        : 'Customer',
  type        : 'Entity',
  indexes     : {
    names: ['uid'],
    types: ['String']
  },
  properties  : [
    {
      name: 'name',
      type: 'CString',
      values: {
        'Customer:0#0': cstring.toJSON()
      }
    }
  ],
  states: {
    'Customer:0#0': 'ok'
  }
};

exports.orderUnchanged = {
  name        : 'Order',
  type        : 'Entity',
  indexes     : {
    names: ['uid', 'customer'],
    types: ['String', 'Customer']
  },
  properties  : [
    {
      name: 'product',
      type: 'CString',
      values: {
        'Order:0#0.Customer:0#0': cstring.toJSON()
      }
    },
    {
      name: 'quantity',
      type: 'CInt',
      values: {
        'Order:0#0.Customer:0#0': cint.toJSON()
      }
    }
  ],
  states: {
    'Order:0#0.Customer:0#0': 'ok'
  }
};


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
  return {
    'cint'    : cint.toJSON(),
    'cint1'   : cint1.toJSON(),
    'cint2'   : cint2.toJSON(),
    'cint3'   : cint3.toJSON(),
    'cstring' : cstring.toJSON(),
    'cstring1': cstring1.toJSON(),
    'cstring2': cstring2.toJSON(),
    'cstring3': cstring3.toJSON()
  };
}




exports.groceryPoluted = {
  name        : 'Grocery',
  type        : 'Array',
  indexes     : {
    names: ['name'],
    types: ['String']
  },
  properties  : [
    {
      name: 'toBuy',
      type: 'CInt',
      values: {}
    }
  ]
};
exports.productPoluted = {
  name        : 'Product',
  type        : 'Array',
  indexes     : {
    names: ['id'],
    types: ['String']
  },
  properties  : [
    {
      name: 'name',
      type: 'CString',
      values: {}
    },
    {
      name: 'price',
      type: 'CInt',
      values: {}
    }
  ]
};

exports.groceryChanged = {
  name        : 'Grocery',
  type        : 'Array',
  indexes     : {
    names: ['name'],
    types: ['String']
  },
  properties  : [
    {
      name: 'toBuy',
      type: 'CInt',
      values: {
        'Apples'  : cint.toJSON(),
        'Peers'   : cint.toJSON(),
        'Cows'    : cint1.toJSON(),
        'Napkins' : cint2.toJSON(),
        'Potatoes': cint3.toJSON()
      }
    }
  ]
};
exports.productChanged = {
  name   : 'Product',
  type   : 'Array',
  indexes: {
    names: ['id'],
    types: ['String']
  },
  properties: [
    {
      name  : 'name',
      type  : 'CString',
      values: {
        '1': cstring.toJSON(),
        '2': cstring.toJSON(),
        '3': cstring1.toJSON(),
        '4': cstring2.toJSON(),
        '5': cstring3.toJSON()
      }
    },
    {
      name: 'price',
      type: 'CInt',
      values: {
        '1': cint1.toJSON(),
        '2': cint3.toJSON()
      }
    }
  ]
};

exports.customerChanged = {
  name        : 'Customer',
  type        : 'Entity',
  indexes     : {
    names: ['uid'],
    types: ['String']
  },
  properties  : [
    {
      name: 'name',
      type: 'CString',
      values: {
        'Customer:0#0': cstring.toJSON(),
        'Customer:0#1': cstring2.toJSON(),
        'Customer:0#2': cstring3.toJSON()
      }
    }
  ],
  states: {
    'Customer:0#0': 'deleted',
    'Customer:0#1': 'ok',
    'Customer:0#2': 'ok',
    'Customer:0#3': 'ok'
  }
};

exports.orderChanged = {
  name        : 'Order',
  type        : 'Entity',
  indexes     : {
    names: ['uid', 'customer'],
    types: ['String', 'Customer']
  },
  properties  : [
    {
      name: 'product',
      type: 'CString',
      values: {
        'Order:0#0.Customer:0#0': cstring.toJSON(),
        'Order:0#1.Customer:0#0': cstring1.toJSON(),
        'Order:0#2.Customer:0#1': cstring2.toJSON(),
        'Order:0#3.Customer:0#1': cstring3.toJSON(),
        'Order:0#4.Customer:0#1': cstring3.toJSON()
      }
    },
    {
      name: 'quantity',
      type: 'CInt',
      values: {
        'Order:0#0.Customer:0#0': cint.toJSON(),
        'Order:0#2.Customer:0#1': cint2.toJSON(),
        'Order:0#3.Customer:0#1': cint3.toJSON(),
        'Order:0#4.Customer:0#1': cint3.toJSON()
      }
    }
  ],
  states: {
    'Order:0#0': 'ok',
    'Order:0#1': 'ok',
    'Order:0#2': 'ok',
    'Order:0#3': 'ok',
    'Order:0#4': 'deleted'
  }
};

exports.arrays = [
  exports.groceryUnchanged, exports.productUnchanged,
  exports.groceryPoluted, exports.productPoluted,
  exports.groceryChanged, exports.productChanged
];

exports.entities = [
  exports.customerUnchanged, exports.customerChanged,
  exports.orderUnchanged, exports.orderChanged
];

exports.stateUnchanged = {
  arrays: [
    exports.groceryUnchanged,
    exports.productUnchanged,
    exports.customerUnchanged
  ]
};

exports.statePoluted = {
  arrays: [
    exports.groceryPoluted,
    exports.productPoluted
  ]
};

exports.stateChanged = {
  arrays: [
    exports.groceryChanged,
    exports.productChanged,
    exports.customerChanged
  ]
}

exports.states = [
  exports.stateUnchanged,
  exports.statePoluted,
  exports.stateChanged
];

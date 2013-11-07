/**
 * Created by ticup on 31/10/13.
 */

// CloudTypes Client Setup
//////////////////////////
var State, connect, disconnect;

var client = CloudTypes.createClient();
client.connect(window.location.hostname, function (state) {
  // on initial connect

  State = state; // debug
  var app = new Application(state);

  // start yielding
  start(app, 500);

  // install views into DOM + update with state
  app.install();
  app.update();

  setupAvailabilityButtons();

// on reconnect
}, function () {
  setupAvailabilityButtons(); // needs to be called again since it relies on the (new) socket of the client!
});


// Application
///////////////
function Application (state) {
  this.state = state;
  this.Grocery    = state.get('Grocery');
  this.totalItems = state.get('totalItems');
  this.groceryView    = new GroceryView({app: this, html: '.grocerylist'});
  this.totalItemsView = new TotalItemsView({app: this, html: '.totalitems'});
}

Application.prototype.toBuy = function (name, count) {
  console.log("have to buy " + count + " more of " + name);
  this.totalItems.add(count);
  this.Grocery.get(name).get('toBuy').add(count);
  this.state.yield();
};

Application.prototype.bought = function (name, count) {
  console.log("bought " + count + " of " + name);
  this.totalItems.add(-count);
  this.Grocery.get(name).get('toBuy').add(-count);
  this.state.yield();
};

Application.prototype.update = function () {
  this.groceryView.update();
  this.totalItemsView.update();
};

Application.prototype.install = function () {
  var app = this;

  // install create new grocery
  $('#newgroceryform').submit(function (event) {
    event.preventDefault();
    var name = $('#newgroceryname').val();
    var toBuy = parseInt($('#newgrocerytobuy').val(), 10);
    app.toBuy(name, toBuy);
    app.update();
  });

  // install bought grocery
  $('#boughtgroceryform').submit(function (event) {
    event.preventDefault();

    // scrape values
    var name = $(this).data('entry');
    var toBuy = parseInt($('#boughtcount').val(), 10);

    // actual bought operation + update view
    app.bought(name, toBuy);
    app.update();
  });

};


// TotalItemsView
//////////////////
var TotalItemsView = CloudTypes.View.extend({
  update: function () {
    this.html.html(this.app.totalItems.get());
  }
});


// GroceryView
///////////////
var GroceryView = CloudTypes.ListView.extend({
  value: function () {
    return this.app.Grocery
        .where()
        .orderBy('toBuy', 'desc')
        .entries('toBuy');
  },

  createItemView: function (item) {
    return new GroceryEntryView({entry: item, app: this.app});
  },

  hideBought: function () {
    var views = this.views;
    Object.keys(views).forEach(function (name) {
      views[name].hideBought();
    });
  }
});

// GroceryEntryView
////////////////////
var GroceryEntryView = CloudTypes.EntryView.extend({
  initialize: function () {
    var self = this;
    this.html = $("<li class='list-group-item grocery-item'><span class='key-name'></span><span class='badge property-toBuy'></span></li>")
        .click(function () { self.showBought(); });
    GroceryEntryView.__super__.initialize.call(this);
  },

  showBought: function () {
    var app = this.app;

    /* if already selected: hide bought form */
    if (this.html.hasClass('selected')) {
      return this.hideBought();
    }

    /* if not selected: create + show bought form */

    // remove other bought forms
    app.groceryView.hideBought();

    // set up bought form + set li to selected
    this.html.addClass('selected');
    this.bought = $("#boughtgroceryform")
        .removeClass('hide')
        .data('entry', this.entry.key('name'))
        .appendTo(this.html);

    // reset input
    $('#boughtcount').val('');
  },

  hideBought: function () {
    var form = this.html.find('form');
    if (form.length > 0) {
      this.html.removeClass('selected');
      form.addClass('hide');
      $('body').append(form);
    }
  }
});

// prevent bubbling for input of bought input
$(function () {
  $('#boughtcount').click(function () { return false; });
});



// Client
//////////
var stop = function stop() { };

function start(app, ms) {
  var yielding = setInterval(function () {
    app.state.yield();
    app.update();
  }, ms);
  stop = function () { clearInterval(yielding); };
}



// Availability Buttons
////////////////////////
function setupAvailabilityButtons() {
  showConnect();
  client.socket.on('disconnect', showDisconnect);
}

function showConnect() {
  console.log('connected');
  $('#disconnect-btn').removeClass('active');
  $('#connect-btn').addClass('active');
}
function showDisconnect() {
  console.log('disconeected');
  $('#connect-btn').removeClass('active');
  $('#disconnect-btn').addClass('active');
}
// install disconnect/disconnect
$('#disconnect-btn').click(function () {
  if (!$('#disconnect-btn').hasClass('active')) {
    client.disconnect();
  }
});
$('#connect-btn').click(function () {
  if (!$('#connect-btn').hasClass('active')) {
    client.reconnect();
  }
});
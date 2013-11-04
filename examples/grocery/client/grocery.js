/**
 * Created by ticup on 31/10/13.
 */

// CloudTypes Client Setup
//////////////////////////
var State, connect, disconnect;

var client = CloudTypes.createClient();
client.connect(window.location.hostname, function (state) {
  State = state; // debug
  var app = new Application(state);

  // start yielding
  start(app, 500);

  // install views into DOM + update with state
  app.install();
  app.update();

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

  // install disconnect/disconnect
  $('#disconnect-btn').click(function () {
    $('.network-actions button').removeClass('active');
    $(this).addClass('active');
    client.disconnect();
  });
  $('#connect-btn').click(function () {
    $('.network-actions button').removeClass('active');
    $(this).addClass('active');
    client.reconnect();
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
  produce: function () {
    return this.app.Grocery.entries('toBuy');
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
    var entryView = this;
    var selected = this.html.hasClass('selected');

    /* if already selected: hide bought form */
    if (selected) {
      return this.hideBought();
    }

    /* if not selected: create + show bought form */

    // remove other bought forms
    app.groceryView.hideBought();

    // create bought form + set li to selected
    this.html.addClass('selected');
    this.bought = $("<form role=form class=form-inline id=boughtgroceryform>" +
                      "<div class=form-group>" +
                        "<div class=input-group>" +
                          "<span class='input-group-addon glyphicon glyphicon-shopping-cart'></span>" +
                          "<input type='text' id='boughtcount' class=form-control placeholder='Amount Bought'>" +
                        "</div>" +
                      "</div>" +
                      "<div class=form-group>" +
                        "<input type=submit class=form-control id=boughtgrocerysubmit value=Ok class=btn>" +
                      "</div>" +
                    "</form>").appendTo(this.html);

    // on submit of bought form
    $('#boughtgrocerysubmit').click(function (event) {
      event.preventDefault();

      // scrape values
      var name = entryView.entry.key('name');
      var toBuy = parseInt($('#boughtcount').val(), 10);

      // actual bought operation + update view
      app.bought(name, toBuy);
      app.update();
    });

    // prevent bubbling for input
    $('#boughtcount').click(function () { return false; });

  },

  hideBought: function () {
    var form = this.html.find('form');
    if (form.length > 0) {
      this.html.removeClass('selected');
      form.remove();
    }
  }
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
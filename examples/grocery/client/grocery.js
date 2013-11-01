/**
 * Created by ticup on 31/10/13.
 */

// CloudTypes Client Setup
//////////////////////////
var State;

CloudTypes.createClient()
          .connect(window.location.hostname, function (state) {

  var app = new Application(state);

  // start yielding
  start(app, 2000);

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
  this.groceryView    = new GroceryView(this.Grocery, this);
  this.totalItemsView = new TotalItemsView(this.totalItems);

}

Application.prototype.toBuy = function (name, count) {
  console.log("have to buy " + count + " more of " + name);
  this.totalItems.add(count);
  this.Grocery.get(name).get('toBuy').add(count);
};

Application.prototype.bought = function (name, count) {
  console.log("bought " + count + " of " + name);
  this.totalItems.add(-count);
  this.Grocery.get(name).get('toBuy').add(-count);
};

Application.prototype.update = function () {
  this.groceryView.update();
  this.totalItemsView.update();
};

Application.prototype.install = function () {
  var app = this;
  // install views
  $('.grocerylist')
      .append(this.totalItemsView.html())
      .append(this.groceryView.html());

  // install create new grocery
  $('#newgroceryform').submit(function (event) {
    var name = $('#newgroceryname').val();
    var toBuy = parseInt($('#newgrocerytobuy').val(), 10);
    app.toBuy(name, toBuy);
    app.update();
    event.preventDefault();
  });
};


// TotalItemsView
//////////////////
function TotalItemsView(total) {
  this.total = total;
  this.countView = $('<span>');
  this.p = $("<p>Total to buy: </p>")
      .append(this.countView);
}

TotalItemsView.prototype.html = function () {
  return this.p;
};

TotalItemsView.prototype.update = function () {
  this.countView.html(this.total.get());
};

// GroceryView
///////////////

function GroceryView(Grocery, app) {
  this.app = app;
  this.Grocery = Grocery;
  this.views = {};
  this.ul = $("<ul class='list-group'>");
}

GroceryView.prototype.html = function () {
  return this.ul;
};

GroceryView.prototype.update = function () {
  var ul    = this.ul;
  var views = this.views;
  var app   = this.app;
  var ctr = 0;
  var newViews = {};

  // create new views or update existing ones
  this.Grocery.entries('toBuy').forEach(function (grocery) {
    var name = grocery.key('name');
    var view = views[name];

    // view already present: update + delete from old views
    if (view) {
      view.update();
      delete views[name];

      // view not present: create, update and insert html in DOM
    } else {
      view = new GroceryEntryView(grocery, app);
      view.update();
      insertAt(ul, ctr, view.html());
    }

   newViews[name] = view;
  });

  // remove old views that have no model anymore
  Object.keys(views).forEach(function (name) {
    views[name].html().remove();
    delete views[name];
  });

  // set the new views
  this.views = newViews;
};

GroceryView.prototype.hideBought = function () {
  var views = this.views;
  Object.keys(views).forEach(function (name) {
    views[name].hideBought();
  });
};


// GroceryEntryView
////////////////////
function GroceryEntryView(grocery, app) {
  var entryView = this;
  this.app = app;
  this.grocery = grocery;
  this.nameView = $("<span>");
  this.toBuyView = $("<span class=badge>");
  this.li = $("<li class='list-group-item grocery-item'></li>")
      .append(this.nameView)
      .append(this.toBuyView)
      .click(function () { entryView.showBought(); });
}

GroceryEntryView.prototype.html = function () {
  return this.li;
};

GroceryEntryView.prototype.update = function () {
  this.nameView.html(this.grocery.key('name'));
  this.toBuyView.html(this.grocery.get('toBuy').get());
};

GroceryEntryView.prototype.showBought = function () {
  var app = this.app;
  var entryView = this;
  var selected = this.li.hasClass('selected');

  /* if already selected: hide bought form */
  if (selected) {
    return this.hideBought();
  }

  /* if not selected: create + show bought form */

  // remove other bought forms
  app.groceryView.hideBought();

  // create bought form + set li to selected
  this.li.addClass('selected');
  this.bought = $("<form role=form class=form-inline id=boughtgroceryform>" +
                    "<div class=form-group>" +
                      "<div class=input-group>" +
                        "<span class='input-group-addon glyphicon glyphicon-shopping-cart'></span>" +
                        "<input type='text' id='boughtcount' class=form-control placeholder='Amount Bought'>" +
                      "</div>" +
                    "</div>" +
                    "<div class=form-group>" +
                      "<input type=submit class=form-control id=boughtgrocerysubmit value=Bought class=btn>" +
                    "</div>" +
                  "</form>").appendTo(this.li);

  // on submit of bought form
  $('#boughtgrocerysubmit').click(function (event) {

    // scrape values
    var name = entryView.grocery.key('name');
    var toBuy = parseInt($('#boughtcount').val(), 10);

    // actual bought operation + update view
    app.bought(name, toBuy);
    app.update();
  });

  // prevent bubbling for input
  $('#boughtcount').click(function () { return false; });

};

GroceryEntryView.prototype.hideBought = function () {
  if (this.bought) {
    this.bought.remove();
    this.li.removeClass('selected');
  }
};


// Utility
///////////

function insertAt(parent, index, html) {
  console.log('inserting at ' + index + ' ' + html);
  console.log(html);
  if (index === 0)
    return parent.prepend(html);
  parent.find(':nth-child(' + index + ')').after(html);
}


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
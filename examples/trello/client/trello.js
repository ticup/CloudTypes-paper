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
  this.state   = state;
  this.Members = state.get('Member');
  this.MembersView = new MembersView({app: this, html: '.members'});
}

Application.prototype.rename = function (member, name) {
  console.log("renaming " + member + " to " + name);
  member.get('name').set(name);
  this.state.yield();
};

Application.prototype.update = function () {
  this.MembersView.update();
};

Application.prototype.install = function () {
  this.MembersView.install();
  var app = this;

  // install create
  $('#createmember').submit(function (event) {
    event.preventDefault();
    app.createMember();
  });

};


// MembersView
///////////////
var MembersView = CloudTypes.ListView.extend({
  value: function () {
    return this.app.Members.all();
  },

  createItemView: function (item) {
    return new MemberView({entry: item, app: this.app});
  }
});

// MemberView
//////////////
var MemberView = CloudTypes.EntryView.extend({
  initialize: function () {
    var self = this;
    GroceryEntryView.__super__.initialize.call(this);
  }
});

// prevent bubbling for input of edit member
$(function () {
  $('#editmembername').click(function () { return false; });
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
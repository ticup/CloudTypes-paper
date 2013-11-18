/**
 * Created by ticup on 15/11/13.
 */

// CloudTypes Client Setup
//////////////////////////
var State, connect, disconnect;

var client = CloudTypes.createClient();
client.connect(window.location.hostname, function (state) {
  // on initial connect

  State = state; // debug

  // install views into DOM + update with state
//  app.install();
//  app.update();

  setupAvailabilityButtons();

// on reconnect
}, function () {
  setupAvailabilityButtons(); // needs to be called again since it relies on the (new) socket of the client!
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
/**
 * Created by ticup on 15/11/13.
 */
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
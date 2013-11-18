/**
 * Created by ticup on 18/11/13.
 */

// Availability Buttons
////////////////////////
angular
    .module('avbuttons', ['cloudtypes'])

    .directive('avbuttons', function avbuttons($client) {
      return function (scope, elem, attrs) {

        var cnButton = $(attrs.connect);
        var dcButton = $(attrs.disconnect);

        function showConnect() {
          dcButton.removeClass('active');
          cnButton.addClass('active');
        }

        function showDisconnect() {
          cnButton.removeClass('active');
          dcButton.addClass('active');
        }

        $client.onConnect(showConnect);
        $client.onReconnect(showConnect);
        $client.onDisconnect(showDisconnect);

        cnButton.click(function () {
          if (!cnButton.hasClass('active')) {
            $client.reconnect();
          }
        });

        dcButton.click(function () {
          if (!dcButton.hasClass('active')) {
            $client.disconnect();
          }
        });
      };
    });
/**
 * Created by ticup on 17/11/13.
 */
angular
    .module('cloudtypes', [])
    .service('$client', function () {
      var clbcks = [];

      return {
        client: CloudTypes.createClient(),
        stop: function stop() { },
        connect: function connect(host, connect, reconnect) {
          return this.client.connect(host, connect, reconnect);
        },
        startTicker: function start(ms) {
          ms = ms || 2000;
          var yielding = setInterval(function () {
            clbcks.forEach(function (clbck) { clbck(); });
          }, ms);
          this.stop = function stop() { clearInterval(yielding); };
          return this;
        },
        onTick: function onTick(clbck) {
          clbcks.push(clbck);
        }
      };
    })
    .service('$state', function ($window, $q, $client) {
      var deferred = $q.defer();

      $client.connect($window.location.hostname, function (state) {
        $window.State = state; // debug
        connectedButton($client.client);
        $client.startTicker(2000)
            .onTick(function () { state.yield(); });
        deferred.resolve(state);
      }, function () {
        reconnectedButton($client.client);
      });
      return deferred.promise;
    })


    .service('$cachedArray', function () {
      function CachedArray(getArray) {
        this.getArray = getArray;
        this.entries = {};
        this.array = [];
        this.update();
      }

      CachedArray.prototype.update = function () {
        var entries = this.entries;
        var newEntries = {};

        this.array = this.getArray().map(function (item) {
          var idx = item.index();
          var entry = entries[idx];
          if (entry)
            item = entry;
          return newEntries[idx] = item;
        });

        this.entries = newEntries;
        return this.array;
      };

      return {
        create: function (getArray) {
          return new CachedArray(getArray);
        }
      };
    });
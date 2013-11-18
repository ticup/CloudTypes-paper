var groceryApp = angular.module('groceryApp', ['ngRoute', 'cloudtypes']);

groceryApp.controller('GroceryCtrl', function ($scope, $client, $state, $cachedArray) {
  $scope.buying = null;

  // when revision received from server
  $state.then(function (state) {
    // Retrieve the cloud types from the state
    $scope.Grocery    = state.get('Grocery');
    $scope.totalItems = state.get('totalItems');

    // create an array that will reuse its entries upon update (provides better reuse for angular)
    $scope.cachedGroceries = $cachedArray.create(function () {
      return $scope.Grocery
              .where()
              .orderBy('toBuy', 'desc')
              .entries('toBuy');
    });

    // initial update of the array + set up periodic updates after yielding
    $scope.update();
    $client.onTick(function () {
      $scope.$apply($scope.update);
    });
  });

  // update the cached array
  $scope.update = function () {
    $scope.groceries = $scope.cachedGroceries.update();
  };

  // Add grocery to buy with given name and quantity
  $scope.addGrocery = function (name, quantity) {
    var toBuy = parseInt(quantity, 10);
    $scope.totalItems.add(toBuy);
    $scope.Grocery.get(name).get('toBuy').add(toBuy);
    $scope.update();
  };

  // Mark grocery bought with given quantity
  $scope.boughtGrocery = function (grocery, quantity) {
    var count = parseInt(quantity, 10);
    $scope.totalItems.add(-count);
    $scope.Grocery.get(grocery.key('name')).get('toBuy').add(-count);
    $scope.stopBuying(grocery);
    $scope.update();
  };

  // Starts/Stops buying depending on the current status
  $scope.toggleBuy = function (grocery, $event) {
    if (!grocery || $scope.buying == grocery)
      return $scope.stopBuying();
    $scope.startBuying(grocery);
    $event.stopPropagation();
  };

  // Set given grocery as being bought
  $scope.startBuying = function (grocery) {
    $scope.buying = grocery;
  };

  // Stop
  $scope.stopBuying = function () {
      $scope.buying = null;
  };

});

/**
 * Directive that places focus on the element it is applied to when the expression it binds to evaluates to true
 */
groceryApp.directive('groceryFocus', function todoFocus($timeout) {
  return function (scope, elem, attrs) {
    scope.$watch(attrs.groceryFocus, function (newVal) {
      if (newVal) {
        $timeout(function () {
          elem[0].focus();
        }, 0, false);
      }
    });
  };
});


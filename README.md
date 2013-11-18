CloudTypes
==========

CloudTypes is a JavaScript library implementation of the CloudTypes model demonstrated in the paper [CloudTypes for Eventual Consistency](http://research.microsoft.com/apps/pubs/default.aspx?id=163842) by Sebastian Burckhardt, Manuel Fahndrich, Daan Leijen, and Benjamin P. Wood.

[![Build Status](https://travis-ci.org/ticup/CloudTypes.png)](https://travis-ci.org/ticup/CloudTypes)

Examples: [Grocery List](http://cloudtypes.herokuapp.com/examples/grocery/client/index.html), [Grocery List Angularjs](http://cloudtypes.herokuapp.com/examples/grocery-ng/client/index.html), [Projects Manager](http://cloudtypes.herokuapp.com/examples/projects/client/index.html)

The Model
----------

This section gives a short overview of the CloudTypes model introduced in the paper.

In short, CloudTypes provide language level abstractions for synchronization of distributed variables.

Somewhat more extensive, CloudTypes provide:

1. **Distributed Structures:** Array and Entity
These structures have entries with fields that can be used across different clients and servers, even when the system in question is offline for days, months or years.

1. **Distributed variables:** CInt, CString and CSet.
These variables, called CloudTypes, are used as fields for the Arrays and Entities.

2. **Eventual consistency** for the whole state.
All systems have their own revision of the complete state. They can use this to locally update or query the CloudTypes. All states are eventually synchronized using revision diagrams and the related operations *yield* (asynchronous) or *flush* (synchronous) operations.

3. **Conflictless synchronization**.
States are merged in a conflictless fashion and the CloudTypes have commmutative operations that explicitly avoid conflicts.

4. **Strong consistency** when necessary.
Whenever strong consistency is necessary, it can be achieved using the *flush* operation. Furthermore, variables can be exclusively locked by combining the *setIfEmpty* and *flush* operations.

5. **Language level abstractions for implementation details**.
CloudTypes aims at abstracting the implementation details (servers, networks, caches, protocols) of the eventual consistent storage model. This allows the programmer to focus on the client-side code, instead of on the distribution details.



This Library
-------------
This library implements the proposed model using javascript and Websockets. It does so as **explicit as possible**, **neglecting** most of the **performance** concerns. It serves both as an **experimental implementation** and a **didactic tool** to better understand the model. An interesting place to look at to learn or experiment with the model are the [integration tests](https://github.com/ticup/CloudTypes/blob/master/test/integration.js), where client and server are put together and different scenarios can be easily tested.

Since this is just a library implementation, in contrary to the language level implementation described in the paper, it inherently differs in some ways:

1. **Server/Client boilerplate code**.
This library still requires the programmer to write the server/client boilerplate code (bullet 5). More specifically, the programmer first needs to create a server, declare the cloud types and publish it (Node.js). Then he needs to create a client to connect to that server (browser Javascript), after which it can use the declared variables. In the original model this boilerplate code is hidden in a multi-tier language.

2. **Higher level states**.
The state (a particular environment with CloudType variables and values) is not deeply integrated into the host environment, instead it is present as an object. This means variables need to be explicitly retrieved from that state, but this also means a client could possibly connect to multiple different CloudType servers and govern different CloudType states. This also means that global available functions such as *yield* and *flush* are now scoped to the state object.

3. **First Class Cloud Types**
While cloud types are not first class in the paper, they are in this library. By doing so we can make an API that comes very close to the proposed one. This allows us to hide some boilerplate code that is hidden on a language level in the paper. More specifically, the *query* and *update* operation on a property can be written more elegantly by performing those operations directly on the cloud type.

3. **No UI thread**.
Since JavaScript has no separate thread for its UI, it is almost impossible to make a blocking *flush* operation. Therefore it is implemented more in the JavaScript fashion, using a callback that is called when synchronized.

Furthermore, at the moment only the single synchronous server model (one server) is being implemented, but the server pool model (multiple servers to increase availability) might follow if interest arises.

Getting Started
---------------
Assuming one of the latest Node version is installed and you are in your project directory:

    npm install cloudtypes

That's it, even better is of course to add it as a dependency to your package.json file.

Usage
-----
As an introduction we'll make [a simple counter](http://cloudtypes.herokuapp.com/examples/counter/client/index.html) example that can be incremented, decremented or set to a particular value. The complete code is in the repository and can be found [here](https://github.com/ticup/CloudTypes/blob/master/examples/counter/server/index.js).

Remember that you can use this counter offline to, synchronizing with the other clients/server when you go online again.
In case of *set* the counter will have the value last set by a client, nothing special here.
In case of the *increment* and *decrement* though, all increments and decrements will be accumulated, resulting in the value that is the result of applying all the increments/decrements.

Start by setting up the server and schema:
### Server

    var CloudTypes = require('cloudtypes').Server;

    // create a new CloudTypes server
    var cloudTypes = CloudTypes.createServer();

    // Declare our counter
    cloudTypes.declare('total'  , CloudTypes.CInt);

    // publish the counter + set up convenience static file server from this path
    cloudTypes.publish(8080, __dirname);


### Client
Load the CloudTypes client bundle into your html and start using the distributed CloudTypes. Assuming you are serving static files from your project root:

    <html>
    <head></head>
    <body>
    <h1>Counter</h1>
    <div>
      <div class='counter-container'>
        <div class='content'></div>
        <button class='inc'> Increase </button>
        <button class='dec'> Decrease </button> <br>
        <input class='amount' type='text'>
        <button class='set'> Set </button>
      </div>
    </div>
    </body>
    <script src="https://code.jquery.com/jquery-1.10.2.min.js"></script>
    <script src="/client/bundle.js"></script>
    <script>

      // CloudTypes
      //////////////
      // create a new CloudTypes client
      var client = CloudTypes.createClient();

      // connect to the server
      client.connect(window.location.hostname, function (state) {

        // retrieve counter + set up View
        var counter = state.get('counter');
        var container = $('.counter-container');
        var counterView = new CounterView(counter, container);
        counterView.update();

        // set up continuous synchronization with the server + updating of view
        setInterval(function () {
          state.yield();
          counterView.update()
        }, 200);

      });

      // CounterView
      ///////////////
      // keeps the DOM in sync with the cloudtype
      function CounterView(counter, container) {
        var self = this;
        this.counter = counter;
        this.container = container;
        this.content = container.find('.content');

        // Set up increase button
        container.find('.inc').click(function () {
          self.counter.add(1);
          self.update();
        });

        // Set up decrease button
        container.find('.dec').click(function () {
          self.counter.add(-1);
          self.update();
        });

        // Set up set button
        container.find('.set').click(function () {
          var amount = parseInt(container.find('.amount').val(), 10);
          self.counter.set(amount);
          self.update();
        });
      }

      // Update the DOM with the counter value
      CounterView.prototype.update = function () {
        this.content.html(this.counter.get());
      };


    </script>
    </html>

That's it! Run your server and visit the client html or just check out the [live example](http://cloudtypes.herokuapp.com/examples/grocery/client/index.html).

### Overview
Here is a quick overview of other (perhaps more sophisticated) things you can do with CloudTypes.

#### Server
    // Globals are declared as simple CloudTypes (currently only CInt and CString)
    cloudTypes.declare('counter', CloudTypes.CInt)
              .declare('name'   , CloudTypes.CString)

    // Array: An infinite map from (possibly multiple) indexes to properties
    //  where each possible combination of indexes their properties are initialized to the default value of that CloudType (0 for CInt, "" for CString)
    // Declaration Arguments:
    // 1. An array of index types: simple objects that map the index name to the index type. Type can be either 'string', 'int' or the name of any previously declared variable.
    // 2. An object of property types: object that maps property names to property types. Properties can only be of type CloudType (CInt or CString).
              .declare('Grocery', CloudTypes.CArray([{name: 'string'}], {toBuy: 'CInt'}));
              .declare('Birds'  , CloudTypes.CArray([{name: 'string'}, {color: 'string'}, {gender: 'string'}], {count: 'CInt'}));

    // Entity: An Array that has the create and delete operations, which adds the notion of existence to Array.
    //  (Since (conceptually) all possible indexes of an Array are always initialized, it has no notion of existence)
    // Declaration Arguments:
    // 1. An array of construction arguments: exactly the same as for Array (but now called construction argument instead of index).
    // 2. An object of property types: also exactly the same as for Array.
              .declare('Customer', CloudTypes.CEntity([], {name: 'CString'}));
              .declare('Order'   , CloudTypes.CEntity([{customer: 'Customer'}, {Product: 'String'}], {amount: 'CInt'}));

    // Using an Entity as index type for an array or as construction argument for an entity makes that array/entity a weak entity.
    // A weak entity automatically gets deleted whenever the entity it depends on gets deleted.

#### Client

    // asynchronous synchronization (see API 3.2 yield)
    state.yield();

    // synchronous synchronzation (see API 3.3 flush)
    state.flush(function (error) {
      // flushed with the server if no error is set
    )}

    /* CInt operations */
    var counter = state.get('counter');

    // add is commutative. This means all add operations can be easily accumulated,
    // thus making sure everyone's add is registered and taken into account
    counter.add(1);
    counter.add(-10);

    // set is not commutative, it has last-set semantics
    counter.set(42);

    /* CString operations */
    var name = state.get('name');

    // last-set semantics
    name.set('foo');

    // will set the string only if it hasn't been set by someone else.
    // if for example the string isn't set locally but it has been set on the server, it will first be set
    // locally but upon joining with the server the value will be 'unset' again.
    name.setIfEmpty('foo');

    // in combination with flush, this provides strong consistency
    seat.get('assignedTo').setIfEmpty(customer);
    state.flush(function (error) {
      if (error || !seat.get('assignedTo').get() != customer)
        // reservation failed
      else
        // reservation succeeded
    });


    /* Array */
    var Grocery = state.get('Grocery');

    // retrieve an entry by index
    var apples = Grocery.get('apples');

    // get an array of all entries where given property is not the default value (0 for CInt, '' for CString)
    var entries = Grocery.entries('toBuy');

    // filter the entries (multiple 'where's chainable)
    var filtered = Grocery
                      .where(function (entry) { return entry.key('name') !== 'apples'; })
                      .entries('toBuy');

    // order the entries (must first apply at least one 'where' before orderBy can be used)
    // ordering currently not chainable.
    var ordered = Grocery
                    .where()
                    .orderBy('toBuy', 'desc')
                    .entries('toBuy');

    /* Entity */
    // has got the same interface as Array, with some additions:

    var Order = state.get('Order');
    var Customer = state.get('Customer');

    // create a new entity entry
    var customer = Customer.create();
    var order = Order.create(customer, "MacBook 17'");

    // delete an entry (also deletes order!!)
    customer.delete();

    // get all entities (possible for entity, not for array)
    Order.all();

    // where/orderBy + all
    Order.where()
         .orderBy('amount', 'asc')
         .all();


    /* Entry (Entity + Array) */
    // retrieve a key
    var name = apples.key('name');

    // retrieve a property
    var toBuy = apples.get('toBuy');

    // loop over all properties
    apples.forEachProperty(function (name, value) { });

    // loop over all indexes
    apples.forEachKey(function (name, value) { });

    // equality: retrieving the same entry twice will NOT return the same js object twice
    // equality is performed using the equals operation on the entry
    // note this has some implications when using for example angularjs, see the angularjs section for more info.
    Grocery.get('apples') != Grocery.get('apples')
    Grocery.get('apples').equals(Grocer.get('apples')); // true

    // values retrieved from the state (global cloudtypes, arrays or entities) are the same objects
    state.get('Grocery') === state.get('Grocery')

Examples
--------
The examples are running live on heroku: [Counter](http://cloudtypes.herokuapp.com/examples/grocery/client/index.html), [Grocery List](http://cloudtypes.herokuapp.com/examples/grocery/client/index.html), [Projects Manager](http://cloudtypes.herokuapp.com/examples/projects/client/index.html). The grocery example is also implemented in Angularjs [here](http://cloudtypes.herokuapp.com/examples/grocery-ng/client/index.html).

See the examples folder (e.g. [the grocery example](https://github.com/ticup/CloudTypes/blob/master/examples/grocery/server/index.js)) on how to get everything working.

You can run the examples on your own computer if you have the optional dependencies installed (static file server):

    npm install --optional

Then start a single example by running e.g.:

    node examples/grocery/server/index.js

You can also run all examples at once by running (this is the file that is used to run the examples on Heroku):

    node deploy/index.js


Visit the examples:

    http://localhost:8080/examples/grocery/client/index.html
    http://localhost:8080/examples/projects/client/index.html



API
---

### Server

1. **CloudTypes Server Library API**

  1.1 *createServer()*

  > Creates a new CloudTypeServer which is used to serve an accompanying state.
  
 1.2 *CInt*

 > The CInt type.

 1.3 *CString*

 > The CString type.

 1.4 *CArray*

 > The Array declaration function (see CloudType API's: 1. CArray/CEntity declaration).

 1.5 **CEntity**

 > The Entity declaration function (see CloudType API's: 1. CArray/CEntity declaration).

2. **CloudTypeServer**

  2.1 *declare(name, type)*

  > Declares a variable with given name of given type. Can only be executed before publish and is used to set up the schema.

       cloudTypes.declare('total'   , CloudTypes.CInt)
                 .declare('name'    , CloudTypes.CString)
                 .declare('Grocery' , CloudTypes.CArray([{name: 'String'}], {toBuy: 'CInt'}));
                 .declare('Customer', CloudTypes.CEntity([]               , {name: 'CString'}));
                 .declare('Order'   , CloudTypes.CEntity([{customer: 'Customer'},
                                                          {Product: 'String'}],
                                                         {amount: 'CInt',
                                                          price : 'CInt'}));


  2.2 *publish(port number or HttpServer)*
  
 > Publishes the declared state on given port or by using given node HttpServer as host.
 
        // publish on given port
        server.publish(8090);
        // publish by using given http server
        server.publish(http.createServer(handler));

 2.3 *publish(port number, static path)*

  > Publishes the declared state on given port and starts a convenience static file server from given path.

         // publish on given port + serve files from path of this file
         server.publish(8090, __dirname);

### Client
1. **CloudTypes** (global window variable/client library API)

 1.1 *createClient()*

 > Creates a new CloudTypeClient which can be used to connect to a CloudTypeServer.


2. **CloudTypeClient**

 2.1 *connect(url, connected, reconnected)*
 > Tries to connect to a CloudTypeServer hosted on given url (e.g. 'localhost' or 'http://localhost:8090').
Invokes connected with an error if failed to connect, otherwise it provides a State as second argument (the revision) when connected with the server for the first time.
Reconnected will be invoked whenever connection with the server was lost but established again (note: normally one shouldn't need this callback!! We just use it for the online/offline buttons in our examples which depend on the internal socket of the client that gets reset and thus needs new listeners. In a normal use case all connecting/disconnecting/reconnecting problems are solved for you)

        var client = CloudTypes.createClient();
        client.connect('localhost', function (error, state) {
          if (error)
            throw error;
          // start the application that depends on the state.
        });

3. **State**

 > Provides environment operations which are embedded in the language in the paper.

 3.1 *get(string name)*
 
 > Retrieves the global CloudType, Entity or Array with given name from the state (as declared with .declare(name, type) on the server side)

        // server
        cloudTypes.declare('counter', CloudTypes.CInt);

        // client
        var counter = state.get('counter'); // instance of CInt

 3.2 *yield()*

 > Instruct to asynchronously synchronize with the server. Yield can do 3 different things when invoked in another context:
 > 1. Not expecting a revision from the server: send this client's revision to server. (e.g. first time when you call yield)
 > 2. A revision from the server has arrived: merge it into the current revision.
 > 3. Waiting for a revision from the server: do nothing. This allows for applications to keep working when offline.

 3.3 *flush(callback, [timeout 2000])*

 > Tries to synchronize with the server and invokes the callback when succeeded. An optional timeout (defaults to 2000) can be provided in milliseconds that specifies the amount of time flush waits for the server before failing.

        state.flush(function (error) {
          if (error)
            // was not able to synchronize after 4 seconds
          else 
            // succesfully synchronized with server, has now got merged state of server.
        }, 4000);

 > This provides the user with *strong consistency*, e.g. when a ticket reservation application needs to do a reservation it needs to be sure that seat is only taken once (in combination with 5.3 CString::setIfEmpty)

         seat.get('assignedTo').setIfEmpty(customer);
         state.flush(function (error) {
           if (error || !seat.get('assignedTo').get() != customer)
             // reservation failed
           else
             // reservation succeeded
         });


### CloudType API's

 This elaborates the CloudTypes their API, which are the objects that can be used as properties for the structures.
 Note that we use the names CArray and CEntity, while the CArray and CEntity are actually not CloudTypes themselves, in contrary to CInt and CString. We do this in order to avoid conflict with the already existing global Array object in Javascript.
 For a more detailed explanation of the CloudTypes their semantics you can always read the [paper](http://research.microsoft.com/apps/pubs/default.aspx?id=163842).

1. **CArray/CEntity declaration**
  > A CArray and CEntity are both declared in the same way, namely


        cloudTypes.declare('Grocery' , CloudTypes.CArray([{name: 'String'}], {toBuy: 'CInt'}));
                  .declare('Customer', CloudTypes.CEntity([]               , {name: 'CString'}));
                  .declare('Order'   , CloudTypes.CEntity([{customer: 'Customer'},
                                                           {Product: 'String'}],
                                                          {amount: 'CInt',
                                                           price : 'CInt'}));


 > They take an array of single {name: type} objects as index types (Array) or construction arguments (Entity) and a single object of possibly multiple {name1: type1, name2: type2,...} mappings for the property declarations. The index types can be of type: 'String', 'Int' or any previously declared name of a CEntity or CArray and the property types can only be CloudTypes, so currently CInt and CString.

 Whenever an Entity is used as an index type for an Array or a construction argument for an Entity, that Array or Entity becomes a *weak entity*. A *weak entity* is dependent on that Entity and will be deleted whenever the Entity it depends on is deleted.

2. **CArray**
> An Array is an infinite mapping from all possible values for the index types to the declared property types. All these infinite entries are conceptually present and their properties are initialized with the default values. One can either retrieve an entry explicitly by using its indexes or one can get a set of entries for which a given property is not the defaul value.

  2.1 *get(index1, index2, ...)*
  > Returns the entry with given indexes (if it is neither deleted, nor depends on a deleted entity).

        Birds.get("pigeon", "white", "male")

  2.2 *entries(propertyName)*
  > Returns a normal javascript Array of all entries for which the given property is not the default value (and for which none of the index values is either a deleted entity, nor depends on a deleted entity).

      // return all entries for which the count isn't 0
      Birds.entries("count")

  2.3 *CArrayEntry*
  > An instance of this object is returned by the get and entries methods and represents an entry in the Array with certain index values.

    2.3.1 *get(propertyName)*
    > Returns the CloudType of the given property for this given entry.

    2.3.2 *key(keyName)*
    > Returns the value of the given keyName for this entry.

    2.3.3 *equals(entry)*
    > Returns true if the entries are equal to each other.
    This operation has to be used to check for equality for entries and not the built-in equality operators.
    Namely, the entry object returned for the same entry is not the same object.

    2.3.4 *forEachProperty(callback)*
    > Calls the callback for each property with its name and value

    2.3.5 *forEachKey(callback)*
    > Calls the callback for each index with its name and value

3. **CEntity**
> An Entity is like an Array, except it has an extra layer which makes sure there is the notion of existing and deleted entries (which there is not for the Array) by using the create and delete methods.

  3.1 *get(index1, index2, ...)*
  > Returns the CEntityEntry for the given indexes (if it is neither deleted, nor depends on a deleted entity).

        var customer = Customer.create();
        var order2 = Order.get(customer, "MacBook 17'");
        order1.equals(order2);

  3.2 *create(index1, index2 ...)*
  > Creates a new CEntityEntry with given index values.

        Order.create(customer, "MacBook 17'");

  3.3 *where(filter)*
  > Sets up a filter that can be chained with multiple other *where* methods or an *orderBy* and which is finalized by using the *all* or *entities* methods.

  3.4 *orderBy(propertyName, 'asc' (default) | 'desc')*
  > Can be called on the result of calling *where* on a CEntity and the *all* and *entities* methods can be used on the result of orderBy.
  Makes sure that the result returned by the finalizing method is ordered by given propertyName and given direction.

        Order.where(function (entry) { return entry.key('name') === 'Macbook' })
             .orderBy('amount', 'asc')
             .all();

  3.4 *all()*
  > Returns an array of CEntityEntries, possibly filtered by previously chained *where* methods and ordered by previous *orderBy* methods.
  Can thus be used on the CEntity directly or on the result of chained *where* calls or *orderBy* call.

        Order.where(...)
             .orderBy('amount', 'asc')
             .all();

        Order.where(...)
             .where(...)
             .all();

        Order.where(...)
             .entities('count');


  3.5 *CEntityEntry*
  > An instance of this object is returned by the create, get and all methods and represents an entry in an Entity with certain index values.

    3.5.1 *get(propertyName)*
    > Returns the CloudType of the given property for this given entry.

    3.3.2 *key(keyName)*
    > Returns the value of the given keyName for this entry.

    3.3.3 *delete()*
    > Delete this entry and all the other Entities/Arrays that depend on this entry.

    3.3.4 *equals(entry)*
    > Returns true if the entries are equal to each other.
    This operation has to be used to check for equality for entries and not the built-in equality operators.
    Namely, the entry object returned for the same entry is not the same object.

    3.3.5 *forEachProperty(callback)*
    > Calls the callback for each property with its name and value

    3.3.6 *forEachKey(callback)*
    > Calls the callback for each index with its name and value

4. **CInt**

 4.1 *get()*
 > Returns the current value of the CInt variable (base value + offset).

 4.2 *set(value)*
 > Sets the (base) value of the CInt variable to given value. Upon joining with other revisions, the last set always prevails as base value.

 4.3 *add(value)*
 > Adds the given value (possibly negative) to the current value by adding the value to the current offset. Upon joining with other revisions, all offset values are added to the base value.

5. **CString**
 
 5.1 *get()*
 > Returns the current value of the CString variable.

 5.2 *set(value)*
 > Sets the current value of the CString variable.

 5.3 *setIfEmpty(value)*
 > Sets the current value of the CString variable if it is empty. If it is not currently empty, the operation is conditionally saved so it can be applied when the string becomes upon joining with other revisions.
 > You can use this in combination with the flush operation to obtain strong consistency and perform locks on variables, e.g:

        // seat is an Entity with a CString slot named assignedTo
        seat.assignedTo.setIfEmpty(customer) ;
        flush(function (error) {
          if (error || seat.assignedTo.get() != customer)
            // reservation failed
          else
            // reservation succeeded
        });

Angular Modules
---------------
[example-assets/js/angular-cloudtypes.js](https://github.com/ticup/CloudTypes/blob/master/example-assets/js/angular-cloudtypes.js) is an Angularjs module to easily use the Cloud Types client in the AngularJS framework. Check out the [Counter](https://github.com/ticup/CloudTypes/blob/master/examples/counter-ng/client) Angularjs implementation to get started and the [Grocery List](https://github.com/ticup/CloudTypes/blob/master/examples/grocery-ng/client) Angularjs implementation for a little more advanced usage + usage of the avbuttons module (lets you easily plug in the online/offline buttons used in the examples).


### Counter Example
Let's remake the counter example using Angular:

#### Server
Stays exactly the same. As a matter of fact, we just use the server of our non-angular counter example!

#### Client Html

    <html>
    <head></head>
    <body>
    <h1>Counter</h1>
    <div>
      <!-- initialize DOM with our angular app + controller -->
      <div ng-app="counterApp" ng-controller="CounterCtrl">

        <!-- display the value of the counter CloudType -->
        <div>{{counter.get()}}</div>

        <!-- increase/decrease buttons -->
        <button ng-click="increaseCounter()"> Increase </button>
        <button ng-click="decreaseCounter()"> Decrease </button> <br>

        <!-- set buttons that uses the 'amount' model which is (2-way) bound to the DOM input -->
        <input type="number" ng-model="amount">
        <button ng-click="setCounter(amount)"> Set </button>
      </div>
    </div>

    <!-- Load jquery, angular, angular-cloudtypes wrapper, cloudtypes client, and the counter app -->
    <script src="../../../example-assets/js/jquery-1.10.2.min.js"></script>
    <script src="../../../example-assets/js/angular.js"></script>
    <script src="../../../example-assets/js/angular-cloudtypes.js"></script>
    <script src="../../../client/bundle.js"></script>
    <script src="app.js"></script>
    </body>
    </html>


#### Client App
Setup app and dependencies + initialize model after retrieving state in app.js:

    angular
        .module('counterApp', ['cloudtypes'])

        // make a controller and inject the $client and $state service of the cloudtypes module
        .controller('CounterCtrl', function ($scope, $client, $state) {

          // the $state service automatically sets up a connection to the cloud types server
          // and returns a promise for the state.
          $state.then(function (state) {
            // cloud types state now available from server, initialize model
            $scope.counter = state.get('counter');

            // upon yielding, notify angular that the model might have been changed
            $client.onYield(function () { $scope.$apply('') });
          });

          // model methods
          $scope.increaseCounter = function () {
            $scope.counter.add(1);
          };

          $scope.decreaseCounter = function () {
            $scope.counter.add(-1);
          };

          $scope.setCounter = function (amount) {
            $scope.counter.set(amount);
          };
        });


Quite clean indeed, thanks CloudTypes and Angular.


### Angular-cloudtypes
The [cloudtypes](https://github.com/ticup/CloudTypes/blob/master/example-assets/js/angular-cloudtypes.js) module provides followings services:

#### $client
> Angular abstraction for the CloudTypesClient, has following API:

1. connect(host, ms)
> Connects to given host and starts periodic yielding every ms when connected.

2. disconnect()
> Disconnects from the server (can be used for simulating going offline).

3. reconnect()
> Reconnects to the server (can be used after calling disconnect()).

4. onConnect(callback)
> Calls given callback whenever the client is connected to the server.

5. onReconnect(callback)
> Calls given callback whenever the client is reconnected to the server.

6. onDisconnect(callback)
> Calls given callback whenever the client is disconnected from the server.

#### $state
> The $state service uses the $client service to automatically connect to the server with the hostname of the current window location and returns a promise for the state of that server.

#### $cachedArray
> Remember that array and entity entries are not returned as the same object every time. This has some implications when using it within a framework such as Angularjs which uses your objects used as models to store dirty information. Therefore we supply a $cachedArray service which you can use to use array/entity queries as models.

1. create(getValue)

> Creates a CachedArray that will use the supplied function *getValue* to update the array. One should then call the *update()* method on this cached array and assign its value to the array to be used as model. This will make sure existing entry objects will be reused, so that frameworks can keep their dirty information in it.

An example usage from the grocery example:

    var groceryApp = angular.module('groceryApp', ['cloudtypes', 'avbuttons']);
    groceryApp.controller('GroceryCtrl', function ($scope, $client, $state, $cachedArray) {
        $state.then(function (state) {
          // Retrieve the cloud types from the stateg
          $scope.Grocery    = state.get('Grocery');

          // Create the CachedArray using given query function
          $scope.cachedGroceries = $cachedArray.create(function () {
            return $scope.Grocery
                    .where()
                    .orderBy('toBuy', 'desc')
                    .entries('toBuy');
          });

          // initial update of the array + set up periodic updates after yielding
          $scope.update();
          $client.onYield(function () {
            $scope.$apply($scope.update);
          });
        });

        // update the model by replacing it by the update of the cached array
        $scope.update = function () {
          $scope.groceries = $scope.cachedGroceries.update();
        };

    });


### Angular-avbuttons
If you want those online/offline buttons from in the examples to track and/or change availability of the cloudtypes server you can use the [angular-avbuttons](https://github.com/ticup/CloudTypes/blob/master/example-assets/js/angular-avbuttons.js) module. (Check out the [Grocery List](https://github.com/ticup/CloudTypes/blob/master/examples/grocery-ng/client) Angular client implementation for usage)

1. Load the module (index.html)

        <script src="../../../example-assets/js/angular-avbuttons.js"></script>

2. Set it as a dependency for your app (app.js)

        angular.module('myapp', ['cloudtypes', 'avbuttons']);

3. Use the avbuttons/connect/disconnect directives to install the functionality (index.html)

        <div avbuttons="true" connect="#connect-btn" disconnect="#disconnect-btn">
          <button id='disconnect-btn' class="active">Offline</button>
          <button id='connect-btn'>Online</button>
        </div>


4. Make sure you have some CSS that marks a button with the class 'active' as active


Library Goal
-------------
This library will be kept as close to the specifications of the paper as a JavaScript library implementation allows. When it is finished, some non-trivial applications are going to be added that explore the boundaries of the CloudTypes concept in the JavaScript environment. Afterwards forks are going to be made to explore extensions that could possibly alleviate the integration of CloudTypes in the JavaScript web development environment and to explore performance optimisations.


Progress
-------------
This section keeps track of the state of this library.

### Implemented:

* Backbone for the (single server) synchronization and thorough testing of states with cloud types.
* The Array and Entity structures for the state.
* CInt and CString implementation of a cloud type.
* Grocery list example with an Array and global CInt.
* Project Manager example using Entities which also demonstrates weak Entities
* CSet cloud type implementation. (version 0.0.9)


### In progress:
* CSet example


The Code
--------------
If any developer would be interested in fiddling around with the code, here is an overview.

### Getting started

Get your own version of the code

    git clone https://github.com/ticup/CloudTypes.git

Install the optional and developer's dependencies

    cd CloudTypes
    npm install --optional --dev

The code structure is briefly explained below.

### Shared
The core semantics of the application are shared across the server and client. This is achieved by writing all code in node require module style and using [browserify](https://github.com/substack/node-browserify) to compile all the shared and client code to a client-compatible style.

The shared folder contains all the shared code, being the core functionality of the State, CloudType and all implementations of the CloudType (CInt, CString, Entity and Array).

### Client
The client code has a main file (main.js) which is used to bundle the client code with browserify into the bundle.js file. So **don't forget to recompile** the main file whenever you **change something to the client or shared code**!

    browserify client/main.js -o client/bundle.js


Furthermore it consists of a Client, which governs the websockets, a ClientState, which is an extension of the shared State (adds for example the yield and flush operation) and a CloudTypeClient, which uses a Client and a ClientState to govern a synchronization with a CloudType server (CloudTypeServer).


### Server
The server code has somewhat the same structure as the client code: it has a Server, which governs the websockets, a ServerState, which is an extension of the shared State (adds for example the declare operation) and a CloudTypeServer, which uses a Server and a ServerState to set up a CloudType server.

### Testing
The library uses the [mocha](http://visionmedia.github.io/mocha/) test framework with the [should](https://github.com/visionmedia/should.js/) assertion module for testing.

Assuming you have installed the dev dependencies, you can start the tests from the root by running

    node_modules/.bin/mocha

Or just

    mocha

If you have mocha globally installed as

    npm install -g mocha

* **Extensions**

The extensions folder contains extensions for the core objects such as the State and CloudTypes to perform testing. It adds operations such as isJoinOf, isForkOf... to easily compare two states with each other. For each CloudType implementation (CInt, CString..) this provides a very clear test for the semantics as described in the paper. Test files should always load these objects and not the standard objects as provided in the shared directory.

* **Client**

When testing, the client also needs to have these extensions added to its core. This directory contains a main file that loads the test extensions for the client instead of the normal core. This main file is again compiled with browserify to a bundle, which is then used for the client in the test suites. **Do not forget** to also **recompile** this file if you are writing tests and **changing shared or client code**!

        browserify test/client/main.js -o test/client/bundle.js

* **stubs.js**

Defines two different states, an unchanged stated with some unchanged cloud type declarations and a changed state where all sorts of operations are performed on the cloud types and the state. These two stub states are used to test forking/joining etc. of the states in all sort of different situations. If one would **implement a new cloud type** it suffices to **add its type** to these **two stubs** in order to include it in tests for marshaling, network transfer, forking and joining.

* **State.js**

Unit tests for the State object its marshaling, forking and joining using the stubs.js states (and thus also performs all these tests for the separate cloud types) and the States object from the extensions.

* **Property.js**
Unit tests for the Property object (the Property object resembles the complete property function for each property declared for an Array or Entity).

* **CArray.js**
Unit tests for the CArray object.

* **CEntity.js**
Unit tests for the CEntity object.

* **CEntity.js**
Unit tests for the CEntity CloudType.

* **integration.js**

This is the most **important** and interesting **test suite** of all. It performs integration tests with client/server interaction. It allows to test specific semantics and synchronization scenarios between clients and server.



License
-------
[GPL v2 licensed](http://choosealicense.com/licenses/gpl-v2/).





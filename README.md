CloudTypes
==========

CloudTypes is a JavaScript library implementation of the CloudTypes model demonstrated in the paper [CloudTypes for Eventual Consistency](http://research.microsoft.com/apps/pubs/default.aspx?id=163842) by Sebastian Burckhardt, Manuel Fahndrich, Daan Leijen, and Benjamin P. Wood.

[![Build Status](https://travis-ci.org/ticup/CloudTypes.png)](https://travis-ci.org/ticup/CloudTypes)

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
This library implements the proposed model using javascript and Websockets. It does so as **explicit as possible**, **neglecting** most of the **performance** concerns. It serves both as an **experimental implementation** and a **didactic tool** to better understand the model. An interesting place to look at to learn or experiment with the model are the [integration tests](https://github.com/ticup/CloudTypes/tests/integration.js), where client and server are put together and different scenarios can be easily tested.

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

### Server

    var CloudTypes = require('cloudtypes').Server;

    // create a new CloudTypes server
    var cloudTypes = CloudTypes.createServer();

    // Declare your schema
    // Globals are declared as simple CloudTypes (currently only CInt and CString)
    cloudTypes.declare('total', CloudTypes.CInt)
              .declare('name' , CloudTypes.CString)

    // Structures: Array and Entity
    // 1. an array of index types/construction arguments: can be of type 'String', 'Int' and the name of any previously declared variable
    // 2. an object of field CloudTypes (CInt or CString)
              .declare('Grocery' , CloudTypes.CArray([{name: 'String'}], {toBuy: 'CInt'}));
              .declare('Customer', CloudTypes.CEntity([], {name: 'CString'}));
              .declare('Order'   , CloudTypes.CEntity([{customer: 'Customer'}, {Product: 'String'}], {amount: 'CInt'}));

    // publish the types (using a port number) + optionally start a convenience static file server from given path (preferably root of your project)
    cloudTypes.publish(8080, __dirname);

    // If you prefer your own static file server, simply publish the types on their own (port number)
    // or using an already existing node HttpServer
    // cloudtypes.publish(8080);
    // cloudtypes.publish(http);


### Client
Load the CloudTypes client bundle into your html and start using the distributed CloudTypes. Assuming you are serving static files from your project root:

    <html>
      <head></head>
      <body></body>
      <script src="node_modules/cloudtypes/client/bundle.js"></script>
      <script>
        // create a new CloudTypes client
        window.client = CloudTypes.createClient();

        // connect to the server
        client.listen('localhost', function handler(state) {

          // retrieve the counter CloudType variable
          var counter = state.get('counter');

          // start using the cloudtypes environment
          counter.set(1);
          counter.add(10);

          // synchronise with the server
          state.yield();
        }
      </script>
    </html>

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

 > The Array declaration function.

 1.5 **CEntity**

 > The CEntity declaration function.

2. **CloudTypeServer**

  2.1 *declare(name, cloudtype)*

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
  
 > Publishes the declared state on given port or by using given HttpServer as host.
 
        // publish on given port
        server.publish(8090);
        // publish by using given http server
        server.publish(http.createServer(handler));

 2.3 *publish(port number, static path)*

  > Publishes the declared state on given port and starts a convenience static file server from given path.

         // publish on given port + serve files from this path
         server.publish(8090, __dirname);

### Client
1. **CloudTypes** (global variable/client library API)

 1.1 *createClient()*

 > Creates a new CloudTypeClient which can be used to connect to a CloudTypeServer.


2. **CloudTypeClient**

 2.1 *connect(url, callback)*
 > Tries to connect to a CloudTypeServer hosted on given url (e.g. 'localhost' or 'http://localhost:8090').
Invokes the callback with an error if failed to connect, otherwise it provides a State as second argument (the revision).

        var client = CloudTypes.createClient();
        client.listen('localhost', function (error, state) {
          if (error)
            throw error;
          // perform operations on the state
        });

3. **State**

 > Provides environment operations which are embedded in the language in the paper.

 3.1 *get(string name)*
 
 > Retrieves the global cloud type, entity or array with given name from the state.

 3.2 *yield()*

 > Instruct to asynchronously synchronize with the server. Yield can do 3 different things when invoked in another context:
 > 1. Not expecting a revision from the server: send revision to server. (e.g. first time when you call yield)
 > 2. A revision from the server has arrived: merge it into the current revision.
 > 3. Waiting for a revision from the server: do nothing. This allows for applications to keep on working when offline.

 3.3 *flush(callback, [timeout 2000])*

 > Tries to synchronize with the server and invokes the callback when succeeded. An optional timeout (defaults to 2000) can be provided in milliseconds that specifies the amount of time flush waits for the server before failing.

        state.flush(function (error) {
          if (error)
            // was not able to synchronize after 4 seconds
          else 
            // succesfully synchronized with server
        }, 4000);

### CloudType API's

 For a more detailed explanation of the CloudTypes their API and semantics you can read the paper. Note that we use the names CArray and CEntity, while the CArray and CEntity are actually not CloudTypes themselves, in contrary to CInt and CString. We do this in order to avoid conflict with the already existing global Array object in Javascript.

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
  > Returns the entry for the given indexes (if it is neither deleted, nor depends on a deleted entity).

  2.2 *entries(propertyName)*
  > Returns a normal javascript Array of all entries for which the given property is not the default value (and for which none of the index values is either a deleted entity, nor depends on a deleted entity).

  2.3 *CArrayEntry*
  > An instance of this object is returned by the get and entries methods and represents an entry in the Array with certain index values.

    2.3.1 *get(propertyName)*
    > Returns the CloudType of the given property for this given entry.

    2.3.2 *key(keyName)*
    > Returns the value of the given keyName for this entry.

3. **CEntity**
> An Entity is like an Array, except it has an extra layer which makes sure there is the notion of existing and deleted entries (which there is not for the Array) by using the create and delete methods.

  3.1 *get(index1, index2, ...)*
  > Returns the CEntityEntry for the given indexes (if it is neither deleted, nor depends on a deleted entity).

  3.2 *create(index1, index2 ...)*
  > Creates a new CEntityEntry with given index values.

  3.3 *where(filter)*
  > Sets up a filter that can be chained with multiple other where clauses and which is finalized by using the all method.

  3.4 *all()*
  > Returns an array of CEntityEntries, possibly filtered by previously set where clauses (can be used on the CEntity directly or on the result of chained where calls).

  3.5 *CEntityEntry*
  > An instance of this object is returned by the create, get and all methods and represents an entry in an Entity with certain index values.

    3.5.1 *get(propertyName)*
    > Returns the CloudType of the given property for this given entry.

    3.3.2 *key(keyName)*
    > Returns the value of the given keyName for this entry.

    3.3.3 *delete()*
    > Delete this entry and all the other Entities/Arrays that depend on this entry.

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


Library Goal
-------------
This library will be kept as close to the specifications of the paper as a JavaScript library implementation allows. When it is finished, some non-trivial applications are going to be added that explore the boundaries of the CloudTypes concept in the JavaScript environment. Afterwards forks are going to be made to explore extensions that could possibly alleviate the integration of CloudTypes in the JavaScript web development environment and to explore performance optimisations.


Progress
-------------
This section keeps track of the state of this library.

### Currently implemented:

* Backbone for the (single server) synchronization and thorough testing of states with cloud types.
* The Array and Entity structures for the state.
* CInt and CString implementation of a cloud type.
* Grocery list example with an Array and global CInt.

### Currently worked on:

* CSet cloud type implementation.
* Example using Entities which also demonstrates weak Entities


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

* **CArray**
Unit tests for the CArray object.

* **CEntity**
Unit tests for the CEntity object.

* **integration.js**

This is the most **important** and interesting **test suite** of all. It performs integration tests with client/server interaction. It allows to test specific semantics and synchronization scenarios between clients and server.



License
-------
[GPL v2 licensed](http://choosealicense.com/licenses/gpl-v2/).





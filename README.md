CloudType.js
============

CloudType.js is a JavaScript library implementation of the CloudTypes demonstrated in the paper [CloudTypes for Eventual Consistency](http://research.microsoft.com/apps/pubs/default.aspx?id=163842) by Sebastian Burckhardt, Manuel Fahndrich, Daan Leijen, and Benjamin P. Wood.

[![Build Status](https://travis-ci.org/ticup/CloudType.js.png)](https://travis-ci.org/ticup/CloudType.js)

CloudTypes
----------

In short, CloudTypes provide language level abstractions for synchronization of distributed variables (Integer, String and Sets).

Somewhat more extensive, CloudTypes provide:

1. **Distributed variables:** CInt, CString and CSet.
These variables can be used across different clients and servers, even when the system in question is offline for days, months or years.

2. **Eventual consistency** for those variables.
All systems have their own revision of the state which they can use to locally update or query CloudTypes from. These states are synchronized using the *yield* (asynchronous) or *flush* (synchronous) operations. 

3. **Conflictless synchronization**.
States are merged in a conflictless fashion and the CloudTypes have operations that explicitly avoid conflicts.

4. **Strong consistency** when necessary.
Whenever strong consistency is necessary, it can be achieved using the *flush* operation. Furthermore, variables can be exclusively locked by combining the *setIfEmpty* and *flush* operations.

5. **Language level abstractions for implementation details**.
CloudTypes aims at abstracting the implementation details (servers, networks, caches, protocols) of the eventual consistent storage model. This allows the programmer to focus on the client-side code, instead of on the distribution details.



What Is Different
-----------------

CloudType.js is a library implementation of CloudTypes to explore the concept in a JavaScript environment. Since this is just a library implementation in contrary to the language level implementation described in the paper, it inherently differs in some ways:

1. **Server/Client boilerplate code**.
This library still requires the programmer to write the server/client boilerplate code (bullet 5). More specifically, the programmer needs to create a server, declare the cloud types and publish it (Node.js) and create a client to connect to that server (browser), which is not required in the original CloudTypes description.

2. **Higher level states**.
The state (a particular environment with CloudType variables and values) is not deeply integrated into the host environment, instead it is simply present as an object in the environment. This means variables need to be explicitly retrieved from that state, but this also means a client could possibly connect to multiple different CloudType servers and govern different CloudType states. This also means that global available functions such as *yield* and *flush* are now scoped to the state object.

3. **No UI thread**.
Since JavaScript has no separate thread for its UI, it is almost impossible to make a blocking *flush* operation. Therefore it is implemented more in the JavaScript fashion, using a callback that is called when synchronized.

Furthermore, at the moment only the single synchronous server model is being implemented, but the server pool model might follow if interest arises.

Warning
-------
This library is currently still under heavy development and you should not yet rely on it at this stage. Once finished it will be published on npm for easy usage.

Usage
-----


### Server

    var CloudTypes = require('CloudTypes/server/main');

    // create a new CloudTypes server
    var cloudTypes = CloudTypes.createServer();

    // declare the types
    cloudTypes.declare('counter', CloudTypes.CInt);

    // publish the types (takes a port number or a node HttpServer)
    cloudTypes.publish(8090);

### Client
Load the CloudTypes client bundle into your html and start using the distributed CloudTypes:

    <html>
      <head></head>
      <body></body>
      <script src="CloudTypes/client/bundle.js"></script>
      <script>
        // create a new CloudTypes client
        window.client = CloudTypes.createClient();

        // connect to the server
        client.listen('http://localhost:8090', handler);

        // actions when initial revision obtained
        function handler(state) {
          // retrieve the counter CloudType variable
          var counter = state.get('counter');

          // start using the cloudtypes environment
          counter.set(1);
          counter.add(10);

          state.yield();
        }
      </script>
    </html>

note: you will also need an http server to serve your file, check out the counter example for a quick complete bootstrap. The examples should be run from the CloudTypes directory:

    node examples/server/counter


Getting Started
---------------
As mentioned before, this library will be available on npm when finished, but for now one can also easily get it by using git (assuming you have git and npm installed):

Clone the repository using git

    git clone https://github.com/ticup/CloudType.js.git

Go into the newly created directory

    cd CloudType.js

Install the dependencies using npm

    npm install


API
---
In addition to the API described in the paper, this library also requires some client/server boilerplate setup code:

### Server

1. **CloudTypes Server Library API**

  1.1 *createServer()*

  > Creates a new CServer (CloudTypes Server) which is used to serve an accompanying state.
  
 1.2 *CInt*

 > The CInt type class.

 1.3 *CString*

 > The CString type class.

2. **CServer**

  2.1 *declare(name, cloudtype)*

  > Declares a variable with given name of given cloud type. Can only be executed before    publish and can be compared with the declaration of variables in a static language where publish is the point where the program is running.

        server.declare('counter', CloudTypes.CInt);

  2.2 *publish(port or httpserver)*
  
 > Publishes the declared state on given port or by using given httpserver as host.
 
        // publish on given port
        server.publish(8090);
        // publish by using given http server
        server.publish(http.createServer(handler));

### Client
1. **CloudTypes** (global variable/client library API)

 1.1 *createClient()*

 > Creates a new CClient (CloudTypes Client) which can be used to connect to a CServer.

 1.2 *CInt*

 > The CInt type class.

 1.3 *CString*

 > The CString type class.


2. **CClient**

 2.1 *listen(url, callback)*
 > Tries to connect to a CServer hosted on given url (e.g. 'http://localhost:8090').
Invokes the callback with an error as first string if failed to connect, otherwise it provides a State as second argument (the revision).

        var client = CloudTypes.createClient();
        client.listen('http://localhost:8090', function (error, state) {
          if (error)
            throw error;
          // perform operations on the state
        });

3. **State**

 > Provides environment operations which are embedded in the language in the paper.

 3.1 *get(string name)*
 
 > Retrieves the cloud type with given name from the environment.

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

 For a more detailed explanation of the CloudTypes their API and semantics you can read the paper.

1. **CInt**
 
 1.1 *get()*
 > Returns the current value of the CInt variable (base value + offset).

 1.2 *set(value)*
 > Sets the (base) value of the CInt variable to given value. Upon joining with other revisions, the last set always prevails as base value.

 1.3 *add(value)*
 > Adds the given value (possibly negative) to the current value by adding the value to the current offset. Upon joining with other revisions, all offset values are added to the base value.

2. **CString**
 
 1.1 *get()*
 > Returns the current value of the CString variable.

 1.2 *set(value)*
 > Sets the current value of the CString variable.

 1.3 *setIfEmpty(value)*
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


Goal
-------
This library will be kept as close to the specifications of the paper as a JavaScript library implementation allows. When it is finished, some non-trivial applications are going to be added that explore the boundaries of the CloudTypes concept in the JavaScript environment. Afterwards forks are going to be made to explore extensions that could possibly alleviate the integration of CloudTypes in the JavaScript web development environment.


Progress
-------------
This section keeps track of the state of this library.

### What is already implemented:

* Backbone for the (single server) synchronization and thorough testing of states with cloud types.
* CInt and CString implementation of a cloud type.

### What is currently worked on:

* CSet cloud type implementation.

### What will be added later:

* Non-trivial applications that explore CloudTypes its boundaries in JavaScript: Grocery and Reservation applications from the paper.
* Non-trivial applications that explore CloudTypes its boundaries in general: Eventing managing application.

### What will be explored in other forks:

* Explore ways of partitioning the revision so that clients must store only part of the entire revision, enabling CloudTypes to scale to larger systems.
* Triggering events when cloud types change, enabling UI's to respond to changes in the environment.



The Code
--------------
If any developer would be interested in fiddling around with the code, here is an overview that will get you started.

### Shared
The core semantics of the application are shared across the server and client. This is achieved by writing all code in node.js require module style and using [browserify](https://github.com/substack/node-browserify) to compile all the shared and client code to a client-compatible style.

The shared folder contains all the shared code, being the core functionality of the State, CloudType and all implementations of the CloudType (CInt, CString, Entity and Array).

### Client
The client code has a main file (main.js) which is used to bundle the client code with browserify into the bundle.js file. So don't forget to recompile the main file whenever you change something to the client or shared code!

    browserify client/main.js -o client/bundle.js


Furthermore it consists of a Client, which governs the websockets, a ClientState, which is an extension of the shared State (and for example adds the yield and flush operation) and a CClient, which uses a Client and a ClientState to govern a synchronization with a CloudType server (CCserver).


### Server
The server code has somewhat the same structure as the client code: it has a Server, which governs the websockets, a ServerState, which is an extension of the shared State (and for example adds the declare operation) and a CServer, which uses a Server and a ServerState to set up a CloudType server.

### Testing
CloudType.js uses the [mocha](http://visionmedia.github.io/mocha/) test framework, [should](https://github.com/visionmedia/should.js/) assertion module and [zombie](http://zombie.labnotes.org/) browser emulator for testing.


* **Extensions**

The extensions folder contains extensions for the core objects such as the State and CloudTypes to perform testing. It adds operations such as isJoinOf, isForkOf... to easily compare two states with each other. For each CloudType implementation (CInt, CString..) this provides a very clear test for the semantics as described in the paper. Test files should always load these objects and not the standard objects as provided in the shared directory.

* **Client**

When testing, the client also needs to have these extensions added to its core. This directory contains a main file that loads the test extensions for the client instead of the normal core. This main file is compiled with browserify to a bundle, which is then used for the client in the test suites. Do not forget to also recompile this file if you are writing tests and changing shared or client code!

        browserify test/client/main.js -o test/client/bundle.js

* **stubs.js**

Defines two different states, an unchanged one with lots of unchanged cloud type declarations and a changed one where are sorts of operations are performed on those cloud types. These two stub states are used to test forking/joining etc. of the states in all sort of different situations. If one would like to implement a new cloud type it suffices to add its type to these two stubs in order to include it in marshaling, network transfer, forking and joining.

* **State.js**

Simple unit test that tests the State object its marshaling, forking and joining using the stubs.js states (and thus also performs all these tests for the separate cloud types) and the States object from the extensions.

* **integrations.js**

This is the most important and interesting test suite of all. It performs integration tests with client/server interaction. Clients are simulated using the zombie module, allowing to test specific semantics and synchronization between clients and server.





    





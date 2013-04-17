window.client = CloudTypes.createClient();
client.listen('http://localhost', handler);

function handler() {
  var counter = client.get('counter');

  console.log(counter.get());
  counter.set(1);
  client.yield();
  console.log(counter.get());
}
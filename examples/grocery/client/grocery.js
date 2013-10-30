window.client = CloudTypes.createClient();
client.listen('http://localhost', handler);
var Grocery;

function toBuy(name, count) {
  totalItems.add(count);
  Grocery.get(name).toBuy.add(count);
}

function bought(name, count) {
  totalItems.add(- count);
  Grocery.get(name).toBuy.add(- count);
}

function display() {
  var ul = $('<ul>');
  Grocery.entries.each(function (g) {
    var li = $('<li>' + g.toBuy.get() + " " + g.name + '<li>');
    ul.append(li);
  });
  var total = $('<li>' + totalItems.get() + " total");
  ul.append(total);
  $('#grocery').html(ul);
}

function handler() {
  Grocery = client.get('Grocery');

  console.log(counter.get());
  counter.set(1);
  client.yield();
  console.log(counter.get());
}
/**
 * Created by ticup on 04/11/13.
 */
var View = require('./View');

// ListView
////////////
var ListView = View.extend({
  initialize: function () {
    ListView.__super__.initialize.call(this);
    this.views = {};
  },

  update: function () {
    var self  = this;
    var views = this.views;
    var app   = this.app;
    var ctr = 0;
    var newViews = {};

    // create new views or update existing ones
    this.value().forEach(function (item) {
      var id = item.index();
      var view = views[id];

      // view already present: update + delete from old views
      if (typeof view !== 'undefined') {
        view.update();
        delete views[id];

        // view not present: create, update and insert html in DOM
      } else {
        view = self.createItemView(item, ctr);
        view.update();
        insertAt(self.html, ctr, view.html);
      }
      view.position = ctr++;
      newViews[id] = view;
    });

    // remove old views that have no model anymore
    Object.keys(views).forEach(function (id) {
      views[id].html.remove();
      delete views[id];
    });

    // set the new views
    this.views = newViews;
  },

  getView: function (position) {
    var result;
    this.forEachView(function (view) {
      if (view.position === position) {
        result = view;
      }
    });
    return result;
  },

  createItemView: function (item) {
    throw Error("ListView.createItemView(item): should be implemented by extending object");
  },

  forEachView: function (callback) {
    var views = this.views;
    Object.keys(views).forEach(function (index) {
      callback(views[index]);
    });
  }
});

// Utility
///////////

function insertAt(parent, index, html) {
  console.log('inserting at ' + index + ' ' + html);
  console.log(parent);
  if (index === 0)
    return parent.prepend(html);
  parent.children(':nth-child(' + index + ')').after(html);
}

module.exports = ListView;
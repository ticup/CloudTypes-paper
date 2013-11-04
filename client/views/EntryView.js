/**
 * Created by ticup on 04/11/13.
 */
var View = require('./View');

// EntryView
/////////////
var EntryView = View.extend({
  initialize: function () {
    EntryView.__super__.initialize.call(this);
    defaults(this);
    var html = this.html;
    this.entry.forEachKey(function (name, value) {
      html.find('.key-'+name).html(value);
    });
  },

  update: function () {
    var self = this;
    this.entry.forEachProperty(function (name, value) {
      self.html.find('.property-'+name).html(value.get());
    });
  }
});

function defaults(entryView) {
//  if (typeof entryView.entry === 'undefined')
//    throw new Error("EntryView requires an Entry property");
  if (typeof entryView.html === 'undefined') {
    var entry = entryView.entry;
    var html  = entryView.html = $("<li class='list-group-item' data-index='" + entry.index() + "'></li>");
    entry.forEachKey(function (name, value) {
      html.append("<div class='key-" + name + "'>" + value + "</div>");
    });
    entry.forEachProperty(function (name) {
      html.append("<div class='property-" + name + "'></div>");
    });
  }
}

module.exports = EntryView;
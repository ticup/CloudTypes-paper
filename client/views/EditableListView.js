/**
 * Created by ticup on 06/11/13.
 */
var ListView = require('./ListView');

var EditableListView = ListView.extend({
  edit: function (entry) {
    this.forEachView(function (view) {
      if (view.entry.equals(entry)) {
        view.edit();
      }
    });
  },
  finishEdit: function () {
    this.forEachView(function (view) {
      view.finishEdit();
    });
  }
});

module.exports = EditableListView;
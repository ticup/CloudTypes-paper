/**
 * Created by ticup on 06/11/13.
 */
// SelectView
//////////////
var SelectView = CloudTypes.ListView.extend({
  initialize: function () {
    SelectView.__super__.initialize.call(this);
    this.update();
    var first = this.getView(0);
    if (typeof first !== 'undefined') {
      first.position = 0;
    }
  },
  unselect: function () {
    this.forEachView(function (view) {
      view.unselect();
    });
  },

  update: function () {
    SelectView.__super__.update.call(this);
    var selected = this.html.find($('option:selected'));
    var view = this.getView(selected.index());
    if (typeof view !== 'undefined') {
      this.unselect();
      view.selected = true;
    }
  },

  selected: function () {
    var result;
    this.forEachView(function (view) {
      if (view.selected)
        result = view;
    });
    if ((typeof result === 'undefined') && this.views.length > 0)
      result = this.firstView();
    return result;
  }
});

// OptionView
//////////////
var OptionView = CloudTypes.View.extend({
  initialize: function () {
    var self = this;
    this.selected = false;
    this.html = $("<option></option>")
        .click(function () { self.listView.unselect(); self.selected = true; });
    OptionView.__super__.initialize.call(this);
  },

  update: function () {
    this.html.html(this.entry.get('name').get());
  },

  unselect: function () {
    this.selected = false;
  }
});

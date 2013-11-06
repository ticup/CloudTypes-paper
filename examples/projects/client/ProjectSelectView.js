/**
 * Created by ticup on 06/11/13.
 */
// ProjectSelectView
/////////////////////
var ProjectSelectView = SelectView.extend({
  value: function () {
   return this.app.Projects.all();
  },
  createItemView: function (item) {
   return new ProjectOptionView({entry: item, app: this.app, listView: this});
  }
});

// ProjectOptionView
/////////////////////
var ProjectOptionView = OptionView.extend({
  update: function () {
    this.html.html(this.entry.get('name').get());
  }
});

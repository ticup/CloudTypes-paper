/**
 * Created by ticup on 06/11/13.
 */
// MemberSelectView
/////////////////////
var MemberSelectView = SelectView.extend({
  value: function () {
   return this.app.Members.all();
  },
  createItemView: function (item) {
   return new MemberOptionView({entry: item, app: this.app, listView: this});
  }
});

// MemberOptionView
/////////////////////
var MemberOptionView = OptionView.extend({
  update: function () {
    this.html.html(this.entry.get('name').get());
  }
});

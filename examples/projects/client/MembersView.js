// MembersView
///////////////
var MembersView = CloudTypes.EditableListView.extend({
  value: function () {
    return this.app.Members.all();
  },

  createItemView: function (item) {
    return new MemberView({entry: item, app: this.app, listView: this});
  },

  onCreateMember: function (event) {
    event.preventDefault();
    this.app.finishEdit();
    var member = this.app.createMember();
    this.app.update();
    this.edit(member);
    return false;
  },

  install: function () {
    var self = this;

    // create member button
    $('#maincreatemember').click(function (event) {
      return self.onCreateMember(event);
    });
  }
});

$(function () {
  // prevent bubbling for input field
  $('#editmembername').click(function () { return false; });
});
/**
 * Created by ticup on 06/11/13.
 */
// SideMembersView
////////////////////
var SideMembersView = MembersView.extend({
  createItemView: function (item) {
    return new SideMemberView({entry: item, app: this.app, listView: this});
  },

  install: function () {
    var self = this;
    $('#sidecreatemember').click(function (event) {
      return self.onCreateMember(event);
    });
  }
});


// SideMemberView
///////////////////
var SideMemberView = MemberView.extend({
  initialize: function () {
    var self = this;
    SideMemberView.__super__.initialize.call(this);
    this.html = $("<li class='list-group-item side-member-item'></li>")
        .click(function (event) { if (!self.editing) { self.edit(this); }});
    this.header = this.html;
    this.nameHtml = $("<span></span>").appendTo(this.html);
  },
  update: function () {
    if (!this.editing) {
      this.nameHtml.html(this.entry.get('name').get());
    }
  }

});

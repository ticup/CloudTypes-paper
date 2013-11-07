/**
 * Created by ticup on 06/11/13.
 */

// MemberTasksView
//////////////////////
var MemberTasksView = CloudTypes.EditableListView.extend({
  value: function () {
    var member = this.member;
    return this.app.Tasks
        .where(function (task) { return task.key('assignee').equals(member); })
        .orderBy('priority', 'desc')
        .all();
  },
  update: function () {
    MemberTasksView.__super__.update.call(this);
    if (Object.keys(this.views).length === 0) {
      this.html.html($("<li class='list-group-item dummy text-muted'>Nothing to do</li>"));
    } else {
      this.html.find('.dummy').remove();
    }
  },
  createItemView: function (item) {
    return new MemberTaskView({entry: item, app: this.app, listView: this});
  }
});

$(function () {
  // prevent bubbling for input field
  $('#edittaskdescription').click(function () { return false; });
});
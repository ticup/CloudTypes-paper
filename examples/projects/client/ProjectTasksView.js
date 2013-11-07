/**
 * Created by ticup on 06/11/13.
 */

// ProjectTasksView
//////////////////////
var ProjectTasksView = MemberTasksView.extend({
  value: function () {
    var project = this.project;
    return this.app.Tasks
        .where(function (task) { return task.key('project').equals(project); })
        .orderBy('priority', 'desc')
        .all();
  },
  createItemView: function (item) {
    return new ProjectTaskView({entry: item, app: this.app, listView: this});
  }
});
/**
 * Created by ticup on 06/11/13.
 */

// ProjectTaskView
//////////////////
var ProjectTaskView = TaskView.extend({
  update: function () {
    if (!this.editing) {
      this.span.html(" (" + this.entry.key('assignee').get('name').get() + ")");
      this.description.html(this.entry.get('description').get());
    }
  }
});
/**
 * Created by ticup on 06/11/13.
 */

// MemberTaskView
//////////////////
var MemberTaskView = TaskView.extend({
  update: function () {
    if (!this.editing) {
      this.span.html(" (" + this.entry.key('project').get('name').get() + ")");
      this.description.html(this.entry.get('description').get());
    }
  }
});
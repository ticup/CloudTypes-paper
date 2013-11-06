/**
 * Created by ticup on 06/11/13.
 */
// ProjectsView
////////////////
var ProjectsView = CloudTypes.EditableListView.extend({
  value: function () {
    return this.app.Projects.all();
  },

  createItemView: function (item) {
    return new ProjectView({entry: item, app: this.app, listView: this});
  },

  onCreateProject: function (event) {
    event.preventDefault();
    this.app.finishEdit();
    var project = this.app.createProject();
    this.app.update();
    this.edit(project);
    return false;
  },

  install: function () {
    var self = this;
    $('#maincreateproject').click(function (event) { self.onCreateProject(event); });
  }
});

$(function () {
  // prevent bubbling for input field
  $('#editprojectname').click(function () { return false; });
});
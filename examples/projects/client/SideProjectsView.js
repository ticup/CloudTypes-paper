/**
 * Created by ticup on 06/11/13.
 */
// SideProjectsView
////////////////////
var SideProjectsView = ProjectsView.extend({
  createItemView: function (item) {
    return new SideProjectView({entry: item, app: this.app, listView: this});
  },

  install: function () {
    var self = this;
    $('#sidecreateproject').click(function (event) { self.onCreateProject(event); });

  }
});


// SideProjectView
///////////////////
var SideProjectView = ProjectView.extend({
  initialize: function () {
    var self = this;
    SideProjectView.__super__.initialize.call(this);
    this.html = $("<li class='list-group-item side-project-item'></li>")
        .click(function (event) { if (!self.editing) { self.edit(); }});
    this.header = this.html;
    this.nameHtml = $("<span></span>").appendTo(this.html);
  },
  update: function () {
    if (!this.editing) {
      this.nameHtml.html(this.entry.get('name').get());
    }
  }
});
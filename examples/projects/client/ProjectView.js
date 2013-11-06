/**
 * Created by ticup on 06/11/13.
 */
// ProjectView
///////////////
var ProjectView = CloudTypes.EntryView.extend({
  initialize: function () {
    var self = this;
    this.editing = false;
    this.html = $("<div class='col-md-4 project text-left'></div>");
    this.panel = $("<div class='panel panel-default'></div>").appendTo(this.html);
    this.header = $("<div class='project-header panel-heading text-center'></div>")
        .appendTo(this.panel)
        .click(function () { if (!self.editing) { self.edit(); } });
    this.nameHtml = $("<span></span>").appendTo(this.header);
    this.tasksDiv = $("<ul class='project-tasks list-group'></ul>").appendTo(this.panel);
    this.tasksView = new ProjectTasksView({app: this.app, html: this.tasksDiv, project: this.entry});

    // Install create new task
    this.html.append($("<form class=form-inline><div class='form-group'><select class='selectpicker' title='Choose a Member'></select></div><div class='form-group'><input type=submit class='btn btn-default createprojecttask' value='New Task'></div></form>")
        .submit(function (event) {
          event.preventDefault();

          var project  = self.entry;
          var memberView = self.memberSelectView.selected();
          if (typeof memberView === 'undefined') {
            alert("Make a Member to assign the task to first");
            return false;
          }
          var task = self.app.createTask(memberView.entry, project);
          self.app.update();
          self.tasksView.edit(task);
          return false;
        }));
    this.html.find('select').selectpicker();

    this.memberSelectView = new MemberSelectView({app: this.app, html: this.html.find('select')});

    ProjectView.__super__.initialize.call(this);
  },

  update: function () {
    if (!this.editing) {
      this.nameHtml.html(this.entry.get('name').get());
    }

    this.tasksView.update();
    this.memberSelectView.update();

    this.html.find('select').selectpicker('refresh');

  },

  edit: function () {
    var self = this;
    var app = this.app;
    var project = this.entry;
    this.app.finishEdit();
    this.editing = true;
    this.nameHtml.addClass('hide');
    this.header.append($('#editprojectform')
        .removeClass('hide')
        .submit(function (event) {
          event.preventDefault();
          var name = $("#editprojectname").val();
          self.finishEdit();
          app.renameProject(project, name);
          app.update();
          return false;
        }));
    $('#editprojectname')
        .val(this.entry.get('name').get())
        .focus()
        .select();
    $('#editprojectcancel').click(function () {
      self.finishEdit();
      return false;
    });
    $('#editprojectdelete').click(function () {
      self.finishEdit();
      app.deleteProject(project);
      app.update();
      return false;
    })
  },

  finishEdit: function () {
    if (this.editing) {
      this.nameHtml.removeClass('hide');
      $('#editprojectform')
          .addClass('hide')
          .unbind()
          .appendTo($('body'))
          .find('input[type=text]').val('');
      $('#editprojectcancel').unbind();
      $('#editprojectdelete').unbind();
      this.editing = false;
      this.update();
    }
    this.tasksView.finishEdit();
  }
});

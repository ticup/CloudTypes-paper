/**
 * Created by ticup on 06/11/13.
 */
// MemberView
//////////////
var MemberView = CloudTypes.EntryView.extend({
  initialize: function () {
    var self = this;
    this.editing = false;
    this.html = $("<div class='col-md-4 member text-left'></div>");
    this.panel = $("<div class='panel panel-default'></div>").appendTo(this.html);
    this.header = $("<div class='member-header panel-heading text-center'></div>").appendTo(this.panel);
    this.nameHtml = $("<span></span>").appendTo(this.header);
    this.tasksDiv = $("<ul class='member-tasks list-group'></ul>").appendTo(this.panel);
    this.tasksView = new MemberTasksView({app: this.app, html: this.tasksDiv, member: this.entry});
    this.html.find('.member-header').click(function () { if (!self.editing) { self.edit(this); } });

    // Install create new task
    this.html.append($("<form class=form-inline><div class='form-group'><select class='selectpicker' title='Choose a Project'></select></div><div class='form-group'><input type=submit class='btn btn-default createmembertask' value='New Task'></div></form>")
        .submit(function (event) {
          event.preventDefault();

          var member  = self.entry;
          var projectView = self.projectSelectView.selected();
          if (typeof projectView === 'undefined') {
            alert("Make a project to assign the task to first");
            return false;
          }
          var task = self.app.createTask(member, projectView.entry);
          self.app.update();
          self.tasksView.edit(task);
          return false;
        }));
    this.html.find('select').selectpicker();

    this.projectSelectView = new ProjectSelectView({app: this.app, html: this.html.find('select')});

    MemberView.__super__.initialize.call(this);
  },

  update: function () {
    if (!this.editing) {
      this.nameHtml.html(this.entry.get('name').get());
    }
    this.tasksView.update();
    this.projectSelectView.update();
    this.html.find('select').selectpicker('refresh');
  },

  edit: function () {
    var self = this;
    var app = this.app;
    var member = this.entry;
    this.app.finishEdit();
    this.editing = true;
    this.nameHtml.addClass('hide');
    this.header.append($('#editmemberform')
        .removeClass('hide')
        .submit(function (event) {
          event.preventDefault();
          var name = $("#editmembername").val();
          self.finishEdit();
          app.renameMember(member, name);
          app.update();
          return false;
        }));
    $('#editmembername')
        .val(this.entry.get('name').get())
        .focus()
        .select();
    $('#editmembercancel').click(function () {
      self.finishEdit();
      return false;
    });
    $('#editmemberdelete').click(function () {
      self.finishEdit();
      app.deleteMember(member);
      app.update();
      return false;
    })
  },

  finishEdit: function () {
    if (this.editing) {
      this.nameHtml.removeClass('hide');
      $('#editmemberform')
          .addClass('hide')
          .unbind()
          .appendTo($('body'))
          .find('input[type=text]').val('');
      $('#editmembercancel').unbind();
      $('#editmemberdelete').unbind();
      this.editing = false;
      this.update();
    }
    this.tasksView.finishEdit();
  }
});

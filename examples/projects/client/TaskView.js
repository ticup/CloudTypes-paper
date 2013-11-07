/**
 * Created by ticup on 06/11/13.
 */

// TaskView
/////////////
var TaskView = CloudTypes.View.extend({
  initialize: function () {
    var self  = this;
    this.html = $("<li class='list-group-item task-item'></li>")
        .click(function () { if (!self.editing) { self.edit(); } });
    this.priorityVotes = $("<div class='priority-votes task-col'></div>").appendTo(this.html);
    this.up = $("<span class='priority-up glyphicon glyphicon-chevron-up'></span>")
        .appendTo(this.priorityVotes)
        .click(function () { self.priorityUp(); return false; });
    this.down = $("<span class='priority-down glyphicon glyphicon-chevron-down'></span>")
        .appendTo(this.priorityVotes)
        .click(function () { self.priorityDown(); return false; });
    this.description = $("<div class='description task-col'></div>").appendTo(this.html);
    this.editor = $("<div class='hide'></div>").appendTo(this.html);
    this.span = $("<span class='text-muted'></span>").appendTo(this.html);
    this.badge = $("<span class='badge'></span>").appendTo(this.html);

  },

  update: function () {
    throw new Error("Implemented by subclass only");
  },

  edit: function () {
    var self = this;
    var li = this.html;
    var app = this.app;
    var task = this.entry;
    this.app.finishEdit();
    this.editing = true;
    this.description.addClass('hide');
    this.editor.removeClass('hide')
               .html($('#edittaskform')
        .removeClass('hide')
        .submit(function (event) {
          event.preventDefault();
          var name = $("#edittaskdescription").val();
          self.finishEdit();
          app.renameTask(task, name);
          app.update();
          return false;
        }));
    $('#edittaskdescription')
        .val(this.entry.get('description').get())
        .focus()
        .select();
    $('#edittaskcancel').click(function () {
      self.finishEdit();
      return false;
    });
    $('#edittaskdelete').click(function () {
      self.finishEdit();
      app.deleteTask(task);
      app.update();
      return false;
    });
  },

  priorityUp: function () {
    this.app.increasePriority(this.entry, 1);
    this.app.update();
  },
  priorityDown: function () {
    this.app.decreasePriority(this.entry, 1);
    this.app.update();
  },

  finishEdit: function () {
    if (this.editing) {
      $('#edittaskform')
          .addClass('hide')
          .unbind()
          .appendTo($('body'))
          .find('input[type=text]').val('');
      $('#edittaskcancel').unbind();
      $('#edittaskdelete').unbind();
      this.editor.addClass('hide');
      this.description.removeClass('hide');
      this.editing = false;
      this.update();
    }
  }
});
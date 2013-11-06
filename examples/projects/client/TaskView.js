/**
 * Created by ticup on 06/11/13.
 */

// TaskView
/////////////
var TaskView = CloudTypes.View.extend({
  initialize: function () {
    var self  = this;
    this.html = $("<li class='list-group-item'></li>")
        .click(function () { if (!self.editing) { self.edit(); } });
    this.description = $("<span></span>").appendTo(this.html);
    this.span = $("<span class='text-muted'></span>").appendTo(this.html);
  },

  update: function () {
    if (!this.editing) {
      this.html.html(this.entry.get('description').get());
    }
  },

  edit: function () {
    var self = this;
    var li = this.html;
    var app = this.app;
    var task = this.entry;
    this.app.finishEdit();
    this.editing = true;
    $(li).html($('#edittaskform')
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

  finishEdit: function () {
    if (this.editing) {
      $('#edittaskform')
          .addClass('hide')
          .unbind()
          .appendTo($('body'))
          .find('input[type=text]').val('');
      $('#edittaskcancel').unbind();
      $('#edittaskdelete').unbind();
      this.description = $("<span></span>").appendTo(this.html);
      this.span = $("<span class='text-muted'></span>").appendTo(this.html);
      this.editing = false;
      this.update();
    }
  }
});
/**
 * Created by ticup on 31/10/13.
 */

// CloudTypes Client Setup
//////////////////////////
var State, connect, disconnect;

var client = CloudTypes.createClient();
client.connect(window.location.hostname + ":" + window.location.port, function (state) {
  // on initial connect

  State = state; // debug
  var app = new Application(state);

  // start yielding
  start(app, 500);

  // install views into DOM + update with state
  app.install();
  app.update();

  setupAvailabilityButtons();

// on reconnect
}, function () {
  setupAvailabilityButtons(); // needs to be called again since it relies on the (new) socket of the client!
});


// Application
///////////////
function Application (state) {
  this.state   = state;
  this.Members  = state.get('Member');
  this.Projects = state.get('Project');
  this.Tasks    = state.get('Task');

  // Panel "Members"
  this.MembersView      = new MembersView({app: this, html: '.main-list-members'});
  this.SideProjectsView = new SideProjectsView({app: this, html: '.side-list-projects'});
  this.membersTab       = [this.MembersView, this.SideProjectsView];

  // Panel "Projects"
  this.ProjectsView     = new ProjectsView({app: this, html: '.main-list-projects'});
  this.SideMembersView  = new SideMembersView({ app: this, html: '.side-list-members'});
  this.projectsTab      = [this.ProjectsView, this.SideMembersView];

  this.activate('#members');
}

// Members
Application.prototype.createMember = function () {
  console.log("creating new member");
  var member = this.Members.create();
  member.get('name').set("New Member");
  this.state.yield();
  return member;
};

Application.prototype.deleteMember = function (member) {
  console.log('deleting member: ' + member.index());
  member.delete();
  this.state.yield();
};

Application.prototype.renameMember = function (member, name) {
  console.log("renaming " + member + " to " + name);
  member.get('name').set(name);
  this.state.yield();
};

// Projects
Application.prototype.createProject = function () {
  console.log("creating new Project");
  var project = this.Projects.create();
  project.get('name').set("New Project");
  this.state.yield();
  return project;
};

Application.prototype.deleteProject = function (project) {
  console.log('deleting project: ' + project.index());
  project.delete();
  this.state.yield();
};

Application.prototype.renameProject = function (project, name) {
  console.log("project " + project + " to " + name);
  project.get('name').set(name);
  this.state.yield();
};

// Tasks
Application.prototype.createTask = function (member, project) {
  console.log("creating new Task");
  var task = this.Tasks.create([member, project]);
  this.state.yield();
  return task;
};

Application.prototype.deleteTask = function (task) {
  console.log('deleting task: ' + task.index());
  task.delete();
  this.state.yield();
};

Application.prototype.renameTask = function (task, description) {
  console.log("rename task " + task + " to " + description);
  task.get('description').set(description);
  this.state.yield();
};

Application.prototype.increasePriority = function (task, amount) {
  task.get('priority').add(amount);
  this.state.yield();
};

Application.prototype.decreasePriority = function (task, amount) {
  this.increasePriority(task, - amount);
};


// Application
Application.prototype.activate = function (tab) {
  this.tab = tab;
  if (tab === '#members') {
    this.active = this.membersTab;
  } else {
    this.active = this.projectsTab;
  }
  this.update();
};

Application.prototype.update = function () {
  this.active.forEach(function (view) {
    view.update();
  });
};

Application.prototype.finishEdit = function () {
  this.active.forEach(function (view) {
    view.finishEdit();
  });
};

Application.prototype.install = function () {
  var self = this;
  this.MembersView.install();
  this.SideProjectsView.install();
  this.ProjectsView.install();
  this.SideMembersView.install();


  $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
    self.activate($(e.target).attr('href'));
  });
};



// Client
//////////
var stop = function stop() { };

function start(app, ms) {
  var yielding = setInterval(function () {
    app.state.yield();
    app.update();
  }, ms);
  stop = function () { clearInterval(yielding); };
}



// Availability Buttons
////////////////////////
function setupAvailabilityButtons() {
  showConnect();
  client.socket.on('disconnect', showDisconnect);
}

function showConnect() {
  console.log('connected');
  $('#disconnect-btn').removeClass('active');
  $('#connect-btn').addClass('active');
}
function showDisconnect() {
  console.log('disconeected');
  $('#connect-btn').removeClass('active');
  $('#disconnect-btn').addClass('active');
}
// install disconnect/disconnect
$('#disconnect-btn').click(function () {
  if (!$('#disconnect-btn').hasClass('active')) {
    client.disconnect();
  }
});
$('#connect-btn').click(function () {
  if (!$('#connect-btn').hasClass('active')) {
    client.reconnect();
  }
});
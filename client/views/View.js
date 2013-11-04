/**
 * Created by ticup on 04/11/13.
 */

function View(attrs) {
  var view = this;
  if (typeof attrs !== 'undefined') {
    Object.keys(attrs).forEach(function (attr) {
      view[attr] = attrs[attr];
    });
  }
  if (typeof this.initialize === 'function')
    this.initialize();
}

View.extend = function (protoProps, staticProps) {
  var parent = this;
  var child;

  // The constructor function for the new subclass is either defined by you
  // (the "constructor" property in your `extend` definition), or defaulted
  // by us to simply call the parent's constructor.
  if (protoProps && (Object.hasOwnProperty(protoProps, 'constructor'))) {
    child = protoProps.constructor;
  } else {
    child = function (){ return parent.apply(this, arguments); };
  }


  // Add constructor properties of parent to the child constructor function
  Object.keys(parent).forEach(function (prop) {
    child[prop] = parent[prop];
  });

  // Add supplied constructor properties to the constructor function.
  if (staticProps)
    Object.keys(staticProps).forEach(function (prop) {
      child[prop] = staticProps[prop];
    });

  // Set prototype chain to inherit from parent
  child.prototype = Object.create(parent.prototype);

  // Add supplied prototype properties (instance properties) to the child's prototype
  if (protoProps) {
    Object.keys(protoProps).forEach(function (prop) {
      child.prototype[prop] = protoProps[prop];
    });
  }

  // Set a convenience property in case the parent's prototype is needed
  // later.
  child.__super__ = parent.prototype;

  child.__parent__ = parent;

  return child;
};

View.prototype.initialize = function () {
  this.html = $(this.html);
};

module.exports = View;
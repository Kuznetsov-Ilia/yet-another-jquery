/*
  depends:
    $.events
    $.Model
    $.log
    $.pick
    $.keys
    $.result
    $.extend
    $.isFunction
    $.inherits
    $.is
  exports:
    $.View
*/
$.View = View;
$.View.extend = $.inherits;

var VIEW_DEFAULTS = {
  whereToRender: 'inner'// innerHTML textContent insertAdjacentHTML(beforebegin afterbegin beforeend afterend)
};
var VIEW_UID = 0;

var VIEW_RENDER_METHODS = {
  inner: 'html',
  before: 'before',
  after: 'after'
};

function View(_options) {
  this.cid = VIEW_UID++;
  var options = $.extend({}, VIEW_DEFAULTS, this.defaults, _options);
  $.extend(this, options);
  this.initialize(options).delegateEvents();
}

$.extend(View.prototype, $.events, {

  $: function (selector) {
    return this.el.find(selector);
  },

  init: $.noop,

  initialize: function (options) {
    this.name = options.name;

    if ('Model' in options) {
      this.model = new options.Model(options.data);
    }

    if (options.watch && this.model) {
      this.model.on('change:' + options.watch, this.render, this);
    }

    this.init(options);
    if (options.render) {
      this.render();
    }
    return this;
  },

  render: function (model, data) {
    if ($.isset(data)) {
      if (model instanceof $.Model) {
        model = model
      } else if ($.isset(this.model) && this.model instanceof $.Model) {
        model = this.model;
      } else {
        return console.error('no model is available. place data to the first argument');
      }
    } else if ($.isset(model)) {
      if (model instanceof $.Model) {
        model = model
        data = model.toJSON();
      } else if ($.isObject(model)) {
        data = model;
      } else {
        return console.error('wrong type: must be model or object');
      }
    } else if ($.isset(this.model) && this.model instanceof $.Model) {
      model = this.model;
      data = model.toJSON();
    } else {
      data = {};
    }

    var html = this.template(data);
    var method = VIEW_RENDER_METHODS[this.whereToRender];
    if ($.isset(method)) {
      this.el[method](html);
    } else {
      console.error('unknown whereToRender method:', this.whereToRender, VIEW_RENDER_METHODS);
    }
    return this;
  },

  // Remove this view by taking the element out of the DOM, and removing any
  // applicable Backbone.Events listeners.
  remove: function () {
    if (this.model) {
      this.model.clear({
        silent: 1
      }).off()
    }
    this.el.parent().removeChild(this.el);
    this.stopListening();
    return this;
  },

  template: function () {},



  // Set callbacks, where `this.events` is a hash of
  //
  // *{"event selector": "callback"}*
  //
  //     {
  //       'mousedown .title':  'edit',
  //       'click .button':     'save',
  //       'click .open':       function(e) { ... }
  //     }
  //
  // pairs. Callbacks will be bound to the view, with `this` set properly.
  // Uses event delegation for efficiency.
  // Omitting the selector binds the event to `this.el`.
  // This only works for delegate-able events: not `focus`, `blur`, and
  // not `change`, `submit`, and `reset` in Internet Explorer.
  delegateEvents: function (events) {
    if (!(events || (events = $.result(this, 'events')))) {
      return this;
    }
    this.undelegateEvents();
    for (var key in events) {
      var method = events[key];
      if (!$.isFunction(method)) {
        method = this[events[key]];
      }
      if (!method) {
        continue;
      }
      this.el.on(key, method, this);
    }
    return this;
  },

  // Clears all callbacks previously bound to the view with `delegateEvents`.
  // You usually don't need to use this, but may wish to if you have multiple
  // Backbone views attached to the same DOM element.
  undelegateEvents: function () {
    this.el.off();
    return this;
  }

});

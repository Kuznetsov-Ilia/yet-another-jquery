/*
  depends:
    $.events
    $.result
    $.extend
    $.clone
    $.inherits
    $.isEqual
  exports:
    $.Model
*/

// Backbone.Model
// --------------

// Backbone **Models** are the basic data object in the framework --
// frequently representing a row in a table in a database on your server.
// A discrete chunk of data and a bunch of useful, related methods for
// performing computations and transformations on that data.

// Create a new model with the specified attributes. A client id (`cid`)
// is automatically generated and assigned for you.
$.Model = Model;
$.Model.extend = $.inherits;

var MODEL_UID = 0;

function Model(attributes, options) {
  var attrs = attributes || {};
  options = options || {};
  this.cid = MODEL_UID++;
  this.attributes = {};
  if (options.collection) {
    this.collection = options.collection;
  }
  if (options.parse) {
    attrs = this.parse(attrs, options) || {};
  }
  attrs = $.extend({}, $.result(this, 'defaults'), attrs);
  this.set(attrs, options);
  this.changed = {};
  this.initialize.apply(this, arguments);
}

// Attach all inheritable methods to the Model prototype.
$.extend(Model.prototype, $.events, {

  // A hash of attributes whose current and previous value differ.
  changed: null,

  // Initialize is an empty function by default. Override it with your own
  // initialization logic.
  initialize: function () {},

  // Return a copy of the model's `attributes` object.
  toJSON: function () {
    return $.keys(this.attributes).length ? $.clone(this.attributes) : {};
  },

  // Get the value of an attribute.
  get: function (attr) {
    return this.attributes[attr];
  },

  // Returns `true` if the attribute contains a value that is not null
  // or undefined.
  has: function (attr) {
    return this.get(attr) !== null;
  },

  // Set a hash of model attributes on the object, firing `"change"`. This is
  // the core primitive operation of a model, updating the data and notifying
  // anyone who needs to know about the change in state. The heart of the beast.
  set: function (key, val, options) {
    var attr, attrs, unset, changes, silent, changing, prev, current;
    if (key === null) {
      return this;
    }

    // Handle both `"key", value` and `{key: value}` -style arguments.
    if (typeof key === 'object') {
      attrs = key;
      options = val;
    } else {
      (attrs = {})[key] = val;
    }

    options = options || {};

    // Extract attributes and options.
    unset = options.unset;
    silent = options.silent;
    changes = [];
    changing = this._changing;
    this._changing = true;

    if (!changing) {
      this._previousAttributes = $.clone(this.attributes);
      this.changed = {};
    }
    current = this.attributes;
    prev = this._previousAttributes;

    // For each `set` attribute, update or delete the current value.
    for (attr in attrs) {
      val = attrs[attr];
      if (!$.isEqual(current[attr], val)) {
        changes.push(attr);
      }
      if (!$.isEqual(prev[attr], val)) {
        this.changed[attr] = val;
      } else {
        delete this.changed[attr];
      }
      if (unset) {
        delete current[attr];
      } else {
        current[attr] = val;
      }
    }

    // Trigger all relevant attribute changes.
    if (!silent) {
      if (changes.length) {
        this._pending = true;
      }
      for (var i = 0, l = changes.length; i < l; i++) {
        this.trigger('change:' + changes[i], this, current[changes[i]], options);
      }
    }

    // You might be wondering why there's a `while` loop here. Changes can
    // be recursively nested within `"change"` events.
    if (changing) {
      return this;
    }
    if (!silent) {
      while (this._pending) {
        this._pending = false;
        this.trigger('change', this, options);
      }
    }
    this._pending = false;
    this._changing = false;
    return this;
  },

  // Remove an attribute from the model, firing `"change"`. `unset` is a noop
  // if the attribute doesn't exist.
  unset: function (attr, options) {
    return this.set(attr, void 0, $.extend({}, options, {
      unset: true
    }));
  },

  // Clear all attributes on the model, firing `"change"`.
  clear: function (options) {
    var attrs = {};
    for (var key in this.attributes) {
      attrs[key] = void 0;
    }
    return this.set(attrs, $.extend({}, options, {
      unset: true
    }));
  },

  // Determine if the model has changed since the last `"change"` event.
  // If you specify an attribute name, determine if that attribute has changed.
  hasChanged: function (attr) {
    if (attr === null) {
      return $.keys(this.changed).length !== 0;
    }
    return attr in this.changed;
  },

  // Return an object containing all the attributes that have changed, or
  // false if there are no changed attributes. Useful for determining what
  // parts of a view need to be updated and/or what attributes need to be
  // persisted to the server. Unset attributes will be set to undefined.
  // You can also pass an attributes object to diff against the model,
  // determining if there *would be* a change.
  changedAttributes: function (diff) {
    if (!diff) {
      return this.hasChanged() ? $.clone(this.changed) : false;
    }
    var val, changed = false;
    var old = this._changing ? this._previousAttributes : this.attributes;
    for (var attr in diff) {
      if ($.isEqual(old[attr], (val = diff[attr]))) {
        continue;
      }
      (changed || (changed = {}))[attr] = val;
    }
    return changed;
  },

  // Get the previous value of an attribute, recorded at the time the last
  // `"change"` event was fired.
  previous: function (attr) {
    if (attr === null || !this._previousAttributes) {
      return null;
    }
    return this._previousAttributes[attr];
  },

  // Get all of the attributes of the model at the time of the previous
  // `"change"` event.
  previousAttributes: function () {
    return $.clone(this._previousAttributes);
  },

  // Fetch the model from the server. If the server's representation of the
  // model differs from its current attributes, they will be overridden,
  // triggering a `"change"` event.
  fetch: function (options) {
    options = options ? $.clone(options) : {};
    if (options.parse === void 0) {
      options.parse = true;
    }
    var model = this;
    var success = options.success;
    options.success = function (resp) {
      if (!model.set(model.parse(resp, options), options)) {
        return false;
      }
      if (success) {
        success(model, resp, options);
      }
    };
    wrapError(this, options);
    return this.sync('read', this, options);
  },

  // **parse** converts a response into the hash of attributes to be `set` on
  // the model. The default implementation is just to pass the response along.
  parse: function (resp /*, options*/ ) {
    return resp;
  },

  // Create a new model with identical attributes to this one.
  clone: function () {
    return new this.constructor(this.attributes);
  }
});
var wrapError = function (model, options) {
  var error = options.error;
  options.error = function (resp) {
    if (error) {
      error(model, resp, options);
    }
    model.trigger('error', model, resp, options);
  };
};

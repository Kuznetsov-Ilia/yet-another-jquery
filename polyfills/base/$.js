W = window;
D = document;
B = D.body;
H = D.documentElement;

var NLp = NodeList.prototype;
var Np = Node.prototype;
var Ep = Element.prototype;
var Ap = Array.prototype;
var Fp = Function.prototype;
var HFE = HTMLFormElement.prototype;
$ = {

  isRegExp: function (value) {
    return $.isset(value) && value instanceof RegExp;
  },
  isFunction: function (value) {
    return $.isset(value) && value instanceof Function;
  },
  isNode: function (value) {
    return $.isset(value) && value instanceof Node;
  },
  isObject: function (value) {
    return $.isset(value) && value instanceof Object;
  },
  isArray: function (value) {
    return $.isset(value) && value instanceof Array;
  },
  isString: function (value) {
    return $.isset(value) && typeof value == 'string';
  },
  isNumber: function (value) {
    return $.isset(value) && typeof value == 'number';
  },
  isUndefined: function (value) {
    return typeof value === 'undefined'
  },
  isset: function (value) {
    return typeof value !== 'undefined';
  },
  is: function (value) {
    return $.isset(value) && !!value;
  },
  isEqual: function (input1, input2) {
    return input1 === input2 || JSON.stringify(input1) == JSON.stringify(input2);
  },


  each: function(collection, func) {
    for (var i = 0, l = collection.length; i < l; i++) {
      func(collection[i], i);
    }
  },

  extend: function (original, extended) {
    if (arguments.length > 2) {
      for (var i = 1, l = arguments.length; i < l; i++) {
        $.extend(original, arguments[i]);
      }
    } else {
      if ($.isObject) {
        for (var key in extended) {
          original[key] = extended[key];
        }
      }
    }
    return original;
  },

  new: function (tagName) {
    return D.createElement(tagName || 'div');
  },
  now: Date.now ? Date.now : function () {
    return +(new Date)
  },
  rand: function () {
    return (Math.random() * 1e17).toString(36)
  },

  result: function (object, key) {
    if ($.isObject(object)) {
      var value = object[key];
      return $.isFunction(value) ? object[key]() : value;
    }
  },
  // Helper function to correctly set up the prototype chain, for subclasses.
  // Similar to `goog.inherits`, but uses a hash of prototype properties and
  // class properties to be extended.
  inherits: function (protoProps, staticProps) {
    var parent = this;
    var child;

    // The constructor function for the new subclass is either defined by you
    // (the 'constructor' property in your `extend` definition), or defaulted
    // by us to simply call the parent's constructor.
    if ($.isset(protoProps) && protoProps.hasOwnProperty('constructor')) {
      child = protoProps.constructor;
    } else {
      child = function () {
        return parent.apply(this, arguments);
      };
    }

    // Add static properties to the constructor function, if supplied.
    $.extend(child, parent, staticProps);

    // Set the prototype chain to inherit from `parent`, without calling
    // `parent`'s constructor function.
    var Surrogate = function () {
      this.constructor = child;
    };
    Surrogate.prototype = parent.prototype;
    child.prototype = new Surrogate;

    // Add prototype properties (instance properties) to the subclass,
    // if supplied.
    if ($.isset(protoProps)) {
      $.extend(child.prototype, protoProps);
    }

    // Set a convenience property in case the parent's prototype is needed
    // later.
    child.__super__ = parent.prototype;

    return child;
  },
  /**
   * Creates a shallow clone of `object` composed of the specified properties.
   * Property names may be specified as individual arguments or as arrays of
   * property names.
   *
   * $.pick({ 'name': 'fred', '_userid': 'fred1' }, 'name');
   * // => { 'name': 'fred' }
   *
   */
  pick: function (input, keys) {
    var output = {};
    keys.each(function (key) {
      if (key in input) {
        output[key] = input[key];
      }
    })
    return output;
  },
  noop: function () {},
  clone: function (value) {
    if ($.isObject(value)) {
      var oldState = history.state;
      history.replaceState(value);
      var clonedObj = history.state;
      history.replaceState(oldState);
      return clonedObj;
    } else {
      return value;
    }
  },
  keys: function (o) {
    if ($.isObject(o)) {
      return Object.keys(o);
    }
    return [];
  },
  param: function (a) {
    var prefix;
    var s = [];
    var add = function (key, value) {
      if ($.isArray(value)) {
        s.push($.param.arrFunc(key, value));
      } else {
        value = value === null ? '' : value;
        s.push(encodeURIComponent(key) + '=' + encodeURIComponent(value));
      }
    };
    // If an array was passed in, assume that it is an array of form elements.
    if ($.isArray(a)) {
      // Serialize the form elements
      a.each(function (aa) {
        add(aa.name, aa.value);
      });
    } else {
      for (prefix in a) {
        add(prefix, a[prefix]);
      }
    }
    // Return the resulting serialization
    return s.join('&').replace(r20, '+');
  }
}
var r20 = /%20/g;

$.param.arrFunc = array2semicolonList;

function array2semicolonList (key, value) {
  return encodeURIComponent(key) + '=' + value.map(encodeURIComponent).join(',')
}
function array2legacy(key, value) {
  return value.map(function(val){
    return encodeURIComponent(key) + '=' + encodeURIComponent(val)
  }).join('&').replace(r20, '+')
}

$.param.setLegacy = function (flag) {
  $.param.arrFunc = flag ? array2legacy : array2semicolonList
}

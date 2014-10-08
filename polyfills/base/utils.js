var UTILS = {
  outerHeight: function (withMargins) {
    var height = this.offsetHeight;
    if ($.isset(withMargins) && withMargins) {
      var style = W.getComputedStyle(this, null);
      height += parseInt(style.marginTop) + parseInt(style.marginBottom, 10);
    }
    return height;
  },
  outerWidth: function (withMargins) {
    var width = this.offsetWidth;
    if ($.isset(withMargins) && withMargins) {
      var style = W.getComputedStyle(this, null);
      width += parseInt(style.marginLeft) + parseInt(style.marginRight, 10);
    }
    return width;
  },
  offset: function () {
    var box = this.getBoundingClientRect();
    return {
      top: box.top + W.pageYOffset - H.clientTop,
      left: box.left + W.pageXOffset - H.clientLeft
    }
  },
  height: function (value) {
    if ($.isset(value)) {
      value = parseInt(value);
      this.style.height = value + 'px';
      return value;
    } else {
      return parseInt(W.getComputedStyle(this, null).height);
    }
  },
  width: function (value) {
    if ($.isset(value)) {
      value = parseInt(value);
      this.style.width = value + 'px';
      return value;
    } else {
      return parseInt(W.getComputedStyle(this, null).width);
    }
  },
  position: function () {
    return {
      left: this.offsetLeft,
      top: this.offsetTop
    }
  },


  parent: function (filter) {
    if ($.isset(filter)) {
      var filterFn;
      if ($.isNumber(filter)) {
        filterFn = function(node, i) {
          return i === filter
        }
      } else {
        filterFn = function(node) {
          return node.matches(filter)
        }
      }

      var parent = this;
      var i = 1;
      while (parent = parent.parentElement) {
        if (filterFn(parent, i)) {
          return parent;
        }
        i++;
      }
      return false;
    } else {
      return this.parentElement;
    }
  },
  siblings: function (filter) {
    var _this = this;
    return this.parent().children.filter(function (child) {
      var valid = child !== _this;
      if (valid && $.isset(filter)) {
        valid = child.matches(filter);
      }
      return valid;
    });
  },
  prev: function (filter) {
    if ($.isset(filter)) {
      var prev = this;
      var result = [];
      while (prev = prev.previousElementSibling) {
        if (prev.matches(filter)) {
          result.push(prev);
        }
      }
      return result;
    } else {
      return this.previousElementSibling;
    }
  },
  next: function (filter) {
    if ($.isset(filter)) {
      var next = this;
      var result = [];
      while (next = next.nextElementSibling) {
        if (next.matches(filter)) {
          result.push(next);
        }
      }
      return result;
    } else {
      return this.nextElementSibling;
    }
  },
  first: function (filter) {
    if ($.isset(filter)) {
      for (var i = 0, l = this.length; i < l; i++) {
        if (this[i].matches(filter)) {
          return this[i];
        }
      }
    } else {
      return this.firstChild;
    }
  },
  after: function (html, position) {
    if (position) {
      position = 'afterend';
    } else {
      position = 'afterbegin';
    }
    if ($.isset(html)) {
      if ($.isString(html)) {
        return this.insertAdjacentHTML(position, html);
      } else if ($.isNode(html)) {
        var parent = this.parentNode;
        var next = this.nextElementSibling;
        if (next === null) {
          return parent.appendChild(html);
        } else {
          return parent.insertBefore(html, next);
        }
      }
    } else {
      return '';
    }
  },
  before: function (html, position) {
    if (position) {
      position = 'beforeend';
    } else {
      position = 'beforebegin';
    }
    if ($.isset(html)) {
      if ($.isString(html)) {
        return this.insertAdjacentHTML(position, html);
      } else if ($.isNode(html)) {
        return this.parent().insertBefore(html, this);
      }
    }
    return '';
  },
  append: function (node) {
    return this.parent().appendChild(node);
  },
  prepend: function (node) {
    if ($.isNode(node)) {
      this.parent().insertBefore(node, this.parent().firstChild);
    } else if ($.isArray(node)) {
      var _this = this;
      node.each(function (n) {
        _this.prepend(n);
      });
    }
    return this;
  },
  replaceWith: function (stringHTML) {
    if ($.isset(stringHTML)) {
      this.outerHTML = stringHTML;
    }
    return this;
  },


  css: function (ruleName, value) {
    if ($.isObject(ruleName)) {
      for (var i in ruleName) {
        this.style[camelCase(i)] = ruleName[i];
      }
      return ruleName;
    } else if ($.isset(ruleName)) {
      if ($.isset(value)) {
        this.style[camelCase(ruleName)] = value;
        return value;
      } else {
        return W.getComputedStyle(this, null)[camelCase(ruleName)];
      }
    }
    return '';
  },
  data: function (key, value) {
    var id;
    if ('__CACHE_KEY__' in this) {
      id = this['__CACHE_KEY__'];
    } else {
      this['__CACHE_KEY__'] = id = CACHE_KEY++;
      CACHE[id] = $.extend({}, this.dataset);
    }
    var cached = CACHE[id];
    if ($.isObject(key)) {
      for (var i in key) {
        cached[i] = key[i];
      }
    } else if ($.isset(key)) {
      if ($.isset(value)) {
        cached[key] = value;
        return value;
      }
      return cached[key];
    }
    return cached;
  },
  attr: function (name, value) {
    if ($.isObject(name)) {
      for (var i in name) {
        this.setAttribute(i, name[i]);
      }
      return this;
    } else if ($.isset(name)) {
      if ($.isset(value)) {
        this.setAttribute(name, value);
        return this;
      } else {
        return this.getAttribute(name);
      }
    }
    return '';
  },
  text: function (textString) {
    if ($.isset(textString)) {
      this.textContent = textString;
      return this;
    } else {
      return this.textContent;
    }
  },
  html: function(string) {
    if ($.isset(string)) {
      this.innerHTML = string;
      return this;
    } else {
      return this.innerHTML;
    }
  },
  clone: function() {
    return this.cloneNode(true);
  }
}
var CACHE = {};
var CACHE_KEY = 0;


function camelCase(string) {
  return string.replace(/^-ms-/, 'ms-').replace(/-([\da-z])/gi, function (all, letter) {
    return letter.toUpperCase();
  });
}

function nodeListToNode(methodName) {
  return function () {
    var returnVals = [];
    this.each(function (node) {
      returnVals.push(UTILS[methodName].apply(node, arguments));
    });
    return returnVals;
  }
}

for (var i in UTILS) {
  Np[i] = UTILS[i];
  NLp[i] = Ap[i] = nodeListToNode(i);
}

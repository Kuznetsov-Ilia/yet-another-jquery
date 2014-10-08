/*
  depends:
    $.isObject
    $.isArray
    $.keys
    D
*/

function on(name, callback, context) {
  if ($.isArray(name)) {
    var _this = this;
    name.each(function (n) {
      on.call(_this, n, callback, context);
    });
  } else if ($.isObject(name)) {
    context = callback;
    for (var i in name) {
      on.call(this, i, name[i], context)
    }
  } else {
    var types = name.split(/\s+/);
    var handler = callback;
    var eventName = types[0].split('.')[0];

    if (context) {
      handler = callback.bind(context);
    }
    if (types.length === 1) {
      this.addEventListener(eventName, handler, false);
    } else {
      this.addEventListener(eventName, delegate(types[1], handler), false);
    }
    this.handlers[name] = this.handlers[name] || [];
    this.handlers[name].push(handler);
  }
  return this;
}

function off(event, fn) {
  var el = this;
  if (!$.isset(this.handlers) || !$.keys(this.handlers).length) {
    return this;
  } else if ($.isset(fn)) {
    if ($.isArray(event)) {
      event.each(function (e) {
        el.removeEventListener(e, fn, false);
      });
    } else {
      this.removeEventListener(event, fn, false);
    }
  } else if ($.isset(event)) {
    if ($.isArray(event)) {
      event.each(function (e) {
        el.handlers[e].each(function (handler, i) {
          el.removeEventListener(e, handler, false);
          delete el.handlers[i];
        });
      });
    } else {
      this.handlers[event].each(function (handler, i) {
        el.removeEventListener(event, handler, false);
        delete el.handlers[i];
      });
    }
  } else {
    $.keys(this.handlers).each(function (e) {
      el.handlers[e].each(function (handler, i) {
        el.removeEventListener(e, handler, false);
        delete el.handlers[i];
      })
    })
  }
  return this;
}

function delegate(selector, handler) {
  return function (event) {
    if (event.target.matches(selector)) {
      return handler(event);
    } else if (event.target.matches(selector + ' *')) {
      var target = event.target.parent(selector);
      var pseudoEvent = {
        target: target,
        realTarget: event.target
      };
      ['initMouseEvent', 'initUIEvent', 'initEvent', 'preventDefault', 'stopImmediatePropagation', 'stopPropagation'].each(function (e) {
        if (e in event) {
          pseudoEvent[e] = event[e].bind(event);
        }
      })
      return handler($.extend({}, event, pseudoEvent));
    }
  }
}

function trigger(type, data) {
  var event = D.createEvent('HTMLEvents');
  event.initEvent(type, true, true);
  event.data = data || {};
  event.eventName = type;
  event.target = this;
  this.dispatchEvent(event);
  return this;
}


W.on = on;
W.off = off;
W.trigger = trigger;
W.handlers = {};

Np.on = on;
Np.off = off;
Np.trigger = trigger;
Np.handlers = {};


NLp.on = Ap.on = function (name, callback, context) {
  this.each(function (node) {
    on.call(node, name, callback, context);
  });
  return this;
};
NLp.off = Ap.off = function (event, fn) {
  this.each(function (node) {
    off.call(node, event, fn);
  });
  return this;
}
NLp.trigger = Ap.trigger = function (type, data) {
  this.each(function (node) {
    trigger.call(node, type, data)
  });
  return this;
};

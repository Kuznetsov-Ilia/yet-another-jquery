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

/*
  depends:
    $.Deferred
    $.extend
    $.events
    $.param
    $.isset
    $.keys
  exports:
    $.ajax
    $.ajax['head','get','put','post','delete','patch','trace','connect','options']
*/
$.ajax = ajax;
$.extend($.ajax, $.events);

['head', 'get', 'put', 'post', 'delete', 'patch', 'trace', 'connect', 'options'].each(function (method) {
  $[method] = function (url, options, data, res) {
    return ajax(method, url, options, data, res);
  }
});
$.jsonp = function (url, data) {
  var def = $.Deferred();
  var script = $.new('script');
  var rand = '_' + $.rand();
  if ($.isString(data)) {
    data += '&callback=' + rand;
  } else if ($.isObject(data)) {
    data.callback = rand;
    data = $.param(data);
  } else {
    data = 'callback=' + rand;
  }
  var src = url + (url.indexOf('?') === -1 ? '?' : '') + data;
  W[rand] = function (res) {
    def.resolve(res);
    W[rand] = null;
    B.removeChild(script);
  }
  B.appendChild(script);
  script.src = src;
  return def;
}
var XHR_DEFAULT_TIMEOUT = 5000; // default request timeout
/*var XHR_CLOSED = 0; // ReadyState status codes 
var XHR_OPENED = 1;
var XHR_SENT = 2;
var XHR_RECEIVED = 3;*/
var XHR_DONE = 4;

['FormData', 'ArrayBuffer', 'ArrayBufferView', 'Blob'].each(function (constructor) {
  if (!(constructor in window)) {
    window[constructor] = $.noop;
  }
})


function ajax(method, url, data, options) {
  if (method == 'jsonp') {
    return $.jsonp(url, data);
  }
  method = method.toUpperCase();
  var xhr = new XMLHttpRequest();
  var res = $.Deferred();
  options = $.extend({
    timeout: XHR_DEFAULT_TIMEOUT,
    headers: {
      'Content-type': 'application/x-www-form-urlencoded',// 'application/json',
      Accept: 'application/json'
    }
  }, options);

  if ($.isset(options.charset)) {
    options.headers['Accept-charset'] = options.charset;
  }

  xhr.onreadystatechange = function () {
    switch (xhr.readyState) {
    case XHR_DONE:
      var status = xhr.status;
      if (status) {
        var isSuccess = status >= 200 && status < 300 || status === 304;
        if (isSuccess) {
          $.ajax.trigger('done', xhr);
          res.resolve(JSON.parse(xhr.response));
        } else {
          $.ajax.trigger('fail', xhr);
          res.reject(xhr);
        }
      } else {
        $.ajax.trigger('fail', xhr);
        res.reject(xhr); // status = 0 (timeout or Xdomain)           
      }
      break;
    }
  }

  /* response headers */
  var headers;

  Object.defineProperty(xhr, 'headers', {
    get: function () {
      if (!headers) {
        headers = parseHeaders(xhr.getAllResponseHeaders());
      }
      return headers;
    }
  });

  /* report progress */
  if (xhr.upload) {
    res.progress = xhr.upload.onprogress;
  }

  if ($.isset(data)) {
    if ($.isObject(data)) {
      if (data instanceof FormData || data instanceof ArrayBuffer || data instanceof ArrayBufferView || data instanceof Blob) {
        /*
          FormData, ArrayBuffer, ArrayBufferView, Blob
          are native data types for XHR2
        */
      } else {
        if (options.headers['Content-type'].indexOf('json') >= 0) {
          if (method == 'PUT') {
            data = JSON.stringify(data);
          } else if (method == 'POST') {
            data = 'json=' + JSON.stringify(data);
          }
        } else {
          data = $.param(data);
        }
      }
    } 

    if (['GET', 'HEAD'].indexOf(method) !== -1 && $.isString(data)) {
      url = url + '?' + data;
      data = null;
    }
  }

  try {
    xhr.open(method, url, true);
  } catch (error) {
    res.reject(error);
  }

  /* set request headers */
  $.keys(options.headers).each(function (header) {
    xhr.setRequestHeader(header, options.headers[header]);
  });

  /* request data */
  try {
    xhr.send(data);
  } catch (error) {
    res.reject(error);
  }

  /* response timeout */
  setTimeout(xhr.abort.bind(xhr), options.timeout);

  res.abort = xhr.abort;

  return res;
}

function parseHeaders(h) {
  var ret = {},
    key, val, i;

  h.split('\n').forEach(function (header) {
    if ((i = header.indexOf(':')) > 0) {
      key = header.slice(0, i).replace(/^[\s]+|[\s]+$/g, '').toLowerCase();
      val = header.slice(i + 1, header.length).replace(/^[\s]+|[\s]+$/g, '');
      if (key && key.length) {
        ret[key] = val;
      }
    }
  });

  return ret;
}

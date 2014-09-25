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
    $['head','get','put','post','delete','patch','trace','connect','options']
*/
$.ajax = ajax;
$.extend($.ajax, $.events);

['head', 'get', 'put', 'post', 'delete', 'patch', 'trace', 'connect', 'options'].each(function (method) {
  $[method] = function (url, options, data, res) {
    return ajax(method, url, options, data, res);
  }
});

$.jsonp = function(url, data, options) {
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
    setTimeout(function(){
      B.removeChild(script);
      delete W[rand];
    }, 0);
  }
  script.src = src;
  B.appendChild(script);
  return def;
}

var XHR_DEFAULT_TIMEOUT = 5000; // default request timeout
/*var XHR_CLOSED = 0; // ReadyState status codes 
var XHR_OPENED = 1;
var XHR_SENT = 2;
var XHR_RECEIVED = 3;*/
var XHR_DONE = 4;

function ajax(method, url, data, options) {
  if (method == 'jsonp') {
    return $.jsonp(url, data, options);
  }
  var xhr = new XMLHttpRequest();
  var res = $.Deferred();
  options = $.extend({
    timeout: XHR_DEFAULT_TIMEOUT,
    headers: {
      'content-type': 'application/json',
      'accept': 'application/json'
    }
  }, options);

  if (options.charset) {
    options.headers['accept-charset'] = options.charset;
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
    var needToTransform = $.isObject(data);
    if ($.isObject(data)) {
      if ('FormData' in window && data instanceof FormData) {
        needToTransform = false
      }
      //  TODO
      //ArrayBuffer
      //ArrayBufferView
      //Blob
    }
    if (needToTransform) {
      //JSON.stringify(data); нахуя это бывает нужно?
      data = $.param(data);
    }
    if (['get', 'head'].indexOf(method) !== -1) {
      url = url + (url.indexOf('?') === -1 ? '?': '') + data;
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

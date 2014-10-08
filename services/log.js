/*
  depends:
    $.ajax
    $.keys
  exports:
    $.log
*/
$.log = logger;

var log = [];
var logKeys = [0, 0, 0];

$.on('all', function (name, data) {
  $.log({
    type: 'trigger',
    name: name,
    data: data
  });
});
$.ajax.on('fail', function (xhr) {
  $.log({
    type: 'error',
    name: 'ajax',
    data: xhr
  })
}).on('done', function (xhr) {
  $.log({
    type: 'done',
    name: 'ajax',
    data: xhr
  })
});
D.on('keydown', function (e) {
  logKeys.shift();
  logKeys.push(e.which);
  //16: "shift", 17: "ctrl", 18: "alt",
  // shift+ctrl+l или ctrl+shift+l
  if (['161776', '171676'].indexOf(logKeys.join('')) !== -1) {
    console.log('comming soon');
    showLog();
  }
});


W.onerror = function () {
  $.log({
    type: 'error',
    name: 'window.onerror',
    data: arguments
  })
};

function logger(options) {
  if (log.length > 998) {
    clearLog();
  }
  log.push({
    type: options.type,
    name: options.name,
    id: options.id,
    data: logClone(options.data, 2),
    date: W.performance.now(),
    memory: W.performance.memory
  });
}

var showLog = logger.show = function () {
  var harLog = logToHar();
  var blob = new Blob([JSON.stringify(harLog)], {
    type: 'application/json'
  });
  var url = W.URL.createObjectURL(blob);
  W.open('/debugger/index.html#' + url, url);
}.debounce(500);

function logToHar() {
  var harLog = [W.navigator.userAgent];
  perfToHar();
  var t = W.performance.timing;
  var navStart = t.navigationStart || 0;

  harLog.push({
    type: 'Error',
    data: {
      userAgent: W.navigator.userAgent,
      date: (new Date()).toLocaleString()
    },
    startTime: 0
  });

  harLog.push({
    type: 'ResourceSendRequest',
    data: {
      requestId: '1.1',
      url: W.location.href,
      requestMethod: 'GET'
    },
    startTime: diff(t.startTime || t.redirectStart),
    endTime: diff(t.responseEnd),
    children: entryHar(t, diff, '1.1')
  }, {
    type: 'EventDispatch',
    data: {
      type: 'Unload'
    },
    startTime: diff(t.unloadEventStart),
    endTime: diff(t.unloadEventEnd)
  }, {
    type: 'EventDispatch',
    data: {
      type: 'DOM loading'
    },
    startTime: diff(t.domLoading),
    endTime: diff(t.domInteractive),
    children: []
  }, {
    type: 'MarkLoad',
    data: {
      isMainFrame: true
    },
    startTime: diff(t.loadEventStart),
    endTime: diff(t.loadEventEnd)
  }, {
    type: 'EventDispatch',
    data: {
      type: 'DOM Interactive'
    },
    startTime: diff(t.domInteractive),
    endTime: diff(t.domContentLoadedEventStart)
  }, {
    type: 'MarkDOMContent',
    data: {
      isMainFrame: true
    },
    startTime: diff(t.domContentLoadedEventStart),
    endTime: diff(t.domContentLoadedEventEnd)
  });

  W.performance.getEntries().each(function (entry, i) {
    var requestId = i + '.2';
    harLog.push({
      type: 'ResourceSendRequest',
      data: {
        url: entry.name,
        requestId: requestId,
        requestMethod: entry.initiatorType
      },
      startTime: entry.startTime || entry.redirectStart,
      endTime: entry.responseEnd,
      children: entryHar(entry, ts, requestId)
    });
  });

  function diff(value) {
    if (value) {
      return value - navStart;
    } else {
      return 0;
    }
  }

  function ts(value) {
    return value;
  }

  var logMap = {};
  var logNew = [];
  log.each(function (l) {
    logMap[l.type + l.name + l.id] = l;
    if (l.type === 'ViewInit' && l.name === 'Start') {
      logNew.push(l);
    }
  })

  logNew.each(function (l) {
    var initStart = l;
    var initEnd = logMap['ViewInitEnd' + l.id];
    var renderStart = logMap['ViewRenderStart' + l.id];
    var renderEnd = logMap['ViewRenderEnd' + l.id];
    var removeStart = logMap['ViewRemoveStart' + l.id];
    var removeEnd = logMap['ViewRemoveEnd' + l.id];
    var endEntity;
    [removeEnd, renderEnd, initEnd].each(function (entity) {
      if ($.isUndefined(endEntity) || entity.date > endEntity.date) {
        endEntity = entity;
      }
    });
    var children = [{
      type: 'View',
      data: {
        name: 'init',
        data: initStart.data
      },
      startTime: initStart.date,
      endTime: initEnd.date,
      counters: {
        jsHeapSizeUsed: initStart.memory.usedJSHeapSize
      }
    }, {
      type: 'GCEvent',
      data: {
        usedHeapSizeDelta: Math.abs(initStart.memory.usedJSHeapSize - initEnd.memory.usedJSHeapSize)
      },
      startTime: initStart.date,
      endTime: initEnd.date,
      counters: {
        jsHeapSizeUsed: initEnd.memory.usedJSHeapSize
      }
    }];
    if ($.isset(renderStart)) {
      children.push({
        type: 'View',
        data: {
          name: 'render',
          data: renderStart.data
        },
        startTime: renderStart.date,
        endTime: renderEnd.date,
        counters: {
          jsHeapSizeUsed: renderStart.memory.usedJSHeapSize
        }
      }, {
        type: 'GCEvent',
        data: {
          usedHeapSizeDelta: Math.abs(renderStart.memory.usedJSHeapSize - renderEnd.memory.usedJSHeapSize)
        },
        startTime: renderStart.date,
        endTime: renderEnd.date,
        counters: {
          jsHeapSizeUsed: renderEnd.memory.usedJSHeapSize
        }
      })
    }
    if ($.isset(removeStart)) {
      children.push({
        type: 'View',
        data: {
          name: 'render',
          data: removeStart.data
        },
        startTime: removeStart.date,
        endTime: removeEnd.date,
        counters: {
          jsHeapSizeUsed: removeStart.memory.usedJSHeapSize
        }
      }, {
        type: 'GCEvent',
        data: {
          usedHeapSizeDelta: Math.abs(removeStart.memory.usedJSHeapSize - removeEnd.memory.usedJSHeapSize)
        },
        startTime: removeStart.date,
        endTime: removeEnd.date,
        counters: {
          jsHeapSizeUsed: removeEnd.memory.usedJSHeapSize
        }
      })
    }
    harLog.push({
      type: 'View',
      data: {
        name: initStart.data.name,
        date: initStart.data
      },
      startTime: initStart.date,
      endTime: endEntity.date,
      children: children
    })
  });

  return harLog;
}
function perfToHar (){}
function entryHar(entity, fn, requestId) {
  var type = 'Request';
  var e = [{
    type: type,
    data: {
      type: 'App cache',
      requestId: requestId
    },
    startTime: fn(entity.fetchStart),
    endTime: fn(entity.domainLookupStart)
  }, {
    type: type,
    data: {
      type: 'DNS',
      requestId: requestId
    },
    startTime: fn(entity.domainLookupStart),
    endTime: fn(entity.domainLookupEnd)
  }, {
    //secureConnectionStart
    type: type,
    data: {
      type: 'TCP',
      requestId: requestId
    },
    startTime: fn(entity.connectStart),
    endTime: fn(entity.connectEnd)
  }, {
    type: type,
    data: {
      type: 'Request',
      requestId: requestId
    },
    startTime: fn(entity.requestStart),
    endTime: fn(entity.responseStart)
  }, {
    type: type,
    data: {
      type: 'Response',
      requestId: requestId
    },
    startTime: fn(entity.responseStart),
    endTime: fn(entity.responseEnd)
  }];
  if (entity.redirectStart) {
    e.unshift({
      type: type,
      data: {
        type: 'Redirect',
        requestId: requestId
      },
      startTime: fn(entity.redirectStart),
      endTime: fn(entity.redirectEnd)
    })
  }
  return e;
}

function logClone(obj, depth, stringLimit) {
  stringLimit = stringLimit || 5;
  var type = typeof obj;
  if ($.isUndefined(obj)) {
    return '[undefined]';
  }
  switch (type) {
  case 'number':
  case 'boolean':
    return obj;
  case 'string':
    var length = obj.length;
    if (length > 15) {
      return obj.substr(0, stringLimit) + '..' + length + '..' + obj.substr(-stringLimit);
    } else {
      return obj;
    }
  case 'object':
    var returnObj = {};
    if (obj === W) {
      returnObj = '[window]';
    } else if (obj === null) {
      returnObj = '[null]';
    } else if (obj instanceof $.View) {
      if (obj.el) {
        returnObj.el = logClone(obj.el);
      }
      if (obj.name) {
        returnObj.name = obj.name;
      }
      if (obj.model) {
        returnObj.model = logClone(obj.model.toJSON());
      }
    } else if (obj instanceof $.Model) {
      returnObj = logClone(obj.toJSON());
    } else if (obj instanceof Error) {
      if (obj.message) {
        returnObj.message = obj.message;
      }
      if (obj.stack) {
        returnObj.stack = obj.stack.split('\n');
      }
      if (obj.name) {
        returnObj.name = obj.name;
      }
      if (obj.code) {
        returnObj.code = obj.code;
      }
    } else if (obj instanceof Event) {
      $.pick(returnObj, [
        'altKey',
        'metaKey',
        'ctrlKey',
        'shiftKey',

        'bubbles',
        'cancelBubble',
        'cancelable',

        'clientX',
        'clientY',
        'pageX',
        'pageY',
        'offsetX',
        'offsetY',
        'screenX',
        'screenY',

        'clipboardData',
        'defaultPrevented',
        'eventPhase',
        'path',
        'returnValue',
        'srcElement',
        'target',
        'timeStamp',
        'type'
      ]);
    } else if (obj instanceof Array) {
      for (var i = obj.length - 1; i >= 0; i--) {
        returnObj[i] = cloneIterate(obj[i], depth);
      }
    } else if (obj instanceof Node) {
      returnObj = cloneHtmlElement(obj);
    } else if ('state' in obj && 'readyState' in obj) {
      returnObj = {
        /*readyState: obj.readyState,
        response: obj.responseJSON ? obj.responseJSON : logClone(obj.responseText, 0, 100),
        status: obj.status*/
      }
    } else if (typeof obj.xhr == 'function') {
      returnObj = {
        /*url: obj.url,
        type: obj.type,
        dataType: obj.dataType*/
      }
    } else {
      for (var j in obj) {
        returnObj[j] = cloneIterate(obj[j], depth);
      }
    }
    return returnObj;
  case 'function':
    return obj + '';
  default:
    console.error('no case for type', type);
    return 'no case for type ' + type;
  }
}

function cloneIterate(obj, depth) {
  if (typeof obj != 'function') {
    if (depth) {
      return logClone(obj, --depth);
    } else {
      return logClone(JSON.stringify(obj));
    }
  }
  return '';
}

function cloneHtmlElement(node) {
  if (!node) {
    return '';
  }
  var returnObj = {};
  returnObj.tagName = node.tagName;
  if (node.id) {
    returnObj.id = node.id;
  }
  if (node.className) {
    returnObj.className = node.className;
  }
  if (node.className) {
    returnObj.className = node.className;
  }

  var datasetKeys = $.keys(node.dataset);
  if (datasetKeys.length) {
    returnObj.dataset = {};
    for (var i = datasetKeys.length - 1; i >= 0; i--) {
      returnObj.dataset[i] = logClone(node.dataset[datasetKeys[i]], 2);
    }
  }
  return returnObj;
}

function clearLog() {
  log.shift();
}

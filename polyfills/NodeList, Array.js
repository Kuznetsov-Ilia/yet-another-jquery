/*
  depends:
    events.js
  
*/
var NLp = NodeList.prototype;
var Ap = Array.prototype;

Ap.each = each;

[ /*EC5*/
  'some', 'every', 'filter', 'map', 'reduce', 'reduceRight',
  /*Array*/
  'join', 'split', 'concat', 'pop', 'push', 'shift', 'unshift', 'reverse', 'slice', 'splice', 'sort', 'indexOf', 'lastIndexOf',
  /*Custom*/
  'each'
].each(function (method) {
  NLp[method] = Ap[method];
});


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

NLp.matches = Ap.matches = NLp.is = Ap.is = function (selector) {
  this.every(function (node) {
    return node.matches(selector);
  });
  return this;
};

NLp.find = Ap.find = function (selector) {
  this.each(function (node) {
    var r = node.find(selector);
    if (r) {
      return r;
    }
  })
  return false;
}

NLp.findAll = Ap.findAll = function (selector) {
  var result = [];
  var r;

  this.each(function (node) {
    r = node.find(selector);
    if (r) {
      result.push(r);
    }
  })
  return result;
}

for (var i in UTILS) {
  NLp[i] = Ap[i] = nodeListToNode(i);
}

function each(func) {
  for (var i = 0, l = this.length; i < l; i++) {
    func.call(this, this[i], i);
  }
}


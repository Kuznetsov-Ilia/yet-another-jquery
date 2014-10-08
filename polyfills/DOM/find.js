Np.find = function (selector) {
  switch (selector.charAt(0)) {
  case '#':
    return D.getElementById(selector.substr(1));
  case '.':
    return this.getElementsByClassName(selector.substr(1))[0];
  case /w+/gi:
    return this.getElementsByTagName(selector);
  default:
    return this.querySelector(selector || '☺');
  }
};
Np.findAll = function (selector) {
  return this.querySelectorAll(selector || '☺');
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
    r = node.findAll(selector);
    if (r) {
      result.push(r);
    }
  })
  return result;
}

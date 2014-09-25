var Np = Node.prototype;
var Ep = Element.prototype;
Np.matches = Np.is = Np.matches || Np.matchesSelector || Np.msMatchesSelector || Np.mozMatchesSelector || Ep.webkitMatchesSelector || Np.oMatchesSelector;
Np.on = on;
Np.off = off;
Np.trigger = trigger;
Np.handlers = {};

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


for (var i in UTILS) {
  Np[i] = UTILS[i];
}

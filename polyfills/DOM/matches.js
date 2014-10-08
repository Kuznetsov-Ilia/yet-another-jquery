Np.matches = Np.is = Np.matches || Np.matchesSelector || Np.msMatchesSelector || Np.mozMatchesSelector || Ep.webkitMatchesSelector || Np.oMatchesSelector;

NLp.matches = Ap.matches = NLp.is = Ap.is = function (selector) {
  this.every(function (node) {
    return node.matches(selector);
  });
  return this;
};

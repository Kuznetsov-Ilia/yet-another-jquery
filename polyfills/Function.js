var Fp = Function.prototype;
// http://jsperf.com/lodash-debounce-vs-simple
Fp.debounce = function (delay) {
  var timeout;
  var func = this;
  delay = delay || 100;
  return function () {
    clearTimeout(timeout)
    timeout = setTimeout(func, delay);
  }
}
Fp.throttle = function (delay) {
  var throttling = false;
  var func = this;
  delay = delay || 100;
  return function () {
    if (!throttling) {
      func();
      throttling = true;
      setTimeout(function () {
        throttling = false;
      }, delay);
    }
  };
}

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

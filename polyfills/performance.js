var PERFORMANCE_MARKS = [];
var PERF = W.performance = W.performance || {};
PERF.now = PERF.now || PERF.webkitNow || PERF.msNow || PERF.mozNow;

if ($.isUndefined(PERF.now)) {
  var navigationStart;
  if (PERF.timing && PERF.timing.navigationStart) {
    navigationStart = PERF.timing.navigationStart
  } else {
    navigationStart = $.now();
  }
  PERF.now = function () {
    return $.now() - navigationStart;
  }
}
W.getEntries = W.getEntries || W.webkitGetEntries || W.mozGetEntries || W.msGetEntries || function () {
  return PERFORMANCE_MARKS;
}

PERF.mark = PERF.mark || PERF.webkitMark || function (l) {
  PERFORMANCE_MARKS.push({
    name: l,
    entryType: 'mark',
    startTime: PERF.now(),
    duration: 0
  });
}

PERF.getEntriesByType = PERF.getEntriesByType || PERF.webkitGetEntriesByType || function (t) {
  return t == 'mark' ? PERFORMANCE_MARKS : undefined;
}

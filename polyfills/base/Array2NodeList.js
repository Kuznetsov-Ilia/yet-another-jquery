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

function each(func) {
  for (var i = 0, l = this.length; i < l; i++) {
    func(this[i], i);
  }
}


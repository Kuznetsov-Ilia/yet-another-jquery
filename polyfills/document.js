D.height = docGabarits('height');
D.width = docGabarits('width');

function docGabarits(name) {
  return function () {
    return Math.max(B['scroll' + name], D['scroll' + name], B['offset' + name], D['offset' + name], D['client' + name]);
  }
}

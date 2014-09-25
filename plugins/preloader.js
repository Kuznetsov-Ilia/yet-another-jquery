var preloader;

function initPreloader(node, show) {
  preloader = document.createElement('div');
  preloader.className = 'preloader';
  $.preloader = doPreloader;
  doPreloader(node, show);
}

$.preloader = initPreloader;

function doPreloader(node, show) {
  if ($.is(show)) {
    if (node._preloader) {
      return node;
    } else {
      node._preloader = preloader.cloneNode();
      node.appendChild(node._preloader);
    }
  } else {
    if (node._preloader) {
      delete(node._preloader);
      try {
        node.removeChild(node._preloader);
      } catch(e) {}
    }
  }
  return node;
}

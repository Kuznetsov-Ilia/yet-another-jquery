module.exports = {
  
  polyfills               : {
    base                  : ['$', 'Array2NodeList', 'utils'],
    DOM                   : ['events', 'find', 'matches'],
    Function              : ['debounce, throttle'],
    gabarits              : 1,
    HTMLFormElement       : 1,
    //requestAnimationFrame : 1
  },

  plugins     : {
    mvc       : ['history', 'router', 'model', 'view'],
    cookie    : 1,
    deferred  : 1,
    events    : 1,
    preloader : 1
  },

  services  : {
    ajax    : 1,
    popup   : 1
  }
}

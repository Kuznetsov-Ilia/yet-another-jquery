$.popup = {
  setConstructor: function (popupConstrictor) {
    this.construct = popupConstrictor;
  },
  init: function(){
    var popupEL = $.new('div');
    var popupFADE = $.new('div');
    var rightWr = $.new('div');

    popupEL.className = 'popup';
    popupFADE.className = 'popup--fade hide';
    rightWr.className = 'popup--right';

    popupFADE.appendChild(popupEL);
    B.appendChild(popupFADE);
    B.appendChild(rightWr);

    popupFADE.on('click', popupClose);
    
    $.popup = new this.construct({
      el: popupEL,
      renderMethod: 'innerHTML'
    });
    $.popup.fade = popupFADE;

    function popupClose(e) {
      if ($.isNode(this)) { // click on popup/fade
        e = e || window.event;
        var target = e.target || e.srcElement;
        if (target === popupFADE) { // if on fade
          $.popup.close();
        } // else do nothing
      } else { // router:next event
        $.popup.close();
      }
    }


    D.on('keydown.popup', function (e) {
      if (e.which == 27) {
        $.popup.close();
      }
    });
    $.on({
      'router:next': popupClose
    });
    this.init = this.setConstructor = null;
  },
  show : function(opts) {
    this.init();
    $.popup.show(opts);
  },
  close : function() {
    this.init();
    $.popup.close();
  }
}




var RANGESLIDER = {
  instances: [],
  defaults: {
    polyfill: true,
    rangeClass: 'rangeslider',
    fillClass: 'rangeslider__fill',
    handleClass: 'rangeslider__handle',
    startEvent: ['mousedown.rangeslider', 'touchstart.rangeslider', 'pointerdown.rangeslider'],
    moveEvent: ['mousemove.rangeslider', 'touchmove.rangeslider', 'pointermove.rangeslider'],
    endEvent: ['mouseup.rangeslider', 'touchend.rangeslider', 'pointerup.rangeslider']
  },
  Plugin: function (element, _options) {
    var options = this.options = $.extend({}, RANGESLIDER.defaults, _options);
    this.element = element;
    this.startEvent = options.startEvent;
    this.moveEvent = options.moveEvent;
    this.endEvent = options.endEvent;
    this.polyfill = options.polyfill;
    this.onInit = options.onInit;
    this.onSlide = options.onSlide;
    this.onSlideEnd = options.onSlideEnd;
    this.identifier = 'js-' + rangeslider + '-' + $.now();
    this.min = parseFloat(element.attr('min') || 0);
    this.max = parseFloat(element.attr('max') || 100);
    this.value = parseFloat(element.value || this.min + (this.max - this.min) / 2);
    this.step = parseFloat(element.attr('step') || 1);

    this.$fill = $.new('div').attr('class', options.fillClass);
    this.$handle = $.new('div').attr('class', options.handleClass);
    this.$range = $.new('div').attr({
      'class': options.rangeClass,
      'id': identifier
    });
    this.$range.prepend([this.$fill, this.$handle]);
    element.after(this.$range);
    // visually hide the input
    element.css({
      'position': 'absolute',
      'width': '1px',
      'height': '1px',
      'overflow': 'hidden',
      'opacity': '0'
    });

    // Store context
    this.handleDown = RANGESLIDER.handleDown.bind(this);
    this.handleMove = RANGESLIDER.handleMove.bind(this);
    this.handleEnd = RANGESLIDER.handleEnd.bind(this);

    this.update();
    if (this.onInit && typeof this.onInit === 'function') {
      this.onInit();
    }

    // Attach Events
    var _this = this;
    var update = function () {
      // Simulate resizeEnd event.
      _this.update();
    }
    W.on('resize.rangeslider', function () {
      rAF(update);
    });

    document.on(this.startEvent, '#' + this.identifier, this.handleDown);

    // Listen to programmatic value changes
    element.on('change.rangeslider', function (e) {
      if (e.data && e.data.origin === 'rangeslider') {
        return;
      }

      var value = e.target.value,
        pos = _this.getPositionFromValue(value);
      _this.setPosition(pos);
    });
  },
  
}

// A really lightweight plugin wrapper around the constructor,
// preventing against multiple instantiations

$.rangeslider = function (node, options) {
  var data = node.data('plugin_rangeslider');

  // Create a new instance.
  if (!data) {
    node.data('plugin_rangeslider', (data = new RANGESLIDER.Plugin(node, options)));
    RANGESLIDER.instances.push(node);
  }

  // Make it possible to access methods from public.
  // e.g `$element.rangeslider('method');`
  if (typeof options === 'string') {
    data[options]();
  }
}


RANGESLIDER.Plugin.prototype = {
  update: function () {
    this.handleWidth = this.$handle.offsetWidth;
    this.rangeWidth = this.$range.offsetWidth;
    this.maxHandleX = this.rangeWidth - this.handleWidth;
    this.grabX = this.handleWidth / 2;
    this.position = this.getPositionFromValue(this.value);
    this.setPosition(this.position);
  },
  handleDown: function(e) {
    e.preventDefault();
    D.on(this.moveEvent, this.handleMove);
    D.on(this.endEvent, this.handleEnd);

    // If we click on the handle don't set the new position
    if (e.target.classList.contains(this.options.handleClass)) {
      return;
    }

    var posX = this.getRelativePosition(this.$range, e),
      handleX = this.getPositionFromNode(this.$handle) - this.getPositionFromNode(this.$range);

    this.setPosition(posX - this.grabX);

    if (posX >= handleX && posX < handleX + this.handleWidth) {
      this.grabX = posX - handleX;
    }
  },
  handleMove: function (e) {
    e.preventDefault();
    var posX = this.getRelativePosition(this.$range, e);
    this.setPosition(posX - this.grabX);
  },
  handleEnd: function(e) {
    e.preventDefault();
    D.off(this.moveEvent, this.handleMove);
    D.off(this.endEvent, this.handleEnd);

    var posX = this.getRelativePosition(this.$range, e);
    if (this.onSlideEnd && typeof this.onSlideEnd === 'function') {
      this.onSlideEnd(posX - this.grabX, this.value);
    }
  },
  cap: function (pos, min, max) {
    if (pos < min) {
      return min;
    }
    if (pos > max) {
      return max;
    }
    return pos;
  },
  setPosition: function(pos) {
    var value, left;

    // Snapping steps
    value = (this.getValueFromPosition(this.cap(pos, 0, this.maxHandleX)) / this.step) * this.step;
    left = this.getPositionFromValue(value);

    // Update ui
    this.$fill.css('width', (left + this.grabX) + 'px');
    this.$handle.css('left', left + 'px');
    this.setValue(value);

    // Update globals
    this.position = left;
    this.value = value;

    if (this.onSlide && typeof this.onSlide === 'function') {
      this.onSlide(left, value);
    }
  },
  getPositionFromNode: function(node) {
    var i = 0;
    while (node !== null) {
      i += node.offsetLeft;
      node = node.offsetParent;
    }
    return i;
  },
  getRelativePosition: function(node, e) {
    return (e.pageX || e.originalEvent.clientX || e.originalEvent.touches[0].clientX || e.currentPoint.x) - this.getPositionFromNode(node);
  },
  getPositionFromValue: function (value) {
    var percentage, pos;
    percentage = (value - this.min) / (this.max - this.min);
    pos = percentage * this.maxHandleX;
    return pos;
  },
  getValueFromPosition: function(pos) {
    var percentage, value;
    percentage = ((pos) / (this.maxHandleX || 1));
    value = this.step * Math.ceil((((percentage) * (this.max - this.min)) + this.min) / this.step);
    return Number((value).toFixed(2));
  },
  setValue: function(value) {
    this.element.value = value;
    this.element.trigger('change', {
      origin: 'rangeslider'
    });
  },
  destroy: function () {
    D.off(this.startEvent, '#' + this.identifier, this.handleDown);
    this.element
      .off('.rangeslider')
      .attr('style', '')
      .data('plugin_' + rangeslider, null);

    // Remove the generated markup
    if (this.$range && this.$range.length) {
      this.$range.remove();
    }

    // Remove global events if there isn't any instance anymore.
    RANGESLIDER.instances.splice(RANGESLIDER.instances.indexOf(this.element), 1);
    if (RANGESLIDER.instances.length === 0) {
      W.off('.rangeslider');
    }
  }
}

HFE.toJSON = function () {
  var vals = {};
  for (var i = 0, l = this.length; i < l; i++) {
    var input = this[i];
    if (input instanceof HTMLInputElement) {
      switch (input.type) {
      case 'checkbox':
        if (input.checked) {
          vals[input.name] = vals[input.name] || [];
          vals[input.name].push(input.value);
        }
        break;
      case 'radio':
        if (input.checked) {
          vals[input.name] = input.value;
        }
        break;
      default:
        if ($.isset(input.value)) {
          if (input.type == 'number') {
            vals[input.name] = +input.value;
          } else {
            vals[input.name] = input.value;
          }
        }
        break;
      }
    } else if (input instanceof HTMLTextAreaElement) {
      if ($.isset(input.value)) {
        vals[input.name] = input.value;
      }
    } else if (input instanceof HTMLSelectElement) {
      if (input.multiple) {
        vals[i.name] = [];
        input.selectedOptions.each(function (i) {
          vals[i.name].push(i.value);
        });
        if (vals[i.name].length === 0) {
          delete vals[i.name];
        }
      } else if ($.isset(input.selectedIndex)) {
        vals[input.name] = input[input.selectedIndex].value;
      }
    }
  }
  return vals;
}
HFE.toString = function () {
  return $.param(this.toJSON());
}

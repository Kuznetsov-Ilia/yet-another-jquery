var STATE = {}; // имя состояния : сопоставленная инфа
var stateCNT = 0; // количество объектов в STATE
var stateTIMER = []; // таймеры для очистки объектов в STATE
var stateSTACK = []; // последовательность состояний объектов STATE
var statePOS = -1; // текущая позиция в stateSTACK. после первого прохода будет 0, что соответствует первой позиции

$.state = {
  data: function (name, value) {
    if (value) {
      if (!(name in STATE)) {
        stateCNT++;
      }

      STATE[name] = value;

      stateDeferredRemoval(name);
    } else {
      return STATE[name];
    }
  },
  setScroll: function (prevStateName) {
    if (prevStateName && STATE[prevStateName]) { // сохраняем скролл страницы с которой уходим
      STATE[prevStateName].scrollTo = {
        top: W.pageYOffset || DE.scrollTop,
        left: W.pageXOffset || DE.scrollLeft
      }
    }
  },
  setStack: function (stateName, navtype) {
    if (navtype) {
      // initial or click - всегда вперёд
      this.pushStack(stateName);
      statePOS++;
    } else {
      // ua - вычисляем куда движение: вперёд или назад
      var index = stateSTACK.indexOf(stateName);
      switch (index) {
      case statePOS - 1: // back
        statePOS--;
        break;
      case statePOS + 1: // forward
        statePOS++;
        break;
      default:
        $.log({
          type: 'state',
          name: 'dead',
          data: {
            index: index,
            statePOS: statePOS,
            stateSTACK: stateSTACK,
            stateName: stateName
          }
        });
        this.pushStack(stateName);
        break;
      }
    }
    /*console.log({
      statePOS: statePOS,
      stateSTACK: stateSTACK,
      CNT: CNT,
      stateName: stateName
    });*/
  },
  pushStack: function (stateName) {
    // выносим из стека чтобы запихать в новую позицию
    stateRemoveFromStack(stateName);
    stateAddToStack(stateName);
  }
}

function stateDeferredRemoval(name) {
  clearTimeout(stateTIMER[name]);
  stateTIMER[name] = setTimeout(function () {
    if (stateCNT > 10) {
      delete STATE[name];
      stateRemoveFromStack(name);
    } else {
      stateDeferredRemoval(name);
    }
  }, 300000); // 5 минут
}

function stateAddToStack(stateName) {
  switch (statePOS) {
  case 0:
    stateSTACK.unshift(stateName);
    break;
  case stateSTACK.length - 1:
    stateSTACK.push(stateName);
    break;
  default:
    stateSTACK = stateSTACK.slice(0, statePOS).concat([stateName]).concat(stateSTACK.slice(statePOS));
    break;
  }
}

function stateRemoveFromStack(stateName) {
  var index = stateSTACK.indexOf(stateName);

  switch (index) {
  case -1:
    break;
  case 0:
    stateSTACK.shift();
    break;
  case stateSTACK.length - 1:
    stateSTACK.pop();
    break;
  default:
    stateSTACK = stateSTACK.slice(0, index).concat(stateSTACK.slice(index + 1));
    break;
  }
}

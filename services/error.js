var ERROR_ID;
$.error = {
  config: function (conf) {
    ERROR_ID = conf;
    $.error.config = errorAlreadyConfigurated;
  },
  show: function (errid) {
    $.popup.render({
      title: 'Ошибка',
      content: ERROR_ID[errid] || unknownError(errid)
    }).show();
  }
}

function errorAlreadyConfigurated() {
  console.error('service error is already configured. $.error.config is blocked for concistancy reason');
}
function unknownError(errid) {
  console.error('unknown error, set in $.error.config({ %d : "my custom api error" })'.replace('%d', errid));
  return 'неизвестная ошибка: ' + errid
}

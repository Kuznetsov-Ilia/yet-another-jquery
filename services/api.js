$.api = function (method, name, data) {
  if (!(name in API)) {
    return console.error('undefined url:', name, API);
  }

  var url = API[name];
  var $Def = $.Deferred();

  if (SALT) {
    data = data || {};
    data.salt = SALT;
    data.token = TOKEN;
  }

  var SUCCESS = function (response) {
    var DONE = apiSuccess.bind(this, $Def, {
      url: url,
      data: data
    });
    var FAIL = apiFail.bind(this, $Def, {
      url: url,
      data: data
    });

    if ($.user.isAuthed()) {
      if (response.id > 0) {
        checkStatus(response, DONE, FAIL);
      } else if (isRefreshAuthInProgress) {
        if ($apiWaitDef) {
          $apiWaitDef
            .done(function () {
              $[method](url, data).done(DONE).fail(FAIL)
            })
            .fail(FAIL)
        } else {
          $.log({
            type: 'error',
            name: 'refresh_auth',
            data: {
              message: 'isRefreshAuthInProgress=1, but $apiWaitDef fails',
              inProgress: isRefreshAuthInProgress,
              'this': this
            }
          })
          refreshAuth(DONE, FAIL, method, url, data);
        }
      } else {
        $apiWaitDef = refreshAuth(DONE, FAIL, method, url, data);
      }
    } else {
      checkStatus(response, DONE, FAIL);
    }
  }

  $[method](url, data).done(SUCCESS).fail(function (response) {
    apiFail.call(this, $Def, {
      url: url,
      data: data
    }, response);
  });

  return $Def;
};
['put', 'get', 'delete', 'post'].each(function (method) {
  $.api[method] = function (name, data) {
    return $.api(method, name, data);
  }
})

function refreshAuth(DONE, FAIL, method, url, data) {
  $.log({
    type: 'ajax',
    name: 'refreshAuth',
    data: {
      method: method,
      url: url,
      data: data,
      inProgress: isRefreshAuthInProgress
    }
  });
  if (isRefreshAuthInProgress === 0) {
    $apiWaitDef = $.Deferred();
  }
  isRefreshAuthInProgress = 1;

  $.post(API.refresh_auth)
    .done(function (response) {
      if (response.status == 200) {
        data.salt = SALT = response.salt;
        data.token = TOKEN = response.token || $.cookie('ot');
        $.log({
          type: 'info',
          name: 'salt',
          data: {
            salt: SALT,
            token: TOKEN,
            url: url,
            data: data,
            refresh_auth_resp: response
          }
        });
        $[method](url, data).done(DONE).fail(FAIL);
        $.user.set(response);
      } else {
        $.showAuth();
        W.CURRENT_USER = null;
        FAIL(response);
      }
      $apiWaitDef.resolve();
    })
    .fail(FAIL)
    .fail(function () {
      W.CURRENT_USER = null;
      $apiWaitDef.reject();
    })
    .always(function () {
      isRefreshAuthInProgress = 0;
    });

  if ($apiWaitDef) {
    return $apiWaitDef;
  }
}

function apiFail($Def, data, response) {
  $Def.reject(response);
  $.log({
    type: 'error',
    name: 'ajax',
    data: {
      ajax: this,
      data: data,
      resp: response
    }
  })
}

function apiSuccess($Def, data, response) {
  $Def.resolve(response);
  $.log({
    type: 'ajax',
    name: 'success',
    data: {
      ajax: this,
      data: data,
      resp: response
    }
  })
}

function checkStatus(response, DONE, FAIL) {
  if (response.status == 200) {
    DONE(response);
  } else {
    $.error.show(response.errid || 1);
    FAIL(response);
  }
}

$.api.config = function(conf) {
  API = conf;
  $.api.config = apiAlreadyCongigured;
}

function apiAlreadyCongigured() {
  console.log('api already configured. $.api.config is blocked for concistency reason');
}

var API;
var SALT = W.CURRENT_USER && W.CURRENT_USER.salt;
var TOKEN = $.cookie('ot') || 0;
var isRefreshAuthInProgress = 0;
var $apiWaitDef;

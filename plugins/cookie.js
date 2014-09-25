$.cookie = (function (config) {
  function encode(s) {
    return config.raw ? s : encodeURIComponent(s);
  }

  function decode(s) {
    return config.raw ? s : decodeURIComponent(s);
  }

  function stringifyCookieValue(value) {
    return encode(config.json ? JSON.stringify(value) : String(value));
  }

  function parseCookieValue(s) {
    if (s.indexOf('"') === 0) {
      // This is a quoted cookie as according to RFC2068, unescape...
      s = s.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, '\\');
    }

    try {
      // Replace server-side written pluses with spaces.
      // If we can't decode the cookie, ignore it, it's unusable.
      s = decodeURIComponent(s.replace(/\+/g, ' '));
    } catch (e) {
      return;
    }

    try {
      // If we can't parse the cookie, ignore it, it's unusable.
      return config.json ? JSON.parse(s) : s;
    } catch (e) {}
  }

  function read(s) {
    return config.raw ? s : parseCookieValue(s);
  }

  return function (key, value, options) {

    // Write
    if (value !== undefined) {
      options = options || {};

      if (typeof options.expires === 'number') {
        var days = options.expires,
          t = options.expires = new Date();
        t.setDate(t.getDate() + days);
      }

      if (!options.path) {
        options.path = '/';
      }

      document.cookie = [
        encode(key), '=', stringifyCookieValue(value),
        // use expires attribute, max-age is not supported by IE
        options.expires ? '; expires=' + options.expires.toUTCString() : '',
        options.path ? '; path=' + options.path : '',
        options.domain ? '; domain=' + options.domain : '',
        options.secure ? '; secure' : ''
      ].join('');
    }

    // Read

    var result = key ? undefined : {};

    // To prevent the for loop in the first place assign an empty array
    // in case there are no cookies at all. Also prevents odd result when
    // calling $.cookie().
    var cookies = document.cookie ? document.cookie.split('; ') : [];

    for (var i = 0, l = cookies.length; i < l; i++) {
      var parts = cookies[i].split('=');
      var name = decode(parts.shift());
      var cookie = parts.join('=');

      if (key && key === name) {
        // If second argument (value) is a function it's a converter...
        result = read(cookie, value);
        break;
      }

      // Prevent storing a cookie that we couldn't decode.
      if (!key && (cookie = read(cookie)) !== undefined) {
        result[name] = cookie;
      }
    }

    return result;
  };
})({
  raw: 0,
  json: 0
});

$.removeCookie = function (key, options) {
  if ($.cookie(key) !== undefined) {
    $.cookie(key, '', _.extend({}, options, {
      expires: new Date(1000),
      path: '/'
    }));
    return true;
  }
  return false;
};

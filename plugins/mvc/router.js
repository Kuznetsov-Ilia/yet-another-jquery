/*
  depends:
    $.events
    $.isRegExp
    $.isFunction
    $.isUndefined
    $.extend
    $.result
    $.history
  export:
    $.router
*/
// Backbone.Router
// ---------------

// Routers map faux-URLs to actions, and fire events when routes are
// matched. Creating a new one sets its `routes` hash, if not set statically.
var Router = $.Router = function (options) {
  options = options || {};
  if (options.routes) {
    this.routes = options.routes;
  }
  this._bindRoutes();
  this.initialize.apply(this, arguments);
};
Router.extend = $.inherits;
// Cached regular expressions for matching named param parts and splatted
// parts of route strings.
var optionalParam = /\((.*?)\)/g;
var namedParam = /(\(\?)?:\w+/g;
var splatParam = /\*\w+/g;
var escapeRegExp = /[\-{}\[\]+?.,\\\^$|#\s]/g;

// Set up all inheritable **Backbone.Router** properties and methods.
$.extend(Router.prototype, $.events, {

  // Initialize is an empty function by default. Override it with your own
  // initialization logic.
  initialize: function () {},

  // Manually bind a single named route to a callback. For example:
  //
  //     this.route('search/:query/p:num', 'search', function(query, num) {
  //       ...
  //     });
  //
  route: function (route, name, callback) {
    if (!$.isRegExp(route)) {
      route = this._routeToRegExp(route);
    }
    if ($.isFunction(name)) {
      callback = name;
      name = '';
    }
    if (!callback) {
      callback = this[name];
    }
    var router = this;
    $.history.route(route, function (fragment) {
      var args = router._extractParameters(route, fragment);
      if (callback) {
        callback.apply(router, args);
      }
      router.trigger.apply(router, ['route:' + name].concat(args));
      router.trigger('route', name, args);
      $.history.trigger('route', router, name, args);
    });
    return this;
  },

  // Simple proxy to `HISTORY` to save a fragment into the history.
  navigate: function (fragment, options) {
    $.history.navigate(fragment, options);
    return this;
  },

  // Bind all defined routes to `HISTORY`. We have to reverse the
  // order of the routes here to support behavior where the most general
  // routes can be defined at the bottom of the route map.
  _bindRoutes: function () {
    if ($.isUndefined(this.routes)) {
      return;
    }
    this.routes = $.result(this, 'routes');
    var route, routes = $.keys(this.routes);
    while ((route = routes.pop()) !== undefined) {
      this.route(route, this.routes[route]);
    }
  },

  // Convert a route string into a regular expression, suitable for matching
  // against the current location hash.
  _routeToRegExp: function (route) {
    route = route.replace(escapeRegExp, '\\$&')
      .replace(optionalParam, '(?:$1)?')
      .replace(namedParam, function (match, optional) {
        return optional ? match : '([^\/]+)';
      })
      .replace(splatParam, '(.*?)');
    return new RegExp('^' + route + '$');
  },

  // Given a route, and a URL fragment that it matches, return the array of
  // extracted decoded parameters. Empty or unmatched parameters will be
  // treated as `null` to normalize cross-browser behavior.
  _extractParameters: function (route, fragment) {
    return route.exec(fragment).slice(1).map(function (param) {
      return param ? decodeURIComponent(param) : null;
    });
  }

});


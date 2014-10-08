var concat = require('gulp-concat');
var exec = require('child_process').exec;
function clear(){
  exec('rm -rf build/*', {}, function (error, stdout, stderr) {
    if (stderr) {
      console.log(stderr);
    }
    if (stdout) {
      console.log(stdout);
    }
  });
}
function getSrc (conf, path) {
  if (!conf) {
    return false;
  }

  var src = false;
  if (conf instanceof Array) {
    src = [];
    conf.forEach(function(name) {
      src.push(path.replace('%s', name));
    });
  } else {
    console.error('чот не пойму тип конфига', conf);
  }

  return src;
}
module.exports = function (gulp, CONF) {
  if (!CONF instanceof Object) {
    return console.error('CONF must be object', CONF);
  }
  clear();

  gulp.task('concat-polyfills-DOM', function (cb) {
    if (!'polyfills' in CONF) {
      return cb();
    }
    var src = getSrc(CONF.polyfills.DOM, 'polyfills/DOM/%s.js');
    if (src === false) {
      return cb();
    }

    return gulp
      .src(src)
      .pipe(concat('DOM.js'))
      .pipe(gulp.dest('build/polyfills'))      
  });
  gulp.task('concat-polyfills-Function', function (cb) {
    if (!'polyfills' in CONF) {
      return cb();
    }
    var src = getSrc(CONF.polyfills.Function, 'polyfills/Function/%s.js');
    if (src === false) {
      return cb();
    }

    return gulp
      .src(src)
      .pipe(concat('Function.js'))
      .pipe(gulp.dest('build/polyfills'))      
  });
  gulp.task('concat-polyfills-base', function (cb) {
    if (!'polyfills' in CONF) {
      return cb();
    }
    var src = getSrc(CONF.polyfills.base, 'polyfills/base/%s.js');
    if (src === false) {
      return cb();
    }
    return gulp
      .src(src)
      .pipe(concat('base.js'))
      .pipe(gulp.dest('build/polyfills'))
  });

  var polyfillsDeaults = [];
  for (i in CONF.polyfills) {
    var val = CONF.polyfills[i];
    if (typeof val == 'number' && val === 1) {
      polyfillsDeaults.push(i);
    }
  }
  if (polyfillsDeaults.length === 0) {
    polyfillsDeaults = false;
  } else {
    polyfillsDeaults = getSrc(polyfillsDeaults, 'polyfills/%s.js');
  }

  console.log('polyfills:', polyfillsDeaults);

  gulp.task('concat-polyfills-default', function (cb) {
    if (!'polyfills' in CONF) {
      return cb();
    }
    if (polyfillsDeaults === false) {
      return cb();
    }
    return gulp
      .src(polyfillsDeaults)
      .pipe(gulp.dest('build/polyfills'))
  });
  gulp.task('concat-polyfills', [
    'concat-polyfills-default',
    'concat-polyfills-base',
    'concat-polyfills-DOM',
    'concat-polyfills-Function'
  ], wrap('polyfills'));

  var pluginsDeaults = [];
  for (i in CONF.plugins) {
    var val = CONF.plugins[i];
    if (typeof val == 'number' && val === 1) {
      pluginsDeaults.push(i);
    }
  }
  if (pluginsDeaults.length === 0) {
    pluginsDeaults = false;
  } else {
    pluginsDeaults = getSrc(pluginsDeaults, 'plugins/%s.js');
  }
  console.log('plugins:', pluginsDeaults);

  gulp.task('concat-plugins-default', function (cb) {
    if (!'plugins' in CONF) {
      return cb();
    }
    if (pluginsDeaults === false) {
      return cb();
    }
    return gulp
      .src(pluginsDeaults)
      .pipe(gulp.dest('build/plugins'))
  });
  gulp.task('concat-plugins-mvc', function () {
    if (!'plugins' in CONF) {
      return cb();
    }
    var src = getSrc(CONF.plugins.mvc, 'plugins/mvc/%s.js');
    if (src === false) {
      return cb();
    }
    return gulp
      .src(src)
      .pipe(concat('mvc.js'))
      .pipe(gulp.dest('build/plugins'))
  });
  gulp.task('concat-plugins', [
    'concat-plugins-mvc',
    'concat-plugins-default'
  ], wrap('plugins'));

  var servicesDeaults = [];
  for (i in CONF.services) {
    var val = CONF.services[i];
    if (typeof val == 'number' && val === 1) {
      servicesDeaults.push(i);
    }
  }

  servicesDeaults = getSrc(servicesDeaults, 'services/%s.js');
  console.log('services:',servicesDeaults);

  gulp.task('concat-services-default', function () {
    if (!'services' in CONF) {
      return cb();
    }
    if (servicesDeaults === false) {
      return cb();
    }
    return gulp
      .src(servicesDeaults)
      .pipe(gulp.dest('build/services'))
  });
  gulp.task('concat-services', [
    'concat-services-default'
  ], wrap('services'));

  gulp.task('concat', ['concat-polyfills', 'concat-plugins', 'concat-services']);

  function wrap (type) {
    var src = 'build/%s/*.js'.replace('%s', type);
    var concatName = '%s.js'.replace('%s', type);

    if (type == 'polyfills') {
      src = ['build/polyfills/base.js', src];
    }
 
    return function() {
      return gulp
        .src(src)
        .pipe(concat(concatName))
        .on('data', wrapper)
        .pipe(gulp.dest('build'))
    }
  }
}

function wrapper(file) {
  file.contents = new Buffer(
    ';(function(){' + file.contents.toString() + '})();'
  )
}

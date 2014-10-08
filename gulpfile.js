var gulp = require('gulp');
var gutil = require('gulp-util');
var log = gutil.log;
var concat = require('gulp-concat');
var gzip = require('gulp-gzip');
var CONF;
var fs = require('fs');
var devConfPath = './conf.js';
if (fs.existsSync(devConfPath)) {
  CONF = require(devConfPath);
}

gulp.task('default', ['watch']);

require('./tasks/concats.js')(gulp, CONF);

var beautify = require('gulp-beautify');
var beautifyOpts = {
  indentSize: 2,
  lookup: false
}
gulp.task('dev', ['concat'], dev);
gulp.task('dev-build', dev);

function wrapper(file) {
  file.contents = new Buffer(
    ';(function(){' + file.contents.toString() + '})();'
  )
}
function dev () {
  return gulp
    .src(['build/polyfills.js', 'build/plugins.js','build/services.js'])
    .pipe(concat('$.dev.js'))
    //.pipe(beautify(beautifyOpts))
    .pipe(gulp.dest('dist'))
    //.pipe(gulp.dest('../otvet/app/admstatic/js'))
    //.pipe(gzip())
    //.pipe(gulp.dest('dist'))
}

var uglify = require('gulp-uglify');
var uglifyOpts = {
  stats: true,
  compress: {
    drop_console: true,
    dead_code: true,
    drop_debugger: true,
    unsafe: true,
    comparisons: true,
    conditionals: true,
    booleans: true,
    loops: true,
    unused: true,
    if_return: true,
    warnings: true
  },
  define: {
    DEBUG: false
  }
}
gulp.task('prod', ['concat'], function () {
  return gulp
    .src(src)
    .pipe(concat('prod.js'))
    .pipe(uglify(uglifyOpts))
    .pipe(gulp.dest('dist'))
    .pipe(gzip())
    .pipe(gulp.dest('dist'))
});

/*gulp.task('dev-copy', ['dev'], function() {
  return gulp
    .src(['dist/*.js', 'dist/*.js'])
    .pipe(gulp.dest('../otvet/app/admstatic/js'))
});
*/
gulp.task('test', function (/*callback*/) {
  log('тесты мне запели!!')
});

/*  WATCH  */
gulp.task('watch', function () {
  gulp.watch('polyfills/*.js', ['concat-polyfills']);
  gulp.watch('plugins/*.js', ['concat-plugins']);
  gulp.watch('services/*.js', ['concat-services']);
  gulp.watch('build/*.js', ['dev-build']);
});


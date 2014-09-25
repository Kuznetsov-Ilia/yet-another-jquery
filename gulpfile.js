var gulp = require('gulp');
var gutil = require('gulp-util');
var rename = require('gulp-rename');
var log = gutil.log;

var CONF = {}
var devConfPath = './.dev.conf';
var fs = require('fs');
if (fs.existsSync(devConfPath)) {
  CONF = require(devConfPath);
}

gulp.task('default', ['watch']);

require('./tasks/concats.js')(gulp);


var uglify = require('gulp-uglify');
gulp.task('uglify', function () {
  return gulp.src('dist/dev.js')
    .pipe(uglify({
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
    }))
    .pipe(rename('prod.js'))
    .pipe(gulp.dest('dist'))
});

var gzip = require('gulp-gzip');
gulp.task('gzip', function () {
  return gulp.src(['dist/dev.js', 'dist/prod.js'])
    .pipe(gzip())
    .pipe(gulp.dest('dist'));
});



//var runSequence = require('run-sequence');

gulp.task('prepare', ['concat']);
gulp.task('minification', ['uglify']);
gulp.task('dev', function (callback) {
  runSequence('concat', 'concat-all', 'beautify', 'gzip', callback);
});
gulp.task('prod', function (callback) {
  runSequence('concat', 'concat-all', 'uglify', 'gzip', callback);
});
gulp.task('test', function (callback) {
  log('тесты мне запели!!')
});
gulp.task('build', function (callback) {
  runSequence('concat', 'uglify', 'gzip', callback);
});

/*  WATCH  */
gulp.task('watch', function () {
  gulp.watch('src/polyfills/*.js', ['concat-polyfills']);
  gulp.watch('src/plugins/*.js', ['concat-plugins']);
  gulp.watch('src/services/*.js', ['concat-services']);
});


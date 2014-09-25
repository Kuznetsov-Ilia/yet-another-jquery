var concat = require('gulp-concat');
module.exports = function (gulp) {
  gulp.task('concat-polyfills', function () {
    return gulp
      .src(['polyfills/utils.js', 'polyfills/*.js'])
      .pipe(concat('polyfills.js'))
      .on('data', wrapper)
      .pipe(gulp.dest('build'))
  });
  gulp.task('concat-plugins', function () {
    return gulp
      .src('plugins/**.js')
      .pipe(concat('plugins.js'))
      .on('data', wrapper)
      .pipe(gulp.dest('build'))
  });
  gulp.task('concat-services', function () {
    return gulp
      .src('services/**.js')
      .pipe(concat('services.js'))
      .on('data', wrapper)
      .pipe(gulp.dest('build'))
  });

  gulp.task('concat-all', function () {
    return gulp
      .src('build/*.js')
      .pipe(concat('dev.js'))
      .pipe(gulp.dest('dist'))
  })

  gulp.task('concat', ['concat-polyfills', 'concat-plugins', 'concat-services'])
}

function wrapper(file) {
  file.contents = new Buffer(
    ';(function(){' + file.contents.toString() + '})();'
  )
}

var gulp = require('gulp'),
  bundle = require('gulp-bundle-assets');

gulp.task('bundle', function() {
  return gulp.src('./bundle.config.js')
    .pipe(bundle())
    .pipe(bundle.results({
      dest: './',
      pathPrefix: '/static/'
    }))
    .pipe(gulp.dest('./public/static'));
});

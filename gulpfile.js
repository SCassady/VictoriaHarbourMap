var gulp = require('gulp');
var htmlmin = require('gulp-htmlmin');
var csso = require('gulp-csso');
var jsmin = require('gulp-jsmin');
var rename = require('gulp-rename');
var replace = require('gulp-replace');

gulp.task('html', function() {
  return gulp.src('./src/index.html')
  .pipe(htmlmin({collapseWhitespace: true}))
  .pipe(gulp.dest('./dist'));
});

gulp.task('css', function() {
  return gulp.src('./src/css/main.css')
  .pipe(csso())
  .pipe(gulp.dest('./dist/css'));
});

gulp.task('jsmin', function() {
  return gulp.src('./src/js/neighbourhoodMap.js')
  .pipe(jsmin())
  .pipe(rename({suffix: '.min'}))
  .pipe(gulp.dest('./dist/js'));
});

gulp.task('htmlreplace', ['html'], function() {
  return gulp.src('./dist/index.html')
  .pipe(replace('neighbourhoodMap.js', 'neighbourhoodMap.min.js'))
  .pipe(gulp.dest('./dist'));
});

gulp.task('default', ['html', 'css', 'jsmin', 'htmlreplace']);

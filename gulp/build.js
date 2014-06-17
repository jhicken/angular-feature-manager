'use strict';

var gulp = require('gulp');

var $ = require('gulp-load-plugins')();

var files = require('../files.js').files;

gulp.task('scripts', function() {
    return gulp.src(files.src)
        .pipe($.jshint())
        .pipe($.jshint.reporter('jshint-stylish'))
        .pipe($.size())
        .pipe($.concatUtil('angular-feature-manager.js', {process: function(src) { return (src.trim() + '\n').replace(/(^|\n)[ \t]*('use strict'|"use strict");?\s*/g, '$1'); }}))
        .pipe($.concatUtil.header('\'use strict\';\n'))
        .pipe(gulp.dest('./dist/'))
        .pipe($.rename('angular-feature-manager.min.js'))
        .pipe($.uglify())
        .pipe(gulp.dest('./dist/'));
});

gulp.task('clean', function() {
    return gulp.src(['.tmp', 'dist'], {
        read: false
    }).pipe($.clean());
});

gulp.task('build', ['scripts']);
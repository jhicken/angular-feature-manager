'use strict';

var gulp = require('gulp');

var $ = require('gulp-load-plugins')();

var files = require('../files.js').files;

gulp.task('test', function() {


    var testFiles = [
        'bower_components/angular/angular.js',
        'bower_components/angular-mocks/angular-mocks.js',
        'bower_components/angular-ui-router/release/angular-ui-router.js'
    ];

    testFiles.push.apply(testFiles,files.src);
    testFiles.push('test/unit/**/*.js');
    return gulp.src(testFiles)
        .pipe($.karma({
            configFile: 'test/karma.conf.js',
            action: 'run'
        }))
        .on('error', function(err) {
            console.log('Failed Tests!!!');
            console.log(err);
            // Make sure failed tests cause gulp to exit non-zero
        });
});

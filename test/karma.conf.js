var files = require('../files.js').files;

var testFiles = [ //!\\ Ignored through gulp-karma //!\\
    'bower_components/angular/angular.js',
    'bower_components/angular/angular-route.js',
    'bower_components/angular-mocks/angular-mocks.js',
];

testFiles.push.apply(testFiles,files.src);
testFiles.push('test/unit/**/*.js');
module.exports = function(config) {

    config.set({
        basePath: '..', //!\\ Ignored through gulp-karma //!\\

        files: testFiles,

        autoWatch: false,

        frameworks: ['jasmine'],

        browsers: ['PhantomJS'],

        plugins: [
            'karma-phantomjs-launcher',
            'karma-jasmine'
        ]

    });
};

var routerFiles = {
    src: [
        'src/angular-feature-manager-module.js',
        'src/$feature-provider.js',
        'src/toggle-disable-styles-factory.js',
        'src/directives/feature-disable-fields-directive.js',
        'src/directives/feature-name-directive.js',
        'src/directives/read-only-area-directive.js'
    ]
    // testUtils: [
    //   'test/testUtils.js'
    // ],
    // test: [
    //   'test/*Spec.js',
    //   'test/compat/matchers.js'
    // ],
    // angular: function(version) {
    //   return [
    //     'lib/angular-' + version + '/angular.js',
    //     'lib/angular-' + version + '/angular-mocks.js'
    //   ].concat(version === '1.2.14' ? ['lib/angular-' + version + '/angular-animate.js'] : []);
    // }
};

if (exports) {
    exports.files = routerFiles;
}

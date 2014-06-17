'use strict';


/* ------------------   START UI-ROUTER testUtils.js   ---------------------*/


// Promise testing support
angular.module('ngMock').config(function($provide) {
    $provide.decorator('$q', function($delegate, $rootScope) {
        $delegate.flush = function() {
            $rootScope.$digest();
        };

        // Add callbacks to the promise that expose the resolved value/error

        function expose(promise) {
            // Don't add hooks to the same promise twice (shouldn't happen anyway)
            if (!promise.hasOwnProperty('$$resolved')) {
                promise.$$resolved = false;
                promise.then(function(value) {
                    promise.$$resolved = {
                        success: true,
                        value: value
                    };
                }, function(error) {
                    promise.$$resolved = {
                        success: false,
                        error: error
                    };
                });

                // We need to expose() any then()ed promises recursively
                var qThen = promise.then;
                promise.then = function() {
                    return expose(qThen.apply(this, arguments));
                };
            }
            return promise;
        }

        // Wrap functions that return a promise
        angular.forEach(['when', 'all', 'reject'], function(name) {
            var qFunc = $delegate[name];
            $delegate[name] = function() {
                return expose(qFunc.apply(this, arguments));
            };
        });

        // Wrap defer()
        var qDefer = $delegate.defer;
        $delegate.defer = function() {
            var deferred = qDefer();
            expose(deferred.promise);
            return deferred;
        };

        return $delegate;
    });
});

try {
    // Animation testing support
    angular.module('mock.animate').config(function($provide) {
        $provide.decorator('$animate', function($delegate) {
            $delegate.flush = function() {
                while (this.queue.length > 0) {
                    this.flushNext(this.queue[0].method);
                }
            };
            return $delegate;
        });
    });
} catch (e) {}

function testablePromise(promise) {
    if (!promise || !promise.then) {throw new Error('Expected a promise, but got ' + jasmine.pp(promise) + '.');}
    if (!isDefined(promise.$$resolved)) {throw new Error('Promise has not been augmented by ngMock');}
    return promise;
}

function resolvedPromise(promise) {
    var result = testablePromise(promise).$$resolved;
    if (!result) {throw new Error('Promise is not resolved yet');}
    return result;
}

function resolvedValue(promise) {
    var result = resolvedPromise(promise);
    if (!result.success) {throw result.error;}
    return result.value;
}

function resolvedError(promise) {
    var result = resolvedPromise(promise);
    if (result.success) {throw new Error('Promise was expected to fail but returned ' + jasmin.pp(res.value) + '.');}
    return result.error;
}

beforeEach(function() {
    this.addMatchers({
        toBeResolved: function() {
            return !!testablePromise(this.actual).$$resolved;
        }
    });
});

// Misc test utils

function caught(fn) {
    try {
        fn();
        return null;
    } catch (e) {
        return e;
    }
}

// Utils for test from core angular
var noop = angular.noop,
    toJson = angular.toJson;
beforeEach(module('ui.router.compat'));



/* ------------------   END UI-ROUTER testUtils.js   ---------------------*/








describe('Module: feature-manager', function() {
    // load the controller's module
    beforeEach(module('feature-manager'));

    beforeEach(module('ui.router'));
    beforeEach(module(function($stateProvider) {
        $stateProvider
            .state('contacts', {
                url: '/'
            })
            .state('contacts.item', {
                url: '/item'
            })
            .state('contacts.item.detail', {
                url: '/detail'
            });
    }));

    var $state, $feature;

    // Initialize the factory
    beforeEach(inject(function($injector) {

        $state = $injector.get('$state');
        $feature = $injector.get('$feature');

    }));

    describe('Directive: feature-name', function() {
        var element, $scope;
        beforeEach(inject(function($rootScope) {
            $scope = $rootScope;
            element = angular.element('<div id="wrap"><div feature-name="stuff.stuff"><input></div></div>');
        }));

        it('should remove element if feature resolves to "hide"', inject(function($compile) {
            $feature.add('stuff.stuff', {
                test: function() {
                    return 'hide';
                }
            });
            var localElement = $compile(element)($scope);
            $scope.$digest();
            expect(localElement.html()).toBe('<!-- featureName: stuff.stuff -->');
        }));

        it('should not touch element if feature resolves to "show"', inject(function($compile) {
            $feature.add('stuff.stuff', {
                test: function() {
                    return 'show';
                }
            });
            var localElement = $compile(element)($scope);
            $scope.$digest();
            expect(localElement.html()).toBe('<!-- featureName: stuff.stuff --><div feature-name="stuff.stuff" class="ng-scope"><input></div>');
        }));

        it('should add disabled attribute to input elements if feature resolves to "disable"', inject(function($compile) {
            $feature.add('stuff.stuff', {
                test: function() {
                    return 'disable';
                }
            });
            var localElement = $compile(element)($scope);
            $scope.$digest();
            expect(localElement.html()).toBe('<!-- featureName: stuff.stuff --><div feature-name="stuff.stuff" class="ng-scope disable-fields" feature-disable-fields="true" no-watch="true"><input disabled="disabled"></div>');
        }));
    });

    describe('Service: $feature', function() {


        it('when adding feature it should be stored in service "add()"', function() {
            expect(function() {
                $feature.add('stuff.stuff', {
                    do :'stuff'
                });
            }).not.toThrow();
        });

        describe('.check()', function() {
            // TODO: add case for user checking and state checking

            it('throw error if the feature is undefined', function() {
                expect(function() {
                    $feature.check('stuff.stuff');
                }).toThrow();
            });

            describe('Custom "test" cases', function() {

                it('when custom case requires "hide" return "hide"', function() {
                    $feature.add('stuff.stuff', {
                        test: function() {
                            return 'hide';
                        }
                    });
                    expect($feature.check('stuff.stuff')).toBe('hide');
                });

                it('when custom case requires "show" return "show"', function() {
                    $feature.add('stuff.stuff', {
                        test: function() {
                            return 'show';
                        }
                    });
                    expect($feature.check('stuff.stuff')).toBe('show');
                });

                it('when custom case requires "disable" return "disable"', function() {
                    $feature.add('stuff.stuff', {
                        test: function() {
                            return 'disable';
                        }
                    });
                    expect($feature.check('stuff.stuff')).toBe('disable');
                });

            });

            describe('"state" cases', function() {

                it('when state matches current state "hide"', inject(function($q) {

                    $feature.add('stuff.stuff', {
                        state: 'not.valid'
                    });
                    $state.transitionTo('contacts.item');
                    $q.flush();
                    expect($feature.check('stuff.stuff')).toBe('hide');
                }));

                it('when state matches current state return "show"', inject(function($q) {
                    $feature.add('stuff.stuff', {
                        state: '**.detail'
                    });
                    $state.transitionTo('contacts.item.detail');
                    $q.flush();
                    expect($feature.check('stuff.stuff')).toBe('show');
                }));

            });

        });

    });


});
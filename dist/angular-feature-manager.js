'use strict';
angular.module('feature-manager', ['ui.router']);

angular.module('feature-manager').provider('$feature', function() {
    var features = {};

    var user = {};

    return {

        add: function(name, rules) {
            features[name] = rules;
        },
        updateUser: function(newUser){
            user = newUser;
        },
        $feature: {},
        $get: ['$state',
            function($state) {
                var checkCustomTest = function(name, scope) {
                    if (features[name].test) {
                        return features[name].test(scope ? scope: undefined);
                    }
                };

                var checkState = function(name) {
                    var notCase = false;
                    var state;
                    if(features[name].state){
                        state = features[name].state;

                        if (state.indexOf('!') > -1) {
                            state = state.split('!')[1];
                            notCase = true;
                        }

                        if ($state.includes(state)) {
                            return notCase ? 'hide' : 'show';
                        }
                        return notCase ? 'show' : 'hide';
                    }
                };

                var checkUserPermissions = function(name) {
                    if(features[name].rights){
                        var rawRights = [];
                        for ( var right in features[name].rights ) {
                            if(user.current.permissions[features[name].rights[right]]){
                                rawRights.push(user.current.permissions[features[name].rights[right]]);
                            }
                        }
                        return prioritizeRights(rawRights);
                    }
                    
                };

                var prioritizeRights = function(rules) {
                    if (rules.indexOf('DELETE') > -1) {
                        return 'show';
                    }
                    if (rules.indexOf('CREATE') > -1) {
                        return 'show';
                    }
                    if (rules.indexOf('EDIT') > -1) {
                        return 'show';
                    }
                    if (rules.indexOf('READ') > -1) {
                        return 'readonly';
                    }
                    if (rules.indexOf('NONE') > -1) {
                        return 'hide';
                    }
                    return 'hide';
                };

                var prioritizeRules = function(rules) {
                    if (rules.indexOf('hide') > -1) {
                        return 'hide';
                    }
                    if (rules.indexOf('disable') > -1) {
                        return 'disable';
                    }
                    if (rules.indexOf('readonly') > -1) {
                        return 'readonly';
                    }
                    return 'show';
                };

                this.$feature.add = this.add;
                this.$feature.updateUser = this.updateUser;
                this.$feature.check = function(name, scope) {
                    var outcome = [];
                    if (!features[name]) {
                        throw new Error('ERROR: Feature ' + name + ' has not been defined by $feature.add()');
                    }

                    outcome.push(checkCustomTest(name, scope));
                    outcome.push(checkState(name));
                    outcome.push(checkUserPermissions(name));
                    return prioritizeRules(outcome);

                };

                return this.$feature;
            }
        ]
    };

});

angular.module('feature-manager').factory('toggleDisableStyles', function() {
    return function(value, element){
        var select2 = element.find('[ui-select2]');

        if (value) {
            element.addClass('disable-fields');
            element.find('input','label').attr('disabled', 'disabled');
            if (select2.select2) {
                select2.attr('disabled', 'disabled');
                select2.select2('enable', false);
            }

        } else {
            element.removeClass('disable-fields');
            element.find('input','label').removeAttr('disabled');
            if (select2.select2) {
                select2.select2('enable', true);
            }
        }
    };

});

angular.module('feature-manager').directive('featureDisableFields', function(toggleDisableStyles) {
    return {
        restrict: 'A',

        link: function featureDisableFieldsLink(scope, element, attr) {
            if (attr.noWatch) {
                toggleDisableStyles(true, element);
            } else {
                scope.$watch(attr.featureDisableFields, function(val){toggleDisableStyles(val,element);});
            }
        }
    };
});

angular.module('feature-manager').directive('featureName', function($feature, toggleDisableStyles) {
    return {

        transclude: 'element',
        priority: 1000,
        terminal: false,
        restrict: 'A',
        $$tlb: true,
        compile: function(element, attr, transclude) {
            return function($scope, $element, $attr) {
                var action = $feature.check($attr.featureName, $scope);
                var childElement, childScope;
                // $scope.$watch($attr.featureName, function ngRemoveWatchAction(value) {
                if (childElement) {
                    childElement.remove();
                    childElement = undefined;
                }
                if (childScope) {
                    childScope.$destroy();
                    childScope = undefined;
                }
                if (action !== 'hide') {
                    childScope = $scope.$new();
                    transclude($scope.$new(), function(clone) {
                        childElement = clone;
                        if( action === 'disable' && !clone.attr('feature-disable-fields') ){
                            clone.attr('feature-disable-fields',true);
                            clone.attr('no-watch',true);
                            toggleDisableStyles(true, clone);
                        }
                        if( action === 'readonly' && !clone.attr('read-only-area') ){
                            clone.attr('read-only-area','');
                            clone.find('input,label').attr('disabled', 'disabled');
                            var select2 = clone.find('[ui-select2]');
                            if (select2.select2) {
                                select2.attr('disabled', 'disabled');
                                select2.select2('enable', false);
                            }
                        }
                        $element.after(clone);
                    });
                }

            };
        }
    };
});

angular.module('feature-manager').directive('readOnlyArea', function(toggleDisableStyles) {
    return {
        restrict: 'A',

        link: function featureDisableFieldsLink(scope, element, attr) {
            if (attr.noWatch) {
                toggleDisableStyles(true, element);
            } else {
                scope.$watch(attr.featureDisableFields, function(val){toggleDisableStyles(val,element);});
            }
        }
    };
});

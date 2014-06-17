'use strict';

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

                // var checkUserPermissions = function(name) {

                //     if(features[name].rights){
                //         var rawRights = [];
                //         _.forEach(features[name].rights,function(right){
                //             if(user.current.permissions[right]){
                //                 rawRights.push(user.current.permissions[right]);
                //             }
                //         });
                //         return prioritizeRights(rawRights);
                //     }
                    
                // };

                // var prioritizeRights = function(rules) {
                //     if (rules.indexOf('DELETE') > -1) {
                //         return 'show';
                //     }
                //     if (rules.indexOf('CREATE') > -1) {
                //         return 'show';
                //     }
                //     if (rules.indexOf('EDIT') > -1) {
                //         return 'show';
                //     }
                //     if (rules.indexOf('READ') > -1) {
                //         return 'readonly';
                //     }
                //     if (rules.indexOf('NONE') > -1) {
                //         return 'hide';
                //     }
                //     return 'hide';
                // };

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
                    //outcome.push(checkUserPermissions(name));
                    return prioritizeRules(outcome);

                };

                return this.$feature;
            }
        ]
    };

});
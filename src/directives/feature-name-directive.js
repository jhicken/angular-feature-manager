'use strict';

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
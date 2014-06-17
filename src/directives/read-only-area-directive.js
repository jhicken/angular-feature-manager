'use strict';

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
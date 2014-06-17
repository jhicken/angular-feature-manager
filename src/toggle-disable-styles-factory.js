'use strict';

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
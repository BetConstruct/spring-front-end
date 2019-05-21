/* global VBET5 */
/**
 * @ngdoc directive
 * @name vbet5.directive:capitaliseinput
 *
 * @description capitalises the strings first letter
 *
 */
VBET5.directive('capitaliseinput', function () {
    'use strict';
    return {
        link: function (scope, element) {
            element.bind('blur', function () {
                element[0].value = element[0].value.charAt(0).toUpperCase() + element[0].value.slice(1);
            });

            scope.$on('$destroy', function() {
                element.unbind('blur');
            });
        }
    };
});

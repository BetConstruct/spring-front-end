/* global VBET5 */
/**
 * @ngdoc directive
 * @name vbet5.directive:capitaliseinput
 *
 * @description add prefix to the input
 *
 */
VBET5.directive('uiPrefix', function () {
    'use strict';
    return {
        link: function ($scope, element, attrs) {
            element.bind('change', function () {
                var val = element[0].value, prefix = attrs.uiPrefix;
                if (val.length === 0 || val.substr(0, prefix.length) !== prefix) {
                    val = prefix + val;
                }
                element[0].value = val;
            });

            $scope.$on('$destroy', function() {
                element.unbind('change');
            })
        }
    };
});

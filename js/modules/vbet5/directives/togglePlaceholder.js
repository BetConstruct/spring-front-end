/**
 * @ngdoc directive
 * @name vbet5.directive:togglePlaceholder
 * @description remove placeholder on focus and set on blur
 * @element Input
 */
VBET5.directive("togglePlaceholder",['$filter', function($filter) {
    'use strict';
    return {
        restrict: 'A',
        link: function (scope, element, attr) {
            element.on("focus", function () {
                attr.$set('placeholder', "");
            });

            element.on("blur", function () {
                attr.$set('placeholder', $filter('translate')(attr.togglePlaceholder));
            });
        }
    };
}]);

/**
 * @ngdoc directive
 * @name vbet5.directive:noAnimate
 * @description disables animation on element
 */
angular.module('vbet5').directive('noAnimate', ['$animate', function ($animate) {
    'use strict';
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            if (attrs.noAnimate === 'disable') {
                $animate.enabled(element, true);
                scope.$watch(function () {
                    $animate.enabled(element, true);
                });
            } else {
                $animate.enabled(element, false);
                scope.$watch(function () {
                    $animate.enabled(element, false);
                });
            }
        }
    };
}]);
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

            function enableAnimation() {
                $animate.enabled(element, true);
                scope.$watch(function () {
                    $animate.enabled(element, true);
                });
            }

            function disableAnimation() {
                $animate.enabled(element, false);
                scope.$watch(function () {
                    $animate.enabled(element, false);
                });
            }
            if (attrs.noAnimate === 'disable') {
                enableAnimation();
            } else {
                disableAnimation();

            }

            scope.$on("toggleAnimation", function (event, data) {
                if (data) {
                    enableAnimation();
                } else {
                    disableAnimation();
                }


            });
        }
    };
}]);
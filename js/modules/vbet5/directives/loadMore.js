/* global VBET5 */
/**
 * @ngdoc directive
 * @name vbet5.directive:loadMore
 * @element ANY
 *
 * @description Automatically triggers click once page is scrolled to the element
 *
 */
VBET5.directive('loadMore', ['$window', '$timeout', 'CConfig', function ($window, $timeout, CConfig) {
    'use strict';
    return {
        restrict: 'A',
        scope: {
            exception: '=',
            bottomOffset: '=',
            blockOffset: '='
        },
        link: function (scope, element) {
            if (CConfig.disableAutoLoadMore) {
                return;
            }

            var clicked = false,
                timeoutPromise,
                bottomOffset = scope.bottomOffset || 10;

            function elementInViewport() {
                var windowHeight = "innerHeight" in window ? window.innerHeight : document.documentElement.offsetHeight;
                var body = document.body, html = document.documentElement;
                var docHeight = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);
                var windowBottom = windowHeight + window.pageYOffset;
                return scope.blockOffset === undefined ? windowBottom + bottomOffset >= docHeight : windowBottom + scope.blockOffset >= docHeight + 7;
            }

            scope.$on('onWindowScroll', function () {
                if (!scope.exception && elementInViewport() && !clicked) {
                    element.triggerHandler('click');
                    clicked = true;
                    timeoutPromise && $timeout.cancel(timeoutPromise);
                    timeoutPromise = $timeout(function () {
                        clicked = false;
                    }, 200);
                }
            });

            scope.$on('$destroy', function() {
                if (timeoutPromise) {
                    $timeout.cancel(timeoutPromise);
                    timeoutPromise = undefined;
                }
            });
        }
    };
}]);

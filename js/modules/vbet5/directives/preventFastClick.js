/* global VBET5 */
/**
 * @ngdoc directive
 * @name vbet5.directive:preventFastClick
 * @element ANY
 *
 * @description  Prevent many clicks on the same button
 *
 */
VBET5.directive('preventFastClick', ['$timeout', function ($timeout) {
    'use strict';
    return {
        scope: {
            preventFastClick: '='
        },
        link: function (scope, element) {
            var locked = false;
            var clickTimeout = parseInt(scope.preventFastClick * 1000 || 1000);
            function clickIsLocked() {
                if (locked) {
                    return true;
                }
                locked = $timeout(function () {
                    locked = false;
                }, clickTimeout);
                return false;
            }

            scope.$on('unlockFastClick', function () {
                if (locked) {
                    $timeout.cancel(locked);
                    locked = false;
                }
            });

            element.bind("click", function (event) {
                if (clickIsLocked()) {
                    event.stopImmediatePropagation();
                }
            });

            scope.$on('$destroy', function() {
                element.unbind("click");
            });
        }
    };

}]);

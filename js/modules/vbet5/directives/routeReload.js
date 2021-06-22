/* global VBET5 */
/**
 * @ngdoc directive
 * @name vbet5.directive:routeReload
 * @element ANY
 * @description will reload route when clicking element
 */
VBET5.directive('routeReload', ['$timeout', '$route', function ($timeout, $route) {
    'use strict';
    return {
        restrict: 'A',
        link: function (scope, elem, attr) {
            if (attr.reload !== 'false' && attr.target !== '_blank') {
                elem.on('click', function () {
                    $timeout(function () {
                        $route.reload();
                    }, 100);
                });
            }
        }
    };
}]);

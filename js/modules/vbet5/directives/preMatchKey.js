/* global VBET5 */
/**
 * @ngdoc directive
 * @name vbet5.directive:preMatchKey
 *
 * @description displays match key and add copy functionality
 *
 */
VBET5.directive('preMatchKey',["Utils", function (Utils) {
    'use strict';
    return {
        restrict: 'A',
        replace: false,
        templateUrl: 'templates/directive/pre-match-key.html',
        scope: {
            hash: '=',
            key: '='
        },
        link: function (scope) {

            scope.matchHashInfo = scope.hash;

            if (scope.key) {
                scope.matchHashInfo += " - " + scope.key;
            }

            scope.copyMatchKey = function copyMatchKey(event) {
                event.stopPropagation();

                Utils.copyToClipboard(scope.matchHashInfo);

                scope.copied = true;
            };

            scope.handleMouseOut = function handleMouseOut() {
                scope.copied = false;
            };

        }
    }
}]);

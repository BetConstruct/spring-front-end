/* global VBET5 */
/**
 * @ngdoc directive
 * @name vbet5.directive:autofocus
 *
 */
VBET5.directive('autoFocus', ['$timeout', function($timeout) {
    'use strict';
    return {
        restrict: 'A',
        link : function($scope, $element) {
            $timeout(function() {
                $element[0].focus();
            });
        }
    };
}]);
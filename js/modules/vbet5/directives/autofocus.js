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
        link : function($scope, $element, $attrs) {

            function focusElement() {
                $timeout(function() {
                    $element[0].focus();
                }, 0);
            }

            if ($attrs.autoFocus !== '') {
                $attrs.$observe('autoFocus', function autoFocusWatcher(value) {
                    if (value !== 'false') {
                        focusElement();
                    }
                });
            } else {
                focusElement();
            }
        }
    };
}]);

/* global VBET5 */
/**
 * @ngdoc directive
 * @name vbet5.directive:ngEscape
 * @element ANY
 *
 * @description Emulates click if escape is pressed
 *
 */
VBET5.directive('ngEscape', ['$document', function ($document) {
    'use strict';
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {

            function escapeFunc(event) {
                if (event.keyCode === 27) {
                    scope.$eval(attrs.ngEscape);
                    event.stopPropagation && event.stopPropagation();
                } else if (event.keyCode === 13 /* 'Enter button' */  && attrs.ngIf === 'activeDialog') {
                    /* To avoid bugs and side effects, we should at least prevent any default action when a user is pressing enter and we have an active dialogue (pop-up) on the screen.
                    In other cases of using ng-escape (e.g. in the 'mixedUserProfile', when user saves profile changes) the 'enter' button should work as intended */
                    event.preventDefault && event.preventDefault();
                    event.stopPropagation && event.stopPropagation();
                }
            }

            $document.on('keydown', escapeFunc);

            scope.$on('$destroy', function () {
                $document.off('keydown', escapeFunc);
            });
        }
    };
}]);




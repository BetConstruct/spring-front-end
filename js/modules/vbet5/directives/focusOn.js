/* global VBET5 */
/**
 * @ngdoc directive
 * @name vbet5.directive:focusOn
 * @element ANY
 * @param {String} focus-on event name
 * @param {String} [dont-scroll-on-focus] optional. if scpecified, page won't scroll on focusing
 *                                                  (actually it will scroll and scroll back immediately)
 *
 * @description will focus element on receiving event specified by focus-on attribute
 */
VBET5.directive('focusOn', ['$timeout', '$window', 'DomHelper', function ($timeout, $window, DomHelper) {
    'use strict';
    return function (scope, elem, attr) {
        if (attr.isFocus) {
            attr.isFocus === 'true' && elem[0].focus();
            return;
        }
        scope.$on(attr.focusOn, function () {
            var pos = DomHelper.getWindowScrollPosition();
            $timeout(function () {
                elem[0].focus();
                if (attr.dontScrollOnFocus !== undefined) {
                    $timeout(function () { $window.scrollTo(pos.x, pos.y); }, 0);
                }
            }, 100);
        });
    }
}]);

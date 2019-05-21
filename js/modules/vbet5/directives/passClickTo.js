/* global VBET5 */
/**
 * @ngdoc directive
 * @name vbet5.directive:passClickTo
 * @element ANY
 *
 * @description  Will pass click on element to specified one
 *
 * @param {String} pass-click-to element id to pass click to
 * @param {String} [find] optional. if specified, will try to find child inside
 *                                  element using angular.element.find() and pass click to it
 */
VBET5.directive('passClickTo', ['$window', function ($window) {
    'use strict';
    return function (scope, element, attr) {

        element.bind("click", function (event) {
            event.stopPropagation();
            var el = $window.document.getElementById(attr.passClickTo);
            if (el) {
                if (attr.iframe) {
                    var content = angular.element(el).find('iframe')[0] && angular.element(el).find('iframe')[0].contentWindow;
                    content && (el = content.document);
                }
                if (attr.find) {
                    el = angular.element(el).find(attr.find)[0];
                } else {
                    el = angular.element(el)[0];
                }
                if (el) {
                    el.click();
                }

            }
        });

        scope.$on('$destroy', function() {
            element.unbind("click");
        });
    };
}]);
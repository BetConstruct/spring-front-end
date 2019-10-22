/* global VBET5 */
/**
 * @ngdoc directive
 * @name vbet5.directive:classOnScroll
 * @description Changes elements class depending on page scroll state. If page is scrolled will set first class, if not, second
 *
 * @param {String} class-on-scroll 2 comma-delimited class names, e.g. "class1,class2"
 */

VBET5.directive("classOnScroll", ['$window', function ($window) {
    'use strict';
    return function (scope, element, attrs) {
        if (attrs.notChange === 'true') {
            return;
        }
        var classNames = attrs.classOnScroll.split(',');
        var class1 = classNames[0];
        var class2 = classNames[1];

        function changeClass() {
            if ($window.pageYOffset >= 100) {
                element.addClass(class1);
                element.removeClass(class2);
            } else {
                element.addClass(class2);
                element.removeClass(class1);
            }
        }

        scope.$on('onWindowScroll', changeClass);
    };
}]);

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
        var classNames = attrs.classOnScroll.split(',');
        var class1 = classNames[0];
        var class2 = classNames[1];

        var changeClass = function () {
            if (this.pageYOffset >= 1) {
                element.addClass(class1);
                element.removeClass(class2);
            } else {
                element.addClass(class2);
                element.removeClass(class1);
            }
        };
        angular.element($window).bind("scroll", changeClass);
    };
}]);
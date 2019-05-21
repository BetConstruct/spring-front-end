/* global VBET5 */
/**
 * @ngdoc directive
 * @name vbet5.directive:classOnElementScroll
 * @description Changes elements class depending on element scroll state. If element is scrolled will set first class, if not, second
 *
 * @param {String} scrolling element ID
 * @param {String} class-on-scroll 2 comma-delimited class names, e.g. "class1,class2"
 */

VBET5.directive("classOnElementScroll", [function () {
    'use strict';
    return function (scope, element, attrs) {
        var classNames = attrs.classOnElementScroll.split(',');
        var class1 = classNames[1];
        var class2 = classNames[2];
        var obj = angular.element(document.getElementById(classNames[0]))[0];
        var changeClass = function () {
            if (obj.scrollHeight > obj.offsetHeight || obj.scrollWidth > obj.offsetWidth) {
                element.addClass(class1);
                element.removeClass(class2);
            } else {
                element.addClass(class2);
                element.removeClass(class1);
            }
        };

        scope.$watch(
            function () {
                return {
                    width: obj.scrollWidth,
                    height: obj.scrollHeight
                };
            },
            changeClass,
            true //deep watch
        );
    };
}]);
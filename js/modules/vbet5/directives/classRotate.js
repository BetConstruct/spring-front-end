/* global VBET5 */
/**
 * @ngdoc directive
 * @name vbet5.directive:classRotate
 * @description Changes element class every given interval
 *
 * @param {String} class-rotate comma-delimited class names, e.g. "class1,class2"
 * @param {String} class-rotate-intervals comma delimited intervals(in milliseconds) to change each class after
 */

VBET5.directive("classRotate", ['$timeout', function ($timeout) {
    'use strict';
    return function (scope, element, attrs) {
        var classNames = attrs.classRotate.split(',');
        var intervals = attrs.classRotateIntervals.split(',');
        var i = 0, currentClass;
        function changeClass() {
            if (currentClass) {
                element.removeClass(currentClass);
            }
            currentClass = classNames[i];
            element.addClass(currentClass);
            $timeout(changeClass, intervals[i]);
            i++;
            i = i === classNames.length ? 0 : i;

        }
        changeClass();

    };
}]);
/* global VBET5 */
/**
 * @ngdoc filter
 * @name vbet5.filter:html
 * @description not show 0 value and format
 */
VBET5.filter('notShowZeroAndFormat', ['$filter', function ($filter) {
    'use strict';
    return function (num) {
        if (num === 0 ) {
            return "";
        } else {
            return $filter('number')(num, 0);
        }
    };
}]);

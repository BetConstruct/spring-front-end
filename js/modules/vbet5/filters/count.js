/* global VBET5 */
/**
 * @ngdoc filter
 * @name vbet5.filter:count
 * @description  returns object properties count
 *
 * e.g.   {a:1, b:2, c: null} | count = 3
 */
VBET5.filter('count', function () {
    'use strict';
    return function (obj) {
        if (!obj) {
            return 0;
        }
        if (obj.length) {
            return obj.length;
        }
        var k, count = 0;
        for (k in obj) {
            if (obj.hasOwnProperty(k)) {
                ++count;
            }
        }
        return count;

    };
});
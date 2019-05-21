/* global VBET5 */
/**
 * @ngdoc filter
 * @name vbet5.filter:numberFixedLength
 * @description formats a number to have leading zeros
 *
 */
VBET5.filter('numberFixedLength', function () {
    'use strict';
    return function (n, len) {
        n = n || 0;
        var num = parseInt(n, 10);
        len = parseInt(len, 10);
        if (isNaN(num) || isNaN(len)) {
            return n;
        }
        num = '' + num;
        while (num.length < len) {
            num = '0' + num;
        }
        return num;
    };
});
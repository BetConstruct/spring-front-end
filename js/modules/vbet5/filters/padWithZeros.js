/* global VBET5 */
/**
 * @ngdoc filter
 * @name vbet5.filter:padWithZeros
 * @description  pads string with zeros
 *
 * @param {String} string or number to pad
 * @param {Number} desired result width
 */
VBET5.filter('padWithZeros', function () {
    'use strict';

    return function (str, width) {
        str = (str === undefined ? "" : str).toString();
        return str.length >= width ? str : new Array(width - str.length + 1).join("0") + str;
    };

});
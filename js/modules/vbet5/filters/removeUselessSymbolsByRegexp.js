/* global VBET5 */
/**
 * @ngdoc filter
 * @name vbet5.filter:removeByRegex
 * @description removes string parts based on regex
 *
 * @param {String} string to modify
 * @param {String} regular expression to remove from string
 * @param {String} regex flag
 */


VBET5.filter('removeUselessSymbolsByRegexp', function () {
    'use strict';
    var result;
    return function(str, regex, flag, toLowerCase) {
        var pattern = new RegExp(regex || '', flag || '');
        result = str ? str.replace(pattern, '') : str;

        return toLowerCase && result ? result.toLowerCase() : result;
    };
});

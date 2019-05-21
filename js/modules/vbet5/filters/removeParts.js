/* global VBET5 */
/**
 * @ngdoc filter
 * @name vbet5.filter:removeParts
 * @description  removes defined parts (including surrounding spaces and punctuation) from beginning and end of string
 *
 * @param {String} str string
 * @param {Array} parts array of parts(strings) to remove
 */
VBET5.filter('removeParts', function () {
    'use strict';
    var cache = {};

    return function (str, parts) {
        parts = parts.join('|').replace(/[\-\[\]\{\}()*+?.,\\\^$|#]/g, "\\$&");
        var cacheKey = [str, parts].join('');
        var regExp = new RegExp('^[.\\-\\s\\:]*(' + parts + ')[.\\-\\s\\:]+|[.\\-\\s\\:]+(' + parts + ')[.\\-\\s\\:]*$', 'ig');

        if (cache[cacheKey] === undefined) {
            while (cache[cacheKey] !== str) {
                cache[cacheKey] = str;
                str = str.replace(regExp, '') || str;
            }
        }

        return cache[cacheKey];
    };
});
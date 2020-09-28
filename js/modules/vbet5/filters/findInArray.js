/* global VBET5 */
/**
 * @ngdoc filter
 * @name vbet5.filter:findInArray
 * @description  Returns the appropriate element of an array
 */
VBET5.filter('findInArray', function () {
    'use strict';
    return function (markets, findBy) {
        if (markets) {
            var i, key = Object.keys(findBy)[0];

            for (i = 0; i < markets.length; i++) {
                if (markets[i][key] === findBy[key]) {
                    return markets[i];
                }
            }
        }
        return null;
    };
});

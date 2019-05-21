/* global VBET5 */
/**
 * @ngdoc filter
 * @name vbet5.filter:deepCount
 * @description  returns sum of children lengths
 *
 * e.g.   ([[1,2],[3,4,5],[6],[7,8]] | deepCount) = 8
 */
VBET5.filter('deepCount', ['Utils', function (Utils) {
    'use strict';
    return function (arr) {
        if (arr instanceof  Object) {
            arr = Utils.objectToArray(arr);
        }
        if (arr === null) {
            return 0;
        }
        return arr.reduce(function (acc, curr) {
            if (curr instanceof Object) {
                curr = Utils.objectToArray(curr);
            }

            return acc + (curr ? curr.length : 0);
        }, 0);

    };
}]);
/* global VBET5 */
/**
 * @ngdoc filter
 * @name vbet5.filter:objectToArray
 * @description
 * Converts object to array using {@link vbet5.service:Utils Utils's} method of the same name
 * needed mainly for 'orderBy'  to work in directives
 *
 * @param {Object} object to convert
 * @returns {Array} object converted to array
 */
VBET5.filter('objectToArray', ['Utils', function (Utils) {
    'use strict';

    return function (obj) {
        return Utils.objectToArray(obj);

    };
}]);
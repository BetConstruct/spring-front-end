/* global VBET5 */
/**
 * @ngdoc filter
 * @name vbet5.filter:capitalise
 * @description capitalises the strings first letter
 *
 */
VBET5.filter('capitalise', function () {
    'use strict';

    return function capitalise(string) {
        if (string === undefined) {
            return string;
        }
        return string.charAt(0).toUpperCase() + string.slice(1);
    };
});
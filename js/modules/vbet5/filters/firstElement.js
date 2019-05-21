/* global VBET5 */
/**
 * @ngdoc filter
 * @name vbet5.filter:firstElement
 * @description  just returns 1st element of object
 *
 * @param {Boolean} onlyNumerable if true, will check for object item's "innumerable" field and will ignore item if it's present'
 */
VBET5.filter('firstElement', function () {
    'use strict';
    return function (obj, onlyNumerable) {
        var key;
        for (key in obj) {
            if (obj.hasOwnProperty(key) && (!onlyNumerable || !obj[key].innumerable)) {
                return obj[key];
            }
        }
        return null;
    };
});
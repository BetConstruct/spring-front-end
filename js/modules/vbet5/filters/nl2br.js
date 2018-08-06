/* global VBET5 */
/**
 * @ngdoc filter
 * @name vbet5.filter:html
 * @description nl2br filter
 */
VBET5.filter('nl2br', ['Utils', function (Utils) {
    'use strict';
    return function (html) {
        return Utils.nl2br(html || '');
    };
}]);
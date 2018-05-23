/* global VBET5 */
/**
 * @ngdoc filter
 * @name vbet5.filter:url
 * @description Encode a URI
 */
VBET5.filter('uri', function () {
    'use strict';
    return function (uri) {
        return encodeURIComponent(uri);
    };
});
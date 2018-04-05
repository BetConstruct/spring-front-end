/* global VBET5 */
/**
 * @ngdoc filter
 * @name vbet5.filter:html
 * @description nl2br filter
 */
VBET5.filter('escapehtml', function () {
    'use strict';
    var map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };

    return function (html) {
        return html.replace(/[&<>"']/g, function(m) { return map[m]; });
    };
});
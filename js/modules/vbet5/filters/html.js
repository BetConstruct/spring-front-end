/* global VBET5 */
/**
 * @ngdoc filter
 * @name vbet5.filter:html
 * @description html filter
 */
VBET5.filter('html', ['$sce', function ($sce) {
    'use strict';
    return function (html, tag) {
        return $sce.trustAsHtml(html && tag ? '<' + tag + '>' + html + '<' + tag + '/>' : html);
    };
}]);
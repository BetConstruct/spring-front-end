/* global VBET5 */
/**
 * @ngdoc filter
 * @name vbet5.filter:html
 * @description  translator filter
 */
VBET5.filter('html', ['$sce', function ($sce) {
    'use strict';

    function isHtml(html) {
        return /<([A-Za-z][A-Za-z0-9]*)\b[^>]*>(.*?)<\/\1>/.test(html);
    }

    return function (html, tag) {

        tag = tag || 'p';

        if (tag === 'url') {
            return $sce.trustAsResourceUrl(html);
        }

        if (!isHtml(html) && tag !== 'nowrap') {
            html = '<' + tag + '>' + html + '</' + tag + '>';
        }

        return $sce.trustAsHtml(html);

    };
}]);
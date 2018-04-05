/* global VBET5 */
/**
 * @ngdoc filter
 * @name vbet5.filter:url
 * @description url
 */
VBET5.filter('url', ['$sce', function ($sce) {
    'use strict';
    return function (url) {
        return $sce.trustAsResourceUrl(url);
    };
}]);
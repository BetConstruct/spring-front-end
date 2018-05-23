/* global CASINO */
/**
 * @ngdoc service
 * @name CASINO.service:casinoCache
 * @description
 * casinoCache
 */
CASINO.factory('casinoCache', ['$cacheFactory', function ($cacheFactory) {
    'use strict';
    return $cacheFactory('casinoCache', {});
}]);

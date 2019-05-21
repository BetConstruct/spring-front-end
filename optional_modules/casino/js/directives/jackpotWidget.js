/**
 * @ngdoc directive
 * @name CASINO.directive:biggestWinners
 * @element ANY
 * @param {Number} initial-width initial width of target element
 *
 * @description Makes gets and updates list of biggest winners of casino
 */
CASINO.directive('casinoJackpotWidget', ['$rootScope', '$location', '$interval', 'CConfig', 'Zergling', 'Utils', 'casinoData', 'Geoip', function ($rootScope, $location, $interval, CConfig, Zergling, Utils, casinoData, Geoip) {
    'use strict';
    return {
        restrict: 'E',
        replace: true,
        template: '<ng-include src="templateUrl"/>',
        scope: {
            limit: '=',
            templateUrl: '@',
            title: '@'
        },
        link: function (scope) {

        }
    };
}]);

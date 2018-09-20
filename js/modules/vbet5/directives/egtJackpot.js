/* global VBET5 */
/**
 * @ngdoc directive
 * @name vbet5.directive:egtJackpot
 */
VBET5.directive('egtJackpot', ['content', 'Zergling', function (content, Zergling) {
    'use strict';
    var jackpotData = {
        clover: 'currentLevelI',
        diamond: 'currentLevelII',
        heart: 'currentLevelIII',
        spade: 'currentLevelIV'
    };

    return {
        restrict: 'E',
        scope: {
            url: '@',
        },
        templateUrl: 'templates/directive/egtJackpot.html',
        link: function (scope) {
            Zergling.get({}, 'get_egt_jackpots').then(function (response) {
                scope.egtJackpot = response.data;
                scope.jackpotValues = {};

                angular.forEach(jackpotData, function (value, key) {
                    scope.jackpotValues[key] = scope.egtJackpot[value].toString().split('').reverse();
                });

                console.log('EGT', scope.egtJackpot);
            });
        }
    };
}]);

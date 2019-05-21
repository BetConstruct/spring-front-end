/* global VBET5 */
/**
 * @ngdoc directive
 * @name vbet5.directive:visibleSets
 * @description selects last visible set
 * No need to debounce the function as it's called once
 * ! Mutates openGame object !
 *
 */
VBET5.directive('visibleSets', function () {
    'use strict';
    return {
        restrict: 'A',
        link: function ($scope) {
            if ($scope.openGame) {
                $scope.$watch('framesCount(openGame.stats).length', function(allSets) {
                    $scope.openGame.setsOffset = allSets >= $scope.visibleSetsNumber ? allSets - $scope.visibleSetsNumber : 0;
                });
            }
        }
    };
});
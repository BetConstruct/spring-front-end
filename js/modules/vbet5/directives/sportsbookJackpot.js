/* global VBET5 */
VBET5.directive('sportsbookJackpot', ['$rootScope', 'jackpotManager', 'Utils', function ($rootScope, jackpotManager, Utils) {
    'use strict';

    return {
        restrict: 'E',
        replace: true,
        templateUrl: 'templates/directive/sportsbook-jackpot.html',
        scope: {},
        link: function (scope) {
            scope.viewDetails = false;
            scope.expandedPool = {name: 'closeAll'};

            scope.jackpotWidgets = {
                amountIndex: 0
            };
            scope.jackpotData = [];

            function subscribeForJackpotDataCallback(data) {
                scope.jackpotData = Utils.objectToArray(data)[0];
            }

            (function subscribeForJackpotData() {
                jackpotManager.subscribeForJackpotData(-1, subscribeForJackpotDataCallback, 'getjackpots', 'sportsbook');  // -1 all games,
            })();

            scope.$on('$destroy', function() {
                jackpotManager.unsubscribeFromJackpotData(true);
            });
        }
    };
}]);

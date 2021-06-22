/* global VBET5 */
/**
 * @ngdoc directive
 * @name vbet5.directive:rtgJackpot
 */
VBET5.directive('bcJackpot', ['content', '$rootScope', 'jackpotManager', 'Utils', function (content, $rootScope, jackpotManager, Utils) {
    'use strict';

    return {
        restrict: 'E',
        scope: {
            jackpotId: '=',
            jackpotSource: '='
        },
        templateUrl: 'templates/directive/bcJackpot.html',
        link: function (scope) {
            jackpotManager.subscribeForJackpotData(-1, subscribeForJackpotDataCallback, null, scope.jackpotSource || 0, scope.jackpotId ? [parseInt(scope.jackpotId)] : null);

            function subscribeForJackpotDataCallback(data) {
                if (data) {
                    if (scope.jackpotId && data[scope.jackpotId]) {
                        scope.jackpotData = data[scope.jackpotId];
                    } else if (!scope.jackpotId) {
                        scope.jackpotData = Utils.objectToArray(data)[0];
                    }
                }
            }

            scope.$on('$destroy', function () {
                jackpotManager.unsubscribeFromJackpotData(null, -1, subscribeForJackpotDataCallback);
            });
        }
    };
}]);

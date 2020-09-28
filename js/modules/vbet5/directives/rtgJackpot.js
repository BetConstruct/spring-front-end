/* global VBET5 */
/**
 * @ngdoc directive
 * @name vbet5.directive:rtgJackpot
 */
VBET5.directive('rtgJackpot', ['content', '$rootScope', 'jackpotManager', function (content, $rootScope, jackpotManager) {
    'use strict';

    return {
        restrict: 'E',
        scope: {
            url: '@'
        },
        templateUrl: 'templates/directive/rtgJackpot.html',
        link: function (scope) {
            jackpotManager.subscribeForExternalJackpotData(subscribeForExternalJackpotDataCallback,['RTG']);

            function subscribeForExternalJackpotDataCallback(data) {
                if(data && data['RTG']){
                    scope.jackpotData = data['RTG'];
                }
            }

            scope.$on('$destroy', function () {
                jackpotManager.unsubscribeFromAllExternalJackpotData(subscribeForExternalJackpotDataCallback);
            });
        }
    };
}]);

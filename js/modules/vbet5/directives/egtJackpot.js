/* global VBET5 */
/**
 * @ngdoc directive
 * @name vbet5.directive:egtJackpot
 */
VBET5.directive('egtJackpot', ['content', '$rootScope', 'jackpotManager', function (content, $rootScope, jackpotManager) {
    'use strict';


    return {
        restrict: 'E',
        scope: {
            url: '@',
        },
        templateUrl: 'templates/directive/egtJackpot.html',
        link: function (scope) {
            scope.jackpotNames = {
                'LeveI': 'clover',
                'LeveII': 'diamond',
                'LeveIII': 'heart',
                'LeveIV': 'spade'
            };

            jackpotManager.subscribeForExternalJackpotData(subscribeForExternalJackpotDataCallback,['EGT']);

            function subscribeForExternalJackpotDataCallback(data) {
                if(data && data['EGT']){
                    scope.jackpotData = data['EGT'];
                }
            }

            scope.$on('$destroy', function () {
                jackpotManager.unsubscribeFromAllExternalJackpotData(subscribeForExternalJackpotDataCallback);
            });
        }
    };
}]);

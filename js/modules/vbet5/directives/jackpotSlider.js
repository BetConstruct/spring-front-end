VBET5.directive('jackpotSlider', ['$rootScope', 'jackpotManager', 'Utils','$filter', function ($rootScope, jackpotManager, Utils,$filter) {
    'use strict';

    return {
        restrict: 'E',
        replace: true,
      //  templateUrl: 'templates/directive/casino-jackpot-slider.html',
        scope: {
            jackpotData: '=?',
            loadJackpotData: '=?',
            type: '=?'
        },
        templateUrl: function templateUrl(el, attrs) {
            var templateUrl = '';
            switch  (attrs.type){
                case 'widget-casino' : {
                    templateUrl = 'templates/directive/casino-jackpot-widget.html';
                    break;
                }
                default: {
                    templateUrl = 'templates/directive/casino-jackpot-slider.html';
                    break;
                }
            }
            return  $filter('fixPath')(templateUrl || 'templates/directive/casino-jackpot-slider.html');
        },
        link: function (scope) {
            scope.jackpotWidgets = {
                amountIndex: 0
            };

            function subscribeForJackpotData() {
                jackpotManager.unsubscribeFromJackpotData();
                jackpotManager.subscribeForJackpotData(-1, function subscribeForJackpotDataCallback(data) {
                    data = Utils.objectToArray(data);
                    scope.jackpotData = data;
                },null,scope.type || 'casino');  // -1 all games ,  casino
            }

            if (scope.loadJackpotData) {
                scope.jackpotData = [];
                subscribeForJackpotData();
            }
            scope.$on('$destroy', function() {
                if (scope.loadJackpotData) {
                    jackpotManager.unsubscribeFromJackpotData(true);
                }
            });
        }
    };
}]);

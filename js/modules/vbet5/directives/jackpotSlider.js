VBET5.directive('jackpotSlider', ['$rootScope', 'jackpotManager', 'Utils','$filter', function ($rootScope, jackpotManager, Utils,$filter) {
    'use strict';

    return {
        restrict: 'E',
        replace: true,
        scope: {
            jackpotData: '=?',
            loadJackpotData: '=?',
            jackpotIndex :'=?',
        },
        templateUrl: function templateUrl(el, attrs) {
            var templateUrl = '';
            switch  (attrs.templateType){
                case 'widget' : {
                    templateUrl = 'templates/directive/jackpot-slider-widget.html';
                    break;
                }
                default: {
                    templateUrl = 'templates/directive/jackpot-slider.html';
                    break;
                }
            }
            return  $filter('fixPath')(templateUrl);
        },
        link: function (scope,el,attrs) {
            scope.jackpotWidgets = {
                amountIndex: 0
            };
            function subscribeForGlobalJackpotDataCallback(data) {
                scope.jackpotData = [{
                    CurrencyFraction: data.CurrencyFraction,
                    Currency: data.Currency,
                    CollectedAmountTotal: data.Amount,
                    Name:data.Name
                }];
            }

            function subscribeForJackpotDataCallback(data) {
                data = Utils.objectToArray(data);
                scope.jackpotData = data;
            }

            function subscribeForJackpotData() {
                if (attrs.type !== 'global') {
                    jackpotManager.subscribeForJackpotData(-1, subscribeForJackpotDataCallback, null, attrs.type || 'casino');  // -1 all games ,  casino
                } else {
                    jackpotManager.subscribeForGlobalJackpotData(subscribeForGlobalJackpotDataCallback);
                }
            }

            if (scope.loadJackpotData) {
                scope.jackpotData = [];
                subscribeForJackpotData();
            }
            scope.$on('$destroy', function() {
                if (scope.loadJackpotData) {
                    if(attrs.type !== 'global'){
                        jackpotManager.unsubscribeFromJackpotData(null, -1, subscribeForJackpotDataCallback);
                    }else{
                        jackpotManager.unsubscribeFromGlobalJackpotData(subscribeForGlobalJackpotDataCallback, true);
                    }
                }
            });
        }
    };
}]);

/**
 * @ngdoc directive
 * @name CASINO.directive:coinsRain
 *
 * @description Coins rain animation
 */
CASINO.directive('coinsRain', ['TimeoutWrapper', function (TimeoutWrapper) {
    'use strict';

    return {
        restrict: 'E',
        replace: true,
        template: '<div class="coin-wrapper"><div class="coin"><p ng-repeat="coin in coins track by $index" style="transform: rotateZ({{coin}}deg);left: {{coin}}%;"></p></div></div>',
        scope: {

        },
        link: function (scope) {
            var Timeout = TimeoutWrapper(scope);
            scope.coins = [];
            var i;
            for (i = 0; i < 120; i+=5) {
                Timeout(function () {
                    var i2;
                    for (i2 = 0; i2 < 7; i2++) {
                        scope.coins.push(5 + Math.round(Math.random() * 80));
                    }

                }, i * 20);
            }
            Timeout(function () {
                //scope.coins = [];
            }, 5000);
        }
    };
}]);
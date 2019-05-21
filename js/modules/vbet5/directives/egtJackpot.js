/* global VBET5 */
/**
 * @ngdoc directive
 * @name vbet5.directive:egtJackpot
 */
VBET5.directive('egtJackpot', ['content', 'Zergling', '$filter', '$rootScope', function (content, Zergling, $filter, $rootScope) {
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
            var delay = 1000;
            var delay1 = 1000;
            var delay2 = 10000;
            var destroy = false;
            var timeout = 0;
            var firstTime = true;
            var dataIsSame = false;
            var currencyName = '';
            scope.jackpotAmounts = {};
            scope.point = 0;



            function getData(currency) {
                if(currency){
                    currencyName = currency.name;
                }

                Zergling.get({}, 'get_egt_jackpots').then(function (response) {
                    scope.egtJackpot = response.data;
                    dataIsSame = true;
                    if (scope.egtJackpot.currency !== currencyName) {
                        Zergling.get({
                            'source': 'config.currency',
                            'what': {
                                'currency': []
                            },
                            'where': {
                                'currency': {
                                    'name': scope.egtJackpot.currency
                                }
                            }
                        }).then(function (response) {
                            if (response.data && response.data.currency) {
                                currencyName = scope.egtJackpot.currency;
                                var curr = $filter('firstElement')(response.data.currency);
                                if (curr && curr.rounding !== undefined) {
                                    scope.point = curr.rounding;
                                }
                            }
                            processData();
                        }, function () {
                            processData();
                        });
                    } else {
                        if(currency){
                            scope.point = currency.rounding;
                        }

                        processData();
                    }

                    function processData() {
                        if (firstTime || dataIsSame) {
                            firstTime = false;
                            delay = delay1;
                        } else {
                            delay = delay2;
                        }

                        angular.forEach(jackpotData, function (value, key) {
                            if (scope.jackpotAmounts[key] !== scope.egtJackpot[value]) {
                                dataIsSame = false;
                            }
                            scope.jackpotAmounts[key] = scope.egtJackpot[value] / 100; //todo SDC-39820
                        });

                        if (destroy) {
                            return;
                        }
                        timeout = setTimeout(getData, delay);
                    }

                }, function () {
                    timeout = setTimeout(getData, 10000);
                });
            }

            var currencyWatcher = $rootScope.$watch('currency', function (currency) {
                if (currency) {
                    currencyWatcher();
                    getData(currency);
                }
            });

            scope.$on('$destroy', function () {
                destroy = true;
                clearTimeout(timeout);
            });
        }
    };
}]);

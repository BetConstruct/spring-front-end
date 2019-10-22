/* global VBET5 */
/**
 * @ngdoc directive
 * @name vbet5.directive:rtgJackpot
 */
VBET5.directive('rtgJackpot', ['content', 'Zergling', '$filter', '$rootScope', function (content, Zergling, $filter, $rootScope) {
    'use strict';

    return {
        restrict: 'E',
        scope: {
            url: '@'
        },
        templateUrl: 'templates/directive/rtgJackpot.html',
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
            var previousAmounts = {};
            scope.rtgJackpot = {};


            function getData() {
                if ($rootScope.currency) {
                    currencyName = $rootScope.currency.name;
                }

                Zergling.get({}, 'get_red_tiger_jackpots').then(function (response) {
                    if (response.data.result && response.data.result.jackpots && response.data.result.jackpots.length > 0) {
                        scope.rtgJackpot = response.data.result.jackpots[0];

                        scope.rtgJackpot.currency = scope.rtgJackpot.pots && scope.rtgJackpot.pots[0] && scope.rtgJackpot.pots[0].currency ? scope.rtgJackpot.pots[0].currency : null;
                        dataIsSame = true;
                        if (scope.rtgJackpot.currency !== currencyName) {
                            Zergling.get({
                                'source': 'config.currency',
                                'what': {
                                    'currency': []
                                },
                                'where': {
                                    'currency': {
                                        'name': scope.rtgJackpot.currency
                                    }
                                }
                            }).then(function (response) {
                                if (response.data && response.data.currency) {
                                    currencyName = scope.rtgJackpot.currency;
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
                            if ($rootScope.currency) {
                                scope.point = $rootScope.currency.rounding;
                            }

                            processData();
                        }

                    } else {
                        timeout = setTimeout(getData, delay1);
                    }

                    function processData() {
                        if (firstTime || dataIsSame) {
                            firstTime = false;
                            delay = delay1;
                        } else {
                            delay = delay2;
                        }

                        if (scope.rtgJackpot.pots && !scope.rtgJackpot.processed) {
                            scope.rtgJackpot.processed = true;
                            angular.forEach(scope.rtgJackpot.pots, function (pot, key) {
                                if (previousAmounts[pot.type] !== pot.amount) {
                                    dataIsSame = false;
                                }
                                previousAmounts[pot.type] = pot.amount;
                                if (scope.rtgJackpot.pots[key].time) {
                                    angular.forEach(scope.rtgJackpot.pots[key].time, function (time, timeKey) {
                                        if (time) {
                                            scope.rtgJackpot.pots[key].time[timeKey] = (new Date(time + ' GMT').getTime() / 1000);
                                        }
                                    });
                                }
                            });
                        }

                        if (destroy) {
                            return;
                        }
                        timeout = setTimeout(getData, delay);
                    }


                }, function () {
                    timeout = setTimeout(getData, delay2);
                });
            }

            var currencyWatcher = $rootScope.$watch('currency', function (currency) {
                if (currency) {
                    currencyWatcher();
                    getData();
                }
            });

            scope.$on('$destroy', function () {
                destroy = true;
                clearTimeout(timeout);
            });
        }
    };
}]);

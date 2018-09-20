/* global VBET5 */
/**
 * @ngdoc directive
 * @name vbet5.directive:openBets
 *
 * @description displays open bets in the bet slip
 *
 */
VBET5.directive('openBets', ['$rootScope', 'Zergling', 'BetService', 'Utils', 'GameInfo', '$filter', '$timeout', 'Config', '$location', '$route', function ($rootScope, Zergling, BetService, Utils, GameInfo, $filter, $timeout, Config, $location, $route) {
    'use strict';
    return {
        restrict: 'E',
        replace: false,
        scope: {
            betSlip: '=',
            profile: '=',
            shared: '=sharedData'
        },
        templateUrl: function getTemplateUrl() {
            return ($rootScope.conf.sportsLayout === 'asian' && $rootScope.currentPage.path === "/sport") ? 'templates/directive/open-bets/open-bets-asian.html' : 'templates/directive/open-bets/open-bets.html';
        },
        link: function ($scope) {
            var openBetsSubId, cashoutableBets = [];
            $scope.matchInfo = {};
            $scope.betTypes = {
                1: 'Single',
                2: 'Express',
                3: 'System',
                4: 'Chain'
            };

            $scope.autoCashoutRule = {
                theValueReaches: undefined,
                partialAmount: undefined,
                showInfo: false
            };

            (function init() {
                $scope.minCashoutValue = BetService.cashOut.getMinCashOutValue();
            })();


            function getOpenBets() {
                Zergling.get({'where': { 'outcome': 0 } }, 'bet_history')
                    .then(function (response) {
                        if (response.bets) {
                            $scope.shared.openBets = response.bets;
                            cashoutableBets = [];
                            angular.forEach($scope.shared.openBets, function improveName(bet) {
                                // Need to filter bets that have cash out so we don't make unnecessary 'calculate_cashout_amount' requests
                                if (bet.cash_out !== undefined) {
                                    cashoutableBets.push(bet.id);
                                }
                                angular.forEach(bet.events, function(event) {
                                    event.id = event.game_id;
                                    event.team1_name = event.team1;
                                    event.team2_name = event.team2;
                                    // Parameters assigned above are necessary for 'improveName' filter to work properly
                                    event.eventName = $filter('improveName')(event.event_name, event);
                                });
                            });
                            if ($scope.betSlip.mode === 'openBets') {
                                unsubscribeFromOpenBets();
                                subscribeToOpenBets();
                            }
                        }
                    });
            }


            function subscribeToOpenBets() {
                var openBetEventsIds = [],
                    openBetSportIds = [],
                    openBetGameIds = [];
                angular.forEach($scope.shared.openBets, function iterateBets(bet) {
                    angular.forEach(bet.events, function getEventId(event) {
                        var eventId = parseInt(($rootScope.conf.GmsPlatform ? event.selection_id : event.id), 10);
                        openBetEventsIds.push(eventId);
                        openBetSportIds.push(event.sport_id);
                        openBetGameIds.push(event.game_id);
                    });
                });

                if (openBetEventsIds.length) {
                    $scope.openBetsLoading = true;
                    openBetSportIds = Utils.uniqueNum(openBetSportIds);
                    openBetGameIds = Utils.uniqueNum(openBetGameIds);

                    Zergling.subscribe({
                        'source': 'betting',
                        'what': {
                            'sport': ['id', 'alias'],
                            'region': ['id'],
                            'competition': ['id'],
                            'game': ['text_info', 'id', 'type'],
                            'event': ['id', 'price']
                        },
                        'where': {
                            'event': { 'id': { '@in': openBetEventsIds } },
                            'sport': { 'id': { '@in': openBetSportIds } },
                            'game': { 'id': { '@in': openBetGameIds } }
                        }
                    }, updateOpenBets).then(
                        function success(response) {
                            openBetsSubId = response.subid;
                            if (response.data) {
                                updateOpenBets(response.data, true); // true - for forcefully calculating cash out amount when we first load data
                            }
                        })['finally'](function closeLoader() { $scope.openBetsLoading = false; });
                }
            }


            function updateOpenBets(data, forceCalculateCashOut) {
                if ($scope.betSlip.mode !== 'openBets') {
                    unsubscribeFromOpenBets();
                    return;
                }
                var events = {};
                angular.forEach(data.sport, function (sport) {
                   angular.forEach(sport.region, function (region) {
                      angular.forEach(region.competition, function (competition) {
                          angular.forEach(competition.game, function iterateGames(gameInfo, gameId) {
                              $scope.matchInfo[gameId] = {
                                text_info: gameInfo.text_info
                              };
                              $scope.matchInfo[gameId].gamePointer = {
                                  'game': gameId,
                                  'sport': sport,
                                  'competition': competition.id,
                                  'type': gameInfo.type === 1 ? "1" : "0",
                                  'region': region.id,
                                  'alias': sport.alias
                              };
                              angular.forEach(gameInfo.event, function getEventId(event) {
                                  var currentEventId = event.id;
                                  events[currentEventId] = event;
                              });
                          });
                      });
                   });
                });
                if (cashoutableBets.length) {
                    updateOpenBetsCashOut(events, forceCalculateCashOut);
                }
            }


            function updateOpenBetsCashOut(data, forceCalculateCashOut) {
                var cashOutBetIds = BetService.cashOut.filterEvents($scope.shared.openBets, data, cashoutableBets, forceCalculateCashOut);
                if(cashOutBetIds.length) {
                    BetService.cashOut.getData(cashOutBetIds)
                        .then(function success(cashOutMap) { BetService.cashOut.processData($scope.shared.openBets, cashOutMap); });
                }
            }


            function updateAfterCashout(betId) {
                var request = {'where': { 'bet_id': betId }};

                $timeout(function() {
                    Zergling.get(request, 'bet_history')
                        .then(function(response) {
                            if (response && response.bets) {
                                var cashedOutBet = response.bets[0];
                                angular.forEach(cashedOutBet.events, function improveName(event) {
                                    event.id = event.game_id;
                                    event.team1_name = event.team1;
                                    event.team2_name = event.team2;
                                    // Parameters assigned above are necessary for 'improveName' filter to work properly
                                    event.eventName = $filter('improveName')(event.event_name, event);
                                });
                                for (var i = $scope.shared.openBets.length; i--;) {
                                    if ($scope.shared.openBets[i].id === cashedOutBet.id) {
                                        cashedOutBet.cashoutEnabled = $scope.shared.openBets[i].cashoutEnabled;
                                        $scope.shared.openBets[i] = cashedOutBet;
                                        break;
                                    }
                                }
                            }
                        });
                }, 950);
            }


            function updateCashOutAmount(e, data) {
                // Updates single bet's cash out amount after it has been partially cashed out (back end currently doesn't send 'bet_settlement', for this to be done automatically)
                $timeout(function() {
                    BetService.cashOut.getData([data.betId])
                        .then(function success(cashOutMap) { BetService.cashOut.processData($scope.shared.openBets, cashOutMap); });
                }, 950);
            }


            function unsubscribeFromOpenBets() {
                if (openBetsSubId) {
                    Zergling.unsubscribe(openBetsSubId);
                    openBetsSubId = undefined;
                }
            }


            function closeOpenBets() {
                if ($scope.betSlip.mode === 'openBets') {
                    $scope.betSlip.mode = 'betting';
                }
            }

            $scope.gotoBetGame = function gotoBetGame(gamePointer) {
                if (!gamePointer) {return;}

                var isVirtual = GameInfo.getVirtualSportIds().indexOf(gamePointer.sport.id) !== -1;

                $location.search({
                    'type': gamePointer.type,
                    'sport': isVirtual ? -3 : gamePointer.sport.id !== undefined ? gamePointer.sport.id : gamePointer.sport,
                    'region': gamePointer.region,
                    'competition': gamePointer.competition,
                    'game': gamePointer.game,
                    'vsport': isVirtual ? gamePointer.sport.id : gamePointer.vsport
                });

                if (Config.main.sportsLayout === 'Combo' && isVirtual) {
                    $location.search('alias', gamePointer.alias);
                }

                var getVirtualPath = function () {
                    var virtualsPath = '/virtualsports';
                    angular.forEach(Config.main.virtualSportIds, function (value, key) {
                        value.indexOf(gamePointer.sport.id) !== -1 && (virtualsPath = key);
                    });

                    return virtualsPath;
                };

                var neededPath = isVirtual ? getVirtualPath() : Utils.getPathAccordintToAlias(gamePointer.alias);

                if ($location.path() !== neededPath + '/') {
                    $location.path(neededPath);
                } else {
                    $route.reload();
                }
            };

            var startTimeout;

            $scope.getAutoCashOutDetails = function getAutoCashOutDetails(betId, rule) {
                $scope.autoCashoutRule.theValueReaches = undefined;
                if(startTimeout) {
                    $timeout.cancel(startTimeout);
                }
                if (rule != null) {
                    startTimeout = $timeout(function() {
                        if ($scope.autoCashoutRule.showInfo) {
                            Zergling.get({'bet_id': betId}, 'get_bet_auto_cashout')
                                .then(function (response) {
                                    if (response.result === 0) {
                                        $scope.autoCashoutRule.theValueReaches = response.details.MinAmount;
                                        $scope.autoCashoutRule.partialAmount = response.details.PartialAmount;
                                    }
                                });
                        }
                    }, 500);
                }
            };


            $scope.cancelAutoCashOutRule = function cancelAutoCashOutRule(betId) {
                Zergling.get({bet_id: betId}, 'cancel_bet_auto_cashout')
                    .then(function (response) {
                        if(response.result === 0) {
                            $rootScope.$broadcast("globalDialogs.addDialog", {
                                type: "success",
                                title: 'Cash-out',
                                content: "Auto Cash-Out rule has been canceled."
                            });
                            updateAfterCashout(betId);
                        }
                    });
            };

            $scope.editBet = function editBet(bet) {
                BetService.repeatBet.addEvents(bet, true).then(function() { $scope.betSlip.mode = 'betting'; });
            };


            $scope.$watch('betSlip.mode', function openBetsWatcher(newVal, oldVal) {
                if (oldVal === newVal) { return; }
                if (newVal === 'openBets') {
                    subscribeToOpenBets();
                } else if (oldVal === 'openBets') {
                    unsubscribeFromOpenBets();
                }
            });
            $scope.$watch('profile.bet_settlement', getOpenBets, true);

            $scope.$on('openBets.close', closeOpenBets);
            $scope.$on('openBets.updateCashOutAmount', updateCashOutAmount);
            $scope.$on('updateAfterCashout', function(event, data) {
                if (data.autoCashout) {
                    updateAfterCashout(data.betId);
                }
            });
            $scope.$on('$destroy', unsubscribeFromOpenBets);
        }
    };
}]);

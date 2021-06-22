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
    var ORDER_BET_TYPES_MAP = {'4':1, '40':1, '43': 1};

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
            var openBetsSubId, cashOutSubId;
            $scope.ODD_TYPE_MAP = [
                {
                    short:'dcm',
                    full:'decimal'
                }, {
                    short:'frc',
                    full:'fractional'
                }, {
                    short:'amr',
                    full:'american'
                }, {
                    short:'hkg',
                    full:'hongkong'
                }, {
                    short:'mly',
                    full:'malay'
                }, {
                    short:'ind',
                    full:'indo'
                }
            ];

            $scope.betConf = Config.betting;
            $scope.matchInfo = {};
            $scope.betTypes = BetService.constants.betTypes;
            $scope.addEvents = BetService.repeatBet;

            $scope.autoCashoutRule = {
                theValueReaches: undefined,
                partialAmount: undefined,
                showInfo: false
            };
            $scope.minCashoutValue = BetService.cashOut.getMinCashOutValue();
            $scope.shared.openBets = $scope.openBets = {
                data: [],
                count: 0,
                loading: false
            };


            function closeLoader() { $scope.openBets.loading = false; }


            function unsubscribeFromCashOut() {
                if (cashOutSubId) {
                    BetService.cashOut.unsubscribe(cashOutSubId);
                    cashOutSubId = undefined;
                }
            }


            function subscribeToCashOut() {
                if (cashOutSubId || $scope.betSlip.mode !== 'openBets') { return; }
                cashOutSubId = BetService.cashOut.subscribe(function updateCashOutAmount(data) {
                    $scope.openBets.data.forEach(function(bet) {
                        if (data[bet.id]) {
                            bet.cash_out = data[bet.id].amount;
                        }
                    });
                    $rootScope.$broadcast('updatePopUpInfo');
                });
            }


            function unsubscribeFromOpenBets() {
                if (openBetsSubId) {
                    Zergling.unsubscribe(openBetsSubId);
                    openBetsSubId = undefined;
                }
            }


            function updateOpenBets(data) {
                if ($scope.betSlip.mode !== 'openBets') {
                    unsubscribeFromOpenBets();
                    return;
                }
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
                            });
                        });
                    });
                });
            }


            function subscribeToOpenBets() {
                var openBetEventsIds = [],
                    openBetSportIds = [],
                    openBetGameIds = [];
                angular.forEach($scope.openBets.data, function iterateBets(bet) {
                    angular.forEach(bet.events, function getEventId(event) {
                        openBetEventsIds.push(event.selection_id);
                        openBetSportIds.push(event.sport_id);
                        openBetGameIds.push(event.game_id);
                    });
                });

                if (openBetEventsIds.length) {
                    $scope.openBets.loading = true;
                    openBetSportIds = Utils.uniqueNum(openBetSportIds);
                    openBetGameIds = Utils.uniqueNum(openBetGameIds);

                    Zergling.subscribe({
                        'source': 'betting',
                        'what': {
                            'sport': ['id', 'alias', 'type'],
                            'region': ['id'],
                            'competition': ['id'],
                            'game': [['text_info', 'id', 'type', 'is_live']],
                            'event': ['id']
                        },
                        'where': {
                            'event': { 'id': { '@in': openBetEventsIds } },
                            'sport': { 'id': { '@in': openBetSportIds } },
                            'game': { 'id': { '@in': openBetGameIds } }
                        }
                    }, updateOpenBets)
                        .then(function success(response) {
                            openBetsSubId = response.subid;
                            if (response.data) {
                                updateOpenBets(response.data);
                            }
                        })['finally'](closeLoader);
                }
            }


            function getOpenBets() {
                $scope.openBets.loading = true;

                var request = {
                    where: { outcome: 0 }
                };
                if ($scope.betSlip.mode !== 'openBets') {
                    request.where.only_counts = true;
                }

                Zergling.get(request, 'bet_history')
                    .then(function (response) {
                        if (response.bets) {
                            if ($scope.betSlip.mode === 'openBets') {
                                if (response.bets.count === undefined) {
                                    $scope.openBets.data = response.bets;
                                    $scope.openBets.count =  response.bets.length;
                                    angular.forEach($scope.openBets.data, function improveName(bet) {
                                        angular.forEach(bet.events, function(event) {
                                            event.id = event.game_id;
                                            event.team1_name = event.team1;
                                            event.team2_name = event.team2;
                                            event.oddTypeMapped = $scope.ODD_TYPE_MAP[+bet.odd_type];
                                            // Parameters assigned above are necessary for 'improveName' filter to work properly
                                            event.eventName = $filter('improveName')(event.event_name, event);
                                        });
                                        if (ORDER_BET_TYPES_MAP[bet.type]) {
                                            bet.events.sort(Utils.orderSorting);
                                            bet.showOrder = true;
                                        }
                                    });
                                    unsubscribeFromOpenBets();
                                    subscribeToOpenBets();
                                    subscribeToCashOut();
                                }
                            } else {
                                $scope.openBets.count = response.bets.count !== undefined ? response.bets.count : response.bets.length; //fast click fix
                            }
                        }
                    })['finally'](closeLoader);
            }


            function updateAfterCashout(bet) {

                angular.forEach(bet.events, function improveName(event) {
                    event.id = event.game_id;
                    event.team1_name = event.team1;
                    event.team2_name = event.team2;
                    event.oddTypeMapped = $scope.ODD_TYPE_MAP[+bet.odd_type];
                    // Parameters assigned above are necessary for 'improveName' filter to work properly
                    event.eventName = $filter('improveName')(event.event_name, event);
                });

                for (var i = $scope.openBets.data.length; i--;) {
                    if ($scope.openBets.data[i].id === bet.id) {
                        $scope.openBets.data[i] = bet;
                        break;
                    }
                }
            }

            $scope.gotoBetGame = function gotoBetGame(gamePointer) {
                if (!gamePointer) {return;}

                var isVirtual = gamePointer.sport.type === 1;

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
                        if (value.indexOf(gamePointer.sport.id) !== -1) {
                            virtualsPath = key;
                        }
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
                if(startTimeout) {
                    $timeout.cancel(startTimeout);
                }
                if (rule !== null) {
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
                        if (response.result === 0) {
                            $rootScope.$broadcast("globalDialogs.addDialog", {
                                type: "success",
                                title: 'Cash-out',
                                content: "Auto Cash-Out rule has been canceled."
                            });
                            setTimeout(function() {
                                BetService.getBetHistory(betId)
                                    .then(function(bet) {
                                        updateAfterCashout(bet);
                                    });
                            }, 950)
                        }
                    });
            };

            $scope.editBet = function editBet(bet) {
                BetService.repeatBet(bet, true).then(function() { $scope.betSlip.mode = 'betting'; });
            };


            $scope.$watch('betSlip.mode', function openBetsWatcher(newVal, oldVal) {
                if (oldVal === newVal) { return; }
                if (newVal === 'openBets') {
                    getOpenBets();
                } else if (oldVal === 'openBets') {
                    unsubscribeFromOpenBets();
                    unsubscribeFromCashOut();
                }
            });
            $scope.$watch('profile.bet_settlement', getOpenBets, true);

            $scope.$on('updateAfterCashout', function(event, data) {
                if (data.autoCashout) {
                    updateAfterCashout(data.bet);
                }
            });
            $scope.$on('$destroy', function openBetsOnDestroy() {
                unsubscribeFromOpenBets();
                unsubscribeFromCashOut();
            });

        }
    };
}]);

/* global VBET5 */
/**
 * @ngdoc directive
 * @name vbet5.directive:greyhoundRacingGame
 *
 * @description greyhounds racing game
 *
 */
VBET5.directive('greyhoundRacingGame', ['$rootScope', 'ConnectionService', 'Utils', 'MarketService', 'GameInfo', 'Config', 'forecastTricast', function($rootScope, ConnectionService, Utils, MarketService, GameInfo, Config, forecastTricast) {
        'use strict';

        var DIALOG_TAG = "forecast-tricast-bet-popup";
        return {
            restrict: 'E',
            replace: false,
            templateUrl: 'templates/directive/greyhound-racing-game.html',
            scope: {
                gameId: '=', sportId: '=', competitionId: '=', regionId: '='
            },
            link: function($scope) {
                $scope.loading = true;
                $scope.selectedTab = 'Winner';
                $scope.isEventInBetSlip = GameInfo.isEventInBetSlip;
                $scope.racingData = {};
                $scope.openGameMarkets = [];
                forecastTricast.init($scope);

                $scope.bet = function bet(event, market, openGame, oddType) {
                    oddType = oddType || 'odd';
                    var game = Utils.clone(openGame);
                    $rootScope.$broadcast('bet', {event: event, market: market, game: game, oddType: oddType});
                };

                $scope.raceCardsColumnClick = function raceCardsColumnClick(orderItem) {
                    if ($scope.raceCardsPredicate === orderItem || $scope.raceCardsPredicateDog === orderItem) {
                        $scope.raceCardsReverce = !$scope.raceCardsReverce;
                    } else {
                        $scope.raceCardsReverce = false;
                        $scope.raceCardsPredicate = orderItem;
                        $scope.raceCardsPredicateDog = orderItem;
                    }
                };

                $scope.openBetPopup = function openBetPopup() {
                    $scope.openPopup($scope.openGame, DIALOG_TAG);
                };

                $scope.getEventRowIndex = function getEventRowIndex(event) {
                    for (var i= $scope.openGameMarkets.length; i--;) {
                        if ($scope.openGameMarkets[i].id === event.id) {
                            return i;
                        }
                    }
                };

                $scope.getEvent = function getEvent(rowIndex) {
                    return $scope.openGameMarkets[rowIndex];
                };

                $scope.getItemsCount = function getItems() {
                    return $scope.openGameMarkets.length;
                };

                function selectForecastTricast() {
                    $scope.extra_info = null;
                    $scope.resetRacingData();
                }

                $scope.selectTab = function selectTab(tab) {
                    if ($scope.selectedTab !== tab) {
                        $scope.selectedTab = tab;
                        switch (tab) {
                            case 'forecast':
                                $scope.racingData.columns = ['1st', '2nd', 'ANY'];
                                selectForecastTricast();
                                break;
                            case 'tricast':
                                $scope.racingData.columns = ['1st', '2nd', '3rd', 'ANY'];
                                selectForecastTricast();
                                break;
                            default:
                                $scope.extra_info = $scope.groupedMarkets[tab].extra_info;
                                break;
                        }
                    }
                };

                function groupMarketsByType(markets) {
                    var groupedObject = {};
                    markets.forEach(function (market) {
                        groupedObject[market.type] = market;
                    });

                    return groupedObject;
                }

                function updateOpenGameData(data) {
                    var sport = data.sport[$scope.sportId];
                    if (!sport) {return}

                    var region = sport.region[$scope.regionId],
                    competition = region.competition[$scope.competitionId],
                    game = competition.game[$scope.gameId];

                    var openGame = {
                        id: game.id,
                        info: game.info,
                        type: game.type,
                        is_blocked: game.is_blocked,
                        markets_count: game.markets_count,
                        game_number: game.game_number,
                        team1_name: game.team1_name,
                        team2_name: game.team2_name,
                        team1_id: game.team1_id,
                        team2_id: game.team2_id,
                        text_info: game.text_info,
                        sport: {
                            id: sport.id,
                            alias: sport.alias,
                            name: sport.name
                        },
                        region: {
                            id: region.id,
                            alias: region.alias,
                            name: region.name
                        },
                        competition: {
                            id: competition.id,
                            name: competition.name
                        },
                        game_info: game.game_info
                    };

                    if(Config.main.showPlayerRegion) {
                        openGame.team1_name = game.team1_reg_name && game.team1_name.indexOf(game.team1_reg_name) === -1 ? game.team1_name + ' (' + game.team1_reg_name + ')' : game.team1_name;
                        openGame.team2_name = game.team2_reg_name && game.team2_name.indexOf(game.team2_reg_name) === -1 ? game.team2_name + ' (' + game.team2_reg_name + ')' : game.team2_name;
                    }

                    var marketsData = MarketService.getMarketsAndGroups(game.id, game.market, game.team1_name, game.team2_name, sport.alias, game.is_stat_available, 0);
                    openGame.markets = marketsData.markets;
                    $scope.openGame = openGame;

                    if(marketsData.markets.length) {
                        $scope.groupedMarkets = groupMarketsByType(openGame.markets);
                        $scope.openGameMarkets = $scope.groupedMarkets.Winner['events'];
                        $scope.extra_info = $scope.groupedMarkets[$scope.selectedTab].extra_info;
                    }
                    forecastTricast.restoreSelectedRaces();
                }

                var connectionService = new ConnectionService($scope);
                var request = {
                    'source': 'betting',
                    'what': {
                        'sport': ['id', 'name', 'alias'],
                        'competition': ['id', 'name'],
                        'region': ['id', 'alias', 'name'],
                        'game': ["id", "show_type", "markets_count", "start_ts", "is_blocked", "team1_id", "team2_id", "game_number", "text_info", "type", "info", "team1_name", "team2_name", "game_info"],
                        'market': ["id", "col_count", "type", "display_key", "display_sub_key", "group_id", "name", "group_name", "order", "extra_info", "group_order"],
                        'event': ["order", "id", "type_1", "type", "type_id", "original_order", "name", "price", "nonrunner", "ew_allowed", "sp_enabled", "extra_info", "base", "display_column"]
                    },
                    'where': {
                        'game': {'id': $scope.gameId},
                        'sport': {'id': $scope.sportId},
                        'region': {'id': $scope.regionId},
                        'competition': {'id': $scope.competitionId}
                    }
                };

                $scope.$on("$destroy", function () {
                    $rootScope.$broadcast("globalDialogs.removeDialogsByTag", DIALOG_TAG);
                });

                $scope.$on("forecastTricastFinished", function(event, gameId) {
                    if (gameId === $scope.openGame.id) {
                        $scope.resetRacingData();
                    }
                });

                connectionService.subscribe(request, updateOpenGameData, {
                    'thenCallback': function() {
                        $scope.loading = false;
                    }, 'failureCallback': function() {
                        $scope.loading = false;
                    }
                });
            }
        };
    }]);

/**
 * @ngdoc controller
 * @name vbet5.controller:classicMultiColumnCtrl
 * @description
 * Classic mode view controller
 */
angular.module('vbet5.betting').controller('classicMultiColumnCtrl', ['$scope', 'Config', 'ConnectionService', function ($scope, Config, ConnectionService) {
    'use strict';
    $scope.multiColumn = $scope.multiColumn || {show: Config.main.prematchMultiColumnEnabled ? (Storage.get('show_multi_column') !== undefined ? !!Storage.get('show_multi_column') : true) : false};

    $scope.multiColumnMarketFilterTypes = Config.main.multiColumnMarketFilterTypes;
    var connectionService = new ConnectionService($scope);
    var liveGamesSubId;
    /**
     * @ngdoc method
     * @name getMultiColumnEvents
     * @methodOf vbet5.controller:classicMultiColumnCtrl
     * @description calculate optimal events for multi column view
     */
    function getMultiColumnEvents(markets, marketType, displayKey, displaySubKey, eventTypes, optimalMarkets) {
        var output = false, outputCache, price, currentPrice;
        function processMarket(market) {
            outputCache = {
                market: market
            };
            angular.forEach(market.event, function (event) {
                outputCache[event.type] = event;
            });
            if (eventTypes && outputCache[eventTypes[0]] && outputCache[eventTypes[1]]) {
                price = Math.abs(outputCache[eventTypes[0]].price - outputCache[eventTypes[1]].price);
                if (currentPrice === undefined || price < currentPrice) {
                    currentPrice = price;
                    output = outputCache;
                }
            } else {
                output = outputCache;
            }
        }
        var minimalMarket = null;
        var minOptimalMarkets = optimalMarkets && optimalMarkets.length && Math.min(optimalMarkets);
        angular.forEach(markets, function (market) {
            var mainOrder = market.main_order;
            if (!output && (!marketType || market.type === marketType) &&(!displayKey || market.display_key === displayKey) && (!displaySubKey || market.display_sub_key === displaySubKey)) {
                if (!optimalMarkets || !eventTypes) {
                    processMarket(market);
                } else if(optimalMarkets && mainOrder && (!minimalMarket || (mainOrder < minimalMarket.main_order && mainOrder >= minOptimalMarkets) )) {
                    minimalMarket = market;
                }
            }
        });

        if (minimalMarket) {
            processMarket(minimalMarket);
        }


        if (output && output.Home && output.Home.name === 'W1') {
            output.P1 = output.Home;
        }

        if (output && output.Away && output.Away.name === 'W2') {
            output.P2 = output.Away;
        }

        return output;
    }

    /**
     * @ngdoc method
     * @name updateGames
     * @methodOf vbet5.controller:classicMultiColumnCtrl
     * @description prepares additional data for multicolumn view
     */
    function updateGames() {
        $scope.multiColumn.viewData = [];
        $scope.multiColumn.prematchGamesEvents = false;
        $scope.multiColumn.selectedSport = '';

        if ($scope.multiColumn.liveSports && $scope.multiColumn.liveSports.length > 0) {

            Array.prototype.push.apply($scope.multiColumn.viewData, $scope.multiColumn.liveSports);
        }

        if ($scope.prematchGameViewData) {
            angular.forEach($scope.prematchGameViewData, function (sport) {
                var competitions = [];
                angular.forEach(sport.competitions, function (competition) {
                    var prematchGames = [];

                    angular.forEach(competition.gamesGroupedByDate, function (gamesGroupedByDate, date) {
                        angular.forEach(gamesGroupedByDate, function (game) {
                            $scope.multiColumn.selectedSport = $scope.multiColumn.selectedSport || game.sport.alias;
                            game.filteredEvents = {};
                            angular.forEach($scope.multiColumnMarketFilterTypes, function (filter, filterType) {
                                if ($scope.selectedSport && filter.useMarketTypeForSports && filter.useMarketTypeForSports[$scope.selectedSport.alias]) {
                                    filter = {
                                        marketType: 'P1XP2'
                                    };
                                }
                                var events = getMultiColumnEvents(game.market, filter.marketType, filter.key, filter.subKey, filter.eventTypes, filter.optimalMarkets, filter.remapTypes);
                                if (events) {
                                    $scope.multiColumn.prematchGamesEvents = $scope.multiColumn.prematchGamesEvents || {};
                                    $scope.multiColumn.prematchGamesEvents[filter.type || filterType] = true;
                                    if (filterType === 'P1XP2' &&  !$scope.multiColumn.prematchGamesEvents.hasXEvent && events.X) {
                                        $scope.multiColumn.prematchGamesEvents.hasXEvent = true;
                                    }
                                    game.filteredEvents[filter.type || filterType] = events;
                                }
                            });
                        });
                        prematchGames.push({
                            games: gamesGroupedByDate,
                            date: date
                        });
                    });
                    competitions.push({
                        competition: competition,
                        label: competition.name,
                        gameData: prematchGames
                    });
                });

                var viewDataItem = null;
                for(var i = $scope.multiColumn.viewData.length; i--;) {
                    var item = $scope.multiColumn.viewData[i];
                    if (item.sport.alias === sport.alias) {
                        viewDataItem = item;
                        break;
                    }
                }
                if (viewDataItem) {
                    Array.prototype.push.apply(viewDataItem.competitions, competitions);
                } else {
                    $scope.multiColumn.viewData.push({
                        sport: sport,
                        competitions: competitions
                    });
                }


            });
        }
    }

    /**
     * @ngdoc method
     * @name loadLiveGamesAndUpdateGames
     * @methodOf vbet5.controller:classicMultiColumnCtrl
     * @description  updates open game data object
     */
    function loadLiveGamesAndUpdateGames() {

        if (liveGamesSubId) {
            connectionService.unsubscribe(liveGamesSubId);
            liveGamesSubId = null;
        }


        if (!$scope.multiColumn.show || !$scope.selectedCompetition || !$scope.selectedCompetition.id || !$scope.selectedCompetition.sport) {
            $scope.multiColumn.liveSports = [];
            updateGames();
            return;
        }

        var requestMarketTypes = [];
        angular.forEach($scope.multiColumnMarketFilterTypes, function (filter, fType) {
            requestMarketTypes.push(fType);
        });
        $scope.multiColumn.liveGames = false;


        var request = {
            'source': 'betting',
            'what': {
                sport: ['id', 'name', 'alias'],
                competition: ['id', 'order', 'name'],
                region: ['id', 'name', 'alias'],
                game: ['id', 'start_ts', 'team1_name', 'team2_name', 'team1_external_id', 'team2_external_id', 'team1_id', 'team2_id', 'type', 'show_type', 'info', 'markets_count', 'extra', 'is_blocked', 'exclude_ids', 'is_stat_available', 'game_number', 'game_external_id', 'is_live'],
                event: ['id', 'price', 'type', 'name', 'order', 'base', 'price_change'],
                market: ['type', 'express_id', 'name', 'base', 'display_key', 'display_sub_key', 'main_order', 'home_score', 'away_score']
            },
            'where': {
                'competition': {'id': parseInt($scope.selectedCompetition.id, 10)},
                'game': {type: 1},
                'sport': {'id':parseInt($scope.selectedCompetition.sport.id, 10) }
            }
        };

        request.where.market = {'@or': [
                {'type': {'@in': requestMarketTypes}},
                {'display_key': {'@in': ['WINNER', 'HANDICAP', 'TOTALS']}}
            ]};
        if ($scope.selectedCompetition && $scope.selectedCompetition.sport && Config.main.multiColumnMarketFilterTypes.P1XP2 && Config.main.multiColumnMarketFilterTypes.P1XP2.useMarketTypeForSports && Config.main.multiColumnMarketFilterTypes.P1XP2.useMarketTypeForSports[$scope.selectedCompetition.sport.alias]) {
            request.where.market["@or"][1].display_key["@in"].shift();
        }

        connectionService.subscribe(
            request,
            updateLiveGames,
            {
                'thenCallback': function (result) {
                    if (result.subid) {
                        liveGamesSubId = result.subid;
                    }
                },
                'failureCallback': function () {

                }
            }
        );
    }

    /**
     * @ngdoc method
     * @name updateLiveGames
     * @methodOf vbet5.controller:classicMultiColumnCtrl
     * @description prepares additional data for multicolumn view
     */
    function updateLiveGames(response) {
        $scope.multiColumn.liveSports = false;
        $scope.multiColumn.liveGamesEvents = false;
        if (!$scope.selectedCompetition) {
            return;
        }
        var selectedSport = $scope.selectedCompetition.sport.alias;
        if (response && response.sport) {
            $scope.multiColumn.liveSports = [];

            angular.forEach(response.sport, function (sport) {
                var competitions = [];
                angular.forEach(sport.region, function (region) {
                    angular.forEach(region.competition, function (competition) {
                        var games = [];
                        angular.forEach(competition.game, function (game) {

                            game.sport = {id: sport.id, alias: sport.alias, name: sport.name};
                            game.region = {id: region.id, name: region.name, alias: region.alias};
                            game.competition = {id: competition.id, order: competition.order};

                            game.filteredEvents = {};
                            angular.forEach($scope.multiColumnMarketFilterTypes, function (filter, filterType) {
                                if (filter.useMarketTypeForSports && filter.useMarketTypeForSports[selectedSport]) {
                                    filter = {
                                        marketType: 'P1XP2'
                                    };
                                }
                                var events = getMultiColumnEvents(game.market, filter.marketType, filter.key, filter.subKey, filter.eventTypes, filter.optimalMarkets, filter.remapTypes);
                                if (events) {
                                    $scope.multiColumn.liveGamesEvents = $scope.multiColumn.liveGamesEvents || {};
                                    $scope.multiColumn.liveGamesEvents[filter.type || filterType] = true;
                                    if (filterType === 'P1XP2' &&  !$scope.multiColumn.liveGamesEvents.hasXEvent && events.X) {
                                        $scope.multiColumn.liveGamesEvents.hasXEvent = true;
                                    }
                                    game.filteredEvents[filter.type || filterType] = events;
                                }
                            });

                            games.push(game);
                        });

                        var liveData = {
                            games: games,
                            label: 'LIVE',
                            live: true
                        };
                        competitions.push({
                            gameData: [liveData],
                            competition: competition
                        });
                    });
                });
                $scope.multiColumn.liveSports.push({
                    competitions: competitions,
                    sport: sport
                });
            });

            updateGames();
        }
    }

    $scope.$on('multiColumn.games', function (event, action) {
        switch (action) {
            case 'update':
                $scope.multiColumn.liveSports = [];
                updateGames();
                break;
            case 'updateBoth':
                loadLiveGamesAndUpdateGames();
                break;
            case 'cleanState':
                $scope.multiColumn.viewData = [];
        }

    });

    /**
     * @ngdoc method
     * @name initMultiColumn
     * @methodOf vbet5.controller:classicMultiColumnCtrl
     * @description initialization
     */
    (function initMultiColumn() {
        if ($scope.multiColumn.toggled) {
            loadLiveGamesAndUpdateGames();
            $scope.multiColumn.toggled = false;
        }
    })();

}]);

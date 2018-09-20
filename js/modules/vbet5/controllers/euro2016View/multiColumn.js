/**
 * @ngdoc controller
 * @name vbet5.controller:euro2016multiColumnCtrl
 * @description
 * Classic mode view controller
 */
angular.module('vbet5.betting').controller('euro2016multiColumnCtrl', ['$scope', 'Config', 'ConnectionService', function ($scope, Config, ConnectionService) {
    'use strict';
    $scope.multiColumn = $scope.multiColumn || {show: Config.main.prematchMultiColumnEnabled ? (Storage.get('show_multi_column') !== undefined ? !!Storage.get('show_multi_column') : true) : false};
    
    $scope.multiColumnMarketFilterTypes = Config.main.GmsPlatform ? Config.main.multiColumnMarketFilterTypesGms : Config.main.multiColumnMarketFilterTypes;
    var connectionService = new ConnectionService($scope);
    var liveGamesSubId;
    /**
     * @ngdoc method
     * @name getMultiColumnEvents
     * @methodOf vbet5.controller:euro2016multiColumnCtrl
     * @description calculate optimal events for multi column view
     */
    function getMultiColumnEvents(markets, marketType, displayKey, displaySubKey, eventTypes, optimalMarkets) {
        var output = false, outputCache, price, currentPrice;
        angular.forEach(markets, function (market) {
            if (!output && (!marketType || market.type === marketType) &&(!displayKey || market.display_key === displayKey) && (!displaySubKey || market.display_sub_key === displaySubKey)) {
                if (!optimalMarkets || !eventTypes || (optimalMarkets && market.main_order && optimalMarkets.indexOf(market.main_order) !== -1)) {
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
            }
        });

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
     * @methodOf vbet5.controller:euro2016multiColumnCtrl
     * @description prepares additional data for multicolumn view
     */
    function updateGames() {
        $scope.multiColumn.viewData = [];
        $scope.multiColumn.prematchGamesEvents = false;
        $scope.multiColumn.selectedSport = '';

        if ($scope.multiColumn.liveGames && $scope.multiColumn.liveGames.length > 0) {

            var liveData = {
                games: $scope.multiColumn.liveGames,
                label: 'LIVE',
                live: true
            };

            $scope.multiColumn.viewData.push({
                gameData: [liveData]
            });
        }

        if ($scope.prematchGameViewData) {
            angular.forEach($scope.prematchGameViewData, function (competition) {
                var prematchGames = [];

                angular.forEach(competition.gamesGroupedByDate, function (gamesGroupedByDate, date) {
                    angular.forEach(gamesGroupedByDate, function (game) {
                        $scope.multiColumn.selectedSport = $scope.multiColumn.selectedSport || game.sport.alias;
                        game.filteredEvents = {};
                        angular.forEach($scope.multiColumnMarketFilterTypes, function (filter, filterType) {
                            var events = getMultiColumnEvents(game.market, filter.marketType, filter.key, filter.subKey, filter.eventTypes, filter.optimalMarkets, filter.remapTypes);
                            if (events) {
                                $scope.multiColumn.prematchGamesEvents = $scope.multiColumn.prematchGamesEvents || {};
                                $scope.multiColumn.prematchGamesEvents[filter.type || filterType] = true;
                                game.filteredEvents[filter.type || filterType] = events;
                            }
                        });
                    });
                    prematchGames.push({
                        games: gamesGroupedByDate,
                        date: date
                    });
                });

                $scope.multiColumn.viewData.push({
                    competition: competition,
                    label: competition.name,
                    gameData: prematchGames
                });

            });
        }
    }

    /**
     * @ngdoc method
     * @name loadLiveGames
     * @methodOf vbet5.controller:euro2016multiColumnCtrl
     * @description  updates open game data object
     */
    function loadLiveGames() {
        if (liveGamesSubId) {
            connectionService.unsubscribe(liveGamesSubId);
            liveGamesSubId = null;
        }

        if (!$scope.multiColumn.show || !$scope.selectedCompetition || !$scope.selectedCompetition.id) return;

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
                game: ['id', 'start_ts', 'team1_name', 'team2_name', 'team1_external_id', 'team2_external_id', 'team1_id', 'team2_id', 'type', 'show_type', 'info', 'events_count', 'markets_count', 'extra', 'is_blocked', 'exclude_ids', 'is_stat_available', 'game_number', 'game_external_id', 'is_live'],
                event: ['id', 'price', 'type', 'name', 'order', 'base', 'price_change'],
                market: ['type', 'express_id', 'name', 'base', 'display_key', 'display_sub_key', 'main_order', 'home_score', 'away_score']
            },
            'where': {
                'competition': {'id': parseInt($scope.selectedCompetition.id, 10)},
                'game': {type: 1}
            }
        };

        if (Config.main.GmsPlatform) {
            request.where.market = {'@or': [
                {'type': {'@in': requestMarketTypes}},
                {'display_key': {'@in': ['WINNER', 'HANDICAP', 'TOTALS']}}
            ]};
        } else {
            request.where.market = {'type': {'@in': requestMarketTypes}};
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
     * @methodOf vbet5.controller:euro2016multiColumnCtrl
     * @description prepares additional data for multicolumn view
     */
    function updateLiveGames(response) {
        $scope.multiColumn.liveGames = false;
        $scope.multiColumn.liveGamesEvents = false;

        if (response && response.sport) {
            $scope.multiColumn.liveGames = [];

            angular.forEach(response.sport, function (sport) {
                angular.forEach(sport.region, function (region) {
                    angular.forEach(region.competition, function (competition) {
                        angular.forEach(competition.game, function (game) {

                            game.sport = {id: sport.id, alias: sport.alias, name: sport.name};
                            game.region = {id: region.id, name: region.name, alias: region.alias};
                            game.competition = {id: competition.id, order: competition.order};

                            game.filteredEvents = {};
                            angular.forEach($scope.multiColumnMarketFilterTypes, function (filter, filterType) {
                                var events = getMultiColumnEvents(game.market, filter.marketType, filter.key, filter.subKey, filter.eventTypes, filter.optimalMarkets, filter.remapTypes);
                                if (events) {
                                    $scope.multiColumn.liveGamesEvents = $scope.multiColumn.liveGamesEvents || {};
                                    $scope.multiColumn.liveGamesEvents[filter.type || filterType] = true;
                                    game.filteredEvents[filter.type || filterType] = events;
                                }
                            });

                            $scope.multiColumn.liveGames.push(game);
                        });
                    });
                });
            });

            updateGames();
        }
    }

    $scope.$on('multiColumn.games', function (event, action) {
        switch (action) {
            case 'loadLive':
                loadLiveGames();
                break;
            case 'update':
                updateGames();
                break;
        }
        
    });

    /**
     * @ngdoc method
     * @name initMultiColumn
     * @methodOf vbet5.controller:euro2016multiColumnCtrl
     * @description initialization
     */
    (function initMultiColumn() {
        loadLiveGames();
        updateGames();
    })();
}]);
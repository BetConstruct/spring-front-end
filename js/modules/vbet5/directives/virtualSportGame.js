/* global VBET5 */
/**
 * @ngdoc directive
 * @name vbet5.directive:virtualSportGame
 *
 * @description virtual sport game markets
 *
 */
VBET5.directive('virtualSportGame', ['$filter', '$location', '$rootScope', 'Utils', 'Config', 'ConnectionService', 'GameInfo', 'Storage', 'analytics', 'Translator', function ($filter, $location, $rootScope, Utils, Config, ConnectionService, GameInfo, Storage, analytics, Translator) {
    'use strict';
    return {
        restrict: 'E',
        replace: false,
        templateUrl: 'templates/directive/virtual-sport-game.html',
        scope: {
            gameId: '=',
            sportId: '=',
            constants: '=',
            nonRaceSports: '='
        },
        link: function ($scope) {
            $scope.favoriteMarketTypes = Storage.get('vs_favorite_market_types') || {};

            var connectionService = new ConnectionService($scope);
            $scope.gameIsLoading = true;
            $scope.selectedGroup = {
                id: undefined
            };
            $scope.collapsedMarkets = {};
            $scope.collapsedMarkets[$scope.sportId] = {};
            $scope.selectedVirtualSport = {};
            $scope.selectedVirtualSport.id = $scope.sportId;
            $scope.isEventInBetSlip = GameInfo.isEventInBetSlip;


            /**
             * @ngdoc method
             * @name toggleMarket
             * @methodOf vbet5.directive:virtualSportGame
             * @description expanding/collapsing markets
             * @param {String} type the market's market_type
             */

            $scope.toggleMarket = function toggleMarket(type) {
                $scope.collapsedMarkets[$scope.sportId] = $scope.collapsedMarkets[$scope.sportId] || {};
                if ($scope.collapsedMarkets[$scope.sportId][type]) {
                    delete $scope.collapsedMarkets[$scope.sportId][type];
                } else {
                    $scope.collapsedMarkets[$scope.sportId][type] = true;
                }
            };

            /**
             * @ngdoc method
             * @name addToFavouriteMarkets
             * @methodOf vbet5.directive:virtualSportGame
             * @description Adds market to favorites list for sport
             * @param {Object} market array of market(s) of same type
             */

            $scope.addToFavouriteMarkets = function addToFavouriteMarkets(market) {
                if (!market) { return; }
                var analyticsText = "";
                $scope.favoriteMarketTypes[$scope.sportId] = $scope.favoriteMarketTypes[$scope.sportId] || [];
                var index = $scope.favoriteMarketTypes[$scope.sportId].indexOf(market.type);
                if (index !== -1) {
                    analyticsText = "removeFromVSFavouriteMarkets";
                    $scope.favoriteMarketTypes[$scope.sportId].splice(index, 1);
                    market.isFavorite = false;
                    $scope.constants.MARKET_GROUP_FAVORITE.count--;
                    !$scope.constants.MARKET_GROUP_FAVORITE.count && $scope.selectedGroup.id === -3 && ($scope.selectedGroup.id = $scope.gameToShow.availableMarketGroups[1].id);
                } else {
                    analyticsText = "addToVSFavouriteMarkets";
                    $scope.favoriteMarketTypes[$scope.sportId].push(market.type);
                    market.isFavorite = true;
                    $scope.constants.MARKET_GROUP_FAVORITE.count++;
                }

                Storage.set("vs_favorite_market_types", $scope.favoriteMarketTypes);
                analytics.gaSend('send', 'event', 'explorer', analyticsText + (Config.main.sportsLayout),  {'page': $location.path(), 'eventLabel': analyticsText});
            };


            /**
             * @ngdoc method
             * @name bet
             * @methodOf vbet5.directive:virtualSportGame
             * @description  sends a message to betslip to add a bet
             *
             * @param {Object} event event object
             * @param {Object} market event's market object
             * @param {Object} openGame game object
             * @param {String} [oddType] odd type (odd or sp)
             */
            $scope.bet = function bet(event, market, openGame, oddType) {
                oddType = oddType || 'odd';
                var game = Utils.clone(openGame);
                $rootScope.$broadcast('bet', {event: event, market: market, game: game, oddType: oddType});
            };

            /**
             * @ngdoc method
             * @name initFavouriteMarkets
             * @methodOf vbet5.directive:virtualSportGame
             * @description calculates favorite markets and count
             * @param {Object} game current open game object
             */
            function initFavouriteMarkets(markets) {

                var count = 0;

                for (var i = markets.length; i--;) {
                    var market = markets[i][0];
                    if ($scope.favoriteMarketTypes[$scope.sportId] && $scope.favoriteMarketTypes[$scope.sportId].indexOf(market.type) !== -1) {
                        market.isFavorite = true;
                        count++;
                    }
                }

                $scope.constants.MARKET_GROUP_FAVORITE.count = count;
            }
            function prepareMarket(market) {
                market.events = Utils.objectToArray(market.event);
                if (market.events) {
                    if ($scope.constants.marketsPreDividedByColumns.indexOf(market.type) > -1) {
                        GameInfo.reorderMarketEvents(market, 'preDivided');
                    } else {market.events.sort(Utils.orderSorting);
                        market.named_events = Utils.groupByItemProperty(market.events, 'type');}
                }
                angular.forEach(market.events, function (event) {
                    event.name = $filter('improveName')(event.name, $scope.gameToShow);
                    event.name = $filter('removeParts')(event.name, [market.name]);
                });
            }

            function updateOpenGameData(data) {
                var selectedGame = null;
                angular.forEach(data.sport, function (sport) {
                    angular.forEach(sport.region, function (region) {
                        angular.forEach(region.competition, function (competition) {
                            angular.forEach(competition.game, function (game) {
                                game.sport = {id: sport.id, alias: sport.alias};
                                game.region = {id: region.id};
                                game.competition = {id: competition.id, name: competition.name};
                                game.additionalGameInfo = Translator.get(game.team2_name ? '№ {1} / {2} vs {3}' : '№ {1} / {2}', [game.game_number, game.team1_name, game.team2_name]);
                                selectedGame = game;
                            });
                        });
                    });
                });
                $scope.gameToShow = selectedGame;

                if (!selectedGame) {
                    return;
                }

                if (selectedGame.market) {
                    var groupedMarkets;
                    groupedMarkets = Utils.objectToArray(Utils.groupByItemProperties(selectedGame.market, ['name']));
                    $scope.vSMarketsSecondPack = [];
                    $scope.vSMarketsFirstPack = [];


                    if (groupedMarkets && groupedMarkets.length) {
                        var market;
                        var availableMarketGroups = {}, selectedGroupId = 0;
                        for (var i = groupedMarkets.length; i--;) {
                            for (var j = groupedMarkets[i].length; j--;) {
                                market = groupedMarkets[i][j];
                                market.express_id = Utils.calculateExpressId(market, $scope.gameToShow.type);

                                prepareMarket(market);

                                if (!market.group_id) {
                                    market.group_id = $scope.constants.MARKET_GROUP_OTHER.id;
                                    market.group_name = $scope.constants.MARKET_GROUP_OTHER.name;
                                }

                                if (availableMarketGroups[market.group_id]) {
                                    availableMarketGroups[market.group_id].count++;
                                } else {
                                    availableMarketGroups[market.group_id] = {
                                        name: market.group_name,
                                        id: market.group_id,
                                        count: 1
                                    };
                                }

                                $scope.selectedGroup.id && market.group_id === $scope.selectedGroup.id && (selectedGroupId = market.group_id);
                            }
                        }
                        availableMarketGroups = Utils.objectToArray(availableMarketGroups);
                        var additionalGroups = [$scope.constants.MARKET_GROUP_FAVORITE, $scope.constants.MARKET_GROUP_ALL];

                        $scope.gameToShow.availableMarketGroups = (availableMarketGroups.length > 1 || (availableMarketGroups.length === 1 && availableMarketGroups[0].id !== $scope.constants.MARKET_GROUP_OTHER.id)) ? additionalGroups.concat(availableMarketGroups) : additionalGroups;
                        initFavouriteMarkets(groupedMarkets);

                        if ($scope.selectedGroup.id !== $scope.constants.MARKET_GROUP_FAVORITE.id || !$scope.constants.MARKET_GROUP_FAVORITE.count) {
                            $scope.selectedGroup.id = selectedGroupId || $scope.gameToShow.availableMarketGroups[1].id;
                        }
                        Utils.sortMarketGroupsWithNestedEvents(groupedMarkets);

                        $scope.vSMarketsSecondPack = groupedMarkets.splice(Math.ceil(groupedMarkets.length / 2));
                        $scope.vSMarketsFirstPack = groupedMarkets;

                    }
                }

                $scope.gameToShow.isVirtual = true;
                $scope.gameToShow.displayTitle = $scope.gameToShow.text_info;
            }
            var request = {
                    'source': 'betting',
                    'what': {
                        sport: ['id', 'alias'],
                        competition: ['id', 'name'],
                        region: ['id'],
                        game: [["id", "markets_count", "start_ts", "is_live", "is_blocked", "game_number","team1_name", "team2_name", "type" ]],
                        market: ["id", "col_count", "type", "sequence", "express_id", "cashout", "display_key", "display_sub_key", "group_id", "name", "group_name", "order" ],
                        event: ["order", "id", "type_1", "type", "type_id", "original_order", "name", "price", "base", "home_value", "away_value", "display_column"]
                    },
                    'where': {'game': {'id': $scope.gameId}}
            };
            Utils.addPrematchExpressId(request);

            connectionService.subscribe(
                request,
                updateOpenGameData,
                {
                    'thenCallback': function () {
                        $scope.gameIsLoading = false;
                    },
                    'failureCallback': function () {
                        $scope.gameIsLoading = false;
                    }
                }
            );
            /**
             * @ngdoc method
             * @name switchMarketsColumnView
             * @methodOf vbet5.controller:virtualSportsCtrl
             * @description switch virtual sport column view(1 or 2 column)
             */
            $scope.marketIsOneColumn = Storage.get('markets_in_one_column') === undefined
                ? !!Config.main.marketsInOneColumn
                : Storage.get('markets_in_one_column');

            $scope.switchMarketsColumnView = function () {
                $scope.marketIsOneColumn = !$scope.marketIsOneColumn;
                Storage.set('markets_in_one_column', $scope.marketIsOneColumn);
            };

        }

    };
}]);

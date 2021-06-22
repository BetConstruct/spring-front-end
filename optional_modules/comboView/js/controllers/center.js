VBET5.controller('comboViewCenterController', ['$rootScope', '$scope', 'OddService', 'ConnectionService', 'StreamService', 'Config', '$filter', 'Utils', 'GameInfo', 'Moment', function ($rootScope, $scope, OddService, ConnectionService, StreamService, Config, $filter, Utils, GameInfo, Moment) {
    'use strict';

    var connectionService = new ConnectionService($scope);
    var streamService = new StreamService($scope);
    var connectionSubIds = {};
    var parentMainScope = $scope.$parent.$parent.$parent;
    var expandedRegionSubIds = {};
    var updateCentralLiveView = updateCentralViewFactory('centerViewLiveData');
    var updateCentralPrematchView = updateCentralViewFactory('centerViewPrematchData');
    var updateCentralLiveViewWithExpandedRegion = updateCentralViewWithExpandedRegionFactory('centerViewLiveData');
    var updateCentralPrematchViewWithExpandedRegion = updateCentralViewWithExpandedRegionFactory('centerViewPrematchData');
    var updateCentralPrematchViewWithExpandedRegionForLiveToday = updateCentralViewWithExpandedRegionFactory('centerViewPrematchData', updateLinkedGames);

    $scope.displayBase = GameInfo.displayBase;
    $scope.isEventInBetSlip = GameInfo.isEventInBetSlip;

    (function initScope () {
        $scope.visibleSetsNumber = 5;

        $scope.selectedMarketForLiveCompetition = {};
        $scope.selectedMarketForPrematchCompetition = {};


        $scope.odds = OddService.data;
        $scope.setOddSwitcherValue = OddService.setOddSwitcherValue;
        $scope.oddSwitcherValue = OddService.getOddSwitcherInitialValue();
        $scope.setOddSwitcherValue($scope.oddSwitcherValue, true);

        $scope.competitionLiveFilters = {};
        $scope.competitionPrematchFilters = {};
    })();

    function isSelectedCentralViewTogglable () {
        return ['sport', 'liveToday', 'popularEvents'].indexOf(parentMainScope.selectedCentralView) !== -1;
    }

    $scope.isSelectedCentralViewTogglable = isSelectedCentralViewTogglable;

    function updateCentralViewFactory (source) {
        return function updateCentralView(data, subId) {
            $scope.centerViewLoading = false;
            if (subId) {
                connectionSubIds[subId] = subId;
            }

            processCenterViewData(data, subId, function (sport) {
                if ($scope[source].length) {
                    var existingSportKey = -1;
                    angular.forEach($scope[source], function (templateSport, key) {
                        if (templateSport.id == sport.id) {
                            existingSportKey = key;

                        }
                    });

                    if (existingSportKey >= 0) {
                        $scope[source][existingSportKey] = sport;
                    } else {
                        $scope[source].push(sport);
                    }
                } else {
                    $scope[source].push(sport);
                }

            });

            if (isSelectedCentralViewTogglable()) {
                if (!subId || !$scope[source].length) {
                    return;
                }

                var region = angular.extend(
                    {},
                    {
                        type: source == 'centerViewLiveData' ? 1 : 0,
                        isClosed: false,
                        'region': $scope[source][0].region[$scope[source][0].regions[0].id].id,
                        'sport': { id: $scope[source][0].id, alias: $scope[source][0].alias }
                    }
                );

                $scope.toggleItem(region);
            }
        }
    }

    function updateLinkedGames (sport) {
        angular.forEach(sport.region, function (region) {
            if (!region || !region.exclude_ids.length) {
                return;
            }

            var where = {
                type: 1,
                game: {'@in': region.exclude_ids}
            };

            var request = generateRequest(where);

            $scope.pointerGames = $scope.pointerGames ? $scope.pointerGames : {};
            $scope.pointerGamesCompetition = $scope.pointerGamesCompetition ? $scope.pointerGamesCompetition : {};

            connectionService.subscribe(request, function (data, subId) {
                if (subId) {
                    connectionSubIds[subId] = subId;
                }
                $scope.pointerGames[region.id] = [];
                $scope.pointerGamesCompetition[region.id] = [];
                processCenterViewData(data, subId, function (sport) {},  function (game, competition) {
                    $scope.pointerGamesCompetition[region.id][game.id] = competition;
                    $scope.pointerGames[region.id][game.id] = game;
                });

            });
        });
    }

    function updateCentralViewWithExpandedRegionFactory (source, callback) {

        return function updateCentralViewWithExpandedRegion(data, subId) {
            if (subId && data.sport) {
                var sportKeys = Object.keys(data.sport);
                if (sportKeys.length) {
                    var regionKeys = Object.keys(data.sport[sportKeys[0]].region);
                    expandedRegionSubIds[data.sport[sportKeys[0]].region[regionKeys[0]].id] = subId;
                }
            }
            $scope.pointerIds = $scope.pointerIds || {};

            processCenterViewData(data, subId, function (sport) {
                angular.forEach($scope[source], function (templateSport) {
                    if (templateSport.id !== sport.id) {
                        return;
                    }

                    angular.forEach(templateSport.region, function (region, key) {
                        if (sport.region[sport.regions[0].id].id == region.id) {
                            // replace (initially loaded) light region info with fully loaded data
                            sport.region[sport.regions[0].id].isLoading = false;

                            var mergedRegion = angular.extend({}, region, sport.region[sport.regions[0].id]);
                            angular.forEach(mergedRegion, function (mergedRegionValue, mergedRegionKey) {
                                templateSport.region[key][mergedRegionKey] = mergedRegionValue;
                            });
                         }
                    });
                });

                callback && callback(sport);

                $scope.centerViewLoading = false;
            });
        }
    }

    function processCenterViewData (data, subId, sportCallback, gameCallback) {
        var sportCount = 0;

        angular.forEach(data.sport, function (sport) {
            sport.regions = Utils.objectToArray(sport.region, false, ['id', 'order']);
            sport.regions.sort(Utils.orderSorting);

            angular.forEach(sport.region, function (region) {
                // by default all regions are closed
                // (see below this loop, when we're opening first region)
                if (subId) {
                    region.regionListClosed = true;
                }

                region.isLoading = false;

                if (region.competition) {
                    region.competitions = Utils.objectToArray(region.competition, false, ['id', 'order']);
                    region.competitions.sort(Utils.orderSorting);
                }

                region.exclude_ids = [];

                angular.forEach(region.competition, function (competition) {
                    angular.forEach(competition.game, function (game) {
                        competition.filteredMarkets = [];

                        game.sport = {id: sport.id, alias: sport.alias, name: sport.name};
                        game.region = {id: region.id, name: region.name};
                        game.competition = {id: competition.id, order: competition.order, name: competition.name};
                        game.firstMarket = $filter('firstElement')(game.market);
                        game.additionalEvents = game.markets_count;

                        game.filteredMarkets = Utils.groupByItemProperty(game.market, 'type');
                        angular.forEach(game.filteredMarkets, function (marketGroup, id) {
                            competition.filteredMarkets.push(marketGroup[0]);

                            if (marketGroup.length > 1 && marketGroup[0].base) {
                                angular.forEach(marketGroup, function (market) {
                                    if (!market.col_count) {
                                        market.col_count = Object.keys(market.event).length;
                                    }

                                    if (market.base === Utils.getDefaultSelectedMarketBase(marketGroup)) {
                                        marketGroup.events = Utils.objectToArray(market.event);
                                    }
                                });
                            } else {
                                marketGroup.events = Utils.objectToArray(marketGroup[0].event);

                                angular.forEach(marketGroup, function (market) {
                                    if (!market.col_count) {
                                        market.col_count = Object.keys(market.event).length;
                                    }
                                });
                            }

                            marketGroup.events.sort(Utils.orderSorting);

                            if (marketGroup.events.length === 2) {
                                marketGroup.events.splice(1, 0, {});
                            }

                            angular.forEach(marketGroup.events, function (event, index) {
                                if (!event.name) {
                                    // remove events without name from filtered markets
                                    marketGroup.events.splice(index, 1);
                                    return;
                                }

                                event.name = $filter('improveName')(event.name, game);
                            });
                        });

                        competition.filteredMarkets.sort(Utils.orderSorting);

                        gameCallback && gameCallback(game, competition);

                        if (game.exclude_ids) {
                            region.exclude_ids.push(game.exclude_ids);
                        }
                    });

                    competition.games = Utils.twoParamsSorting(Utils.objectToArray(competition.game, false, ['id', 'start_ts']), ['start_ts', 'id']);

                    var competitionTotalMarketCount = Object.keys(competition.filteredMarkets).length;
                    competition.filteredMarketsCount = competitionTotalMarketCount;
                    competition.moreFilteredMarketsCount = competitionTotalMarketCount > 3 ? competitionTotalMarketCount - 3 : 0;
                });
            });

            sportCount++;

            if (sportCount === 1) {
                // mark first region as open
                if (subId) {
                    sport.region[sport.regions[0].id].regionListClosed = false;
                }

                if (isSelectedCentralViewTogglable()) {
                    sport.region[sport.regions[0].id].isLoading = true;
                }
            }

            sportCallback(sport);
        });
    }

    function generateRequest (where, whatFields) {
        var request = {
            'source': 'betting',
            'what': {
                'sport': ['id', 'name', 'alias'],
                'region': ['id', 'name', 'order'],
                'competition': ['id', 'name', 'order'],
                'game': [
                    'id', 'start_ts', 'team1_name', 'team2_name',
                    'team1_external_id', 'team2_external_id', 'type', 'info',
                    'markets_count', 'extra', 'is_blocked',
                    'exclude_ids', 'is_stat_available', 'game_number', 'game_external_id', 'is_live', 'show_type'
                ],
                'event': ['id', 'price', 'type', 'name', 'order', 'base'],
                'market': ['type', 'express_id', 'name', 'base', 'order', 'id']
            },
            'where': {
                'game': {}
            }
        };
        Utils.addPrematchExpressId(request);


        if (whatFields && !whatFields['competition']) {
            delete request['what']['competition'];
        }

        if (whatFields && !whatFields['game']) {
            delete request['what']['game'];
        }

        if (whatFields && !whatFields['event']) {
            delete request['what']['event'];
        }

        if (whatFields && !whatFields['market']) {
            delete request['what']['market'];
        }

        if (where.sport) {
            request.where['sport'] = {'id': where.sport.id};
        } else {
            Utils.setCustomSportAliasesFilter(request);
        }

        if (where.region) {
            request.where['region'] = {'id': where.region};
        }

        if (where.competition) {
            request.where['competition'] = {'id': where.competition};
        }

        if (where.game) {
            request.where['game'].id = where.game;
        }

        if (where.type !== undefined) {
            if (where.game === undefined) {
                request.where.game = {'type': where.type};
            } else {
                request.where.game.type = where.type;
            }
        }

        if (where.start_ts) {
            request.where.game["@or"] = [];
            request.where.game["@or"].push({start_ts: where.start_ts});
        }

        if (where.popularGames) {
            request.where[Config.main.loadPopularGamesForSportsBook.level] = {};
            request.where[Config.main.loadPopularGamesForSportsBook.level][Config.main.loadPopularGamesForSportsBook.type] = true;
        }

        if ($scope.selectedUpcomingPeriod) {
            request.where.game.start_ts = {'@now': {'@gte': 0, '@lt': $scope.selectedUpcomingPeriod * 3600}};
        } else if (Config.env.gameTimeFilter) {
            request.where.game.start_ts = Config.env.gameTimeFilter;
        }

        return request;
    }

    function stopRegionLoading(toggledItem) {
        var centerViewData = $scope[toggledItem.type == 1 ? 'centerViewLiveData' : 'centerViewPrematchData'];

        if (!centerViewData) {
            return;
        }

        for (var j = 0; j < centerViewData.length; j++) {
            if (centerViewData[j].id === toggledItem.sport) {
                centerViewData[j].region[toggledItem.region].isLoading = false;

                break;
            }
        }
    }

    var setMarketFactory = function setMarketFactory (type) {
        return function (market, competitionId) {
            $scope['selectedMarketFor' + type + 'Competition'][competitionId] = market;
        };
    };

    $scope.setLiveMarket = setMarketFactory('Live');
    $scope.setPrematchMarket = setMarketFactory('Prematch');

    var getMarketFactory = function getMarketFactory (type) {
        return function (competition) {
            var marketToReturn = $scope['selectedMarketFor' + type + 'Competition'][competition.id];

            if (!marketToReturn && competition.filteredMarketsCount) {
                var selectedItem = Utils.getItemBySubItemProperty(competition.filteredMarkets, 'type', ['P1XP2']) || Utils.getItemBySubItemProperty(competition.filteredMarkets, 'type', ['P1P2']);
                if (selectedItem) {
                    return selectedItem.P1XP2 || selectedItem.P1P2;
                } else {
                    return competition.filteredMarkets[0];
                }

            }

            return marketToReturn;
        }
    };

    $scope.getLiveMarket = getMarketFactory('Live');
    $scope.getPrematchMarket = getMarketFactory('Prematch');

    $scope.openGameView = function openGameView (game) {
        parentMainScope.selectedCentralView = 'gameView';
        $scope.liveGameLoading = true;
        var gameRequest = [["id", "show_type", "markets_count", "start_ts", "is_live", "is_blocked", "is_neutral_venue","team1_id", "team2_id", "game_number", "text_info", "is_stat_available", "type",  "info", "stats", "team1_name", "team2_name", "tv_info"]];
        if (game.type === 1) {
            Array.prototype.push.apply(gameRequest[0], ["match_length", "scout_provider", "video_id","video_id2", "video_id3", "tv_type", "last_event", "live_events"]);
        }

        // -1) init
        game.opened = true;
        var competition = game.competition;
        var region = game.region;
        var sport = game.sport;
        var request = {
            'source': 'betting',
            'what': {
                'game':gameRequest,
                'market': ["id", "col_count", "type", "sequence", "express_id", "cashout", "display_key", "display_sub_key", "group_id", "name", "group_name", "order" ],
                'event': ["order", "id", "type_1", "type", "type_id", "original_order", "name", "price", "base", "home_value", "away_value", "display_column"]
            },
            'where': {'game': {'id': game.id}}
        };
        /*Utils.setCustomSportAliasesFilter(request);*/
        Utils.addPrematchExpressId(request);

        // 0) update breadcrumb
        $scope.updatePathInComboView(sport, region, competition, game);

        // 1) clean up previous subscriptions
        connectionService.unsubscribe(connectionSubIds);
        connectionService.unsubscribe(expandedRegionSubIds);

        // 2) add game view data to scope, so that bet() can receive then from template
        $scope.game = game;
        $scope.competition = competition;
        $scope.region = region;
        $scope.sport = sport;

        // 3) request full game details
        connectionService.subscribe(
            request,
            function updateCentralGameView(response, subId) {
                if (Utils.isObjectEmpty(response.game)) {
                    $scope.openGame = {};
                    parentMainScope.$broadcast('comboView.leftMenu.liveTodaySelected');
                    return;
                }

                if (subId) {
                    connectionSubIds[subId] = subId;
                }

                response.game[game.id].availableMarketGroups = {};
                response.game[game.id].sport = {id: sport.id, alias: sport.alias, name: sport.name};
                response.game[game.id].region = {id: region.id, name: region.name};
                response.game[game.id].competition = {id: competition.id, name: competition.name};

                $scope.openGame = response.game[game.id];
                $scope.openGame.setsOffset = $scope.openGame.setsOffset || 0;

                // if teams shirt colors equal we change them to default colors
                if ($scope.openGame.info && $scope.openGame.info.shirt1_color === $scope.openGame.info.shirt2_color) {
                    $scope.openGame.info.shirt1_color = "ccc";
                    $scope.openGame.info.shirt2_color = "f00";
                }

                if ($scope.openGame.type === 1) {
                    GameInfo.updateGameStatistics($scope.openGame);
                    GameInfo.extendLiveGame($scope.openGame);

                    if ($scope.openGame.sport.alias === "Soccer") {
                        GameInfo.generateTimeLineEvents($scope.openGame, $scope);
                        GameInfo.addOrderingDataToSoccerGameEvents($scope.openGame);
                    }
                }

                if ($scope.openGame.sport.alias === "HorseRacing") {
                    GameInfo.getRacingInfo($scope.openGame.info, $scope.openGame.market, "Winner");
                }
                streamService.monitoring($scope, 'openGame', 'null', 'enlargedGame');

                // move to GameInfo service and pass $scope.openGame
                GameInfo.updateOpenGameTextInfo($scope.openGame);

                $scope.$emit('animation.video.available', $scope.openGame);

                if ($scope.openGame) {
                    $scope.openGame.markets = Utils.objectToArray(Utils.groupByItemProperties($scope.openGame.market, ['type', 'name']));

                    if ($scope.openGame.markets) {
                        $scope.openGame.markets.sort(function (a, b) {
                            return a[0].order - b[0].order;
                        });
                        angular.forEach($scope.openGame.markets, function (groupedMarkets) {
                            groupedMarkets.sort(Utils.orderSorting);
                            groupedMarkets[0].name = $filter('improveName')(groupedMarkets[0].name, $scope.openGame);
                            // Uncomment next line and add BetService as a dependency if necessary - https://betconstruct.atlassian.net/browse/SDC-39502
                            // groupedMarkets[0].eachWayTerms = BetService.getEachWayTerms(groupedMarkets[0]);
                            if (groupedMarkets[0].type) {
                                groupedMarkets[0].fullType = (groupedMarkets[0].type || '') + (groupedMarkets[0].period || '');
                            }
                        });
                    }
                }
                $scope.liveGameLoading = false;
            }
        );
    };

    $scope.changeStatsMode = function changeStatsMode(mode) {
        $scope.flipMode = mode;
    };

    $scope.toggleItem = function toggleItem(item) {
        if (!isSelectedCentralViewTogglable()) {
            stopRegionLoading(item);

            return;
        }

        if (!item.isClosed) {
            var where = angular.copy(item);
            where.region = item.region;

            if (parentMainScope.selectedCentralView === 'popularEvents') {
                where.popularGames = true;
            }

            if (parentMainScope.selectedCentralView === 'liveToday') {
                where.type = 2;
                where.start_ts = {
                    '@gte': Moment.get().add(0, 'days').startOf("day").unix(),
                    '@lt': Moment.get().add(0, 'days').endOf("day").unix()
                };
            }

            var request = generateRequest(where);

            if (parentMainScope.selectedCentralView === 'liveToday') {
                connectionService.subscribe(request, updateCentralPrematchViewWithExpandedRegionForLiveToday);
            } else if (item.type == 1) {
                connectionService.subscribe(request, updateCentralLiveViewWithExpandedRegion);
            } else {
                connectionService.subscribe(request, updateCentralPrematchViewWithExpandedRegion);
            }
        } else {
            stopRegionLoading(item);

            if (!expandedRegionSubIds[item.region]) {
                return;
            }

            connectionService.unsubscribe(expandedRegionSubIds[item.region]);
            delete expandedRegionSubIds[item.region];
        }
    };

    var parentGameSelected = parentMainScope.$on('comboView.leftMenu.gameSelected', function (event, game) {
        if (game.opened && parentMainScope.selectedCentralView == 'gameView' && $scope.selectedGame && $scope.selectedGame.id == game.id && !game.force) {
            return;
        }

        $scope['centerViewLiveData'] = [];
        $scope['centerViewPrematchData'] = [];

        $scope.openGameView(game);
    });

    var parentCompetitionSelected = parentMainScope.$on('comboView.leftMenu.competitionSelected', function (event, response) {
        var competition = response.competition;

        if (competition.opened && parentMainScope.selectedCentralView == 'competition' && $scope.selectedCompetition && $scope.selectedCompetition.id == competition.id && !response.force) {
            return;
        }

        $scope['centerViewLiveData'] = [];
        $scope['centerViewPrematchData'] = [];

        connectionService.unsubscribe(connectionSubIds);
        connectionService.unsubscribe(expandedRegionSubIds);

        $scope.hideLiveEvents = false;
        var requestLive = generateRequest({'competition': competition.id, type: 1});
        var requestPrematch = generateRequest({'competition': competition.id, type: 0});

        parentMainScope.selectedCentralView = 'competition';
        $scope.mainHeaderTitle = competition.name;

        $scope.centerViewLoading = true;
        connectionService.subscribe(requestLive, updateCentralLiveView, null, true);
        connectionService.subscribe(requestPrematch, updateCentralPrematchView, null, true);

        $scope.updatePathInComboView(response.sport, response.region, competition);
    });

    var parentRegionSelected = parentMainScope.$on('comboView.leftMenu.regionSelected', function (event, response) {
        var region = response.region;

        if (region.opened && parentMainScope.selectedCentralView === 'region' && $scope.selectedRegion && $scope.selectedRegion.id == region.id && !response.force) {
            return;
        }

        $scope['centerViewLiveData'] = [];
        $scope['centerViewPrematchData'] = [];

        $scope.centerViewLoading = true;
        connectionService.unsubscribe(connectionSubIds);
        connectionService.unsubscribe(expandedRegionSubIds);

        $scope.hideLiveEvents = false;
        var requestLive = generateRequest({'region': region.id, type: 1});
        var requestPrematch = generateRequest({'region': region.id, type: 0});

        parentMainScope.selectedCentralView = 'region';
        $scope.mainHeaderTitle = region.name;

        connectionService.subscribe(requestLive, updateCentralLiveView, null, true);
        connectionService.subscribe(requestPrematch, updateCentralPrematchView, null, true);

        $scope.updatePathInComboView(response.sport, region);
    });

    var parentSportSelected = parentMainScope.$on('comboView.leftMenu.sportSelected', function (event, response) {
        var sport = response.sport;

        if (sport.opened && parentMainScope.selectedCentralView === 'sport' && $scope.selectedSport && $scope.selectedSport.id === sport.id && !response.force) {
            return;
        }

        $scope['centerViewLiveData'] = [];
        $scope['centerViewPrematchData'] = [];

        $scope.centerViewLoading = true;
        connectionService.unsubscribe(connectionSubIds);
        connectionService.unsubscribe(expandedRegionSubIds);

        $scope.hideLiveEvents = false;

        var requestLive = generateRequest({'sport': {id: sport.id, alias: sport.alias}, type: 1}, ['sport', 'region']);
        var requestPrematch = generateRequest({'sport': {id: sport.id, alias: sport.alias}, type: 0}, ['sport', 'region']);

        parentMainScope.selectedCentralView = 'sport';
        $scope.mainHeaderTitle = sport.name;

        connectionService.subscribe(requestLive, updateCentralLiveView, null, true);
        connectionService.subscribe(requestPrematch, updateCentralPrematchView, null, true);

        $scope.updatePathInComboView(sport);
    });

    var parentLiveTodaySelected = parentMainScope.$on('comboView.leftMenu.liveTodaySelected', function (event, data) {
        var force = data && data.force;
        if (parentMainScope.selectedCentralView === 'liveToday' && !force) {
            return;
        }

        $scope['centerViewLiveData'] = [];
        $scope['centerViewPrematchData'] = [];

        $scope.centerViewLoading = true;
        connectionService.unsubscribe(connectionSubIds);
        connectionService.unsubscribe(expandedRegionSubIds);

        $scope.hideLiveEvents = true;

        var where = {
            type: 2,
            start_ts: {
                '@gte': Moment.get().add(0, 'days').startOf("day").unix(),
                '@lt': Moment.get().add(0, 'days').endOf("day").unix()

            }
        };

        var request = generateRequest(where, ['sport', 'region']);

        parentMainScope.selectedCentralView = 'liveToday';
        $scope.mainHeaderTitle = 'LIVE TODAY';

        connectionService.subscribe(request, updateCentralPrematchView);

        $scope.updatePathInComboView({name: 'Live Today'});
    });

    var parentPopularEventSelected = parentMainScope.$on('comboView.leftMenu.popularEventsSelected', function (event, data) {
        var force = data && data.force;
        if (parentMainScope.selectedCentralView === 'popularEvents' && !force) {
            return;
        }

        $scope['centerViewLiveData'] = [];
        $scope['centerViewPrematchData'] = [];

        connectionService.unsubscribe(connectionSubIds);
        connectionService.unsubscribe(expandedRegionSubIds);

        $scope.hideLiveEvents = true;

        var where = {popularGames: true};
        var request = generateRequest(where, ['sport', 'region']);


        parentMainScope.selectedCentralView = 'popularEvents';
        $scope.mainHeaderTitle = 'POPULAR';

        $scope.centerViewLoading = true;
        connectionService.subscribe(request, updateCentralPrematchView);

        $scope.updatePathInComboView({name: 'Popular Events'});
    });

    var parentTimeFilterChanged = parentMainScope.$on('comboView.timeFilter.changed', function (event) {
        var eventForView = {
            'liveToday': 'liveTodaySelected',
            'popularEvents': 'popularEventsSelected',
            'sport': 'sportSelected',
            'region': 'regionSelected',
            'competition': 'competitionSelected'
        };

        var data = {
            'sport': $scope.selectedSport,
            'region': $scope.selectedRegion,
            'competition': $scope.selectedCompetition
        };

        data.force = true;

        $scope.$emit('comboView.leftMenu.' + eventForView[parentMainScope.selectedCentralView], data);
    });

    $scope.selectSport = function selectSport (sport) {
        $scope.$emit(
            'comboView.leftMenu.sportSelected',
            {sport: sport}
        );
    };

    $scope.selectRegion = function selectRegion (sport, region) {
        $scope.$emit(
            'comboView.leftMenu.regionSelected',
            {
                sport: sport,
                region: region
            }
        );
    };

    $scope.selectCompetition = function selectCompetition (sport, region, competition) {
        $scope.$emit(
            'comboView.leftMenu.competitionSelected',
            {
                sport: sport,
                region: region,
                competition: competition
            }
        );
    };

    /**
     * removes event listeners from parent scope
     */
    $scope.$on('$destroy', function() {
        parentGameSelected();
        parentCompetitionSelected();
        parentRegionSelected();
        parentSportSelected();
        parentLiveTodaySelected();
        parentTimeFilterChanged();
        parentPopularEventSelected();
    });
}]);

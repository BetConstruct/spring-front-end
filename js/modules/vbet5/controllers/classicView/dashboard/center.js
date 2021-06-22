/**
 * @ngdoc controller
 * @name vbet5.controller:classicDashboardCenterController
 * @description
 * classic view dashboard controller
 */
VBET5.controller('classicDashboardCenterController', ['$rootScope', '$scope', 'OddService', 'ConnectionService', 'Config', '$filter', 'Utils', 'GameInfo', 'Moment', 'Storage', function ($rootScope, $scope, OddService, ConnectionService, Config, $filter, Utils, GameInfo, Moment, Storage) {
    'use strict';

    var connectionService = new ConnectionService($scope);
    var connectionSubIds = {};
    var parentMainScope = $scope.$parent.$parent.$parent;
    var expandedRegionSubIds = {};
    var expandedSportsSubIds = {};
    var updateCentralLiveView = updateCentralViewFactory('centerViewLiveData');
    var updateCentralPrematchView = updateCentralViewFactory('centerViewPrematchData');

    var updateCentralLiveViewWithExpandedRegion = updateCentralViewWithExpandedRegionFactory('centerViewLiveData');
    var updateCentralPrematchViewWithExpandedRegion = updateCentralViewWithExpandedRegionFactory('centerViewPrematchData');
    var updateCentralPrematchViewWithExpandedRegionForLiveToday = updateCentralViewWithExpandedRegionFactory('centerViewPrematchData', updateLinkedGames);

    /**
     * @ngdoc method
     * @name initScope
     * @methodOf vbet5.controllers:classicDashboardCenterController
     * @description Initialization
     */
    (function initScope () {
        $scope.displayBase = GameInfo.displayBase;
        $scope.isEventInBetSlip = GameInfo.isEventInBetSlip;
        $scope.liveGamesSoccerTemplate = GameInfo.liveGamesSoccerTemplate;
        $scope.dotaGamesList = GameInfo.dotaGamesList;
        $scope.framesCount = GameInfo.framesCount;
        $scope.showFrameAlias = GameInfo.showFrameAlias;
        $scope.slideSets = GameInfo.slideSets;
        $scope.getCurrentTime = GameInfo.getCurrentTime;
        $scope.hideRegionsInDashboard = Storage.get("hideRegionsInDashboard") === undefined ? true : Storage.get("hideRegionsInDashboard");
        $scope.visibleSetsNumber = 5;

        $scope.selectedMarketForLiveCompetition = {};
        $scope.selectedMarketForPrematchCompetition = {};


        $scope.odds = OddService.data;
        $scope.setOddSwitcherValue = OddService.setOddSwitcherValue;
        $scope.oddSwitcherValue = OddService.getOddSwitcherInitialValue();
        $scope.setOddSwitcherValue($scope.oddSwitcherValue, true);

        $scope.competitionLiveFilters = {};
        $scope.competitionPrematchFilters = {};
        $scope.sportBlock = {};
        $scope.expandedAll = true;
        $scope.goToUrl = function goToUrl(game, widgetMode){
            Utils.goToUrl(game, widgetMode);
            Config.env.live = game.type === 1;
        };
    })();

    /**
     * @ngdoc method
     * @name isSelectedCentralViewTogglable
     * @methodOf vbet5.controllers:classicDashboardCenterController
     * @description Check if selected central view is toggable (true by default)
     */
    /*function isSelectedCentralViewTogglable () {
        return true;
//         return ['sport', 'liveToday', 'popularEvents'].indexOf(parentMainScope.selectedCentralView) !== -1;
    }*/

    $scope.isSelectedCentralViewTogglable = true; //isSelectedCentralViewTogglable;

    /**
     * @ngdoc method
     * @name updateCentralViewFactory
     * @methodOf vbet5.controllers:TopMenu
     * @description Update central view factory
     */
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
                            return;
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

            if (!subId || !$scope[source].length) {
                return;
            }

            var region = angular.extend(
                {},
                {
                    type: source == 'centerViewLiveData' ? 1 : 0,
                    isClosed: false,
                    'region': !$scope.hideRegionsInDashboard ? $scope[source][0].region[$scope[source][0].regions[0].id].id : "",
                    'sport': $scope[source][0].id
                }
            );

            $scope.toggleItem(region);
        }
    }

    /**
     * @ngdoc method
     * @name updateCentralViewFactory
     * @methodOf vbet5.controllers:updateLinkedGames
     * @description Update linked games
     */
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

    /**
     * @ngdoc method
     * @name updateCentralViewWithExpandedRegionFactory
     * @methodOf vbet5.controllers:classicDashboardCenterController
     * @description Update central view with expanded region (factory)
     * @param {String} source
     * @param {Function}  callback
     */
    function updateCentralViewWithExpandedRegionFactory (source, callback) {

        return function updateCentralViewWithExpandedRegion(data, subId) {
            if (subId && data.sport) {
                var sportKeys = Object.keys(data.sport);
                if (sportKeys.length) {
                    if (!$scope.hideRegionsInDashboard) {
                        var regionKeys = Object.keys(data.sport[sportKeys[0]].region);
                        expandedRegionSubIds[data.sport[sportKeys[0]].region[regionKeys[0]].id] = subId;
                    } else {
                        expandedSportsSubIds[data.sport[sportKeys[0]].id] = subId;
                    }
                }
            }
            $scope.pointerIds = $scope.pointerIds || {};

            processCenterViewData(data, subId, function (sport) {
                angular.forEach($scope[source], function (templateSport) {
                    if (templateSport.id !== sport.id) {
                        return;
                    }

                    angular.forEach(templateSport.region, function (region, key) {
                        if ($scope.hideRegionsInDashboard) {

                            angular.forEach(sport.regions, function(sportRegion) {
                                if (sport.region[sportRegion.id].id === region.id) {
                                    sport.region[sportRegion.id].isLoading = false;

                                    var mergedRegion = angular.extend({}, region, sport.region[sportRegion.id]);
                                    angular.forEach(mergedRegion, function (mergedRegionValue, mergedRegionKey) {
                                        templateSport.region[key][mergedRegionKey] = mergedRegionValue;
                                    });
                                }
                            });
                        } else if (sport.region[sport.regions[0].id].id == region.id) {
                            // replace (initially loaded) light region info with fully loaded data
                            sport.region[sport.regions[0].id].isLoading = false;

                            var mergedRegion = angular.extend({}, region, sport.region[sport.regions[0].id]);
                            angular.forEach(mergedRegion, function (mergedRegionValue, mergedRegionKey) {
                                templateSport.region[key][mergedRegionKey] = mergedRegionValue;
                            });
                        }
                    });
                    $scope.sportBlock[sport.id].isLoading = false;
                });

                callback && callback(sport);

                $scope.centerViewLoading = false;
            });
        };
    }

    /**
     * @ngdoc method
     * @name processCenterViewData
     * @methodOf vbet5.controllers:classicDashboardCenterController
     * @description Prepare data for the template
     * @param {Object} data
     * @param {Number} subId the subscription id
     * @param {Function} sportCallback: Execution sport callback
     * @param {Function} gameCallback: Execution game callback
     */
    function processCenterViewData (data, subId, sportCallback, gameCallback) {
        var sportCount = 0;

        angular.forEach(data.sport, function (sport) {
            sport.regions = Utils.objectToArray(sport.region);
            sport.regions.sort(Utils.orderSorting);

            angular.forEach(sport.region, function (region) {
                // by default all regions are closed
                // (see below this loop, when we're opening first region)
                if (subId) {
                    region.regionListClosed = true;
                }

                region.isLoading = false;

                if (region.competition) {
                    region.competitions = Utils.objectToArray(region.competition);
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
                        game['text_info'] = game['text_info'] ? game['text_info'].replace(/;/g, ',') : '';

                        GameInfo.hasVideo(game);
                        GameInfo.checkITFAvailability(game);

                        var filteredMarkets = Utils.groupByItemProperty(game.market, 'type');
                        angular.forEach(filteredMarkets, function (marketGroup, id) {
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

                                //event.name = $filter('improveName')(event.name, game);
                            });
                        });

                        game.filteredMarket = filteredMarkets && (filteredMarkets['P1XP2'] || filteredMarkets['P1P2']);

                        gameCallback && gameCallback(game, competition);

                        if (game.exclude_ids) {
                            region.exclude_ids.push(game.exclude_ids);
                        }
                    });

                    competition.games = Utils.twoParamsSorting(Utils.objectToArray(competition.game), ['start_ts', 'id']);

                    var competitionTotalMarketCount = Object.keys(competition.filteredMarkets).length;
                    competition.filteredMarketsCount = competitionTotalMarketCount;
                    competition.moreFilteredMarketsCount = competitionTotalMarketCount > 3 ? competitionTotalMarketCount - 3 : 0;
                });
            });

            sportCount++;

            if (sportCount === 1) {
                // mark first region as open
                if (subId) {
                    if (!$scope.hideRegionsInDashboard) {
                        sport.region[sport.regions[0].id].regionListClosed = false;
                    } else {
                        angular.forEach(sport.region, function(region) {
                            region.regionListClosed = false;
                        });
                    }
                }

                sport.region[sport.regions[0].id].isLoading = true;
            }

            sportCallback(sport);
        });
    }

    /**
     * @ngdoc method
     * @name generateRequest
     * @methodOf vbet5.controllers:classicDashboardCenterController
     * @description Generate backend request
     * @param {Object} where condition
     * @param {Object} Which fields to get
     */
    function generateRequest (where, whatFields) {
        var request = {
            'source': 'betting',
            'what': {
                'sport': ['id', 'name', 'alias'],
                'region': ['id', 'name', 'order'],
                'competition': ['id', 'name', 'order'],
                'game': [
                    'id', 'start_ts', 'team1_name', 'team2_name', 'game_number', 'game_external_id',
                    'team1_external_id', 'team2_external_id', 'type', 'info', 'is_stat_available',
                    'markets_count', 'extra', 'is_blocked', 'is_itf', 'exclude_ids',
                    'is_live', 'tv_type', 'video_id', 'video_id2', 'video_id3', 'video_provider', 'stats'
                ],
                'event': ['id', 'price', 'type', 'name', 'order', 'base'],
                'market': ['type', 'express_id', 'name', 'base', 'order', 'home_score', 'away_score', 'id']
            },
            'where': {
                'game': {}
            }
        };

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
        } else {
            Utils.addPrematchExpressId(request);
        }

        if (where.sport) {
            request.where['sport'] = {'id': where.sport};
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

    /**
     * @ngdoc method
     * @name stopRegionLoading
     * @methodOf vbet5.controllers:classicDashboardCenterController
     * @description Clears scope from region data
     * @param {Boolean} toggle state
     */
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

    /**
     * @ngdoc method
     * @name setMarketFactory
     * @methodOf vbet5.controllers:classicDashboardCenterController
     * @description Prepare market (factory)
     * @param {String} market type
     */
    var setMarketFactory = function setMarketFactory (type) {
        return function (market, competitionId) {
            $scope['selectedMarketFor' + type + 'Competition'][competitionId] = market;
        };
    };

    $scope.setLiveMarket = setMarketFactory('Live');
    $scope.setPrematchMarket = setMarketFactory('Prematch');

    /**
     * @ngdoc method
     * @name getMarketFactory
     * @methodOf vbet5.controllers:classicDashboardCenterController
     * @description Get market market factory
     * @param {String} market type
     */
    var getMarketFactory = function getMarketFactory (type) {
        return function (competition) {
            var marketToReturn = $scope['selectedMarketFor' + type + 'Competition'][competition.id];

            if (!marketToReturn && competition.filteredMarketsCount) {
                var selectedItem = Utils.getItemBySubItemProperty(competition.filteredMarkets, 'type', ['P1XP2']);
                if (selectedItem) {
                    return selectedItem.P1XP2;
                } else {
                    return competition.filteredMarkets[0];
                }

            }

            return marketToReturn;
        }
    };

    $scope.getLiveMarket = getMarketFactory('Live');
    $scope.getPrematchMarket = getMarketFactory('Prematch');

    /**
     * @ngdoc method
     * @name openGameView
     * @methodOf vbet5.controllers:classicDashboardCenterController
     * @description Open game
     * @param {Object} game object
     */
    $scope.openGameView = function openGameView (game) {
        parentMainScope.selectedCentralView = 'gameView';
        $scope.liveGameLoading = true;

        // -1) init
        game.opened = true;
        var competition = game.competition;
        var region = game.region;
        var sport = game.sport;
        var request = {
            'source': 'betting',
            'what': {
                'game': [],
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
        connectionService.subscribe(request, function updateCentralGameView (response, subId) {
            if (subId) {
                connectionSubIds[subId] = subId;
            }

            response.game[game.id].availableMarketGroups = {};
            response.game[game.id].sport = {id: sport.id, alias: sport.alias, name: sport.name};
            response.game[game.id].region = {id: region.id};
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

                if($scope.openGame.sport.alias === "Soccer" || $scope.openGame.sport.alias === "CyberFootball") {
                    GameInfo.generateTimeLineEvents($scope.openGame, $scope);
                    GameInfo.addOrderingDataToSoccerGameEvents($scope.openGame);
                }
            }

            var hasVideo = GameInfo.hasVideo($scope.openGame);
            if (hasVideo) {
                if ($scope.openGame.video_data === undefined) {
                    $scope.openGame.video_data = null; }//not to call this several times before getVideoData fills the field
                /*if ($scope.pinnedGames && !$scope.pinnedGames[$scope.openGame.id]) {*/
                GameInfo.getVideoData($scope.openGame);
                if ($scope.enlargedGame && $scope.enlargedGame.id !== $scope.openGame.id) {
                    $scope.enlargedGame = $scope.openGame;
                }
                /*} else {
                 $scope.openGame.activeFieldType = 'field';
                 }*/

            }

            if (hasVideo && (Config.env.authorized || !$scope.openGame.has_animation) && $scope.openGame.activeFieldType === undefined) {
                $scope.openGame.activeFieldType = 'video';
            } else if ($scope.openGame.activeFieldType === undefined) {
                $scope.openGame.activeFieldType = 'field';
            }

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
                        groupedMarkets[0].name = $filter('improveName')(groupedMarkets[0].name, $scope.openGame);

                        if(groupedMarkets[0].type) {
                            groupedMarkets[0].fullType = (groupedMarkets[0].type || '') + (groupedMarkets[0].period || '');
                        }
                    });
                }
            }
            $scope.liveGameLoading = false;
        });
    };

    /**
     * @ngdoc method
     * @name changeStatsMode
     * @methodOf vbet5.controllers:classicDashboardCenterController
     * @description Change stats mode
     * @param {Boolean} set mode true or false
     */
    $scope.changeStatsMode = function changeStatsMode(mode) {
        $scope.flipMode = mode;
    };

    /**
     * @ngdoc method
     * @name toggleItem
     * @methodOf vbet5.controllers:classicDashboardCenterController
     * @description Toggle dashboard item
     * @param {Object} item object
     */
    $scope.toggleItem = function toggleItem(item) {
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
                connectionService.subscribe(request, updateCentralPrematchViewWithExpandedRegionForLiveToday, null, true);
            } else if (item.type === 1) {
                connectionService.subscribe(request, updateCentralLiveViewWithExpandedRegion, null, true);
            } else {
                connectionService.subscribe(request, updateCentralPrematchViewWithExpandedRegion, null, true);
            }
        } else if (item.region) {
            stopRegionLoading(item);

            if (!expandedRegionSubIds[item.region]) {
                return;
            }

            connectionService.unsubscribe(expandedRegionSubIds[item.region]);
            delete expandedRegionSubIds[item.region];
        } else {
            if (!expandedSportsSubIds[item.sport]) {
                return;
            }

            connectionService.unsubscribe(expandedSportsSubIds[item.sport]);
            delete expandedSportsSubIds[item.sport];
            $scope.sportBlock[item.sport].isLoading = false;
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
        connectionService.unsubscribe(expandedSportsSubIds);

        $scope.hideLiveEvents = false;
        var requestLive = generateRequest({'competition': competition.id, type: 1});
        var requestPrematch = generateRequest({'competition': competition.id, type: 0});

        parentMainScope.selectedCentralView = 'competition';
        $scope.mainHeaderTitle = competition.name;

        $scope.centerViewLoading = true;
        connectionService.subscribe(requestLive, updateCentralLiveView);
        connectionService.subscribe(requestPrematch, updateCentralPrematchView);

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
        connectionService.unsubscribe(expandedSportsSubIds);

        $scope.hideLiveEvents = false;
        var requestLive = generateRequest({'region': region.id, type: 1});
        var requestPrematch = generateRequest({'region': region.id, type: 0});

        parentMainScope.selectedCentralView = 'region';
        $scope.mainHeaderTitle = region.name;

        connectionService.subscribe(requestLive, updateCentralLiveView);
        connectionService.subscribe(requestPrematch, updateCentralPrematchView);

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
        connectionService.unsubscribe(expandedSportsSubIds);

        $scope.hideLiveEvents = false;

        var requestLive = generateRequest({'sport': sport.id, type: 1}, ['sport', 'region']);
        var requestPrematch = generateRequest({'sport': sport.id, type: 0}, ['sport', 'region']);

        parentMainScope.selectedCentralView = 'sport';
        $scope.mainHeaderTitle = sport.name;

        connectionService.subscribe(requestLive, updateCentralLiveView);
        connectionService.subscribe(requestPrematch, updateCentralPrematchView);

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
        connectionService.unsubscribe(expandedSportsSubIds);

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

    $scope.$on('classic.comboView.leftMenu.liveNow', function (event, data) {
        $scope['centerViewLiveData'] = [];
        $scope['centerViewPrematchData'] = [];

        $scope.centerViewLoading = true;
        connectionService.unsubscribe(connectionSubIds);
        connectionService.unsubscribe(expandedRegionSubIds);
        connectionService.unsubscribe(expandedSportsSubIds);

        $scope.hideLiveEvents = true;

        var request = {
            'source': 'betting',
            'what': {
                'sport': ['id', 'name', 'alias', 'order'],
                'region': ['id', 'name', 'alias', 'order']
            },
            'where': {'game': {'type': 1}}
        };

        request.where.sport = {'type': {'@ne': 1}};

        Utils.setCustomSportAliasesFilter(request);

        connectionService.subscribe(request, updateCentralLiveView);
    });

    var parentPopularEventsSelected = parentMainScope.$on('comboView.leftMenu.popularEventsSelected', function (event, data) {
        var force = data && data.force;
        if (parentMainScope.selectedCentralView === 'popularEvents' && !force) {
            return;
        }

        $scope['centerViewLiveData'] = [];
        $scope['centerViewPrematchData'] = [];

        connectionService.unsubscribe(connectionSubIds);
        connectionService.unsubscribe(expandedRegionSubIds);
        connectionService.unsubscribe(expandedSportsSubIds);

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

    $scope.$on('loggedIn', function () {
        if ($scope.openGame) {
            if ($rootScope.profile) {
                GameInfo.getVideoData($scope.openGame);
            } else {
                var profilePromise = $rootScope.$watch('profile', function () {
                    if ($rootScope.profile) {
                        profilePromise();
                        GameInfo.getVideoData($scope.openGame);
                    }
                });
            }
        }
    });

    //and unavailable when he logs out
    $scope.$on('login.loggedOut', function () {
        $scope.openGame && ($scope.openGame.video_data = null);
    });

    //synchronize video with user balance
    $scope.$watch('profile.balance', function (newValue, oldValue) {
        if (!$scope.openGame || $scope.openGame.allow_zero_balance) {
            return;
        }

        if (newValue === 0) {
            $scope.openGame.video_data = null;
        } else if (oldValue === 0 && newValue > 0 && !$scope.openGame.video_data) {
            GameInfo.getVideoData($scope.openGame);
        }
    });

    /**
     * @ngdoc method
     * @name selectSport
     * @methodOf vbet5.controllers:classicDashboardCenterController
     * @description Select sport
     * @param {Object} sport object
     */
    $scope.selectSport = function selectSport (sport) {
        $scope.$emit(
            'comboView.leftMenu.sportSelected',
            {sport: sport}
        );
    };

    /**
     * @ngdoc method
     * @name selectRegion
     * @methodOf vbet5.controllers:classicDashboardCenterController
     * @description Select region
     * @param {Object} region object
     */
    $scope.selectRegion = function selectRegion (sport, region) {
        $scope.$emit(
            'comboView.leftMenu.regionSelected',
            {
                sport: sport,
                region: region
            }
        );
    };

    /**
     * @ngdoc method
     * @name selectCompetition
     * @methodOf vbet5.controllers:classicDashboardCenterController
     * @description Select competition
     * @param {Object} competition object
     */
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
     * @ngdoc method
     * @name toggleSports
     * @methodOf vbet5.controllers:classicDashboardCenterController
     * @description Toggle sports
     * @param {Number} Sport ID
     */
    $scope.toggleSports = function toggleSports (sportId) {
        if (sportId) {
            if ($scope.sportBlock[sportId].isLoading) { return; }
            $scope.sportBlock[sportId].expanded = !$scope.sportBlock[sportId].expanded;

            if ($scope.hideRegionsInDashboard) {
                $scope.sportBlock[sportId].isLoading = true;
                $scope.toggleItem({'sport': sportId, 'type': 1, 'isClosed': !$scope.sportBlock[sportId].expanded});
            }
            checkToggleAllStatus();
        } else {
            $scope.expandedAll = !$scope.expandedAll;
            angular.forEach($scope.sportBlock, function (item) {
                item.expanded = $scope.expandedAll;
            });
        }
    };

    /**
     * @ngdoc method
     * @name checkToggleAllStatus
     * @methodOf vbet5.controllers:classicDashboardCenterController
     * @description Check for toggle statuses
     * @param {Number} Sport ID
     */
    function checkToggleAllStatus() {
        var expandedCount = 0;
        angular.forEach($scope.sportBlock, function (item) {
            if (item.expanded) {
                expandedCount++;
            }
        });

        if (expandedCount === $scope.centerViewLiveData.length) {
            $scope.expandedAll = true;
        } else if (!expandedCount) {
            $scope.expandedAll = false;
        }
    }

    /**
     * @ngdoc method
     * @name toggleRegionFilter
     * @methodOf vbet5.controller:classicDashboardCenterController
     * @description  toggles region filter (if hideRegionsInDashboard is true - all games in all regions will be shown)
     */
    $scope.toggleRegionFilter = function toggleRegionFilter() {
        $scope.hideRegionsInDashboard = !$scope.hideRegionsInDashboard;
        $scope.expandedAll = true;
        Storage.set("hideRegionsInDashboard", $scope.hideRegionsInDashboard);

        $scope.$broadcast("classic.comboView.leftMenu.liveNow");
    };

    /**
     * removes event listeners from parent scope
     */
    $scope.$on('$destroy', function() {
        parentGameSelected();
        parentCompetitionSelected();
        parentRegionSelected();
        parentPopularEventsSelected();
        parentSportSelected();
        parentLiveTodaySelected();
        parentTimeFilterChanged();
    });
}]);

/* global VBET5 */
VBET5.controller('eSportsCenterController', ['$rootScope', '$scope',  '$location', '$filter', '$route', '$q', 'DomHelper', 'Utils', 'Zergling', 'ConnectionService', 'GameInfo', 'asianViewGmsBasaltChanger', 'Storage', 'Config', 'Translator', 'analytics', 'TimeoutWrapper',
    function ($rootScope, $scope, $location, $filter, $route, $q, DomHelper, Utils, Zergling, ConnectionService, GameInfo, asianViewGmsBasaltChanger, Storage, Config, Translator, analytics, TimeoutWrapper) {
        'use strict';

        TimeoutWrapper = TimeoutWrapper($scope);
        var connectionService = new ConnectionService($scope);
        var asianConf = Config.main.asian;

        $scope.displayBase = GameInfo.displayBase;
        $scope.framesCount = Utils.memoize(GameInfo.framesCount);
        $scope.showFrameAlias = Utils.memoize(GameInfo.showFrameAlias);
        $scope.collapsedMarkets = {};

        $scope.pointsTypeForMarket = 'TOTALS';
        $scope.isInitial = true;

        var MARKET_GROUP_ALL = {
            id: -2,
            name: 'All'
        };
        var MARKET_GROUP_OTHER = {
            id: -1,
            name: 'Other'
        };
        var MARKET_GROUP_FAVORITE = {
            id: -3,
            name: 'Favorite',
            count: 0
        };

        var subIds = {
            game: null,
            games: null
        };

        if (Config.main.showInSportsbookBanners) {
            $scope.bannersState = {
                show: Storage.get("showEsportBanners") !== undefined ?Storage.get("showEsportBanners"): true
            };
            $scope.toggleBanners = function toggleBanners() {
                $scope.bannersState.show = !$scope.bannersState.show;
                Storage.set("showEsportBanners", $scope.bannersState.show);
            };
        }

        function unsubscribeFromPreviousData(type) {
            if (subIds[type]) {
                connectionService.unsubscribe(subIds[type]);
                subIds[type] = null;
            }
            $scope[type] = null;
        }

        function updateLocation(params) {
            angular.forEach(params, function(value, key) {
                if (value.hasOwnProperty('id')) {
                    $location.search(key, value.id);
                }
            });
        }

        function updateGame(game, matchesInfo) {
            game.sport = matchesInfo.sport;
            game.region = matchesInfo.region;
            game.competition = matchesInfo.competition;
            if(Config.main.showPlayerRegion) {
                game.team1_name = game.team1_reg_name && game.team1_name.indexOf(game.team1_reg_name) === -1 ? game.team1_name + ' (' + game.team1_reg_name + ')' : game.team1_name;
                game.team2_name = game.team2_reg_name && game.team2_name.indexOf(game.team2_reg_name) === -1 ? game.team2_name + ' (' + game.team2_reg_name + ')' : game.team2_name;
            }
            asianViewGmsBasaltChanger(game);
            return game;
        }

        function processUpdates(data, matchesInfo) {
            matchesInfo = Utils.copyObj(matchesInfo);
            var games = [];
            if (data.competition) {
                angular.forEach(data.competition, function(competition) {
                    matchesInfo.competition = { name: competition.name };
                    angular.forEach(competition.game, function(game) {
                        games.push(updateGame(game, matchesInfo));
                    });
                });
            } else {
                angular.forEach(data.game, function(game) {
                    games.push(updateGame(game, matchesInfo));
                });
            }

            $scope.games = games.sort(Utils.orderByStartTs);
        }

        function getSportData(params) {
            unsubscribeFromPreviousData('games');
            $scope.getCompetitionData(params, true);
        }

        $scope.getCompetitionData = function getCompetitionData(params, getAllCompetitions) {
            $scope.isInitial = false;
            $scope.attachPinnedVideo($scope.enlargedGame, 'fullScreen', true);
            if ($scope.loading || (!getAllCompetitions && $scope.games && $scope.games[0] && $scope.games[0].competition.id === params.competition.id) ) {
                return;
            }
            unsubscribeFromPreviousData('game');
            unsubscribeFromPreviousData('sport');
            updateLocation(params);
            $scope.loading = true;
            params.type = params.type || $location.search().type;
            var filters = $scope.repayCompetitionsFilter(params.competition.start_ts, params.type);

            var request = {
                source: 'betting',
                what: {
                    game: [['id', 'team1_name', 'team2_name', 'team1_id', 'team2_id', 'team1_reg_name', 'team2_reg_name', 'info', 'start_ts', 'type', 'text_info', 'events_count', 'is_blocked', 'markets_count', 'stats', 'strong_team', 'is_neutral_venue', 'is_stat_available', 'tv_type', 'video_id', 'video_id2', 'video_id3', 'video_provider', 'show_type']],
                    market: ['base', 'id', 'name', 'order', 'sequence', 'show_type', 'display_key', 'display_sub_key', 'type', 'home_score', 'away_score', 'main_order'],
                    event: ['name', 'id', 'base', 'type', 'type_1', 'price', 'show_type', 'home_value', 'away_value']
                },
                where: {
                    sport: {id: params.sport.id},
                    game: filters.game,
                    market: filters.market
                }
            };

            if (getAllCompetitions) {
                request.what.competition = ['name'];
            }
            if (params.region.id) {
                request.where.region = { id: params.region.id };
            }
            if (params.competition.id) {
                request.where.competition = { id: params.competition.id };
            }

            connectionService.subscribe(
                request,
                function(data) {
                    processUpdates(data, params);
                },
                {
                    thenCallback: function (result) {
                        if (result.subid) {
                            subIds[getAllCompetitions ? 'sport' : 'games'] = result.subid;
                        }
                        var selected = $scope.createSelectedObj(params);
                        if ( !angular.equals($scope.sharedData.selected[selected.type], selected) ) {
                            $scope.sharedData.selected[selected.type] = selected;
                        }
                        $scope.loading = false;
                    },
                    failureCallback: function failureCallback() {
                        $scope.loading = false;
                    }
                }
            );
        };

        /**
         * @ngdoc method
         * @name initFavouriteMarkets
         * @methodOf vbet5.controller:classicViewCenterController
         * @description Separates favorite markets and puts them in game's favouriteMarkets field
         * @param {Object} game current open game object
         */
        function initFavouriteMarkets(game) {
            if (0 === game.fullType) {
                return 0;
            }
            var store = Storage.get('favouriteMarketsTypes');
            game.sport.favouriteMarketsTypes = store && store[game.type] && store[game.type][game.sport.id] ? store[game.type][game.sport.id] : {};
            game.sport.favouriteMarkets = [];
            var market;
            if (!Utils.isObjectEmpty(game.sport.favouriteMarketsTypes) && game.markets) {
                angular.forEach(game.sport.favouriteMarketsTypes, function (value, fullType) {
                    market = game.markets.filter(function(market) {
                        return market[0].fullType === fullType;
                    });
                    if (market && market[0]) {
                        game.sport.favouriteMarkets.push(market[0]);
                    }
                });
            }

            MARKET_GROUP_FAVORITE.count = $scope.game.sport.favouriteMarkets.length;
        }

        function updateOpenGame(data, matchInfo) {
            if (Utils.isObjectEmpty(data.game)) {
                $scope.gameFinished = true;

                TimeoutWrapper(function(){
                    //TODO navigate to others
                }, 5000);
            } else {
                $scope.gameFinished = false;
            }

            angular.forEach(data.game, function (game) {
                game.sport = {id: matchInfo.sport.id, alias: matchInfo.sport.alias, name: matchInfo.sport.name};
                game.region = {id: matchInfo.region.id, alias: matchInfo.region.alias, name: matchInfo.region.name};
                game.competition = {id: matchInfo.competition.id, name: matchInfo.competition.name};

                var availableMarketGroups = {};
                $scope.game = game;
                if(Config.main.showPlayerRegion) {
                    $scope.game.team1_name = $scope.game.team1_reg_name && $scope.game.team1_name.indexOf($scope.game.team1_reg_name) === -1 ? $scope.game.team1_name + ' (' + $scope.game.team1_reg_name + ')' : $scope.game.team1_name;
                    $scope.game.team2_name = $scope.game.team2_reg_name && $scope.game.team2_name.indexOf($scope.game.team2_reg_name) === -1 ? $scope.game.team2_name + ' (' + $scope.game.team2_reg_name + ')' : $scope.game.team2_name;
                }
                $scope.game.setsOffset = $scope.game.setsOffset || 0;
                // if teams shirt colors equal we change them to default colors
                if ($scope.game.info && $scope.game.info.shirt1_color === $scope.game.info.shirt2_color) {
                    $scope.game.info.shirt1_color = "ccc";
                    $scope.game.info.shirt2_color = "f00";
                }
                if ($scope.game.type === 1) { // live game
                    if($scope.game.info){
                        $scope.game.info.current_game_time = GameInfo.getCurrentTime($scope.game.info.current_game_time, $scope.game.info.current_game_state);
                    }
                    GameInfo.updateGameStatistics($scope.game);
                    GameInfo.extendLiveGame($scope.game);

                    GameInfo.updateOpenGameTextInfo($scope.game);
                }

                var groupCountChecker = {};

                angular.forEach(game.market, function (market) {
                    if (!market.group_id) {
                        market.group_id = MARKET_GROUP_OTHER.id;
                        market.group_name = MARKET_GROUP_OTHER.name;
                    }
                    groupCountChecker[market.group_id] = groupCountChecker[market.group_id] || {};

                    if (availableMarketGroups[market.group_id]) {
                        if(!groupCountChecker[market.group_id][market.type + market.name]) {
                            availableMarketGroups[market.group_id].count++;
                            groupCountChecker[market.group_id][market.type + market.name] = market.type + market.name;
                        }
                    } else {
                        availableMarketGroups[market.group_id] = {name: market.group_name, id: market.group_id, count: 1};
                        groupCountChecker[market.group_id][market.type + market.name] = market.type + market.name;
                    }

                    angular.forEach(market.event, function (event) {
                        event.name = $filter('removeParts')(event.name, [market.name]);
                        if (Config.main.dontReplaceP1P2WithTeamNamesForEvents) {
                            if (!Config.main.dontReplaceP1P2WithTeamNamesForEvents[market.type]) {
                                event.name = $filter('improveName')(event.name, game);
                            }
                        }
                        else if (Config.main.replaceP1P2WithTeamNames) {
                            event.name = $filter('improveName')(event.name, game);
                        }
                    });

                    /*CORRECT SCORE*/
                    if(market.display_key === 'CORRECT SCORE') {
                        GameInfo.reorderMarketEvents(market, 'correctScore');
                    } else{
                        market.events = Utils.objectToArray(market.event);
                        Utils.createDummyEvents(market);
                    }
                });

                availableMarketGroups = Utils.objectToArray(availableMarketGroups);
                var additionalGroups = [MARKET_GROUP_FAVORITE, MARKET_GROUP_ALL];

                game.availableMarketGroups = availableMarketGroups.length > 1 || (availableMarketGroups.length === 1 && availableMarketGroups[0].id !== MARKET_GROUP_OTHER.id) ? additionalGroups.concat(availableMarketGroups) : additionalGroups;

                if (Config.main.sportMarketGroupsOrder) {
                    var index;
                    game.availableMarketGroups.sort(function(a) {
                        index = Config.main.sportMarketGroupsOrder.indexOf(a.id);
                        return index < 0 ? a.id : index;
                    });
                }
            });

            if ($scope.game) {

                $location.search('sport', $scope.game.sport.id);
                $location.search('competition', $scope.game.competition.id);
                $location.search('region', $scope.game.region.id);
                $location.search('game', $scope.game.id);

                $scope.game.markets = Utils.objectToArray(Utils.groupByItemProperties($scope.game.market, ['type', 'name']));

                if ($scope.game.markets) {
                    $scope.game.markets.sort(function (a, b) {
                        return a[0].order - b[0].order;
                    });
                    angular.forEach($scope.game.markets, function (groupedMarkets) {

                        groupedMarkets.events = groupedMarkets.event ? Utils.objectToArray(groupedMarkets.event) : '';
                        if(groupedMarkets[0].type) {
                            groupedMarkets[0].fullType = (groupedMarkets[0].type || '') + (groupedMarkets[0].period || '');
                        }
                    });
                }

                var selectedGroupId = $scope.game.selectedMarketGroupId !== undefined ? $scope.game.selectedMarketGroupId : $scope.game.availableMarketGroups[1].id;
                initFavouriteMarkets($scope.game);
                $scope.selectMarketsGroup(selectedGroupId, true);
            }
        }

        $scope.getGameData = function getGameData(data) {
            $scope.isInitial = false;
            if ($scope.game && $scope.game.id === data.game.id) {
                return;
            }
            unsubscribeFromPreviousData('games');
            unsubscribeFromPreviousData('sport');
            updateLocation(data);
            $scope.loading = true;
            var requestGame = [["id", "show_type", "markets_count", "start_ts", "is_live", "is_blocked", "is_neutral_venue","team1_id", "team2_id", "game_number", "text_info", "type",  "info", "team1_name", "team2_name", "tv_info"  ]];
            if (data.game.type === 1) {
                Array.prototype.push.apply(requestGame[0], ["match_length", "scout_provider", "video_id","video_id2", "video_id3", "tv_type", "last_event", "live_events"]);
            }
            var request = {
                'source': 'betting',
                'what': {
                    game: requestGame,
                    market: ["id", "col_count", "type", "sequence", "express_id", "cashout", "display_key", "display_sub_key", "group_id", "name", "group_name", "order" ],
                    event: ["order", "id", "type_1", "type", "type_id", "original_order", "name", "price", "base", "home_value", "away_value", "display_column"]
                },
                'where': {
                    game: {id: data.game.id},
                    sport: {id: data.sport.id}
                }
            };

            if (data.region.id) {
                request.where.region = { id: data.region.id };
            }
            if (data.competition.id) {
                request.where.competition = { id: data.competition.id };
            }

            connectionService.subscribe(
                request,
                function(response) {
                    updateOpenGame(response, data);
                },
                {
                    thenCallback: function (result) {
                        if (result.subid) {
                            subIds.game = result.subid;
                        }
                        // Handling 'selected game' state
                        data.type = data.type || $location.search().type;
                        var selected = $scope.createSelectedObj(data);
                        // We don't need to track the selected pre match game in the left menu
                        if ( !angular.equals($scope.sharedData.selected[selected.type], selected) ) {
                            $scope.sharedData.selected[selected.type] = selected;
                        }

                        $scope.handleStreaming($filter("firstElement")(result.data.game));

                        $scope.loading = false;
                    },
                    failureCallback: function failureCallback() {
                        $scope.loading = false;
                    }
                }
            );
        };

        $scope.selectMarketsGroup = function selectMarketsGroup(groupId, forceUpdate) {
            if (!forceUpdate && $scope.game.selectedMarketGroupId === groupId) {
                return;
            }
            $scope.game.selectedMarketsGroup = [];
            $scope.game.selectedMarketGroupId = groupId;
            switch (groupId) {
                case MARKET_GROUP_ALL.id:
                    $scope.game.selectedMarketsGroup = $scope.game.markets;
                    break;
                case MARKET_GROUP_FAVORITE.id:
                    $scope.game.selectedMarketsGroup = $scope.game.sport.favouriteMarkets;
                    break;
                default:
                    $scope.game.selectedMarketsGroup = $scope.game.markets.filter(function (market) {
                        return groupId === market[0].group_id;
                    });
            }
        };

        /**
         * @ngdoc method
         * @name addToFavouriteMarkets
         * @methodOf vbet5.controller:classicViewCenterController
         * @description Adds market to favorites list for sport
         * @param {Array} groupedMarkets array of market(s) of same type
         */
        $scope.addToFavouriteMarkets = function addToFavouriteMarkets(groupedMarkets) {
            var analyticsText = "";
            var index = $scope.game.sport.favouriteMarkets.indexOf(groupedMarkets);
            if (index === -1) {
                analyticsText = "addToFavouriteMarkets";
                $scope.game.sport.favouriteMarkets.push(groupedMarkets);
                $scope.game.sport.favouriteMarketsTypes[groupedMarkets[0].fullType] = 1;
            } else {
                analyticsText = "removeFromFavouriteMarkets";
                delete $scope.game.sport.favouriteMarketsTypes[groupedMarkets[0].fullType];
                $scope.game.sport.favouriteMarkets.splice(index, 1);

                if ($scope.game.selectedMarketGroupId === MARKET_GROUP_FAVORITE.id) {
                    if (!$scope.game.sport.favouriteMarkets.length) {
                        $scope.game.selectedMarketGroupId = MARKET_GROUP_ALL.id;
                        $scope.selectMarketsGroup(MARKET_GROUP_ALL.id, true);
                    }
                }
            }

            MARKET_GROUP_FAVORITE.count = $scope.game.sport.favouriteMarkets.length;

            var store =  Storage.get('favouriteMarketsTypes') || {'0': {}, '1': {}, '2': {}};
            store[$scope.game.type] = store[$scope.game.type] || {}; // Should be deleted after some time: type 2 was added after implementing this functionality, so people who has favourite markets, will receive an error when adding market  with type=2
            store[$scope.game.type][$scope.game.sport.id] = $scope.game.sport.favouriteMarketsTypes;
            Storage.set('favouriteMarketsTypes', store);
            analytics.gaSend('send', 'event', 'explorer', analyticsText + (Config.main.sportsLayout),  {'page': $location.path(), 'eventLabel': analyticsText});
            console.log('gaSend-',analyticsText);
        };

        $scope.prefixBase = function prefixBase(market, marketType) {
            if(!market || !market[marketType]) {
                return;
            }
            var basePrice = market[marketType].price,
                nonBasePrice = market[marketType === 'Home' ? 'Away' : 'Home'].price;

            var recalculatedBase = $filter('handicapBaseFormat')(market[marketType].base, false, false, false, market.home_score, market.away_score, market[marketType].type_1); // get's recalculated value

            if (asianConf.showAllHandicapSigns) {
                return $filter('handicapBaseFormat')(recalculatedBase, undefined, false, true);
            }

            if (recalculatedBase > 0) {
                return '';
            } else if (recalculatedBase === 0) {
                if (basePrice === nonBasePrice && marketType === 'Home') { return ''; }
                if (basePrice > nonBasePrice) { return ''; }
            }

            return $filter('handicapBaseFormat')(recalculatedBase, undefined, true, true);
        };

        $scope.$on('eSports.requestData', function requestData(event, data) {
            if(data.game.id) {
                $scope.getGameData(data);
            } else if(data.competition.id) {
                $scope.getCompetitionData(data);
            } else {
                getSportData(data);
            }
        });

        $scope.$on('eSports.noGames', function () {
            $scope.games = [];
            $scope.game = null;

            unsubscribeFromPreviousData('games');
            unsubscribeFromPreviousData('sport');
        });
        /**
         * @ngdoc method
         * @name openGameRulesPopup
         * @methodOf vbet5.controller:eSportsCenterController
         * @description Open game rules popup with passed content
         * @param {String} data
         */
        $scope.openGameRulesPopup = function openGameRulesPopup(data) {
            $rootScope.broadcast("globalDialogs.addDialog", {
                title: "Game rules",
                type: "dialog",
                content: data,
                hideButtons: true
            });
        };


        $scope.handleBannersLinks = function handleBannersLinks(link) {
            if (link.hostname === $location.host()) {
                var linkProps = Utils.getAllUrlParams(link.href);
                if (linkProps.path === $location.path()) {
                    if (linkProps.params.type !== undefined) {
                        $location.search('sport', linkProps.params.sport);
                        $location.search('competition', linkProps.params.competition);
                        $location.search('region', linkProps.params.region);
                        $location.search('game', linkProps.params.game);
                        $location.search('type', linkProps.params.type);
                        $route.reload();
                    }
                }
            }
        };
    }]);

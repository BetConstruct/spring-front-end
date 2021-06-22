/* global VBET5 */
VBET5.controller('eSportsCenterController', ['$rootScope', '$scope',  '$location', '$filter', '$route', '$q', 'DomHelper', 'Utils', 'Zergling', 'ConnectionService', 'GameInfo', 'asianViewGmsBasaltChanger', 'Storage', 'Config', 'Translator', 'analytics', 'TimeoutWrapper', 'MarketService',
    function ($rootScope, $scope, $location, $filter, $route, $q, DomHelper, Utils, Zergling, ConnectionService, GameInfo, asianViewGmsBasaltChanger, Storage, Config, Translator, analytics, TimeoutWrapper, MarketService) {
        'use strict';

        TimeoutWrapper = TimeoutWrapper($scope);
        var connectionService = new ConnectionService($scope);
        var asianConf = Config.main.asian;

        $scope.displayBase = GameInfo.displayBase;
        $scope.collapsedMarkets = {};

        $scope.pointsTypeForMarket = 'TOTALS';
        $scope.isInitial = true;

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

        $scope.marketsInOneColumn = { // Need to store value in an object to be able to change it from the directive
            enabled: MarketService.marketDivided
        };

        /**
         * @ngdoc method
         * @name toggleMarketDivision
         * @methodOf vbet5.controller:eSportsCenterController
         * @description  switch markets to one or two columns
         * @param {boolean} divide
         */
        $scope.toggleMarketDivision = function toggleMarketDivision(divided) {
            MarketService.toggleMarketDivision(divided);
            $scope.marketsInOneColumn.enabled = divided;
        };

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
            $scope.attachPinnedVideo($scope.enlargedGame, 'fullScreen', true);
            if (!getAllCompetitions && $scope.games && $scope.games[0] && $scope.games[0].competition.id === params.competition.id) {
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
                    game: [['id', 'team1_name', 'team2_name', 'team1_id', 'team2_id', 'team1_reg_name', 'team2_reg_name', 'info', 'start_ts', 'type', 'text_info', 'is_blocked', 'markets_count', 'stats', 'strong_team', 'is_neutral_venue', 'is_stat_available', 'tv_type', 'video_id', 'video_id2', 'video_id3', 'video_provider', 'show_type', "tv_info"]],
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

                        $scope.game = null;
                        $scope.loading = false;
                    },
                    failureCallback: function failureCallback() {
                        $scope.loading = false;
                    }
                }
            );
        };

        function updateOpenGame(data, matchInfo) {
            if (Utils.isObjectEmpty(data.game) || !data.game[matchInfo.game.id]) {
                $scope.gameFinished = true;

               $rootScope.broadcast("openGameFinished",  matchInfo);
            } else {
                $scope.gameFinished = false;
            }

            angular.forEach(data.game, function (game) {
                var openGame = {
                    id: game.id,
                    type: game.type,
                    show_type: game.show_type,
                    markets_count: game.markets_count,
                    start_ts: game.start_ts,
                    is_live: game.is_live,
                    is_blocked: game.is_blocked,
                    is_neutral_venue: game.is_neutral_venue,
                    team1_id: game.team1_id,
                    team2_id: game.team2_id,
                    game_number: game.game_number,
                    text_info: game.text_info,
                    is_stat_available: game.is_stat_available,
                    info: game.info,
                    tv_info: game.tv_info,
                    selectedMarketGroupId: $scope.game && $scope.game.selectedMarketGroupId //store previously selected id
                };

                if(Config.main.showPlayerRegion) {
                    openGame.team1_name = game.team1_reg_name && game.team1_name.indexOf(game.team1_reg_name) === -1 ? game.team1_name + ' (' + game.team1_reg_name + ')' : game.team1_name;
                    openGame.team2_name = game.team2_reg_name && game.team2_name.indexOf(game.team2_reg_name) === -1 ? game.team2_name + ' (' + game.team2_reg_name + ')' : game.team2_name;
                } else {
                    openGame.team1_name = game.team1_name;
                    openGame.team2_name = game.team2_name;
                }

                openGame.sport = {id: matchInfo.sport.id, alias: matchInfo.sport.alias, name: matchInfo.sport.name};
                openGame.region = {id: matchInfo.region.id, alias: matchInfo.region.alias, name: matchInfo.region.name};
                openGame.competition = {id: matchInfo.competition.id, name: matchInfo.competition.name};

                // if teams shirt colors equal we change them to default colors
                if (openGame.info && openGame.info.shirt1_color === openGame.info.shirt2_color) {
                    openGame.info.shirt1_color = "ccc";
                    openGame.info.shirt2_color = "f00";
                }

                $scope.game = openGame;

                if (game.type === 1) {
                    $scope.game.last_event = game.last_event;
                    $scope.game.scout_provider = game.scout_provider;
                    $scope.game.stats = game.stats;
                    $scope.game.add_info_name = game.add_info_name;
                    $scope.game.setsOffset = 0;
                    $scope.game.live_events = game.live_events && Utils.orderByField(game.live_events, 'time');

                    if ($scope.game.info) {
                        $scope.game.info.current_game_time = GameInfo.getCurrentTime($scope.game.info.current_game_time);
                    }
                    GameInfo.updateGameStatistics($scope.game);
                    GameInfo.extendLiveGame($scope.game);
                }
                var marketsData = MarketService.getMarketsAndGroups(game.id, game.market, game.team1_name, game.team2_name, $scope.game.sport.alias, game.is_stat_available, game.type);

                $scope.game.markets = marketsData.markets;
                $scope.game.availableMarketGroups = marketsData.marketGroups;
            });

            if ($scope.game) {
                $location.search('sport', $scope.game.sport.id);
                $location.search('competition', $scope.game.competition.id);
                $location.search('region', $scope.game.region.id);
                $location.search('game', $scope.game.id);

                if (!$scope.game.selectedMarketGroupId) {
                    $scope.game.selectedMarketGroupId = $scope.game.availableMarketGroups[1].id;
                }
                MarketService.initFavouriteMarkets($scope.game);
                updateMarketsByGroup();
            }
        }

        $scope.getGameData = function getGameData(data) {
            if ($scope.game && $scope.game.id === data.game.id) {
                return;
            }
            unsubscribeFromPreviousData('games');
            unsubscribeFromPreviousData('sport');
            unsubscribeFromPreviousData('game');
            updateLocation(data);
            $scope.loading = true;
            $scope.game = null;
            var requestGame = [["id", "show_type", "markets_count", "start_ts", "is_live", "is_blocked", "is_neutral_venue","team1_id", "team2_id", "game_number", "text_info", "is_stat_available", "type",  "info", "team1_name", "team2_name", "tv_info"  ]];
            if (data.type  === 'live' || data.game.type === 1) {
                Array.prototype.push.apply(requestGame[0], ["match_length", "scout_provider", "last_event", "live_events", "stats", "add_info_name"]);
            }
            var request = {
                'source': 'betting',
                'what': {
                    game: requestGame,
                    market: ["id", "col_count", "type", "sequence", "point_sequence", "express_id", "cashout", "display_key", "display_sub_key", "group_id", "name", "group_name", "order", "group_order", "extra_info", "name_template" ],
                    event: ["order", "id", "type_1", "type", "type_id", "original_order", "name", "price", "base", "home_value", "away_value", "display_column"]
                },
                'where': {
                    game: {id: data.game.id},
                    sport: {id: data.sport.id}
                }
            };
            Utils.addPrematchExpressId(request);

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

                        $scope.games = null;
                        $scope.loading = false;
                    },
                    failureCallback: function failureCallback() {
                        $scope.loading = false;
                    }
                }
            );
        };

        function updateMarketsByGroup() {
            $scope.selectedMarketsGroups = MarketService.divideMarkets($scope.game.markets, $scope.game.selectedMarketGroupId, $scope.game.sport.favouriteMarketsTypes);
        }

        $scope.selectMarketsGroup = function selectMarketsGroup(groupId, forceUpdate) {
            if (!forceUpdate && $scope.game.selectedMarketGroupId === groupId) {
                return;
            }

            $scope.game.selectedMarketGroupId = groupId;

            updateMarketsByGroup();
        };

        /**
         * @ngdoc method
         * @name addToFavouriteMarkets
         * @methodOf vbet5.controller:classicViewCenterController
         * @description Adds market to favorites list for sport
         * @param {Object} market array of market(s) of same type
         */
        $scope.addToFavouriteMarkets = function addToFavouriteMarkets(market) {
            MarketService.toggleFavouriteMarket($scope.game, market, function() {
                updateMarketsByGroup();
            })
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
            $scope.isInitial = false;

            if(!data) {
                return;
            }
            if(data.game.id) {
                $scope.getGameData(data);
            } else if(data.competition.id) {
                $scope.getCompetitionData(data);
            } else {
                getSportData(data);
            }
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

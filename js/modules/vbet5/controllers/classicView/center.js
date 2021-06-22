/**
 * @ngdoc controller
 * @name vbet5.controller:classicViewCenterController
 * @description
 * Classic mode game controller
 *
 *          ATTENTION!
 *          when adding dependencies to this controller, you must add them also in classicViewLeftController(classicExplorerCtrl)
 *          and pass it to this controller when extending it
 */
angular.module('vbet5.betting').controller('classicViewCenterController', ['$rootScope', '$scope', '$filter', 'Config', 'ConnectionService', 'StreamService', 'Utils', 'Storage', 'GameInfo', 'partner', 'TimeoutWrapper', '$location', 'analytics', 'BetService', 'MarketService', '$timeout', function ($rootScope, $scope, $filter, Config, ConnectionService, StreamService, Utils, Storage, GameInfo, partner, TimeoutWrapper, $location, analytics, BetService, MarketService,  $timeout) {
    'use strict';
    $rootScope.footerMovable = true;
    TimeoutWrapper = TimeoutWrapper($scope);

    $scope.getVideoData = GameInfo.getVideoData;
    $scope.displayBase = GameInfo.displayBase;
    $scope.isEventInBetSlip = GameInfo.isEventInBetSlip;

    var connectionService = new ConnectionService($scope);
    var streamService = new StreamService($scope);
    var openGameSubId = null;

    var openGameId;

    var hoveredLiveGameFullData;
    $scope.visibleSetsNumber = 5; // number of sets to be visible for multiset games
    $scope.GamesWithStatsBlock = GameInfo.GamesWithStatsBlock;

    $scope.marketsInOneColumn = {
        enabled: MarketService.marketDivided
    };
    $scope.customTemplateForSport = {
        '31': 'templates/sport/classic/racing/main.html',
        '184': 'templates/sport/classic/racing/main.html',
        '-17': 'templates/sport/expressOfDay/main.html'
    };
    var initial = !!$location.search().game;

    /**
     * @ngdoc method
     * @name toggleMarketDivision
     * @methodOf vbet5.controller:classicViewCenterController
     * @description  switch markets to one or two columns
     * @param {boolean} divide
     */
    $scope.toggleMarketDivision = function toggleMarketDivision(divided) {
        MarketService.toggleMarketDivision(divided);
        $scope.marketsInOneColumn.enabled = divided;
    };

    /**
     * @ngdoc method
     * @name populateExpandedMarkets
     * @methodOf vbet5.controller:classicViewCenterController
     * @description
     *
     * @param {Array} marketsPack contains  markets
     * @param  numberToExpand number of markets that should be expanded by default
     * @param {boolean} force force apply
     */
    function populateExpandedMarkets(marketsPack, numberToExpand, force) {
        if (!$scope.expandedMarkets[$scope.openGame.id]) {
            $scope.expandedMarkets[$scope.openGame.id] = {};
        }
        var limit = numberToExpand === 'all' || numberToExpand === undefined ? marketsPack.length: numberToExpand;
        for (var i = 0; i < marketsPack.length; i++) {
            if (force || $scope.expandedMarkets[$scope.openGame.id][marketsPack[i].fullType] === undefined) {
                $scope.expandedMarkets[$scope.openGame.id][marketsPack[i].fullType] = i < limit;
            }
        }
    }

    /**
     * @ngdoc method
     * @name calculateMarketsExpandedState
     * @description  called populateExpandedMarkets function to update collapse/expand states
     * @methodOf vbet5.controller:classicViewCenterController
     *
     * @param {boolean} [force = false] to force apply state
     */
    function calculateMarketsExpandedState(force) {
        populateExpandedMarkets($scope.selectedMarketsGroups[0], Config.main.numberOfExpandedMarkets, force);

        if ($scope.selectedMarketsGroups[1]) {
            var secondPackOpeningCount = (Config.main.numberOfExpandedMarkets !== 'all' && Config.main.numberOfExpandedMarkets !== undefined)?(Config.main.numberOfExpandedMarkets - $scope.selectedMarketsGroups[0].length): Config.main.numberOfExpandedMarkets;
            populateExpandedMarkets($scope.selectedMarketsGroups[1], secondPackOpeningCount, force);
        }
    }

    /**
     * @ngdoc method
     * @name divideMarketsArray
     * @description  divinding the openGame.markets into two parts for making ng-repeat in two different columns
     * @methodOf vbet5.controller:classicViewCenterController
     */
    function divideMarketsArray() {
        $scope.selectedMarketsGroups = MarketService.divideMarkets($scope.openGame.markets, $scope.openGame.selectedMarketGroupId, $scope.openGame.sport.favouriteMarketsTypes);
    }


    /**
     * @ngdoc method
     * @name selectMarketGroup
     * @description  sets selected market group and reorders markets according to it
     * @methodOf vbet5.controller:classicViewCenterController
     * @param {Number} groupId group id to select
     */
    $scope.selectMarketGroup = function selectMarketGroup(groupId) {
        $scope.openGame.selectedMarketGroupId = groupId;
        divideMarketsArray();
        calculateMarketsExpandedState(true);
    };

    /**
     * @ngdoc method
     * @name updateOpenGame
     * @methodOf vbet5.controller:classicViewCenterController
     * @description  updates open game data object
     *
     * @param {Object} data game data object
     */
    $scope.updateOpenGame = function updateOpenGame(data) {
        if (Utils.isObjectEmpty(data.sport) && openGameId) {
            $rootScope.$broadcast('liveGame.gameRemoved', openGameId);
            $scope.openGameFinished = true;
            $scope.openGame = null;
            $rootScope.$broadcast('sportsbook.gameFinished');
        } else {
            $scope.openGameFinished = false;
        }
        angular.forEach(data.sport, function (sport) {
            angular.forEach(sport.region, function (region) {
                angular.forEach(region.competition, function (competition) {
                    angular.forEach(competition.game, function (game) {
                        var openGame = {
                            game_number: game.game_number,
                            id: game.id,
                            info: game.info,
                            is_blocked: game.is_blocked,
                            is_live: game.is_live,
                            is_neutral_venue: game.is_neutral_venue,
                            is_stat_available: game.is_stat_available,
                            markets_count: game.markets_count,
                            start_ts: game.start_ts,
                            stats: game.stats,
                            team1_id: game.team1_id,
                            team2_id: game.team2_id,
                            text_info: game.text_info,
                            type: game.type,
                            show_type: game.show_type,
                            tv_info: game.tv_info,
                            add_info_name: game.add_info_name,
                            selectedMarketGroupId: $scope.openGame && $scope.openGame.selectedMarketGroupId, //store previously selected id
                            video_data:  $scope.openGame && $scope.openGame.video_data, //store previously calculated data
                            activeFieldType:  $scope.openGame && $scope.openGame.activeFieldType // store previously calculated data
                        };

                        if(Config.main.showPlayerRegion) {
                            openGame.team1_name = game.team1_reg_name && game.team1_name.indexOf(game.team1_reg_name) === -1 ? game.team1_name + ' (' + game.team1_reg_name + ')' : game.team1_name;
                            openGame.team2_name = game.team2_reg_name && game.team2_name.indexOf(game.team2_reg_name) === -1 ? game.team2_name + ' (' + game.team2_reg_name + ')' : game.team2_name;
                        } else {
                            openGame.team1_name = game.team1_name;
                            openGame.team2_name = game.team2_name;
                        }
                        openGame.sport = {id: sport.id, alias: sport.alias, name: sport.name};
                        openGame.region = {id: region.id, alias: region.alias, name: region.name};
                        openGame.competition = {id: competition.id, name: competition.name};

                        // if teams shirt colors equal we change them to default colors
                        if (openGame.info && openGame.info.shirt1_color === openGame.info.shirt2_color) {
                            openGame.info.shirt1_color = "ccc";
                            openGame.info.shirt2_color = "f00";
                        }

                        $scope.openGame = openGame;

                        if (game.type === 1) {
                            $scope.openGame.last_event = game.last_event;
                            $scope.openGame.scout_provider = game.scout_provider;
                            $scope.openGame.match_length = game.match_length;
                            $scope.openGame.setsOffset = 0;
                            $scope.openGame.live_events = game.live_events && Utils.orderByField(game.live_events, 'time');

                            if($scope.openGame.info) {
                                $scope.openGame.info.current_game_time = GameInfo.getCurrentTime($scope.openGame.info.current_game_time);
                            }

                            GameInfo.updateGameStatistics($scope.openGame);
                            GameInfo.extendLiveGame($scope.openGame);

                            if($scope.openGame.sport.alias === "Soccer") {
                                GameInfo.generateTimeLineEvents($scope.openGame, $scope);
                                GameInfo.addOrderingDataToSoccerGameEvents($scope.openGame);
                            }
                        }

                        streamService.monitoring($scope, 'openGame', 'pinnedGames', 'enlargedGame');

                        var marketsData = MarketService.getMarketsAndGroups(game.id, game.market, game.team1_name, game.team2_name, sport.alias, game.is_stat_available, game.type);

                        $scope.openGame.markets = marketsData.markets;
                        $scope.openGame.availableMarketGroups = marketsData.marketGroups;
                        if (!$scope.openGame.selectedMarketGroupId) {
                            $scope.openGame.selectedMarketGroupId = $scope.openGame.availableMarketGroups[1].id;
                        }
                    });
                });
            });
        });

        if ($scope.openGame) {
            MarketService.initFavouriteMarkets($scope.openGame);
            divideMarketsArray();
            calculateMarketsExpandedState();
        }
    };

    $scope.unsubscribeFromOpenGame = function unsubscribeFromOpenGame() {
        if (openGameSubId) {
            connectionService.unsubscribe(openGameSubId);
            openGameSubId = null;
        }
    };

    /**
     * @ngdoc method
     * @name openGameFullDetails
     * @methodOf vbet5.controller:classicViewCenterController
     * @description  expands(or collapses if expanded) region menu (loads and subscribes/unsibscribes to game)
     *
     * @param {Object} game game data object
     * @param {Boolean} fromCustomWidget if it from custom widget
     * @param {Object} competition competition data objectD
     * @param {Boolean} fromLeftMenu from where come event
     * @param {Boolean} fully is responsible for covering the entire central part of the
     */
    $scope.openGameFullDetails = function openGameFullDetails(game, competition, fromCustomWidget, fromLeftMenu, fully) {
        if ($scope.selectedGame && $scope.selectedGame.id === game.id ) {
            console.log("game already selected");
            return;
        }
        $scope.unsubscribeFromOpenGame();

        if (game.sport && $scope.customTemplateForSport[game.sport.id]) {
            return;
        }

        $scope.currentGameIsFinished = false;
        $scope.selectedMarketTab = {};
        $scope.marketsStatisticsState = {};
        openGameId = game.id;
        $scope.$broadcast('game.selected', openGameId);

        if (Config.main.customSportsBook.enabled && fromCustomWidget && !Config.main.customSportsBook.classic.showMarkets) {
            partner.handleGameClick(game, competition, $scope.selectedSport.id);
            return;
        }
        console.log('openGameFullDetails', game, competition);
        $scope.selectedGame = game;

        $scope.favoriteGameIsSelected = fully || $rootScope.myGames.indexOf(game.id) !== -1;
        $scope.favoriteGameFromLeftMenu = $scope.favoriteGameIsSelected && fromLeftMenu;

        if (competition) {
            $scope.selectedCompetition = competition;
        }

        $scope.openGameLoading = true;
        $scope.selectGame(game.id);
        $scope.openGame = {};
        if (Config.main.prefetchLeftMenuHoveredLivesGames.enabled
            && hoveredLiveGameFullData
            && hoveredLiveGameFullData.gameId === game.id
        ) {
            $scope.updateOpenGame(hoveredLiveGameFullData.gameData);
            $scope.openGameLoading = false;
        } else {
            var prematchGameRequest = ["id", "show_type", "markets_count", "start_ts", "is_live", "is_blocked", "is_neutral_venue","team1_id", "team2_id", "game_number", "text_info", "is_stat_available", "type", "info", "team1_name", "team2_name", "tv_info", "stats","add_info_name"];

            var request = {
                'source': 'betting',
                'what': {
                    'sport': ['id', 'name', 'alias'],
                    'competition': ['id', 'name'],
                    'region': ['id', 'alias', 'name'],
                    'game': (Config.env.live || initial)?
                        prematchGameRequest.concat([
                            "match_length",
                            "scout_provider",
                            "last_event",
                            "live_events",
                            "add_info_name"
                        ])
                        : prematchGameRequest,
                    'market': ["id", "col_count", "type", "name_template", "sequence", "point_sequence", "express_id", "cashout", "display_key", "display_sub_key", "group_id", "name", "group_name", "order", "extra_info", "group_order"],
                    'event': ["order", "id", "type_1", "type", "type_id", "original_order", "name", "price", "nonrunner", "ew_allowed", "sp_enabled", "extra_info", "base", "home_value", "away_value", "display_column"]
                },
                'where': {'game': {'id': game.id}}
            };
            Utils.addPrematchExpressId(request);

            if (initial) {
                initial = false;
            }

            if (game.sport && game.sport.id) {
                request.where.sport = {'id': game.sport.id};
            }

            if (game.region && game.region.id) {
                request.where.region = {'id': game.region.id};
            }

            if (game.competition && game.competition.id) {
                request.where.competition = {'id': game.competition.id};
            }

            if (Config.main.customSportsBook.classic.showLive === false || Config.main.customSportsBook.classic.showLive === 0) {
                request.where.game.type = {'@in': [0, 2]};
            } else if (Config.main.customSportsBook.classic.showPrematch === false || Config.main.customSportsBook.classic.showPrematch === 0) {
                request.where.game.type = 1;
            }

            connectionService.subscribe(
                request,
                $scope.updateOpenGame,
                {
                    'thenCallback': function (res) {
                        openGameSubId = res.subid;
                        $scope.openGameLoading = false;
                    },
                    'failureCallback': function () {
                        $scope.openGameLoading = false;
                    }
                },
                $location.path() === '/multiview/'
            );

            if (fully || game.type === 1) { //notify main to unsubscribe from previous subscriptions
                $scope.$emit('leftMenu.fullGmeSelected');
            }
        }
    };

    /**
     * @ngdoc method
     * @name initOpenedGame
     * @methodOf vbet5.controller:classicViewCenterController
     * @description Initialize multiView game every time, when the game was moved
     * @param {Object} game
     */
    $scope.initOpenedGame = function initOpenedGame(game) {
        $timeout(function () {
            $scope.openGameFullDetails(game);
        }, 0);
    };

    $scope.$on("leftMenu.hoveredLiveGameFullDataArrived", function (event, data) {
        if (data === undefined) {
            return;
        }

        hoveredLiveGameFullData = data;
    });

    /**
     * @ngdoc method
     * @name selectGame
     * @methodOf vbet5.controller:classicViewCenterController
     * @description Select game
     */
    $scope.selectGame = function (id) {
        console.log('selected game id: ' + id);
    };

    var lastAnimationType, lastAnimationSide, lastAnimationStart;
    /**
     * @ngdoc method
     * @name generateAutostopAnimationEvent
     * @methodOf vbet5.controller:classicViewCenterController
     * @description  generates animation event that will be stopped some time after occurring (Not used for now)
     * @param {Object} game game object
     */
    function generateAutostopAnimationEvent(game) {
        var theEvent = game.last_event;
        if (lastAnimationType === theEvent.type && lastAnimationSide === theEvent.side) {
            return;
        }
        var currentMinute = game.info.current_game_time || 0;
        var eventMinute = null;
        //event minute exists only for goal, corner, yellow and red card, for the rest events the timeout part will be working
        if (game.live_events.length && (game.live_events[game.live_events.length - 1].event_type === theEvent.type.toLowerCase())) {
            eventMinute = game.live_events[game.live_events.length - 1].add_info_order;
        }
        lastAnimationStart = new Date().getTime();

        if (currentMinute && eventMinute && (currentMinute - eventMinute > 2)) {
            theEvent.type = "";
        } else {
            TimeoutWrapper(function () {
                if (lastAnimationStart < new Date().getTime() - 9000) {
                    theEvent.type = "";
                }
            }, 10000);
        }
    }

    /**
     * @ngdoc method
     * @name toggleAnimationSound
     * @methodOf vbet5.controller:classicViewCenterController
     * @description  on/off saound of animation
     */
    $scope.toggleAnimationSound = function toggleAnimationSound(isMute) {
        if ($scope.openGame) {
            $scope.openGame.isAnimationMute = !isMute;
        }
    };

    /**
     * @ngdoc method
     * @name changeStatsMode
     * @methodOf vbet5.controller:classicViewCenterController
     * @description  changes live games stats mode from chart to details and back
     */
    $scope.changeStatsMode = function changeStatsMode(mode) {
        $scope.flipMode = mode;
    };

    /**
     * @ngdoc method
     * @name toggleStatsVisibility
     * @methodOf vbet5.controller:classicViewCenterController
     * @description  toggles live game statistics visibility
     */
    $scope.toggleStatsVisibility = function toggleStatsVisibility() {
        Config.env.hideLiveStats = !Config.env.hideLiveStats;
        $scope.showStatsBlock = !$scope.showStatsBlock;
    };


    /**
     * @ngdoc method
     * @name toggleLiveSectionPin
     * @methodOf vbet5.controller:classicViewCenterController
     * @description pins/unpin live score section at the top of middle section
     */
    $scope.toggleLiveSectionPin = function toggleLiveSectionPin() {
        $rootScope.env.isLiveGamePinned = !$rootScope.env.isLiveGamePinned;
        if ($rootScope.env.isLiveGamePinned && Config.env.hideLiveStats) {
            Config.env.hideLiveStats = false;
            $scope.showStatsBlock = !Config.env.hideLiveStats;
        }
        Storage.set('LiveGamePin', $rootScope.env.isLiveGamePinned);
    };

    if (Storage.get('LiveGamePin')) {
        $rootScope.env.isLiveGamePinned = Storage.get('LiveGamePin');
    }

    /**
     * @ngdoc method
     * @name bet
     * @methodOf vbet5.controller:classicViewCenterController
     * @description  sends a message to betslip[ to add a bet
     *
     * @param {Object} event event object
     * @param {Object} market event's market object
     * @param {Object} openGame game object
     * @param {String} [oddType] odd type (odd or sp)
     */
    $scope.bet = function bet(event, market, openGame, oddType) {
        oddType = oddType || 'odd';
        var game = Utils.clone(openGame);
        if (Config.main.phoneOnlyMarkets && Config.main.phoneOnlyMarkets.enable && game.type === 1) {
            return;
        }
        $rootScope.$broadcast('bet', {event: event, market: market, game: game, oddType: oddType});
    };

    $scope.expandedMarkets = {};


    /**
     * @ngdoc method
     * @name setActiveMarketTab
     * @methodOf vbet5.controller:classicViewCenterController
     * @description sets the active market tab
     * @param {Object} groupedMarkets
     * @param {Number} activeMarketId the id of selected market
     * @param {String} activeMarketName the name of market
     */
    $scope.setActiveMarketTab = function setNextEventMarket(groupedMarkets, activeMarketId, activeMarketName) {
        $scope.selectedMarketTab[groupedMarkets[0].type].id = activeMarketId;
        $scope.selectedMarketTab[groupedMarkets[0].type].name = activeMarketName;
    };

    /**
     * @ngdoc method
     * @name toggleGroupedMarket
     * @methodOf vbet5.controller:classicViewCenterController
     * @description expanding/collapsing grouped markets
     * @param {String} fullType grouped marketName
     */
    $scope.toggleGroupedMarket = function (fullType) {
        $scope.expandedMarkets[$scope.openGame.id][fullType] = !$scope.expandedMarkets[$scope.openGame.id][fullType];
    };



    /**
     * @ngdoc method
     * @name addToFavouriteMarkets
     * @methodOf vbet5.controller:classicViewCenterController
     * @description Adds market to favorites list for sport
     * @param {Object} market object
     */
    $scope.addToFavouriteMarkets = function addToFavouriteMarkets(market) {

        MarketService.toggleFavouriteMarket($scope.openGame, market, function() {
            divideMarketsArray();
        })
    };

    // Unable to find nicer way to do this
    $scope.$on('sportsbook.updateStatsBlockState', function (e, data) {
        $scope.showStatsBlock = !!data;
    });
}]);

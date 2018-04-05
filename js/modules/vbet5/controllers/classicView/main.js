/**
 * @ngdoc controller
 * @name vbet5.controller:classicViewMainCtrl
 * @description
 * Classic mode view controller
 */
angular.module('vbet5.betting').controller('classicViewMainCtrl', ['$rootScope', '$scope', '$controller', 'Config', 'ConnectionService', 'Utils', '$filter', '$location', 'TimeoutWrapper', '$q', 'Storage', 'GameInfo', '$window', 'partner', 'Moment', function ($rootScope, $scope, $controller, Config, ConnectionService, Utils, $filter, $location, TimeoutWrapper, $q, Storage, GameInfo, $window, partner, Moment) {
    'use strict';

    TimeoutWrapper = TimeoutWrapper($scope);
    var connectionService = new ConnectionService($scope);
    $scope.currentGameIsFinished = false;

    $rootScope.footerMovable = true;

    angular.extend(this, $controller('classicViewCenterController', {
        $rootScope: $rootScope,
        $scope: $scope,
        TimeoutWrapper: TimeoutWrapper,
        $filter: $filter,
        $q: $q,
        Config: Config,
        Utils: Utils,
        Storage: Storage,
        GameInfo: GameInfo,
        partner: partner
    }));

    var subIds = {
        todaysBets: null,
        todaysBetsSports: null,
        competitions: null,
        popularGames: null,
        outRightGames: null,
        teamGames: null
    };

    Config.env.liveStatsFlipMode = parseInt(Storage.get('liveStatsFlipMode') || Config.env.liveStatsFlipMode);
    $scope.flipMode = Config.env.liveStatsFlipMode;
    Config.env.preMatchMultiSelection = Storage.get('preMatchMultiSelection') === undefined ? Config.env.preMatchMultiSelection : Storage.get('preMatchMultiSelection');
    Config.env.hideLiveStats = Storage.get('hideLiveStats') || false;
    $scope.showStatsBlock = !Config.env.hideLiveStats;
    GameInfo.checkIfTimeFilterIsNeeded();
    $scope.hideVideoAndAnimationBox = false;
    $scope.isPopularGames = false;
    $scope.popularGamesLastState = false;
    $scope.showNewsBlock = !Config.betting.enableShowBetSettings;
    $scope.showNewsBetSet = true;
    $scope.marketsInOneColumn = { // Need to store value in an object to be able to change it from the directive
        enabled: false
    };
    $scope.marketFilterTypes = Config.main.GmsPlatform ? Config.main.marketFilterTypesGms : Config.main.marketFilterTypes;
    $scope.selectedMarketFilter = $scope.marketFilterTypes[0];
    $scope.competitionTimeGroupe = {};
    $scope.competitionNameGroupe = {};

    $scope.changeVolume = GameInfo.changeVolume;
    $scope.pinnedGames = {};
    $scope.enlargedGame = null;
    $scope.multiColumn = {
        show: Config.main.prematchMultiColumnEnabled ? (Storage.get('show_multi_column') !== undefined ? !!Storage.get('show_multi_column') : !Config.main.dontShowMulticolumnAsDefault) : false
    };

    $scope.sportsbookAvailableViews = Utils.checkForAvailableSportsbookViews(Config);
    $scope.customSportAliasFilter = Utils.getCustomSportAliasFilter();
    $scope.resizeButton = {
        live: Config.main.expandedRightInfoBlock.live,
        prematch: Config.main.expandedRightInfoBlock.prematch
    };

    /**
     * @ngdoc method
     * @name resizeRightInfoBlock
     * @methodOf vbet5.controller:classicViewMainCtrl
     * @description  resizes right info block (betslip, video, animations, etc.)
     */
    $scope.resizeRightInfoBlock = function resizeRightInfoBlock() {
        Config.env.live ? $scope.resizeButton.live = !$scope.resizeButton.live : $scope.resizeButton.prematch = !$scope.resizeButton.prematch;
    };

    /**
     * @ngdoc method
     * @name newsDependBetSetting
     * @methodOf vbet5.controller:classicViewMainCtrl
     * @description  show/hide News block, depend BetSetting
     */
    $scope.newsDependBetSetting = function () {
        $scope.showNewsBetSet = !$scope.showNewsBetSet;
    };

    /**
     * @ngdoc method
     * @name newsDependBetSlip
     * @methodOf vbet5.controller:classicViewMainCtrl
     * @description  show/hide News block, depend BetSlip
     */
    $scope.newsDependBetSlip = function () {
        $scope.showNewsBlock = !$scope.showNewsBlock;
    };

    /**
     * @ngdoc method
     * @name toggleVideoAndAnimationBox
     * @methodOf vbet5.controller:classicViewMainCtrl
     * @description  name says it all
     */
    $scope.toggleVideoAndAnimationBox = function toggleVideoAndAnimationBox() {
        $scope.hideVideoAndAnimationBox = !$scope.hideVideoAndAnimationBox;
    };

    /**
     * @ngdoc method
     * @name saveMultiColumnState
     * @methodOf vbet5.controller:classicViewMainCtrl
     * @description  name says it all
     */
    $scope.saveMultiColumnState = function saveMultiColumnState() {
        Storage.set('show_multi_column', !!$scope.multiColumn.show);
    };

    /**
     * @ngdoc method
     * @name animationSoundOn
     * @methodOf vbet5.controller:classicViewMainCtrl
     * @description  indicates the animation sound state
     */
    $scope.animationSoundOn = function animationSoundOn() {
        return $scope.openGame && !$scope.openGame.isAnimationMute && $scope.openGame.activeFieldType !== 'video' && Config.env.sound > 0 && !$scope.hideVideoAndAnimationBox && !$scope.isVideoDetached;
    };

    $rootScope.myGames = Storage.get('myGames') || [];

    // will be stored route params if there is, and will be loaded the view depend on this object
    $scope.userActivity = {0: {},1: {}};

    $scope.isInArray = Utils.isInArray;
    $scope.setSound = GameInfo.setSound;
    $scope.animationSoundsMap = GameInfo.animationSoundsMap;
    $scope.visibleSetsNumber = 5; // number of sets to be visible for multiset games

    /**
     * Today's Bets
     */
    $scope.toDay = Moment.get().unix();

    $scope.$on('leftMenu.closed', function (event, isClosed) {
        $scope.leftMenuClosed = isClosed;
    });

    $scope.$on('login.loggedOut', function() {
        if($scope.enlargedGame) {
            $scope.attachPinnedVideo($scope.enlargedGame, 'fullScreen');
        }
    });

    $scope.$on("leftmenu.virtualSportsSelected", function(event, value){ $scope.virtualSportsSelected = value; });
    $scope.$on("leftmenu.outrightSelected", function(event, value){ $scope.outrightSelected = value; });

    (function() {
        var envType;
        switch (true) {
            case Config.main.customSportsBook.classic.showLive === false || Config.main.customSportsBook.classic.showLive === 0:
                envType = 0;
                break;
            case Config.main.customSportsBook.classic.showPrematch === false || Config.main.customSportsBook.classic.showPrematch === 0:
                envType = 1;
                break;
            case undefined === $location.search():
                envType = Config.main.classicViewDefaultType;
                break;
        }
        if (envType !== undefined)
        {
            $location.search('type', envType);
            Config.env.live = !!envType;
        }

    })();

    /**
     * @ngdoc method
     * @name toggleLive
     * @methodOf vbet5.controller:classicViewMainCtrl
     * @description Toggles  live/pre-match
     */
    function toggleLive() {
        if (Config.env.live) {
            $scope.popularGamesLastState = $scope.isPopularGames;
        } else if ($scope.popularGamesLastState) {
            $scope.loadPopularGames(true);
        }
    }

    $scope.$on('toggleLive', toggleLive);

    /**
     * @description selects live prematch tab from dashboard
     * @param type sport type live/prematch
     */
    $scope.selectSportTabFromDashboard = function selectSportTabFromDashboard(type) {
        if (type === 1) {
            Config.env.live = true
        }
        $location.search('type', type);
        $location.path('/sport');
    };

    $scope.$on("leftMenu.gameClicked", function (event, data) {
        if ($location.path() === '/multiview/') {
            return;
        }

        $scope.openGameFullDetails(data.game, data.competition, false, true, data.fully);
    });

    $scope.$on('subscribeForTodaysBetsSports', subscribeForTodaysBetsSports);

    /**
     * @ngdoc method
     * @name updateTodaysBetsSportList
     * @methodOf vbet5.controller:classicViewMainCtrl
     * @description Update todays bets sport list
     * @param callback data
     */
    function updateTodaysBetsSportList (data) {
        $scope.todaysBetsSports = Utils.objectToArray(data.sport);
        $scope.todaysBetsSports.sort(Utils.orderSorting);
    }

    /**
     * @ngdoc method
     * @name subscribeForTodaysBetsSports
     * @methodOf vbet5.controller:classicViewMainCtrl
     * @description
     */
    function subscribeForTodaysBetsSports() {
        unsubscribeOldSubscriptions('todaysBetsSports');

        var dayShift, startTime, endTime;
        if ($location.search().dayshift) {
            dayShift = $location.search().dayshift;
            startTime = Moment.get().add(dayShift, 'days').startOf("day").unix();
            endTime = Moment.get().add(dayShift, 'days').endOf("day").unix();
            $location.search('dayshift', undefined);
        } else {
            startTime = Moment.get().unix();
            endTime = Config.main.todayBets.timeShift ? startTime + Config.main.todayBets.timeShift : Moment.get().add(0, 'days').endOf("day").unix();
        }

        var request = {
            'source': 'betting',
            'what': {'sport': ['id', 'name', 'alias', 'order'], 'game': '@count'},
            'where': {
                'game': {
                    'type': Config.main.GmsPlatform ? {'@in':[0,2]} : 0,
                    'start_ts': {
                        '@gte': startTime,
                        '@lt': endTime
                    }
                }

            }
        };
        Utils.setCustomSportAliasesFilter(request);
        connectionService.subscribe(
            request,
            updateTodaysBetsSportList,
            {
                'thenCallback': function (result) {
                    if (result.subid) {
                        subIds.todaysBetsSports = result.subid;
                    }

                    if (result.data) {
                        $scope.todaysBetsSelected = true;
                        $scope.expandTodaysBets($scope.todaysBetsSelectedSport || $scope.todaysBetsSports[0], startTime, endTime);
                    }
                }
            }
        );
    }

    /**
     * @ngdoc method
     * @name unsubscribeOldSubscriptions
     * @methodOf vbet5.controller:classicViewMainCtrl
     * @description
     */
    function unsubscribeOldSubscriptions(exceptedKey) {
        var item;
        for (item in subIds) {
            if (item !== exceptedKey && subIds[item] !== null) {
                connectionService.unsubscribe(subIds[item]);
                subIds[item] = null;
            }
        }
    }

    /**
     * @ngdoc method
     * @name updatePrematchGames
     * @methodOf vbet5.controller:classicViewMainCtrl
     * @description  Updates pre-mach games list (middle column)
     * @param {Object} data game data
     */
    function updatePrematchGames(data) {
        $scope.prematchGameViewData = [];
        angular.forEach(data.sport, function (sport) {
            angular.forEach(sport.region, function (region) {
                angular.forEach(region.competition, function (competition) {
                    if (!Config.main.GmsPlatform) {
                        competition.name = $filter('removeParts')(competition.name, [sport.name]);
                    }
                    angular.forEach(competition.game, function (game) {
                        game.sport = {id: sport.id, alias: sport.alias, name: sport.name};
                        game.region = {id: region.id, name: region.name, alias: region.alias};
                        game.competition = {id: competition.id, order: competition.order};
                        game.firstMarket = Utils.getFirstMarket(game.market, $filter);
                        game.additionalEvents = Config.main.showEventsCountInMoreLink ? game.events_count : game.markets_count;
                        game.groupDate = Date.parse((moment(game.start_ts*1000).utcOffset(Config.env.selectedTimeZone || 0).lang("en").format("YYYY-MM-DD")))/1000;
                        if(Config.main.showPlayerRegion) {
                            game.team1_name = game.team1_reg_name && game.team1_name.indexOf(game.team1_reg_name) === -1 ? game.team1_name + ' (' + game.team1_reg_name + ')' : game.team1_name;
                            game.team2_name = game.team2_reg_name && game.team2_name.indexOf(game.team2_reg_name) === -1 ? game.team2_name + ' (' + game.team2_reg_name + ')' : game.team2_name;
                        }
                        $scope.showMarketsFilter = false;

                        if (game.sport.alias !== 'Soccer' && Config.main.enableMarketFiltering) {
                            $scope.selectedMarketFilter = $scope.marketFilterTypes[0];
                        }

                        if (Config.main.enableMarketFiltering && game.sport.alias === 'Soccer') {
                            $scope.showMarketsFilter = true;
                            game.filteredMarkets = Utils.groupByItemProperty(game.market, 'type');
                            angular.forEach($scope.marketFilterTypes, function (filter) {
                                var key = filter.type;
                                if (game.filteredMarkets && game.filteredMarkets[key]) {
                                    if (filter.base) {
                                        key = filter.type + filter.base;
                                        var events = Utils.groupByItemProperty(game.filteredMarkets[filter.type], 'base');
                                        if (!game.filteredMarkets[key]) {
                                            game.filteredMarkets[key] = {};
                                        }
                                        game.filteredMarkets[key].events = events[filter.base] ? Utils.objectToArray(events[filter.base][0].event) : '';
                                    } else if (game.filteredMarkets[key].length > 1 && game.filteredMarkets[key][0].base) {
                                        angular.forEach(game.filteredMarkets[key], function (market) {
                                            if (market.base === Utils.getDefaultSelectedMarketBase(game.filteredMarkets[key])) {
                                                game.filteredMarkets[key].events = Utils.objectToArray(market.event);
                                            }
                                        });

                                    } else {
                                        game.filteredMarkets[key].events = Utils.objectToArray(game.filteredMarkets[key][0].event);
                                    }
                                    if (game.filteredMarkets[key].events) {
                                        game.filteredMarkets[key].events.sort(Utils.orderSortin);
                                        if (game.filteredMarkets[key].events.length === 2) {
                                            game.filteredMarkets[key].events.splice(1, 0, {});

                                        }
                                        angular.forEach(game.filteredMarkets[key].events, function (event) {
                                            event.name = $filter('improveName')(event.name, game);
                                        });
                                    }

                                }
                            });

                        } else if (game.firstMarket) {
                            game.firstMarket.events = Utils.createMapFromObjItems(game.firstMarket.event, 'type');
                            //if (Config.main.replaceP1P2WithTeamNames) {
                            angular.forEach(game.firstMarket.events, function (event) {
                                event.name = $filter('improveName')(event.name, game);
                            });
                            //}

                            if (!Config.main.showEventsCountInMoreLink) {
                                game.additionalEvents--;
                            } else {
                                game.additionalEvents -= $filter('count')(game.firstMarket.events);
                            }
                        }
                    });
                    competition.games = Utils.objectToArray(competition.game).sort(function (a, b) {
                        return a.start_ts - b.start_ts;
                    });
                    if(Config.main.sportsLayout === 'euro2016') {
                        competition.gamesGroupedByDate = Utils.groupByItemProperty(competition.games, 'groupDate');
                    }

                    if (!$location.search().game && $scope.selectedCompetition && competition.id === $scope.selectedCompetition.id) {
                        expandFullGameDetails(competition);
                    }
                    $scope.prematchGameViewData.push(competition);
                });
            });
        });

        $scope.prematchGamesLoading = false;
        $scope.multiColumn.show && $scope.$broadcast('multiColumn.games', 'update');

        $scope.isPopularGamesLoadedFlag = true;
        if ($location.search().sport === -12 && !Utils.isObjectEmpty(data.sport))
        {
            $scope.$broadcast('topGamesAreLoaded');
        }
    }

    /**
     * @ngdoc method
     * @name selectGame
     * @methodOf vbet5.controller:classicViewMainCtrl
     * @description Select game
     * @param {Number} gameId the game id
     */
    $scope.selectGame = function selectGame(gameId) {
        var type = Number(Config.env.live);
        $location.search('game', gameId);
        $scope.userActivity[type].selectedGameId = gameId;
    };

    /**
     * @ngdoc method
     * @name expandFullGameDetails
     * @description automaticly expand game full detalis when we have game
     * @methodOf vbet5.controller:classicViewMainCtrl
     * @param {object} competition competition
     */
    function expandFullGameDetails(competition) {
        console.log('expandFullGameDetails', competition);
        if (!competition.game) {
            return;
        }
        var games = Utils.objectToArray(competition.game);
        if (!games) {
            return;
        }
        var gameToOpen,
            type = Number(Config.env.live);

        var deepLinkedGameId = $location.search().game ? parseInt($location.search().game, 10) : null;
        if (deepLinkedGameId && Utils.getArrayObjectElementHavingFieldValue(games, 'id', deepLinkedGameId)) {
            gameToOpen = Utils.getArrayObjectElementHavingFieldValue(games, 'id', deepLinkedGameId);
        } else {
            gameToOpen = games[0];
        }
        if ((competition.expanded && gameToOpen.id !== $scope.userActivity[type].selectedGameId) || !$scope.openGame) {
            $scope.openGameFullDetails(gameToOpen, competition);
        }
    }

    /**
     * @ngdoc method
     * @name loadPopularGames
     * @description Loads popular games
     * @methodOf vbet5.controller:classicViewMainCtrl
     */
    $scope.loadPopularGames = function loadPopularGames() {
        unsubscribeOldSubscriptions('popularGames');

        if ($scope.isPopularGames) {
            $scope.resetPrematchMultiView(true);
            return;
        }

        $scope.resetPrematchMultiView(true);

        $scope.favoriteGameIsSelected = false;
        $scope.outrightSelected = false;
        $scope.favoriteTeamExpanded = false;

        var request = {
            'source': 'betting',
            'what': {
                'sport': ['id', 'name', 'alias'],
                'competition': ['id', 'order', 'name'],
                'region': ['id', 'name', 'alias'],
                game: [
                    ['id', 'start_ts', 'team1_name', 'team2_name', 'team1_reg_name', 'team2_reg_name', 'team1_external_id', 'team2_external_id', 'type',
                        'info', 'events_count', 'markets_count', 'extra', 'is_blocked', 'exclude_ids', 'is_stat_available', 'game_number', 'game_external_id', 'is_live', 'is_neutral_venue']
                ],
                'event': ['id', 'price', 'type', 'name', 'order', 'price_change'],
                'market': ['type', 'express_id', 'name', 'display_key', 'display_sub_key', 'main_order']
            },
            'where': {}
        };

        if (Config.env.gameTimeFilter) {
            request.where.game = {start_ts : Config.env.gameTimeFilter};
        }

        $scope.isPopularGames = false;

        if (Config.main.loadPopularGamesForSportsBook.type1x1) {
            request.where.event = {type: {'@in': ['P1', 'X', 'P2']}};
        }

        request.where[Config.main.loadPopularGamesForSportsBook.level] = {};
        request.where[Config.main.loadPopularGamesForSportsBook.level][Config.main.loadPopularGamesForSportsBook.type] = true;

        Utils.setCustomSportAliasesFilter(request);

        $scope.isPopularGames = true;
        $scope.prematchGamesLoading = true;
        $scope.favoriteTeamExpanded = false;

        Storage.set('isPopularGames', $scope.isPopularGames);


        connectionService.subscribe(
            request,
            updatePrematchGames,
            {
                'thenCallback': function (result) {
                    $scope.$broadcast('popularGamesAreLoaded', result.data);
                    if (result.subId) {
                        subIds.popularGames = result.subId;
                    }
                },
                'failureCallback': function () {
                    $scope.prematchGamesLoading = false;
                }
            }
        );
    };

    /**
     * @ngdoc method
     * @name resetPrematchMultiView
     * @description Reset prematch multi view
     * @methodOf vbet5.controller:classicViewMainCtrl
     */
    $scope.resetPrematchMultiView = function resetPrematchMultiView() {
        $scope.isPopularGames = false;
        $scope.$parent.$broadcast('prematchMultiView.reset');
    };

    var prematchMultiViewGameIds;
    $scope.$on("prematchMultiView.games", function (event, games) {
        prematchMultiViewGameIds = [];
        angular.forEach(games, function (val, id) {
            if (val) {
                prematchMultiViewGameIds.push(parseInt(id, 10));
            }
        });
        $scope.loadPrematchMultiView();
    });

    $scope.$on("prematchMultiView.changeIsPopularGames", function (event, isPopularGames) {
        $scope.isPopularGames = isPopularGames;
    });

    /**
     * @ngdoc method
     * @name loadPrematchMultiView
     * @description Load prematch multi view
     * @methodOf vbet5.controller:classicViewMainCtrl
     */
    $scope.loadPrematchMultiView = function loadPrematchMultiView() {
        $scope.favoriteGameIsSelected = false;
        $scope.favoriteTeamExpanded = false;

        var requestMarketTypes = ['P1P2'];
        angular.forEach($scope.marketFilterTypes, function (fType) {
            requestMarketTypes.push(fType.type);
        });

        var request = {
            'source': 'betting',
            'what': {
                'sport': ['id', 'name', 'alias'],
                'competition': ['id', 'order', 'name'],
                'region': ['id', 'name', 'alias'],
                game: [
                    ['id', 'start_ts', 'team1_name', 'team2_name', 'team1_external_id', 'team2_external_id', 'type', 'info', 'events_count', 'markets_count', 'extra', 'is_blocked', 'exclude_ids', 'is_stat_available', 'game_number', 'game_external_id', 'is_live', 'is_neutral_venue']
                ],
                'event': ['id', 'price', 'type', 'name', 'order', 'base', 'price_change'],
                'market': ['type', 'express_id', 'name', 'base', 'display_key', 'display_sub_key', 'main_order']
            },
            'where': {
                'game': {'type': Config.main.GmsPlatform ? {'@in': [0, 2]} : 0 , 'id': {'@in': prematchMultiViewGameIds}}
            }
        };

        addMarketTypesInRequest(request, requestMarketTypes);

        if (Config.env.gameTimeFilter) {
            request.where.game.start_ts = Config.env.gameTimeFilter;
        }
        Utils.setCustomSportAliasesFilter(request);
        connectionService.subscribe(
            request,
            updatePrematchGames,
            {
                'failureCallback': function () {
                    $scope.prematchGamesLoading = false;
                }
            }
        );
    };

    /**
     * @ngdoc method
     * @name openStatistics
     * @methodOf vbet5.controller:classicViewMainCtrl
     * @description
     * Opens statistics in popup window
     *
     * @param {Object} game game object
     */

    $scope.openStatistics = function openStatistics(game) {
        $window.open(GameInfo.getStatsLink(game), game.id, "width=940,height=600,resizable=yes,scrollbars=yes");
    };

    $scope.$on('prematch.expandCompetition', function (event, data) {
        if (Config.env.live) {
            return;
        }
        console.log('classicView: expandCompetition', event, data.competition, data.sport);
        $scope.expandCompetition(data.competition, data.sport);
    });

    $scope.$on('openTodayBets', function() {
        $scope.todaysBetsSelected = true;
    });

    $scope.$on('sportsbook.gameFinished', function() {
        $scope.currentGameIsFinished = true;
        TimeoutWrapper(function() {
            if($scope.prematchGameViewData && $scope.prematchGameViewData[0] && $scope.prematchGameViewData[0].games && $scope.currentGameIsFinished) {
                $scope.openGameFullDetails($scope.prematchGameViewData[0].games[0]);
                $scope.currentGameIsFinished = false;
            }
        }, 5000);
    });

    /**
     * @ngdoc method
     * @name expandCompetition
     * @methodOf vbet5.controller:classicViewMainCtrl
     * @description  updates open game data object
     *
     * @param {Object} competition competition object
     */
    $scope.expandCompetition = function expandCompetition(competition, sport) {
        $scope.todaysBetsSelected = false;
        $scope.favoriteTeamExpanded = false;
        $scope.isPopularGames = false;
        $scope.prevCompetition = [competition, sport];

        if (!competition || (Config.env.preMatchMultiSelection && !Config.env.live)) {
            return;
        }

        if (sport && !sport.isVirtualSport) {
            $scope.virtualSportsSelected = false;
        }

        $scope.selectedCompetition = competition;
        $scope.multiColumn.show && $scope.$broadcast('multiColumn.games', 'loadLive');
        $scope.selectedSport = sport || $scope.selectedSport;
        $scope.selectedRegion = competition.region || $scope.selectedRegion;

        if (Config.env.live) {
            competition.expanded = !competition.expanded;
            // open game full detalis when we are in live mode
            expandFullGameDetails(competition);
        } else {
            $scope.favoriteGameIsSelected = false;
            if ($location.search().game && (!$scope.openGame || $scope.openGame.id !== Number($location.search().game))) { //open if deeplinked and different from now open
                $scope.openGameFullDetails({id: Number($location.search().game)});
            }

            $scope.prematchGamesLoading = true;
            $scope.favoriteTeamExpanded = false;

            var requestMarketTypes = ['P1P2'];
            if ((competition.sport_alias && competition.sport_alias === 'Soccer') || sport.alias === 'Soccer' || sport.alias === 'UFS' ) {
                angular.forEach($scope.marketFilterTypes, function (fType) {
                    requestMarketTypes.push(fType.type);
                });
            } else if ($scope.marketFilterTypes[0].type !== 'P1P2') {
                requestMarketTypes.push($scope.marketFilterTypes[0].type);
                requestMarketTypes.push('Handicap');
            }

            var request = {
                'source': 'betting',
                'what': {
                    'sport': ['id', 'name', 'alias'],
                    'competition': ['id', 'name'],
                    'region': ['id', 'name', 'alias'],
                    game: [
                        ['id', 'start_ts', 'team1_name', 'team2_name', 'team1_external_id', 'team2_external_id','team1_id', 'team2_id', 'type', 'show_type', 'info', 'events_count', 'markets_count', 'extra', 'is_blocked', 'exclude_ids', 'is_stat_available', 'game_number', 'game_external_id', 'is_live', 'is_neutral_venue']
                    ],
                    'event': ['id', 'price', 'type', 'name', 'order', 'base', 'price_change'],
                    'market': ['type', 'express_id', 'name', 'base', 'display_key', 'display_sub_key', 'main_order']
                },
                'where': {
                    'competition': {'id': parseInt(competition.id, 10)},
                    'game': (Config.main.enableVisibleInPrematchGames && !Config.env.live ? {
                        '@or': ([{'type': Config.env.live ? 1 : Config.main.GmsPlatform ? {'@in':[0,2]} : 0}, {
                            'visible_in_prematch': 1,
                            'type': 1
                        }])
                    } : {'type': Config.env.live ? 1 : Config.main.GmsPlatform ? {'@in':[0,2]} : 0}),
                    'market': null
                }
            };

            addMarketTypesInRequest(request, requestMarketTypes);

            if ($rootScope.myGames && $rootScope.myGames.length && Config.main.separateFavoritesInClassic) {
                request.where.game.id = {'@nin': $rootScope.myGames};
            }

            if ($scope.selectedUpcomingPeriod && !Config.env.live) {
                request.where.game.start_ts = {'@now': {'@gte': 0, '@lt': $scope.selectedUpcomingPeriod * 3600}};
            } else if (Config.env.gameTimeFilter) {
                request.where.game.start_ts = Config.env.gameTimeFilter;
            }
            /*Utils.setCustomSportAliasesFilter(request);*/
            connectionService.subscribe(
                request,
                updatePrematchGames,
                {
                    'thenCallback': function (result) {
                        if (result.subid) {
                            competition.gamesSubId = result.subid;
                            subIds.competitions = result.subid;
                        }
                    },
                    'failureCallback': function () {
                        $scope.prematchGamesLoading = false;
                    }
                }
            );

            unsubscribeOldSubscriptions('competitions');
        }

        competition.active = !competition.active;
    };

    /**
     * @ngdoc method
     * @name addMarketTypesInRequest
     * @methodOf vbet5.controller:classicViewMainCtrl
     * @description  added market types in request
     *
     * @param {Object} request object
     * @param {Object} requestMarketTypes object
     */
    function addMarketTypesInRequest(request, requestMarketTypes) {
        if (Config.main.GmsPlatform && Config.main.prematchMultiColumnEnabled) {
            request.where.market = {'@or': [
                {'type': {'@in': requestMarketTypes}},
                {'display_key': {'@in': ['WINNER', 'HANDICAP', 'TOTALS']}}
            ]};
        } else {
            request.where.market = {'type': {'@in': requestMarketTypes}};
        }
    }

    $scope.$on('prematch.expandFavoriteTeam', function (event, data) {
        $scope.expandFavoriteTeam(data.team);
    });

    /**
     * @ngdoc method
     * @name expandCompetition
     * @methodOf vbet5.controller:classicViewMainCtrl
     * @description  updates open game data object
     *
     * @param {Object} team favorite team object
     */
    $scope.expandFavoriteTeam = function expandFavoriteTeam(team) {
        if (!team || (Config.env.preMatchMultiSelection && !Config.env.live)) {
            return;
        }

        $scope.virtualSportsSelected = false;
        $scope.favoriteTeamExpanded = true;
        $scope.prematchGamesLoading = true;

        var requestMarketTypes = ['P1P2'];
        angular.forEach($scope.marketFilterTypes, function (fType) {
            requestMarketTypes.push(fType.type);
        });

        var request = {
            'source': 'betting',
            'what': {
                'sport': ['id', 'name', 'alias'],
                'competition': ['id', 'name'],
                'region': ['id', 'name', 'alias'],
                game: [
                    ['id', 'start_ts', 'team1_name', 'team2_name', 'team1_external_id', 'team2_external_id', 'type', 'info', 'events_count', 'markets_count', 'extra', 'is_blocked', 'exclude_ids', 'is_stat_available', 'game_number', 'game_external_id', 'is_live', 'is_neutral_venue']
                ],
                'event': ['id', 'price', 'type', 'name', 'order', 'base', 'price_change'],
                'market': ['type', 'express_id', 'name', 'base', 'display_key', 'display_sub_key', 'main_order']
            },
            'where': {
                'game': {
                    '@or': [
                        {'team1_id': team.id},
                        {'team2_id': team.id}
                    ],
                    'type': Config.main.GmsPlatform ? {'@in':[0,2]} : 0
                },
                'market': {'type': {'@in': requestMarketTypes}}
            }
        };
        Utils.setCustomSportAliasesFilter(request);
        connectionService.subscribe(
            request,
            updatePrematchGames,
            {
                'thenCallback': function (result) {
                    if (result.subid) {
                        team.gamesSubId = result.subid;
                        subIds.teamGames = result.subid;
                    }
                },
                'failureCallback': function () {
                    $scope.prematchGamesLoading = false;
                }
            }
        );

        unsubscribeOldSubscriptions('teamGames');

        $scope.favoriteGameIsSelected = false;
        if ($location.search().game && (!$scope.openGame || $scope.openGame.id !== Number($location.search().game))) { 
            //open if deeplinked and different from now open
            $scope.openGameFullDetails({id: Number($location.search().game)});
        }
    };

    /**
     * @ngdoc method
     * @name updateTodaysBetsGames
     * @description Update todays bets games
     * @methodOf vbet5.controller:classicViewMainCtrl
     * @param {Object} prematch games callback data
     */
    function updateTodaysBetsGames(data) {
        updatePrematchGames(data);
        var prematchGameViewData = [];
        var first = true;

        angular.forEach($scope.prematchGameViewData, function (competition) {
            if (first) {
                first = false;
                prematchGameViewData.push(competition);
                return 0;
            }
            prematchGameViewData[0].games = prematchGameViewData[0].games.concat(competition.games);
        });

        prematchGameViewData[0].games = prematchGameViewData[0].games.sort(function (a, b) {
            return a.start_ts - b.start_ts;
        });

        if(Config.main.sportsLayout === 'euro2016') {
            prematchGameViewData[0].gamesGroupedByDate = Utils.groupByItemProperty(prematchGameViewData[0].games, 'groupDate');
        }

        $scope.prematchGameViewData = prematchGameViewData;
    }

    /**
     * @ngdoc method
     * @name expandTodaysBets
     * @methodOf vbet5.controller:classicViewMainCtrl
     *
     * @param {Object} sport sport object
     */
    $scope.expandTodaysBets = function expandTodaysBets(sport, startTime, endTime) {
        if (!sport) {
            return;
        }
        $scope.todaysBetsSelectedSport = sport;
        $scope.prematchGamesLoading = true;
        $scope.favoriteTeamExpanded = false;


        var dayShift;
        if ($location.search().dayshift) {
            dayShift = $location.search().dayshift;
            startTime = Moment.get().add(dayShift, 'days').startOf("day").unix();
            endTime = Moment.get().add(dayShift, 'days').endOf("day").unix();
            $location.search('dayshift', undefined);
        } else if (!startTime && !endTime) {
            startTime = Moment.get().unix();
            endTime = Config.main.todayBets.timeShift ? startTime + Config.main.todayBets.timeShift : Moment.get().add(0, 'days').endOf("day").unix();
        }


        var request = {
            'source': 'betting',
            'what': {
                'sport': ['id', 'name', 'alias', "order"],
                'region': ['id', 'name'],
                'competition': ['id'],
                game: [
                    ['id', 'start_ts', 'team1_name', 'team2_name', 'team1_external_id', 'team2_external_id', 'type', 'info', 'events_count', 'markets_count', 'extra', 'is_blocked', 'exclude_ids', 'is_stat_available', 'game_number', 'is_live','is_neutral_venue']
                ],
                'market': ['type', 'express_id', 'name'],
                'event': ['id', 'price', 'type', 'name', 'order']
            },
            'where': {
                //'competition': {'id': parseInt(competition.id, 10)},
                "sport": {
                    "id": {"@in": [sport.id]}
                },
                'game': {
                    type: Config.main.GmsPlatform ? {'@in':[0,2]} : 0,
                    start_ts: {
                        '@gte': startTime,
                        '@lt': endTime
                    }
                },
                'market': {'type': {'@in': ['P1XP2', 'P1P2']}}
            }
        };

        if ($rootScope.myGames && $rootScope.myGames.length && Config.main.separateFavoritesInClassic) {
            request.where.game.id = {'@nin': $rootScope.myGames};
        }
        /*Utils.setCustomSportAliasesFilter(request);*/
        connectionService.subscribe(
            request,
            updateTodaysBetsGames,
            {
                'thenCallback': function (result) {
                    if (result.subid) {
                        subIds.todaysBets = result.subid;
                    }
                },
                'failureCallback': function () {
                    $scope.prematchGamesLoading = false;
                }
            }
        );
    };

    /**
     * @ngdoc method
     * @name toggleGameFavorite
     * @methodOf vbet5.controller:classicViewMainCtrl
     * @description  adds or removes(depending on if it's already there) game from 'my games' by emitting an event
     * @param {Object} game game object
     */
    $scope.toggleGameFavorite = function toggleGameFavorite(game) {
        $rootScope.$broadcast('game.toggleGameFavorite', game);
        console.log('$scope.favorites', $scope.favorites);
    };

    /**
     * @ngdoc method
     * @name detachVideo
     * @methodOf vbet5.controller:classicViewMainCtrl
     * @description called when video is detached. Sends game object to parent scope to show game video there
     *
     */
    $scope.detachVideo = function detachVideo(type) {
        $scope.pinnedGameType = type;
        $scope.isVideoDetached = true;

        if (!Config.main.defaultStreaming || !Config.main.defaultStreaming.enabled || $scope.openGame.tv_type !== Config.main.defaultStreaming.tvType) {
            $scope.openGame.video_data = null;
            GameInfo.getVideoData($scope.openGame);
        }

        if (type === 'dragable') {
            $scope.pinnedGames[$scope.openGame.id] = $scope.openGame;
        } else {
            $scope.enlargedGame = $scope.openGame;
            $scope.pinnedGames = {};
        }
    };

    /**
     * @ngdoc method
     * @name attachVideo
     * @methodOf vbet5.controller:classicViewMainCtrl
     * @description called when we get message from parent scope that detached video is reattached.
     * All single game scopes get this message so we have to look at check received game object id to check if
     * it is for current game
     *
     */
    $scope.attachPinnedVideo = function attachPinnedVideo(game, type) {
        if (type === 'dragable') {
            delete $scope.pinnedGames[game.id];
        } else {
            $scope.enlargedGame = null;
        }

        if (game && game.id === $scope.openGame.id) {
            if (!Config.main.defaultStreaming || !Config.main.defaultStreaming.enabled || $scope.openGame.tv_type !== Config.main.defaultStreaming.tvType) {
                $scope.openGame.video_data = null;
                GameInfo.getVideoData($scope.openGame);
            }
            $scope.isVideoDetached = false;
            $scope.openGame.activeFieldType = 'video'; //
        }
    };

    /**
     * @ngdoc method
     * @name selectPrematchTimePeriod
     * @methodOf vbet5.controller:classicViewMainCtrl
     * @description  sets pre-match time period and reloads left menu
     *
     * @param {Number} hours number of hours, 0 for no filtering
     */
    $scope.selectMarketFilter = function selectMarketFilter(marketFilterField) {
        $scope.selectedMarketFilter = marketFilterField;

    };

    /**
     * @ngdoc method
     * @name changeStatsMode
     * @methodOf vbet5.controller:classicViewMainCtrl
     * @description  changes live games stats mode from chart to details and back
     */
    $scope.changeStatsMode = function changeStatsMode(mode) {
        Config.env.liveStatsFlipMode = mode;
        $scope.flipMode = mode;
        Storage.set('liveStatsFlipMode', Config.env.liveStatsFlipMode);
    };

    /**
     * @ngdoc method
     * @name toggleStatsVisibility
     * @methodOf vbet5.controller:classicViewMainCtrl
     * @description  toggles live game statistics visibility
     */
    $scope.toggleStatsVisibility = function toggleStatsVisibility() {
        Config.env.hideLiveStats = !Config.env.hideLiveStats;
        $scope.showStatsBlock = !Config.env.hideLiveStats;
        Storage.set('hideLiveStats', Config.env.hideLiveStats);
    };

    $scope.$on('populateOutright', function() {
        TimeoutWrapper(populateOutright);
    });

    /**
     * @ngdoc method
     * @name populateOutright
     * @methodOf vbet5.controller:classicViewMainCtrl
     * @description populates games with OUTRIGHT market
     */
    function populateOutright() {
        unsubscribeOldSubscriptions('outRightGames');

        $scope.favoriteGameIsSelected = false;
        $scope.isPopularGames = false;
        $scope.favoriteTeamExpanded = false;

        var request = {
            'source': 'betting',
            'what': {
                competition: ['name', 'order', 'id'],
                game: ['id','start_ts', 'team1_name', 'team2_name']
            },
            'where': {
                'market': {'display_key': "OUTRIGHT"}
            }
        };

        $scope.prematchGamesLoading = true;
        Utils.setCustomSportAliasesFilter(request);
        connectionService.subscribe(
            request,
            updateOutrightGames,
            {
                'thenCallback': function (result) {
                    if (result.subid) {
                        subIds.outRightGames = result.subid;
                    }
                },
                'failureCallback': function () {
                    $scope.prematchGamesLoading = false;
                }
            }
        );
    }

    /**
     * @ngdoc method
     * @name updateOutrightGames
     * @description Update outright games
     * @methodOf vbet5.controller:classicViewMainCtrl
     * @param {Object} response data
     */
    function updateOutrightGames(data) {
        console.log('OUTRIGHT', data);
        var prematchGameViewData = [];
        if(Config.main.sportsLayout === 'euro2016') {
            addGroupDateToOutright(data.competition);
        }
        angular.forEach(data.competition, function (competition) {
            if(competition.game) {
                if(Config.main.sportsLayout === 'euro2016') {
                    competition.gamesGroupedByDate = Utils.groupByItemProperty(competition.game, 'groupDate');
                }
                competition.games = Utils.objectToArray(competition.game).sort(function (a, b) {
                    return a.start_ts - b.start_ts;
                });
            }
           prematchGameViewData.push(competition);
        });
        $scope.prematchGameViewData = prematchGameViewData;
        $scope.prematchGamesLoading = false;
    }

    /**
     * @ngdoc method
     * @name addGroupDateToOutright
     * @description Add group date to outright
     * @methodOf vbet5.controller:classicViewMainCtrl
     * @param {Object} competition object
     */
    function addGroupDateToOutright(competitions) {
        angular.forEach(competitions, function(competition) {
            angular.forEach(competition.game, function(game) {
                game.groupDate = Date.parse((moment(game.start_ts*1000).format("YYYY-MM-DD")))/1000;
            }) ;
        });
    }

    /**
     * @ngdoc method
     * @name bet
     * @methodOf vbet5.controller:gameCtrl
     * @param {Object} event event object
     * @param {Object} market market object
     * @param {Object} game game object
     * @param {String} [oddType] odd type (odd or sp)
     * @description
     * Adds bet to betslip by broadcasting **bet** event from root scope
     */
    $scope.bet = function bet(event, market, game, oddType) {
        oddType = oddType || 'odd';
        if (Config.main.phoneOnlyMarkets && Config.main.phoneOnlyMarkets.enable && game.type == 1) {
            return;
        }
        $rootScope.$broadcast('bet', {event: event, market: market, game: game, oddType: oddType});
    };

    $scope.$on('$destroy', function() {
        // Need this to avoid side effect with $location.search()
        $scope.selectGame = function() {};
    })
}]);
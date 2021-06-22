/**
 * @ngdoc controller
 * @name vbet5.controller:classicViewMainCtrl
 * @description
 * Classic mode view controller
 */
angular.module('vbet5.betting').controller('classicViewMainCtrl', ['$rootScope', '$scope', '$controller', 'Config', 'ConnectionService', 'Utils', '$filter', '$location', 'TimeoutWrapper', '$q', 'Storage', 'GameInfo', '$window', 'partner', 'Moment','analytics','Zergling', 'MarketTypes', function ($rootScope, $scope, $controller, Config, ConnectionService, Utils, $filter, $location, TimeoutWrapper, $q, Storage, GameInfo, $window, partner, Moment,analytics, Zergling, MarketTypes) {
    'use strict';

    TimeoutWrapper = TimeoutWrapper($scope);
    var connectionService = new ConnectionService($scope);
    $scope.currentGameIsFinished = false;

    if (Config.main.externalAnimation) {
        $scope.externalAnimation = {
            show: false,
            loading : true
        };
    }
    $scope.currentPath = $location.path();

    $rootScope.footerMovable = true;
    $scope.boostedBets = {selected : false};
    $scope.expressOfDay = {selected : false};


    $scope.couponGames = {selected: false};

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
        boostedBets: null,
        competitions: null,
        popularGames: null,
        outRightGames: null,
        multiselect: null,
        teamGames: null,
        couponGames: null
    };

    Config.env.liveStatsFlipMode = parseInt(Storage.get('liveStatsFlipMode') || Config.env.liveStatsFlipMode);
    $scope.flipMode = Config.env.liveStatsFlipMode;
    Config.env.preMatchMultiSelection = Storage.get('preMatchMultiSelection') === undefined ? Config.env.preMatchMultiSelection : Storage.get('preMatchMultiSelection');
    $scope.showStatsBlock = !Config.env.hideLiveStats;
    GameInfo.checkIfTimeFilterIsNeeded();
    $scope.hideVideoAndAnimationBox = false;
    $scope.isPopularGames = false;
    $scope.popularGamesLastState = false;
    $scope.showNewsBlock = !Config.betting.enableShowBetSettings;
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
    $scope.todaysBets = {
        selected: 0, // Selected "Today's bets" type (e.g. all Today's bets or custom additionalItem from Config)
        selectedSport: 0 // Currently selected sport
    };
    $scope.recommendedGames = { selected: false };



    function updateStreamConfig() {
        $scope.streamConfig = GameInfo.PROVIDER_AVAILABLE_EVENTS;
    }
    updateStreamConfig();
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

    function clearCoupons() {
        $scope.couponGames.selected = false;
        $scope.couponGames.coupon = null;
        $location.search("coupon", undefined);

    }


    /**
     * @ngdoc method
     * @name multiColumnStateAnalyticsCounter
     * @methodOf vbet5.controller:classicViewMainCtrl
     * @description  sending multi column state analytics data
     */
    function multiColumnStateAnalyticsCounter() {
        if(Config.main.prematchMultiColumnEnabled){
            var eventLabel = $scope.multiColumn.show ? 'multiColumnEnabled' : 'multiColumnDisabled';
            analytics.gaSend('send', 'event', 'explorer', eventLabel + (Config.main.sportsLayout),  {'page': $location.path(), 'eventLabel': eventLabel});
        }
    }

    if($location.path() === '/sport/' ) {
        if($location.search().type === '0'){ // prematch
            multiColumnStateAnalyticsCounter();
        }else{
            var locationPathWatcher = $rootScope.$watch('currentPage.params.type', function (type) {
                if ($location.path() === '/sport/' && type == '0') {
                    locationPathWatcher();
                    multiColumnStateAnalyticsCounter();
                }
            });
        }
    }
    /**
     * @ngdoc method
     * @name saveMultiColumnState
     * @methodOf vbet5.controller:classicViewMainCtrl
     * @description  name says it all
     */
    $scope.saveMultiColumnState = function saveMultiColumnState() {
        $scope.multiColumn.toggled = !!$scope.multiColumn.show;
        multiColumnStateAnalyticsCounter();
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
            case undefined === $location.search() && Config.main.classicViewDefaultType !== null:
                envType = Config.main.classicViewDefaultType;
                break;
        }
        if (envType !== undefined) {
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
        Config.env.live ? $scope.popularGamesLastState = $scope.isPopularGames : ($scope.popularGamesLastState ? $scope.loadPopularGames(true) : null);
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
        if (data.fully) {
            $scope.boostedBets.selected = false;
            $scope.expressOfDay.selected = false;
            $scope.todaysBets.selected = 0;
            $scope.recommendedGames.selected = false;
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
    function subscribeForTodaysBetsSports(event, sport) {
        unsubscribeOldSubscriptions('todaysBetsSports');

        $scope.todaysBets.selected = sport.id;
        $scope.boostedBets.selected = false;
        $scope.expressOfDay.selected = false;
        $scope.selectedCompetition = null;
        clearCoupons();

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
                    'type': {'@in':[0,2]},
                    'start_ts': {
                        '@gte': startTime,
                        '@lt': endTime
                    }
                }

            }
        };

        if (sport.sportId) {
            request.where.sport = {id: sport.sportId};
        }

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
                        $scope.expandTodaysBets($scope.todaysBetsSports[0], startTime, endTime);
                    }
                }
            }
        );
    }

    $scope.$on('subscribeForBoostedBets', subscribeForBoostedBets);



    var boostedSelectionsPromise = GameInfo.getBoostedSelections();

    boostedSelectionsPromise().then(function(response) {
        $rootScope.boostedBetsEventIds = response.eventIds;
        $rootScope.broadcast('addBoostedBets');
    });

    /**
     * @ngdoc method
     * @name subscribeForBoostedBets
     * @methodOf vbet5.controller:classicViewMainCtrl
     * @description
     */
    function subscribeForBoostedBets() {
        $scope.prematchGamesLoading = true;

        $scope.boostedBets.selected = true;
        $scope.todaysBets.selected = 0;
        $scope.favoriteGameIsSelected = false;
        clearCoupons();
        $scope.selectedSport = null;
        $scope.marketTypes = null;


        unsubscribeOldSubscriptions('boostedBets');

        $scope.prematchGameViewData = [];
        $scope.showMarketsFilter = false;
        $scope.selectedCompetition = null;

        boostedSelectionsPromise().then(function(response) {
            var boostedBetsGameIdsArray = response.gamesIds;

            if (boostedBetsGameIdsArray.length) {
                var request = {
                    'source': 'betting',
                    'what': {
                        'sport': ['id', 'name', 'alias'],
                        'competition': ['id', 'name'],
                        'region': ['id', 'name', 'alias'],
                        game:[['id', 'start_ts','show_type', 'team1_name', 'team2_name', 'team1_external_id', 'team2_external_id', 'type', 'info', 'markets_count', 'extra', 'is_blocked', 'exclude_ids', 'is_stat_available', 'game_number', 'game_external_id', 'is_live', 'is_neutral_venue', 'game_info']],
                        'event': ['id', 'price', 'type', 'name', 'order', 'base', 'price_change'],
                        'market': ['type', 'express_id', 'name', 'base', 'display_key', 'display_sub_key', 'main_order', 'col_count', 'id']
                    },
                    'where': {
                        'game': {
                            'id': {'@in':boostedBetsGameIdsArray}
                        }
                    }
                };

                Utils.setCustomSportAliasesFilter(request);
                Utils.addPrematchExpressId(request);

                var requestMarketTypes = ["P1P2", "P1XP2", "Handicap"];
                addMarketTypesInRequest(request, requestMarketTypes, true);
                $scope.prematchGamesLoading = true;
                connectionService.subscribe(
                    request, updatePrematchGamesAndMultiColumnView,
                    {
                        'thenCallback': function (result) {
                            if (result.subid) {
                                subIds.boostedBets = result.subid;
                            }
                            if (result.data) {
                                if ($location.search().game && (!$scope.openGame || $scope.openGame.id !== Number($location.search().game))) { //open if deeplinked and different from now open
                                    $scope.openGameFullDetails({id: Number($location.search().game)});
                                } else if (!$scope.openGame && $scope.prematchGameViewData && $scope.prematchGameViewData[0] && $scope.prematchGameViewData[0].games) {
                                    $scope.openGameFullDetails($scope.prematchGameViewData[0].games[0]);
                                }
                            }
                            handeLoaderCallback();

                        },
                        'failureCallback':handeLoaderCallback
                    }
                );
            } else {
                updatePrematchGamesAndMultiColumnView({sport:[]});
            }

        });
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
            sport.competitions = [];
            angular.forEach(sport.region, function (region) {
                angular.forEach(region.competition, function (competition) {
                    angular.forEach(competition.game, function (game) {
                        game.sport = {id: sport.id, alias: sport.alias, name: sport.name};
                        game.region = {id: region.id, name: region.name, alias: region.alias};
                        if ($scope.boostedBets.selected || $scope.couponGames.selected || $scope.todaysBets.selected || $scope.outrightSelected) {
                            game.additionalEvents = game.markets_count;
                        }
                        game.competition = {id: competition.id, order: competition.order};
                        game.firstMarket = Utils.getFirstMarket(game.market);
                        game.groupDate = Date.parse((moment(game.start_ts*1000).utcOffset(Config.env.selectedTimeZone || 0).lang("en").format("YYYY-MM-DD")))/1000;
                        if (Config.main.showPlayerRegion) {
                            game.team1_name = game.team1_reg_name && game.team1_name.indexOf(game.team1_reg_name) === -1 ? game.team1_name + ' (' + game.team1_reg_name + ')' : game.team1_name;
                            game.team2_name = game.team2_reg_name && game.team2_name.indexOf(game.team2_reg_name) === -1 ? game.team2_name + ' (' + game.team2_reg_name + ')' : game.team2_name;
                        }
                        $scope.showMarketsFilter = false;

                        var marketTypeFilters = $scope.marketTypes;
                        if (marketTypeFilters && !$scope.env.preMatchMultiSelection && !$scope.outrightSelected && !$scope.todaysBets.selected && !$scope.boostedBets.selected && !$scope.couponGames.selected) {
                            $scope.showMarketsFilter = true;
                            game.filteredMarkets = Utils.groupByItemProperty(game.market, 'type');
                            angular.forEach(marketTypeFilters, function (filter) {
                                var key = filter.BasaltKind;
                                if (game.filteredMarkets && game.filteredMarkets[key]) {
                                   if (game.filteredMarkets[key].length > 1 && game.filteredMarkets[key][0].base) {
                                        angular.forEach(game.filteredMarkets[key], function (market) {
                                            if (market.base === Utils.getDefaultSelectedMarketBase(game.filteredMarkets[key])) {
                                                game.filteredMarkets[key].events = Utils.objectToArray(market.event);
                                                game.filteredMarkets[key].market = market;
                                            }
                                        });

                                    } else {
                                        game.filteredMarkets[key].events = Utils.objectToArray(game.filteredMarkets[key][0].event);
                                    }
                                    if (game.filteredMarkets[key].events) {
                                        game.filteredMarkets[key].events.sort(Utils.orderSorting);
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

                            if (Config.main.showEventsCountInMoreLink) {
                                game.additionalEvents -= $filter('count')(game.firstMarket.events);
                            }
                        }
                    });
                    competition.games = Utils.objectToArray(competition.game).sort(Utils.orderByStartTs);
                    if(Config.main.sportsLayout === 'classic') {
                        competition.gamesGroupedByDate = Utils.groupByItemProperty(competition.games, 'groupDate');
                    }

                    sport.competitions.push(competition);
                });
            });
            $scope.prematchGameViewData.push(sport);
        });


        $scope.isPopularGamesLoadedFlag = true;
        if ($location.search().sport === -12 && !Utils.isObjectEmpty(data.sport))
        {
            $scope.$broadcast('topGamesAreLoaded');
        }
    }

    function updatePrematchGamesAndMultiColumnView(data, subId) {
        updatePrematchGames(data);
        if ($scope.multiColumn.show) {
            $scope.$broadcast('multiColumn.games', subId ? 'updateBoth' : 'update');
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

        $scope.resetPrematchMultiView(true);
        if ($scope.isPopularGames) {return}

        $scope.favoriteGameIsSelected = false;
        $scope.outrightSelected = false;
        $scope.selectedCompetition = null;

        $scope.favoriteTeamExpanded = false;
        $scope.marketTypes = null;

        clearCoupons();

        var request = {
            'source': 'betting',
            'what': {
                'sport': ['id', 'name', 'alias'],
                'competition': ['id', 'order', 'name'],
                'region': ['id', 'name', 'alias'],
                game: [
                    ['id', 'start_ts','show_type', 'team1_name', 'team2_name', 'team1_reg_name', 'team2_reg_name', 'team1_external_id', 'team2_external_id', 'type', "game_info",
                        'info', 'markets_count', 'extra', 'is_blocked', 'exclude_ids', 'is_stat_available', 'game_number', 'game_external_id', 'is_live', 'is_neutral_venue']
                ],
                'event': ['id', 'price', 'type', 'name', 'order', 'price_change'],
                'market': ['type', 'express_id', 'name', 'display_key', 'display_sub_key', 'main_order', 'col_count', 'id']
            },
            'where': {}
        };
        Utils.addPrematchExpressId(request);

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
            updatePrematchGamesAndMultiColumnView,
            {
                'thenCallback': function (result) {
                    $scope.$broadcast('popularGamesAreLoaded', result.data);
                    if (result.subId) {
                        subIds.popularGames = result.subId;
                    }
                    handeLoaderCallback();
                },
                'failureCallback': handeLoaderCallback
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
        if (prematchMultiViewGameIds.length === 0) {
            unsubscribeOldSubscriptions();
            $scope.prematchGameViewData = [];
            if ($scope.multiColumn.show) {
                $scope.$broadcast('multiColumn.games', 'updateBoth');
            }
            return;
        }
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
        angular.forEach(MarketTypes.get(1), function (fType) {
            requestMarketTypes.push(fType.BasaltKind);
        });

        var request = {
            'source': 'betting',
            'what': {
                'sport': ['id', 'name', 'alias'],
                'competition': ['id', 'order', 'name'],
                'region': ['id', 'name', 'alias'],
                game: [
                    ['id', 'start_ts','show_type', 'team1_name', 'team2_name', 'team1_external_id', 'team2_external_id', 'type', 'info', 'markets_count', 'extra', 'is_blocked', 'exclude_ids', 'is_stat_available', 'game_number', 'game_external_id', 'is_live', 'is_neutral_venue', 'game_info']
                ],
                'event': ['id', 'price', 'type', 'name', 'order', 'base', 'price_change'],
                'market': ['type', 'express_id', 'name', 'base', 'display_key', 'display_sub_key', 'main_order', 'col_count', 'id']
            },
            'where': {
                'game': {'type': {'@in': [0, 2]}, 'id': {'@in': prematchMultiViewGameIds}}
            }
        };
        Utils.addPrematchExpressId(request);

        addMarketTypesInRequest(request, requestMarketTypes);

        if (Config.env.gameTimeFilter) {
            request.where.game.start_ts = Config.env.gameTimeFilter;
        }
        Utils.setCustomSportAliasesFilter(request);
        connectionService.subscribe(
            request,
            updatePrematchGamesAndMultiColumnView,
            {
                'failureCallback': handeLoaderCallback,
                'thenCallback': function (res) {
                    subIds.multiselect = res.subid;
                    handeLoaderCallback();

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
        analytics.gaSend('send', 'event', 'explorer', 'H2H-on-click', {'page': $location.path(), 'eventLabel': ($scope.env.live ? 'Live' : 'Prematch')});
        $window.open(GameInfo.getStatsLink(game), game.id, "width=940,height=600,resizable=yes,scrollbars=yes");
    };

    $scope.$on('prematch.expandCompetition', function (event, data) {
        if (Config.env.live) {
            return;
        }
        if ($scope.customTemplateForSport[data.sport.id]) {
            if (data.fromLeft) {
                $location.search('game', undefined);
            }
            $scope.selectedSport = data.sport;
            $scope.selectedRegion = data.competition.region || $scope.selectedRegion;
            $scope.selectedCompetition = data.competition;
            unsubscribeOldSubscriptions();
            $scope.unsubscribeFromOpenGame();
            return;
        }
        console.log('classicView: expandCompetition', event, data.competition, data.sport);
        $scope.expandCompetition(data.competition, data.sport, data.openFirstGame);
    });

    function checkAndGetFirstGame() {
        return ($scope.prematchGameViewData
            && $scope.prematchGameViewData[0]
            && $scope.prematchGameViewData[0].competitions[0]
            && $scope.prematchGameViewData[0].competitions[0].games
            && $scope.prematchGameViewData[0].competitions[0].games[0]
        );
    }

    $scope.$on('sportsbook.gameFinished', function() {
        $scope.currentGameIsFinished = true;
        TimeoutWrapper(function() {
            var game = checkAndGetFirstGame();
            if(game && $scope.currentGameIsFinished) {
                $scope.openGameFullDetails(game);
                $scope.currentGameIsFinished = false;
            }
        }, 5000);
    });

    function updatePrematchCompetitionMarketesCount(data) {
        $scope.gameMarketsCountMap = {};
        angular.forEach(data.game, function (game) {
            $scope.gameMarketsCountMap[game.id] = game.market;
        });
    }
    function handeLoaderCallback() {
        $scope.prematchGamesLoading = false;
    }

    /**
     * @ngdoc method
     * @name expandCompetition
     * @methodOf vbet5.controller:classicViewMainCtrl
     * @description  updates open game data object
     *
     * @param {Object} competition - competition object
     * @param {Object} sport - sport object
     * @param {Boolean} openFirstGame - opens first game of selected competition
     */
    $scope.expandCompetition = function expandCompetition(competition, sport, openFirstGame) {
        $scope.todaysBets.selected = 0;
        $scope.boostedBets.selected = false;
        $scope.expressOfDay.selected = false;
        $scope.recommendedGames.selected = false;
        clearCoupons();
        $scope.favoriteTeamExpanded = false;
        $scope.isPopularGames = false;
        $scope.prevCompetition = [competition, sport];

        if (!competition || (Config.env.preMatchMultiSelection && !Config.env.live)) {
            return;
        }

        $scope.selectedCompetition = competition;
        $scope.selectedCompetition.sport = $scope.selectedCompetition.sport || sport;
        if ($scope.selectedPrematchStreamSport !== undefined && sport.id !== $scope.selectedPrematchStreamSport &&  $scope.selectedSport.id === $scope.selectedPrematchStreamSport) {
            $rootScope.broadcast("removePrematchStream");
        }
        $scope.selectedSport = sport || $scope.selectedSport;
        $scope.selectedRegion = competition.region || $scope.selectedRegion;
        $scope.multiColumn.show && $scope.$broadcast('multiColumn.games', 'cleanState');


        if (Config.env.live) {
            competition.expanded = !competition.expanded;
            // open game full detalis when we are in live mode
            expandFullGameDetails(competition);
        } else {
            $scope.favoriteGameIsSelected = false;
            if (!openFirstGame && $location.search().game && (!$scope.openGame || $scope.openGame.id !== Number($location.search().game))) { //open if deeplinked and different from now open
                $scope.openGameFullDetails({id: Number($location.search().game)});
            }

            $scope.prematchGamesLoading = true;
            $scope.favoriteTeamExpanded = false;
            var isContainsP1P2 = !$scope.multiColumn.show || !Config.main.multiColumnMarketFilterTypes['P1XP2'] || !Config.main.multiColumnMarketFilterTypes['P1XP2'].useMarketTypeForSports || !Config.main.multiColumnMarketFilterTypes['P1XP2'].useMarketTypeForSports[$scope.selectedSport.alias];

            var requestMarketTypes = [];
            if (isContainsP1P2){
                requestMarketTypes.push('P1P2');

            }
            $scope.marketTypes = MarketTypes.get($scope.selectedSport.id);
            if ($scope.marketTypes) {
                var isFilterExist = $scope.selectedMarketFilter && ($scope.marketTypes.filter(function (marketType) {
                    return marketType.BasaltKind === $scope.selectedMarketFilter.BasaltKind;
                }).length > 0);
                if (!isFilterExist) {
                    $scope.selectedMarketFilter = $scope.marketTypes[0];
                }

                angular.forEach($scope.marketTypes, function (fType) {
                    requestMarketTypes.push(fType.BasaltKind);
                });
            }


            var requestGameFilter = [
                ['id', 'start_ts', 'team1_name', 'team2_name', 'team1_external_id', 'team2_external_id','team1_id', 'team2_id', 'type', 'show_type',  'markets_count', 'is_blocked', 'exclude_ids', 'is_stat_available', 'game_number', 'game_external_id', 'is_live', 'is_neutral_venue']
            ];

            if (Config.env.live) {
                requestGameFilter[0].push('info');
            } else {
                requestGameFilter[0].push("game_info");
            }

            var request = {
                'source': 'betting',
                'what': {
                    'sport': ['id', 'name', 'alias'],
                    'competition': ['id', 'name'],
                    'region': ['id', 'name', 'alias'],
                    game: requestGameFilter,
                    'event': ['id', 'price', 'type', 'name', 'order', 'base', 'price_change'],
                    'market': ['type', 'express_id', 'name', 'base', 'display_key', 'display_sub_key', 'main_order', 'col_count', 'id']
                },
                'where': {
                    'competition': {'id': parseInt(competition.id, 10)},
                    'game': (Config.main.enableVisibleInPrematchGames && !Config.env.live ? {
                        '@or': ([{'type': Config.env.live ? 1 : {'@in':[0,2]}}, {
                            'visible_in_prematch': 1,
                            'type': 1
                        }])
                    } : {'type': Config.env.live ? 1 : {'@in':[0,2]}}),
                    'market': null
                }
            };
            Utils.addPrematchExpressId(request);

            if (sport) {
                request.where.sport = {
                    id:  parseInt(sport.id, 10)
                };
            }

            addMarketTypesInRequest(request, requestMarketTypes, isContainsP1P2);

            if ($scope.selectedUpcomingPeriod && !Config.env.live) {
                request.where.game.start_ts = {'@now': {'@gte': 0, '@lt': $scope.selectedUpcomingPeriod * 3600}};
            } else if (Config.env.gameTimeFilter) {
                request.where.game.start_ts = Config.env.gameTimeFilter;
            }
           if (!Config.main.showEventsCountInMoreLink) {
               var marketCountRequest = {
                   'source': 'betting',
                   'what': {
                       'game': ['id'],
                       'market': '@count'
                   },
                   'where': {
                       'competition': {'id': parseInt(competition.id, 10)}
                   }
               };
               connectionService.subscribe(marketCountRequest, updatePrematchCompetitionMarketesCount);
           }

            /*Utils.setCustomSportAliasesFilter(request);*/
            connectionService.subscribe(
                request,
                updatePrematchGamesAndMultiColumnView,
                {
                    'thenCallback': function (result) {
                        if (result.subid) {
                            competition.gamesSubId = result.subid;
                            subIds.competitions = result.subid;
                            if (openFirstGame || !$location.search().game) {
                                var firstGameOfCompetition = $filter('firstElement')($scope.prematchGameViewData[0].competitions[0].gamesGroupedByDate)[0];
                                $scope.openGameFullDetails(firstGameOfCompetition);
                            }
                        }
                       handeLoaderCallback();
                    },
                    'failureCallback': handeLoaderCallback
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
     * @param {Boolean} [containsWinner]
     */
    function addMarketTypesInRequest(request, requestMarketTypes, containsWinner) {
        request.where.market = {'@or': [
                {'type': {'@in': requestMarketTypes}},
                {'display_key': {'@in': ['WINNER','HANDICAP', 'TOTALS']}}
            ]};
        if (containsWinner === false) {
            request.where.market["@or"][1]["display_key"]["@in"].shift();
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

        $scope.favoriteTeamExpanded = true;
        $scope.prematchGamesLoading = true;
        $scope.selectedCompetition = null;


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
                    ['id', 'show_type', 'start_ts', 'team1_name', 'team2_name', 'team1_external_id', 'team2_external_id', 'type', 'info', 'markets_count', 'extra', 'is_blocked', 'exclude_ids', 'is_stat_available', 'game_number', 'game_external_id', 'is_live', 'is_neutral_venue', 'game_info']
                ],
                'event': ['id', 'price', 'type', 'name', 'order', 'base', 'price_change'],
                'market': ['type', 'express_id', 'name', 'base', 'display_key', 'display_sub_key', 'main_order', 'col_count', 'id']
            },
            'where': {
                'game': {
                    '@or': [
                        {'team1_id': team.id},
                        {'team2_id': team.id}
                    ],
                    'type': {'@in':[0,2]}
                },
                'market': {'type': {'@in': requestMarketTypes}}
            }
        };
        Utils.setCustomSportAliasesFilter(request);
        Utils.addPrematchExpressId(request);

        connectionService.subscribe(
            request,
            updatePrematchGamesAndMultiColumnView,
            {
                'thenCallback': function (result) {
                    if (result.subid) {
                        team.gamesSubId = result.subid;
                        subIds.teamGames = result.subid;
                    }
                    handeLoaderCallback();
                },
                'failureCallback': handeLoaderCallback
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

        angular.forEach($scope.prematchGameViewData[0].competitions, function (competition) {
            if (first) {
                first = false;
                prematchGameViewData.push(competition);
                return 0;
            }
            prematchGameViewData[0].games = prematchGameViewData[0].games.concat(competition.games);
        });

        prematchGameViewData[0].games = prematchGameViewData[0].games.sort(Utils.orderByStartTs);

        if(Config.main.sportsLayout === 'classic') {
            prematchGameViewData[0].gamesGroupedByDate = Utils.groupByItemProperty(prematchGameViewData[0].games, 'groupDate');
        }

        $scope.prematchGameViewData[0].competitions = prematchGameViewData;

        if ($scope.multiColumn.show) {
            $scope.$broadcast('multiColumn.games', 'update');
        }
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
        $scope.selectedSport = null;
        $scope.todaysBets.selectedSport = sport;
        $scope.prematchGamesLoading = true;
        $scope.favoriteTeamExpanded = false;
        $scope.favoriteGameIsSelected = false;
        clearCoupons();
        $scope.selectedCompetition = null;
        $scope.marketTypes = null;


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
                    ['id', 'start_ts', 'show_type', 'team1_name', 'team2_name', 'team1_external_id', 'team2_external_id', 'type', 'info', 'markets_count', 'extra', 'is_blocked', 'exclude_ids', 'is_stat_available', 'game_number', 'is_live','is_neutral_venue', 'game_info']
                ],
                'market': ['type', 'express_id', 'name', 'home_score', 'away_score', 'id'],
                'event': ['id', 'price', 'type', 'name', 'order']
            },
            'where': {
                //'competition': {'id': parseInt(competition.id, 10)},
                "sport": {"id": sport.id},
                'game': {
                    type: {'@in':[0,2]},
                    start_ts: {
                        '@gte': startTime,
                        '@lt': endTime
                    }
                },
                'market': {'type': {'@in': ['P1XP2', 'P1P2']}}
            }
        };
        Utils.addPrematchExpressId(request);

        if (Config.main.prematchMultiColumnEnabled) {
            request.what.market.push('display_key', 'display_sub_key', 'base', 'col_count', 'main_order');
            request.what.event.push('base');

            addMarketTypesInRequest(request, Config.main.multiColumnMarketFilterTypes);
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
                    handeLoaderCallback();
                },
                'failureCallback': handeLoaderCallback
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

    $scope.selectPrematchStreaming = function selectPrematchStreaming(streamInfo, game) {
        $scope.selectedPrematchStreamSport = game.sport.id;
        $rootScope.broadcast("setPrematchStream", streamInfo);
    };

    $scope.$on('leftMenu.fullGmeSelected', function(event) {
        event.stopPropagation();
        unsubscribeOldSubscriptions();
    });

    /**
     * @ngdoc method
     * @name populateOutright
     * @methodOf vbet5.controller:classicViewMainCtrl
     * @description populates games with OUTRIGHT market
     */
    function populateOutright() {
        unsubscribeOldSubscriptions('outRightGames');
        $scope.todaysBets.selected = 0;
        $scope.boostedBets.selected = false;
        $scope.expressOfDay.selected = false;
        $scope.favoriteGameIsSelected = false;
        $scope.isPopularGames = false;
        $scope.favoriteTeamExpanded = false;
        clearCoupons();

        $scope.selectedCompetition = null;
        $scope.marketTypes = null;

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
                    handeLoaderCallback();
                },
                'failureCallback':handeLoaderCallback
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
        if(Config.main.sportsLayout === 'classic') {
            addGroupDateToOutright(data.competition);
        }
        angular.forEach(data.competition, function (competition) {
            if(competition.game) {
                if(Config.main.sportsLayout === 'classic') {
                    competition.gamesGroupedByDate = Utils.groupByItemProperty(competition.game, 'groupDate');
                }
                competition.games = Utils.objectToArray(competition.game).sort(Utils.orderByStartTs);
            }
            prematchGameViewData.push(competition);
        });
        $scope.prematchGameViewData = [{}];
        $scope.prematchGameViewData[0].competitions = prematchGameViewData;
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
     * @param _
     * @param {Object} recommendations
     * @param {number[]} recommendations.games
     * @param {number[]} [recommendations.sports]
     * @param {number[]} [recommendations.regions]
     * @param {number[]} [recommendations.competitions]
     * @param {boolean} [recommendations.sortByCompetitions]
     */
    function subscribeToRecommendedGames(_, recommendations) {
        unsubscribeOldSubscriptions("recommendedGames");

        $scope.prematchGamesLoading = true;
        $scope.showMarketsFilter = false;

        var request = {
            source: "betting",
            what: {
                sport: ["id", "name", "alias", "order"],
                region: ["id", "name"],
                competition: ["id", "name"],
                game: [
                    [
                        "id",
                        "start_ts",
                        "team1_name",
                        "team2_name",
                        "team1_id",
                        "show_type",
                        "team2_id",
                        "type",
                        "info",
                        "markets_count",
                        "extra",
                        "is_blocked",
                        "exclude_ids",
                        "is_stat_available",
                        "game_number",
                        "is_live",
                        "is_neutral_venue",
                        "game_info"
                    ]
                ],
                market: ["type", "express_id", "name", "home_score", "away_score", 'id'],
                event: ["id", "price", "type", "name", "order"]
            },
            where: {
                game: { id: { "@in": recommendations.games } },
                market: { type: { "@in": ["P1XP2", "P1P2"] } }
            }
        };
        Utils.addPrematchExpressId(request);

        if (Config.main.prematchMultiColumnEnabled) {
            request.what.market.push('display_key', 'display_sub_key', 'base', 'col_count', 'main_order');
            request.what.event.push('base');

            addMarketTypesInRequest(request, Config.main.multiColumnMarketFilterTypes);
        }

        if (recommendations.sports) {
            request.where.sport = {id: {"@in": recommendations.sports}};
        }

        if (recommendations.regions) {
            request.where.region = {id: {"@in": recommendations.regions}};
        }

        if (recommendations.competitions) {
            request.where.competition = {id: {"@in": recommendations.competitions}};
        }

        connectionService.subscribe(
            request,
            function updateRecommendedGames(data) {
                updatePrematchGames(data);

                var sourceCompetitions = $scope.prematchGameViewData.reduce(function (acc, sport) {
                    return acc.concat(sport.competitions);
                }, []);
                if (recommendations.sortByCompetitions) {
                    var competitions = sourceCompetitions.reduce(function (acc, competition) {
                        acc[competition.id] = competition;
                        return acc;
                    }, {});
                    $scope.prematchGameViewData = [{}];
                    $scope.prematchGameViewData[0].competitions = recommendations.competitions
                        .filter(function (competitionId) {
                            return competitionId in competitions;
                        })
                        .map(function (competitionId) {
                            return competitions[competitionId];
                        });
                }

                if ($scope.multiColumn.show) {
                    $scope.$broadcast('multiColumn.games', 'update');
                }
            },
            {
                "thenCallback": function(result) {
                    subIds.recommendedGames = result.subid;
                    handeLoaderCallback();
                },
                "failureCallback": handeLoaderCallback
            }
        );
    }

    $scope.$on('subscribeToRecommendedGames', subscribeToRecommendedGames);

    $scope.$on("selectExpressOfDay", function(event, data) {
        $scope.selectedSport = data;
        $scope.selectedRegion = null;
        $scope.selectedCompetition = null;
        clearCoupons();
        unsubscribeOldSubscriptions();
        $scope.unsubscribeFromOpenGame();
    });

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


    $scope.$on('stream.config.updated', function() {
        updateStreamConfig();
    });

    $scope.expandCoupon = function expandCoupon(coupon) {
        $rootScope.broadcast("clearSelectedCompetitionAndRegion");
        $scope.boostedBets.selected = false;
        $scope.expressOfDay.selected = false;
        $scope.todaysBets.selected = 0;
        $scope.favoriteGameIsSelected = false;
        $scope.couponGames.selected  = true;
        $scope.couponGames.coupon  = coupon;
        $scope.selectedCompetition = null;
        $scope.selectedSport = null;
        $scope.marketTypes = null;

        $location.search({
            type: 0,
            coupon: coupon.Name
        });

        unsubscribeOldSubscriptions("couponGames");

        $scope.prematchGameViewData = [];
        $scope.showMarketsFilter = false;
        var request = {
            'source': 'betting',
            'what': {
                'sport': ['id', 'name', 'alias'],
                'competition': ['id', 'name'],
                'region': ['id', 'name', 'alias'],
                'game': [['id', 'show_type', 'start_ts', 'team1_name', 'team2_name', 'team1_external_id', 'team2_external_id','team1_id', 'team2_id', 'type', 'show_type',  'markets_count', 'is_blocked', 'exclude_ids', 'is_stat_available', 'game_number', 'game_external_id', 'is_live', 'is_neutral_venue']],
                'event': ['id', 'price', 'type', 'name', 'order', 'base', 'price_change'],
                'market': ['type', 'express_id', 'name', 'base', 'display_key', 'display_sub_key', 'main_order', 'col_count', 'id']
            },
            'where': {
                'game' :{
                    'id': {'@in': coupon.Matches}
                }
            }
        };
        Utils.addPrematchExpressId(request);

        var requestMarketTypes = ["P1P2", "P1XP2", "Handicap"];
        addMarketTypesInRequest(request, requestMarketTypes, true);
        $scope.prematchGamesLoading = true;

        connectionService.subscribe(request, updatePrematchGamesAndMultiColumnView,
            {
                'thenCallback': function (result) {
                    if (result.subid) {
                        subIds.couponGames = result.subid;
                    }
                    if (result.data) {
                        if ($location.search().game && (!$scope.openGame || $scope.openGame.id !== Number($location.search().game))) { //open if deeplinked and different from now open
                            $scope.openGameFullDetails({id: Number($location.search().game)});
                        } else if (!$scope.openGame && $scope.prematchGameViewData && $scope.prematchGameViewData[0] && $scope.prematchGameViewData[0].games) {
                            $scope.openGameFullDetails($scope.prematchGameViewData[0].games[0]);
                        }
                    }
                    handeLoaderCallback();
                },
                'failureCallback':handeLoaderCallback
            });
    };
}]);

/**
 * @ngdoc controller
 * @name vbet5.controller:classicExplorerCtrl
 * @description
 * Classic mode Explorer controller
 */
angular.module('vbet5.betting').controller('classicExplorerCtrl', ['$rootScope', '$scope', '$controller', 'Config', 'Zergling', 'Utils', '$filter', '$location', 'TimeoutWrapper', '$q', 'analytics', 'Storage', 'GameInfo', '$window', 'partner', 'DomHelper', 'Moment', function ($rootScope, $scope, $controller, Config, Zergling, Utils, $filter, $location, TimeoutWrapper, $q, analytics, Storage, GameInfo, $window, partner, DomHelper, Moment) {
    'use strict';
    $rootScope.footerMovable = true;
    TimeoutWrapper = TimeoutWrapper($scope);

    angular.extend(this, $controller('classicViewCenterController', {
        $rootScope: $rootScope,
        $scope: $scope,
        TimeoutWrapper: TimeoutWrapper,
        $filter: $filter,
        $q: $q,
        Config: Config,
        Zergling: Zergling,
        Utils: Utils,
        Storage: Storage,
        GameInfo: GameInfo,
        partner: partner
    }));


    var sportListSubId, favoritesSubId, multiViewSubId, allSubscriptions = {}, competitionSubsciptionProgress = null,
        multiViewSubsciptionProgress = null, todaysBetsSubsciptionProgress = null, sportsSubsciptionProgress = null, favoritesSubsciptionProgress = null, leftMenuInitDone = false,
        favoriteCompetitionsCountSubsciptionProgress = null, favoriteCompetitionsSubsciptionProgress = null, todaysBetsSportsSubsciptionProgress = null;
    var expandedSports = {0: {}, 1: {}}, expandedRegions = {0: {}, 1: {}}, liveVideoCondition = null;
    var VIRTUAL_SPORT_FINANCIALS = {
        id: -2,
        alias: 'financials',
        name: $filter('translate')('Financials'),
        order: Config.main.showFinancialsInSportList,
        game: 2,
        link: '#/financials'
    };
    var VIRTUAL_SPORT_VIRTUALS = {
        id: -3,
        alias: 'virtualsports',
        name: $filter('translate')('Virtual sports'),
        order: Config.main.showVirtualsInSportList,
        game: 30,
        isVirtualSport: true
    };
    var SHOW_ALL_SPORTS = {
        id: -10,
        game: 0,
        innumerable: true,
        alias: 'showallsports',
        name: $filter('translate')('More sports')
    };
    var TODAY_BETS = {
        id: -11,
        order: Config.main.todayBets.order,
        game: 0,
        innumerable: true,
        alias: 'todaybets',
        isTodayBets: true,
        link: '#/livecalendar'
    };
    var FAVORITE_COMPETITIONS = {
        id: -12,
        innumerable: true,
        name: $filter('translate')('Popular competitions'),
        alias: 'favoritecompetitions'
    };

    Config.env.liveStatsFlipMode = Storage.get('liveStatsFlipMode') ? 1 : 0;
    Config.env.preMatchMultiSelection = Storage.get('preMatchMultiSelection') === undefined ? Config.env.preMatchMultiSelection : Storage.get('preMatchMultiSelection');
    Config.env.hideLiveStats = Storage.get('hideLiveStats') || false;
    GameInfo.checkIfTimeFilterIsNeeded();
    $scope.hideVideoAndAnimationBox = false;
    $scope.isPopularGames = false;
    $scope.popularGamesLastState = false;
    $scope.showNewsBlock = !Config.betting.enableShowBetSettings;
    $scope.showNewsBetSet = true;
    $scope.isLiveGamePinned = false;
    $scope.selectedMarketFilter = Config.main.marketFilterTypes[0];

    $scope.changeVolume = GameInfo.changeVolume;

    /**
     * @ngdoc method
     * @name newsDependBetSetting
     * @methodOf vbet5.controller:classicExplorerCtrl
     * @description  show/hide News block, depend BetSetting
     */
    $scope.newsDependBetSetting = function () {
        $scope.showNewsBetSet = !$scope.showNewsBetSet;
    };

    /**
     * @ngdoc method
     * @name newsDependBetSlip
     * @methodOf vbet5.controller:classicExplorerCtrl
     * @description  show/hide News block, depend BetSlip
     */
    $scope.newsDependBetSlip = function () {
        $scope.showNewsBlock = !$scope.showNewsBlock;
    };

    TimeoutWrapper(function () {
        Config.env.showSportsbookToolTip = false;
    }, Config.main.sportsbookLayoutSwitcherTooltipTimeout);

    /**
     * @ngdoc method
     * @name toggleVideoAndAnimationBox
     * @methodOf vbet5.controller:classicExplorerCtrl
     * @description  name says it all
     */
    $scope.toggleVideoAndAnimationBox = function toggleVideoAndAnimationBox() {
        $scope.hideVideoAndAnimationBox = !$scope.hideVideoAndAnimationBox;
    };

    /**
     * @ngdoc method
     * @name animationSoundOn
     * @methodOf vbet5.controller:classicExplorerCtrl
     * @description  indicates the animation sound state
     */
    $scope.animationSoundOn = function animationSoundOn() {
        return !$scope.openGame.isAnimationMute && $scope.openGame.activeFieldType !== 'video' && Config.env.sound > 0 && !$scope.hideVideoAndAnimationBox && !$scope.isVideoDetached;
    };

    $rootScope.myGames = Storage.get('myGames') || [];
    $scope.upcomingPeriods = Utils.clone(Config.main.upcomingGamesPeriods);
    $scope.upcomingPeriods.unshift(0);
    $scope.selectedUpcomingPeriod = $scope.upcomingPeriods[Config.env.defaultUpcomingPeriodIndex + 1 || 0];
    $scope.liveFilters = {withVideo: false, disableRegions: !Config.main.selectRegionsByDefault};

    // will be stored route params if there is, and will be loaded the view depend on this object
    $scope.userActivity = {
        0: {},
        1: {}
    };
    $scope.gameCounts = {0: 0, 1: 0};

    $scope.isInArray = Utils.isInArray;

    $scope.setSound = GameInfo.setSound;
    $scope.animationSoundsMap = GameInfo.animationSoundsMap;

    /* number of sets to be visible for multiset games */
    $scope.visibleSetsNumber = 5;


    /**
     * Today's Bets
     */
    $scope.toDay = Moment.get().unix();


    /**
     * @ngdoc method
     * @name initRouteParams
     * @methodOf vbet5.controller:classicExplorerCtrl
     * @description Initialization. Assign  route values to scope vars.
     */
    $scope.initRouteParams = function () {
        var type = $location.search().type;
        $scope.userActivity[type] = $scope.userActivity[type] || {};

        if ($location.search().sport === '-12') {
            return;
        }
        if ($location.search().sport) {
            $scope.userActivity[type].selectedSportId = parseInt($location.search().sport, 10);
            $scope.selectedSport = {id: $scope.userActivity[type].selectedSportId};
        }
        if ($location.search().region) {
            $scope.userActivity[type].selectedRegionId = parseInt($location.search().region, 10);
            $scope.selectedRegion = {id: $scope.userActivity[type].selectedRegionId};
        }
        if ($location.search().competition) {
            $scope.userActivity[type].selectedCompetitionId = parseInt($location.search().competition, 10);
            $scope.selectedCompetition = {id: $scope.userActivity[type].selectedCompetitionId};
        }

        if ($location.search().game) {
            $scope.userActivity[type].selectedGameId = parseInt($location.search().game, 10);
            $scope.selectedGame = {id: $scope.userActivity[type].selectedGameId};
            if ($rootScope.myGames && $rootScope.myGames.length && $rootScope.myGames.indexOf(parseInt($location.search().game, 10)) !== -1) {
                $scope.toggleFavorites(true);
            }
        }
    };

    /**
     * @ngdoc method
     * @name subscribeToAllGameCounts
     * @methodOf vbet5.controller:classicExplorerCtrl
     * @description  Subscribes to live or pre-match all games counts and updates $scope's gameCounts object properties
     * @param {Number} type game type, 0-pre-match or 1-live
     */
    function subscribeToAllGameCounts(type) {
        var request = {
            'source': 'betting',
            'what': {'game': '@count'},
            'where': {'game': {'type': type}}
        };
        if ($scope.customSportAliasFilter) {
            request.where.sport = request.where.sport || {};
            request.where.sport.alias = $scope.customSportAliasFilter;
        }

        Zergling.subscribe(
            request,
            function (data) {
                $scope.gameCounts[type] = data.game;
            }
        )
            .then(function (result) {
                if (result.subid) {
                    allSubscriptions[result.subid] = result.subid;
                }
                if (result.data) {
                    $scope.gameCounts[type] = result.data.game;
                }
            })['catch'](function (reason) {
                console.warn('subscribeToAllGameCounts error:', reason);
            });
    }

    /**
     * @ngdoc method
     * @name initLeftMenu
     * @methodOf vbet5.controller:classicExplorerCtrl
     * @description  Set expanded menus by default
     */
    $scope.initLeftMenu = function () {
        if (leftMenuInitDone) {
            return;
        }
        console.log('initLeftMenu');
        var type = Number(Config.env.live), sport;
        var selectedSportId = $scope.userActivity[type].selectedSportId;
        if (selectedSportId && !(-11 === selectedSportId && ($scope.env.preMatchMultiSelection || $scope.env.live))) {
            sport = selectedSportId;
        } else {

            if ($scope.leftMenuSports.length === 0 && !$scope.toggleLiveTriggerOnce && !$location.search().type) {
                $scope.toggleLiveTriggerOnce = true;
                $scope.toggleLive();
            }
            sport = $filter('firstElement')($scope.leftMenuSports, true).id;
        }
        subscribeToAllGameCounts(0);
        //subscribeToAllGameCounts(1);
        if (Config.main.customSportsBook.enabled) {
            $scope.fromCustomWidget = true;
        }
        $scope.expandLeftMenuSport({id: sport}, true, true);
        leftMenuInitDone = true;
        if (Config.env.preMatchMultiSelection) {
            $scope.loadPrematchMultiView();
        }
    };

    /**
     * @ngdoc method
     * @name toggleVideoFilter
     * @methodOf vbet5.controller:classicExplorerCtrl
     * @description  toggles video filter(if on , only games with video will be selected)
     */
    $scope.toggleVideoFilter = function toggleVideoFilter() {
        $scope.liveFilters.withVideo = !$scope.liveFilters.withVideo;
        Storage.set('liveFiltersWithVideo', $scope.liveFilters.withVideo);

        if ($scope.liveFilters.withVideo) {
            liveVideoCondition = GameInfo.getVideoFilter();
        } else {
            liveVideoCondition = null;
        }
        $scope.loadLeftMenuSports();
    };

    /**
     * @ngdoc method
     * @name toggleRegionsFilter
     * @methodOf vbet5.controller:classicExplorerCtrl
     * @description  toggles region filter(if off, games in all regions will be selected)
     */
    $scope.toggleRegionsFilter = function toggleRegionsFilter() {
        $scope.liveFilters.disableRegions = !$scope.liveFilters.disableRegions;
        Storage.set('liveFiltersDisableRegions', $scope.liveFilters.disableRegions);
        $scope.loadLeftMenuSports();
    };

    /**
     * @ngdoc method
     * @name selectPrematchTimePeriod
     * @methodOf vbet5.controller:classicExplorerCtrl
     * @description  sets pre-match time period and reloads left menu
     *
     * @param {Number} hours number of hours, 0 for no filtering
     */
    $scope.selectPrematchTimePeriod = function selectPrematchTimePeriod(hours) {
        $scope.selectedUpcomingPeriod = hours;
        $scope.periodDropdownOpened = false;
        $scope.loadLeftMenuSports();

    };

    var searchParams = $location.search();
    if (searchParams.type !== undefined) {
        var mapping = {'live': 1, 'prematch': 0};
        if (mapping[searchParams.type] !== undefined) {
            searchParams.type = mapping[searchParams.type];
        }
        Config.env.live = !!parseInt(searchParams.type, 10);
    } else {
        Config.env.live = true;
        $location.search('type', 1);
    }


    /**
     * @ngdoc method
     * @name reloadView
     * @methodOf vbet5.controller:classicExplorerCtrl
     * @description unsubscribes from all sports,regions, games subscriptions then loads sports list for selected mode
     */
    function reloadView() {
        $scope.leftMenuIsLoading = true;
        var mode = Config.env.live ? 1 : 0, gameId = $scope.userActivity[mode].selectedGameId || -1;
        $location.search('type', mode);
        $location.search('game', gameId);
        $scope.selectedCompetition = null;
        leftMenuInitDone = false;
        $scope.prematchGames = null;
        $scope.openGame = null;
        $scope.pinnedGames = {};
        $scope.pinnedGameType = null;
        if (sportListSubId) {
            Zergling.unsubscribe(sportListSubId).then(function () {
                $scope.loadLeftMenuSports();
            });
        } else {
            $scope.loadLeftMenuSports();
        }
        // TODO:
        //if (gameSubsciptionProgress) {
        //    gameSubsciptionProgress.then(function (subId) {
        //        Zergling.unsubscribe(subId);
        //    });
        //}
    }

    /**
     * @ngdoc method
     * @name toggleLive
     * @methodOf vbet5.controller:classicExplorerCtrl
     * @description Toggles  live/pre-match
     *
     */
    function toggleLive() {

        if ($scope.leftMenuIsLoading) {
            return;
        }

        Config.env.live = !Config.env.live;

        if (Config.env.live) {
            $scope.popularGamesLastState = $scope.isPopularGames;
        } else {
            if ($scope.popularGamesLastState) {
                $scope.loadPopularGames(true);
                return;
            }
        }

        reloadView();
    }

    $scope.$on('toggleLive', toggleLive);

    $scope.toggleLive = toggleLive;

    /**
     * @ngdoc method
     * @name checkFavoriteCompetitionsCount
     * @methodOf vbet5.controller:classicExplorerCtrl
     * @description Subscribe for favorite competitions count
     */
    function checkFavoriteCompetitionsCount() {
        function doSubscribe() {
            var subscribingProgress = $q.defer();
            favoriteCompetitionsCountSubsciptionProgress = subscribingProgress.promise;
            var siteId = Config.main.site_id;
            var showHideFavoriteCompatitionsSection = function (count) {
                if (!count) {
                    FAVORITE_COMPETITIONS.hide = true;
                }
            };
            var request = {
                'source': 'betting',
                'what': {'competition': '@count'},
                'where': {
                    'competition': {'favorite': true}
                }
            };
            Zergling.subscribe(
                request,
                showHideFavoriteCompatitionsSection
            )
                .then(function (result) {
                    if (result.subid) {
                        allSubscriptions[result.subid] = result.subid;
                        subscribingProgress.resolve(result.subid);
                    }
                    if (result.data) {
                        showHideFavoriteCompatitionsSection(result.data.competition);
                    }
                })['catch'](function (reason) {
                    console.log('Error:', reason);
                    subscribingProgress.resolve(null);
                });
        }
        if (favoriteCompetitionsCountSubsciptionProgress === null) {
            doSubscribe();
        } else {
            favoriteCompetitionsCountSubsciptionProgress.then(function (subId) {
                Zergling.unsubscribe(subId);
                doSubscribe();
            });
        }
    }

    /**
     * @ngdoc method
     * @name updateLeftMenuSports
     * @methodOf vbet5.controller:classicExplorerCtrl
     * @description  updates sports list
     *
     * @param {Object} data sports data object
     */
    function updateLeftMenuSports(data, firstTime) {
        $scope.sportListIsLoading = false;
        $scope.leftMenuIsLoading = false;
        var type = Number(Config.env.live);
        if(type){
            $scope.gameCounts[1] = 0;
        }

        $scope.leftMenuSports = Utils.objectToArray(data.sport);

        if (!$scope.customSportAliasFilter) {
            if (Config.main.showFinancialsInSportList && !$scope.env.live) {
                $scope.leftMenuSports.unshift(VIRTUAL_SPORT_FINANCIALS);
            }
            if (Config.main.showVirtualsInSportList && !$scope.env.live) {
                $scope.leftMenuSports.unshift(VIRTUAL_SPORT_VIRTUALS);
            }

            if (Config.main.todayBets.enabled) {
                $scope.leftMenuSports.unshift(TODAY_BETS);
            }

            $scope.leftMenuSports.sort(function (a, b) {
                return a.order - b.order;
            });

            //if (firstTime && Config.main.showFavoriteCompetitions && !$scope.env.live) {
            if (Config.main.showFavoriteCompetitions && !$scope.env.live) {
                checkFavoriteCompetitionsCount();
                $scope.leftMenuSports.unshift(FAVORITE_COMPETITIONS);
            }

            if (Config.main.showPrematchLimit > 0 && !Config.env.live) {
                if ($scope.leftMenuSports.length > Config.main.showPrematchLimit) {
                    $scope.leftMenuSports.splice(Config.main.showPrematchLimit, 0, SHOW_ALL_SPORTS);
                    if (firstTime) {
                        SHOW_ALL_SPORTS.expanded = true;
                        $scope.expandLeftMenuAllSports(false);
                    }
                }
            }
        }
        if (!$scope.env.live && $scope.selectedSport && $scope.selectedSport.id === TODAY_BETS.id) {
            $scope.initRouteParams();
        }
        $scope.initLeftMenu();

        if (Config.main.expandFavoriteCompetitions && !$scope.virtualSportsSelected) {
            if (!$scope.favoriteCompetitionsExpandedFlag) {
                for (var i = 0, length = $scope.leftMenuSports.length; i < length; i += 1) {
                    if ($scope.leftMenuSports[i].id === FAVORITE_COMPETITIONS.id) {
                        $scope.leftMenuSports[i].expanded = true;
                        $scope.expandLeftMenuSport($scope.leftMenuSports[i], true);
                        break;
                    }
                }
                $scope.favoriteCompetitionsExpandedFlag = true;
            }
        } else {
            angular.forEach($scope.leftMenuSports, function (sport) {
                if(type){
                    $scope.gameCounts[1] +=  sport.game;
                }
                if (expandedSports[type][sport.id] && !sport.expanded) {
                    sport.expanded = true;
                    $scope.expandLeftMenuSport(sport, true);
                }
            });
        }

        console.log('sports:', data, $scope.leftMenuSports);
    }

    /**
     * @ngdoc method
     * @name getCustomSportAliasFilter
     * @methodOf vbet5.controller:classicExplorerCtrl
     * @description
     */
    $scope.getCustomSportAliasFilter = function getCustomSportAliasFilter() {
        var customSportAlias;

        for (customSportAlias in Config.main.customSportIds) {
            if ($location.path() === '/customsport/' + customSportAlias + '/') {
                $scope.customSportAliasFilter = Config.main.customSportIds[customSportAlias];
                return;
            }
        }
    };
    /**
     * @ngdoc method
     * @name subscribeForSports
     * @methodOf vbet5.controller:classicExplorerCtrl
     * @description
     */
    function subscribeForSports(callback) {
        function doSubscribe() {
            var deferred = $q.defer();

            sportsSubsciptionProgress = deferred.promise;
            var request = {
                'source': 'betting',
                'what': {'sport': ['id', 'name', 'alias', 'order'], 'game': '@count'},
                'where': {
                    'game': (Config.main.enableVisibleInPrematchGames && !Config.env.live ? {
                        '@or': ([{'type': Config.env.live ? 1 : 0}, {
                            'visible_in_prematch': 1,
                            'type': 1
                        }])
                    } : {'type': Config.env.live ? 1 : 0}),
                    'sport': {'id': {'@nin': Config.main.virtualSportIds}}
                }
            };
            if ($rootScope.myGames && $rootScope.myGames.length && Config.main.separateFavoritesInClassic) {
                request.where.game.id = {'@nin': $rootScope.myGames};
            }
            if ($scope.selectedUpcomingPeriod && !Config.env.live) {
                request.where.game.start_ts = {'@now': {'@gte': 0, '@lt': $scope.selectedUpcomingPeriod * 3600}};
            } else if (Config.env.gameTimeFilter) {
                request.where.game.start_ts = Config.env.gameTimeFilter;
            }
            if (liveVideoCondition && Config.env.live) {
                request.where.game['@or'] = liveVideoCondition;
            }
            if ($scope.customSportAliasFilter) {
                request.where.sport.alias = $scope.customSportAliasFilter;
            }

            Zergling.subscribe(
                request,
                callback
            )
                .then(function (result) {
                    if (result.subid) {
                        sportListSubId = result.subid;
                        allSubscriptions[result.subid] = result.subid;
                        deferred.resolve(sportListSubId);
                    }
                    if (result.data) {
                        callback(result.data, true);
                    }

                })['catch'](function (reason) {
                    console.log('Error:', reason);
                    deferred.resolve(null);
                });
        }
        if (sportsSubsciptionProgress === null) {
            doSubscribe();
        } else {
            sportsSubsciptionProgress.then(function (subId) {
                Zergling.unsubscribe(subId);
                doSubscribe();
                sportListSubId = null;
            });
        }

    }

    /**
     * @ngdoc method
     * @name subscribeForTodaysBetsSports
     * @methodOf vbet5.controller:classicExplorerCtrl
     * @description
     */
    function subscribeForTodaysBetsSports() {
        function doSubscribe() {
            var deferred = $q.defer();

            todaysBetsSportsSubsciptionProgress = deferred.promise;
            var request = {
                'source': 'betting',
                'what': {'sport': ['id', 'name', 'alias', 'order'], 'game': '@count'},
                'where': {
                    'game': {
                        'type': 0,
                        'start_ts': {
                            '@gte': Moment.get().add(0, 'days').startOf("day").unix(),
                            '@lt': Moment.get().add(1, 'days').unix()
                        }
                    }
                    //'sport': {'id': {'@nin': Config.main.virtualSportIds}}
                }
            };

            var updateTodaysBetsSportList = function (data) {
                $scope.todaysBetsSports = Utils.objectToArray(data.sport);
                $scope.todaysBetsSports.sort(function (a, b) {
                    return a.order - b.order;
                });
            };

            Zergling.subscribe(
                request,
                updateTodaysBetsSportList
            )
                .then(function (result) {
                    if (result.subid) {
                        deferred.resolve(result.subid);
                        allSubscriptions[result.subid] = result.subid;
                    }
                    if (result.data) {
                        $scope.todaysBetsSelected = true;
                        updateTodaysBetsSportList(result.data);
                        $scope.expandTodaysBets($scope.todaysBetsSelectedSport || $scope.todaysBetsSports[Object.keys($scope.todaysBetsSports)[0]]);
                    }

                })['catch'](function (reason) {
                    console.log('Error:', reason);
                    deferred.resolve(null);
                });
        }
        if (todaysBetsSportsSubsciptionProgress === null) {
            doSubscribe();
        } else {
            todaysBetsSportsSubsciptionProgress.then(function (subId) {
                Zergling.unsubscribe(subId);
                doSubscribe();
            });
        }

    }

    /**
     * @ngdoc method
     * @name unsubscribeFromTodayBets
     * @methodOf vbet5.controller:classicExplorerCtrl
     * @description
     */
    function unsubscribeFromTodayBets() {
        if (todaysBetsSubsciptionProgress !== null) {
            todaysBetsSubsciptionProgress.then(function (subId) {
                Zergling.unsubscribe(subId);
            });
        }
        if (todaysBetsSportsSubsciptionProgress !== null) {
            todaysBetsSportsSubsciptionProgress.then(function (subId) {
                Zergling.unsubscribe(subId);
            });
        }
    }

    /**
     * @ngdoc method
     * @name loadSportsList
     * @methodOf vbet5.controller:classicExplorerCtrl
     * @description
     */
    $scope.loadLeftMenuSports = function loadLeftMenuSports() {

        $scope.leftMenuIsLoading = true;
        $scope.sportListIsLoading = true;
        $scope.getCustomSportAliasFilter();

        if ($rootScope.geoCountryInfo === undefined && Config.main.availableVideoProviderCountryFiltersActive) {
            $rootScope.geoDataAvailable['finally']($scope.loadLeftMenuSports);
            return;
        }
        subscribeForSports(updateLeftMenuSports);
    };

    /**
     * @ngdoc method
     * @name updateLeftMenuSportRegions
     * @methodOf vbet5.controller:classicExplorerCtrl
     * @description  updates sports data object by adding regions list to it
     *
     * @param {Object} sport sports data object to update with its regions
     * @param {Object} data regions data object
     */
    function updateLeftMenuSportRegions(sport, data) {
        console.log('updateLeftMenuSportRegions got', sport, data);
        var type = Number(Config.env.live);
        sport.regions = Utils.objectToArray(data.region);
        sport.regions = GameInfo.groupRegionsIfNeeded(sport.regions, sport.id);
        sport.regions.sort(function (a, b) {
            return a.order - b.order;
        });
        angular.forEach(sport.regions, function (region) {
            region.sportId = sport.id;

            if ((expandedRegions[type][region.id] && expandedRegions[type][region.id].expanded && !region.expanded) || (data.region && Object.keys(data.region).length === 1 && Config.main.autoExpandSingleRegionCompetitions)) {
                region.expanded = true;
                $scope.expandLeftMenuRegion(region, true);
            }
        });
        $scope.leftMenuIsLoading = false;
    }

    /**
     * @ngdoc method
     * @name updateLeftMenuFavoriteCompetitions
     * @methodOf vbet5.controller:classicExplorerCtrl
     * @description updates left menu favorite competitions data object
     * @param {Object} sport sports data object to update with its regions
     * @param {Object} data regions data object
     */
    function updateLeftMenuFavoriteCompetitions(sport, data) {
        console.log('updateLeftMenuSportRegions got', sport, data);
        setTimeout(function () {
            sport.favoriteCompetition = Utils.objectToArray(data.competition);

            if (Config.main.expandFavoriteCompetitionsFirst && sport.favoriteCompetition.length > 0 && !$scope.favoriteCompetitionFirstExpanded) {
                sport.favoriteCompetition[0].expanded = true;
                $scope.expandCompetition(sport.favoriteCompetition[0], FAVORITE_COMPETITIONS);
                $scope.favoriteCompetitionFirstExpanded = true;
            }

        }, 0);
        $scope.leftMenuIsLoading = false;
    }

    /**
     * @ngdoc method
     * @name selectSport
     * @methodOf vbet5.controller:classicExplorerCtrl
     * @description
     * Selects sport and subscribes to it's regions
     * data is processed by  updateRegionsList func.
     *
     */
    function selectSport() {
        analytics.gaSend('send', 'event', 'explorer', 'select sport ' + ($scope.env.live ? '(LIVE)' : '(PM)'), {
            'page': $location.path(),
            'eventLabel': $scope.selectedSport.alias
        });
        $location.search('sport', $scope.selectedSport.id);
        searchParams = $location.search();
        $scope.selectedSportId = $scope.selectedSport.id;
    }

    /**
     * @ngdoc method
     * @name toggleLeftMenu
     * @methodOf vbet5.controller:classicExplorerCtrl
     * @description  expands(or collapses if expanded) left menu
     *
     * @param {boolean} val - set concrate value
     */
    $scope.toggleLeftMenu = function (val, restore) {

        $scope.leftMenuClosed = !$scope.leftMenuClosed;

        if (val !== undefined) {
            $scope.leftMenuClosed = !val;
        }

        if (restore) {
            var leftMenuToggleState = !!Storage.get('leftMenuToggleState');
            $scope.leftMenuClosed = leftMenuToggleState;
        }

        Storage.set('leftMenuToggleState', !!$scope.leftMenuClosed);

        //get new video data
        if ($rootScope.conf.animationAndVideoOnLeft && !$scope.leftMenuClosed && Config.env.live && $scope.openGame && $scope.openGame.video_data !== null && $scope.openGame.video_data !== undefined && !$scope.pinnedGames[$scope.openGame.id]) {
            $scope.openGame.video_data = null;
            GameInfo.getVideoData($scope.openGame);
        }
    };

    // restore value from storage
    $scope.toggleLeftMenu(null, true);

    /**
     * @ngdoc method
     * @name expandLeftMenuAllSports
     * @methodOf vbet5.controller:classicExplorerCtrl
     * @description  expands(or collapses all menu sports if enabled) sports menu
     *
     * @param {Boolean} force overrides value if set
     */
    $scope.expandLeftMenuAllSports = function expandLeftMenuAllSports(force) {

        var showPanel = SHOW_ALL_SPORTS;
        showPanel.name = $filter('translate')(showPanel.expanded === false ? 'Top 10 sports' : 'More sports');

        showPanel.expanded = !showPanel.expanded;

        if (force !== undefined) {
            showPanel.expanded = force;
        }

        var count = 0;
        var key;
        var sport;
        showPanel.game = $scope.leftMenuSports.length - Config.main.showPrematchLimit - 1;

        for (key in $scope.leftMenuSports) {

            sport = $scope.leftMenuSports[key];
            if (sport.id !== SHOW_ALL_SPORTS.id) {
                if (showPanel.expanded) {
                    sport.hideSport = false;
                } else {
                    if (count >= Config.main.showPrematchLimit) {
                        sport.hideSport = true;
                    }
                }
            }
            count++;
        }
    };

    /**
     * @ngdoc method
     * @name expandLeftMenuSport
     * @methodOf vbet5.controller:classicExplorerCtrl
     * @description  expands(or collapses if expanded) sports menu (loads and subscribes/unsubscribes to it's regions)
     *
     * @param {Object} sport sports data object
     * @param {Boolean} keepItOpen - do we need to keep menu opened
     * @param {Boolean} doChainingOpen - after resolving priiomise call expandRegion and continue opening chain
     */
    $scope.expandLeftMenuSport = function expandLeftMenuSport(sport, keepItOpen, doChainingOpen, leaveMenuOpen) {

        if (Config.main.collapseMenuInLive && $scope.env.live && doChainingOpen) {
            return;
        }
        var type = Number(Config.env.live);
        expandedSports[type][sport.id] = sport.expanded;

        //if ($scope.env.live || $scope.env.preMatchMultiSelection) {
        //    $scope.todaysBetsSelected = false;
        //}
        if (sport.id === TODAY_BETS.id) {
            $scope.virtualSportsSelected = false;
            $scope.initTodaysBets();
            return;
        }

        if ($scope.leftMenuClosed && !leaveMenuOpen) {
            TimeoutWrapper(function () {
                DomHelper.scrollVisible("sports-list-container", "sport-" + sport.alias, false);
                $scope.toggleLeftMenu(false);
            }, 500);
        }

        if (sport.id === VIRTUAL_SPORT_VIRTUALS.id) {
            $location.path('/virtualsports');
            return;
        }
        if (sport.id === SHOW_ALL_SPORTS.id) {
            $scope.expandLeftMenuAllSports();
            return;
        }
        sport.expanded = keepItOpen || !sport.expanded;
        if (sport.id === FAVORITE_COMPETITIONS.id) {
            if (sport.expanded) {
                sport.isFavoriteCompetition = true;
                $scope.expandLeftMenuFavoriteCompetitions(sport, keepItOpen, doChainingOpen);
            }
            return;
        }

        $scope.virtualSportsSelected = false;

        console.log('expandLeftMenuSport', sport);
        $scope.leftMenuClosed = false;

        expandedSports[type][sport.id] = sport.expanded;
        if (sport.regionsSubId) {
            Zergling.unsubscribe(sport.regionsSubId).then(function () {
                sport.regionsSubId = null;
            });

            // unsubscribe from nested regions
            sport.regions.forEach(function (region) {
                if (region.expanded) {
                    Zergling.unsubscribe(region.gamesSubId).then(function () {
                        region.gamesSubId = null;
                    });
                }
            });
            // remove regions which are not needed
            if (!$scope.liveFilters.disableRegions) {
                sport.regions = null;
            }
        }
        if (sport.expanded) {
            sport.loading = true;
            $scope.selectedSport = sport;

            selectSport();

            var request = {
                'source': 'betting',
                'what': {'region': ['name', 'alias', 'id', 'order'], 'game': '@count'},
                'where': {
                    'sport': {'id': sport.id},
                    'game': (Config.main.enableVisibleInPrematchGames && !Config.env.live ? {
                        '@or': ([{'type': Config.env.live ? 1 : 0}, {
                            'visible_in_prematch': 1,
                            'type': 1
                        }])
                    } : {'type': Config.env.live ? 1 : 0})
                }
            };
            if ($rootScope.myGames && $rootScope.myGames.length && Config.main.separateFavoritesInClassic) {
                request.where.game.id = {'@nin': $rootScope.myGames};
            }
            if ($scope.selectedUpcomingPeriod && !Config.env.live) {
                request.where.game.start_ts = {'@now': {'@gte': 0, '@lt': $scope.selectedUpcomingPeriod * 3600}};
            } else if (Config.env.gameTimeFilter) {
                request.where.game.start_ts = Config.env.gameTimeFilter;
            }
            if (liveVideoCondition && Config.env.live) {
                request.where.game['@or'] = liveVideoCondition;
            }
            if (!$scope.liveFilters.disableRegions || !Config.env.live) {
                sport.regions = [];
                Zergling.subscribe(
                    request,
                    function (data) {
                        updateLeftMenuSportRegions(sport, data);
                    }
                )
                    .then(function (result) {
                        if (result.subid) {
                            sport.regionsSubId = result.subid;
                            allSubscriptions[result.subid] = result.subid;
                        }
                        if (result.data) {
                            updateLeftMenuSportRegions(sport, result.data);
                        }
                        if (!$scope.userActivity[type].selectedRegionId) {
                            var firstRegion = Utils.objectToArray(result.data.region).sort(function (a, b) {
                                return a.order - b.order;
                            })[0];
                            $scope.expandLeftMenuRegion(firstRegion, true);
                        } else if (doChainingOpen) {
                            var key = $scope.userActivity[type].selectedRegionId;
                            if (result.data && result.data.region[key]) {
                                $scope.expandLeftMenuRegion(result.data.region[key], true);
                            }
                        }

                        sport.loading = false;

                    })['catch'](function (reason) {
                        sport.loading = false;
                        console.log('Error:', reason);
                    });
            } else {
                var regionAll = {id: -1, name: ' '};
                sport.regions = sport.regions || {};
                sport.regions[regionAll.id] = regionAll;
                $scope.expandLeftMenuRegion(regionAll, true);
            }
        }


    };

    /**
     * @ngdoc method
     * @name expandLeftMenuFavoriteCompetitions
     * @methodOf vbet5.controller:classicExplorerCtrl
     * @description Expand left menu favorite competitions
     * @param {Object} sport sports data object
     */
    $scope.expandLeftMenuFavoriteCompetitions = function expandLeftMenuFavoriteCompetitions(sport) {
        var type = Number(Config.env.live);
        $scope.leftMenuClosed = false;

        expandedSports[type][sport.id] = sport.expanded;
        var siteId = Config.main.site_id;
        function doSubscribe() {
            var subscribingProgress = $q.defer();
            favoriteCompetitionsSubsciptionProgress = subscribingProgress.promise;
            var request = {
                'source': 'betting',
                'what': {
                    'competition': ['name', 'alias', 'id'],
                    'game': ['game_number', 'id', 'start_ts', 'team1_name']
                },
                'where': {
                    'competition': {'favorite': true}
                }
            };
            sport.favoriteCompetition = [];
            Zergling.subscribe(
                request,
                updateLeftMenuFavoriteCompetitions
            )
                .then(function (result) {
                    if (result.subid) {
                        sport.regionsSubId = result.subid;
                        allSubscriptions[result.subid] = result.subid;
                    }
                    if (result.data) {
                        updateLeftMenuFavoriteCompetitions(sport, result.data);
                    }

                    sport.loading = false;

                })['catch'](function (reason) {
                    console.log('Error:', reason);
                    subscribingProgress.resolve(null);
                });
        }
        if (favoriteCompetitionsSubsciptionProgress === null) {
            doSubscribe();
        } else {
            favoriteCompetitionsSubsciptionProgress.then(function (subId) {
                Zergling.unsubscribe(subId);
                doSubscribe();
            });
        }
    };

    /**
     * @ngdoc method
     * @name updateLeftMenuRegionGames
     * @methodOf vbet5.controller:classicExplorerCtrl
     * @description  updates regions data object by adding sports list to it
     *
     * @param {Object} region region data object to update with its sports
     * @param {Object} data competitions/games data object
     */
    function updateLeftMenuRegionGames(region, data) {
        region.competitions = [];
        angular.forEach(data.region, function (regionData) {
            angular.forEach(regionData.competition, function (competition) {
                competition.name = $filter('removeParts')(competition.name, [$scope.selectedSport.name]);
                competition.name = $filter('removeParts')(competition.name, [regionData.name]);
                competition.region = {'alias': regionData.alias, name: regionData.name, id: regionData.id};
                GameInfo.replaceRegionFieldsIfNeeded(competition.region);
                if (competition.game) {
                    competition.games = Utils.objectToArray(competition.game).sort(function (a, b) {
                        return a.start_ts - b.start_ts;
                    });

                    if (Config.env.live) {
                        var i, length;
                        for (i = 0, length = competition.games.length; i < length; i += 1) {
                            GameInfo.hasVideo(competition.games[i]);
                        }
                    }
                }
                region.competitions.push(competition);
            });
        });
        region.competitions.sort(function (a, b) {
            return a.order - b.order;
        });
        $scope.leftMenuIsLoading = false;
        //console.log('region', region, data);
    }

    /**
     * @ngdoc method
     * @name selectRegion
     * @methodOf vbet5.controller:classicExplorerCtrl
     * @description
     * Selects region and subscribes to it's competitions
     * data is processed by  updateGames func.
     *
     */
    function selectRegion() {
        var type = Number(Config.env.live);
        $location.search('region', $scope.selectedRegion.id);
        $scope.userActivity[type].selectedRegionId = $scope.selectedRegion.id;
    }

    /**
     *
     * @param currentRegion
     * @description Close all opened regions except of given
     */
    function closeOtherRegions(currentRegion) {
        var type = Number(Config.env.live);
        angular.forEach(expandedRegions[type], function (item, key) {
            if (item.id !== currentRegion.id) {
                expandedRegions[type][key].expanded = false;
            }
        });
    }

    /**
     * @ngdoc method
     * @name expandLeftMenuRegion
     * @methodOf vbet5.controller:classicExplorerCtrl
     * @description  expands(or collapses if expanded) region menu (loads and subscribes/unsubscribes to games)
     *
     * @param {Object} region region data object
     * @param {Boolean} keepItOpen if true, keeps it expanded(just reloads)
     */
    $scope.expandLeftMenuRegion = function expandLeftMenuRegion(region, keepItOpen) {
        console.log('expandLeftMenuRegion', region. keepItOpen);
        var type = Number(Config.env.live);
        if (Config.env.preMatchMultiSelection && !Config.env.live) {
            closeOtherRegions(region);
        }
        region.expanded = keepItOpen || !region.expanded;
        expandedRegions[type][region.id] = region;

        if (region.gamesSubId) {
            Zergling.unsubscribe(region.gamesSubId).then(function () {
                region.gamesSubId = null;
            });
        }
        if (region.expanded) {
            region.loading = true;
            $scope.selectedRegion = region;
            var request = {
                'source': 'betting',
                'what': {
                    'competition': ['id', 'name', 'order'],
                    'region': ['name', 'alias', 'id']
                },
                'where': {
                    'game': (Config.main.enableVisibleInPrematchGames && !Config.env.live ? {
                        '@or': ([{'type': Config.env.live ? 1 : 0}, {
                            'visible_in_prematch': 1,
                            'type': 1
                        }])
                    } : {'type': Config.env.live ? 1 : 0})
                }
            };
            if ($rootScope.myGames && $rootScope.myGames.length && Config.main.separateFavoritesInClassic) {
                request.where.game.id = {'@nin': $rootScope.myGames};
            }
            if (region.id !== -1) {
                if (Config.main.regionMapping && Config.main.regionMapping.enabled && GameInfo.getRegionChildren(region.id)) {
                    request.where.region = {'id': {'@in': GameInfo.getRegionChildren(region.id)}};
                } else {
                    request.where.region = {'id': region.id};
                }

            }
            if ($scope.selectedUpcomingPeriod && !Config.env.live) {
                request.where.game.start_ts = {'@now': {'@gte': 0, '@lt': $scope.selectedUpcomingPeriod * 3600}};
            } else if (Config.env.gameTimeFilter) {
                request.where.game.start_ts = Config.env.gameTimeFilter;
            }
            if (liveVideoCondition && Config.env.live) {
                request.where.game['@or'] = liveVideoCondition;
            }
            if (Config.env.live) {
                request.what.game = ['id', 'start_ts', 'team1_name', 'team2_name', 'type', 'info', 'events_count', 'markets_count', 'extra', 'is_blocked', 'game_number', 'stats', 'exclude_ids', 'tv_type', 'video_id', 'video_id2', 'video_id3', 'video_provider'];
            } else if (Config.env.preMatchMultiSelection) {
                request.what.game = ['id', 'team1_name', 'team2_name', 'start_ts', 'game_number'];
            }
            if ($scope.liveFilters.disableRegions) {
                request.where.sport = {id: region.sportId || $scope.selectedSport.id};
            }
            Zergling.subscribe(
                request,
                function (data) {
                    updateLeftMenuRegionGames(region, data);
                }
            )
                .then(function (result) {
                    if (result.subid) {
                        region.gamesSubId = result.subid;
                        allSubscriptions[result.subid] = result.subid;
                    }
                    if (result.data) {
                        updateLeftMenuRegionGames(region, result.data);
                    }
                    // when user doesn't clicked on competition we opening the first
                    if (!$scope.userActivity[type].selectedCompetitionId && result.data.region) {
                        var firstCompetition = region.competitions[0];
                        if (firstCompetition) {
                            $scope.expandCompetition(firstCompetition);
                        }
                    }
                    // if user have competition id in URL we opening it
                    if (!$scope.todaysBetsSelected && (!$scope.selectedCompetition || !$scope.selectedCompetition.name)) {
                        $scope.expandCompetition(Utils.getArrayObjectElementHavingFieldValue(region.competitions, 'id', $scope.userActivity[type].selectedCompetitionId));
                        // In case when we in multiselection mode
                        if (Config.env.preMatchMultiSelection && !Config.env.live && $location.search().game && (!$scope.openGame || $scope.openGame.id !== Number($location.search().game))) {
                            $scope.openGameFullDetails({id: Number($location.search().game)});
                        }
                    }
                    // in case when we in live and we have in url competition id then select the competition
                    if (Config.env.live) {
                        if ($scope.userActivity[type].selectedCompetitionId && region.competitions.length > 0) {
                            $scope.expandCompetition(Utils.getArrayObjectElementHavingFieldValue(region.competitions, 'id', $scope.userActivity[type].selectedCompetitionId));
                        }
                    }


                    region.loading = false;

                })['catch'](function (reason) {
                    region.loading = false;
                    console.log('Error:', reason);
                });
        }

        selectRegion();

    };

    /**
     * @ngdoc function
     * @name getDefaultSelectedMarketBase
     * @methodOf vbet5.controller:classicExplorerCtrl
     * @description
     * returns the market base of market for which the 2 event price difference is minimal
     *
     * @param {Object} markets markets
     * @returns {number} base market base
     */
    function getDefaultSelectedMarketBase(markets) {
        var minDiff,
            defaultBase = markets[0].base;

        angular.forEach(markets, function (market) {
            var currDiff,
                events = Utils.objectToArray(market.event);
            if (events.length === 2 && (((currDiff = Math.abs(events[0].price - events[1].price)) < minDiff) || minDiff === undefined)) {
                minDiff = currDiff;
                defaultBase = market.base;
            }
        });
//        console.log('default base:', defaultBase, markets);
        return defaultBase;
    }

    /**
     * @ngdoc method
     * @name updatePrematchGames
     * @methodOf vbet5.controller:classicExplorerCtrl
     * @description  Updates pre-mach games list (middle column)
     * @param {Object} data game data
     */
    function updatePrematchGames(data) {

        $scope.prematchGameViewData = [];
        angular.forEach(data.sport, function (sport) {
            angular.forEach(sport.region, function (region) {
                angular.forEach(region.competition, function (competition) {
                    angular.forEach(competition.game, function (game) {
                        game.sport = {id: sport.id, alias: sport.alias, name: sport.name};
                        game.region = {id: region.id};
                        game.competition = {id: competition.id, order: competition.order};
                        game.firstMarket = $filter('firstElement')(game.market);
                        game.additionalEvents = Config.main.showEventsCountInMoreLink ? game.events_count : game.markets_count;
                        $scope.showMarketsFilter = false;
                        if (Config.main.enableMarketFiltering && game.sport.alias === 'Soccer') {
                            $scope.showMarketsFilter = true;
                            game.filteredMarkets = Utils.groupByItemProperty(game.market, 'type');
                            angular.forEach(game.filteredMarkets, function (marketGroup, id) {
                                if (marketGroup.length > 1 && marketGroup[0].base) {
                                    angular.forEach(marketGroup, function (market) {
                                        if (market.base === getDefaultSelectedMarketBase(marketGroup)) {
                                            game.filteredMarkets[id].events = Utils.objectToArray(market.event);
                                        }
                                    });

                                } else {
                                    game.filteredMarkets[id].events = Utils.objectToArray(marketGroup[0].event);
                                }
                                game.filteredMarkets[id].events.sort(function (a, b) {
                                    return a.order - b.order;
                                });
                                if (game.filteredMarkets[id].events.length === 2) {
                                    game.filteredMarkets[id].events.splice(1, 0, {})
                                }
                            });
                        }

                        if (game.firstMarket) {
                            game.firstMarket.events = Utils.createMapFromObjItems(game.firstMarket.event, 'type');
                            angular.forEach(game.firstMarket.events, function (event) {
                                event.name = $filter('improveName')(event.name, game);
                            });
                            if (!Config.main.showEventsCountInMoreLink) {
                                game.additionalEvents--;
                            } else {
                                game.additionalEvents -= $filter('count')(game.firstMarket.events);
                            }
                        }
                        //$scope.prematchGames.push(game);
                    });
                    competition.games = Utils.objectToArray(competition.game).sort(function (a, b) {
                        return a.start_ts - b.start_ts;
                    });
                    if (!$location.search().game && $scope.selectedCompetition && competition.id === $scope.selectedCompetition.id) {
                        expandFullGameDetails(competition);
                    }
                    $scope.prematchGameViewData.push(competition);
                });
            });
        });
        //alert($scope.prematchGameViewData.length);

        if (Storage.get('isPopularGames') && !$scope.isPopularGamesLoadedFlag) {
            $scope.loadPopularGames(true);
        } else if (!$scope.todaysBetsSelected && $scope.prematchGameViewData.length === 0 && !Config.env.preMatchMultiSelection && $scope.isPopularGames === false && Config.main.loadPopularGamesForSportsBook) {
            $scope.loadPopularGames(true);
        }
        $scope.prematchGamesLoading = false;
        $scope.leftMenuIsLoading = false;

        Storage.set('isPopularGames', !!$scope.isPopularGames);
        $scope.isPopularGamesLoadedFlag = true;

        //$scope.prematchGames.sort(function (a, b) { return a.start_ts - b.start_ts; }); //sort by game time
        //$scope.prematchGames.sort(function (a, b) { return a.competition.order - b.competition.order; });
        console.log('prematch games', $scope.prematchGames, $scope.prematchGameViewData);

    }

    /**
     * @ngdoc method
     * @name selectGame
     * @methodOf vbet5.controller:classicExplorerCtrl
     * @description Select Competition - update route
     */
    $scope.selectCompetition = function selectCompetition() {
        if (!$scope.selectedCompetition) {
            return;
        }
        var type = Number(Config.env.live);
        $scope.userActivity[type].selectedCompetitionId = $scope.selectedCompetition.id;
        $location.search('competition', $scope.selectedCompetition.id);
    };

    /**
     * @ngdoc method
     * @name selectGame
     * @methodOf vbet5.controller:classicExplorerCtrl
     * @description Select game
     * @param {Number} Game ID
     */
    $scope.selectGame = function (gameId) {
        var type = Number(Config.env.live);
        $location.search('game', gameId);
        $scope.userActivity[type].selectedGameId = gameId;
    };

    /**
     * @ngdoc method
     * @name expandFullGameDetails
     * @description automaticly expand game full detalis when we have game
     * @methodOf vbet5.controller:classicExplorerCtrl
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
        if (competition.expanded && gameToOpen.id !== $scope.userActivity[type].selectedGameId) {
            $scope.openGameFullDetails(gameToOpen, competition);
        } else if (!$scope.openGame) {
            $scope.openGameFullDetails(gameToOpen, competition);
        }
    }

    $scope.prematchMultiViewGames = Storage.get('prematchMultiViewGames') || {};
    $scope.prematchMultiViewCompetitions = Storage.get('prematchMultiViewCompetitions') || {};

    $scope.$watch('prematchMultiViewGames', function () {
        Storage.set("prematchMultiViewGames", $scope.prematchMultiViewGames);
    }, true);
    $scope.$watch('prematchMultiViewCompetitions', function () {
        Storage.set("prematchMultiViewCompetitions", $scope.prematchMultiViewCompetitions);
    }, true);

    /**
     * @ngdoc method
     * @name competitionToMultiview
     * @methodOf vbet5.controller:classicExplorerCtrl
     * @description Move competition to multiview
     * @param {Object} competition object
     */
    $scope.competitionToMultiview = function competitionToMultiview(competition) {
        $scope.virtualSportsSelected = false;
        angular.forEach(competition.game, function (game) {
            $scope.prematchMultiViewGames[game.id] = $scope.prematchMultiViewCompetitions[competition.id];
        });
        $scope.loadPrematchMultiView();
    };

    /**
     * @ngdoc method
     * @name gameCheckBoxClicked
     * @methodOf vbet5.controller:classicExplorerCtrl
     * @description Game checkbox click handler
     * @param {Object} competition object
     */
    $scope.gameCheckBoxClicked = function gameCheckBoxClicked(competition) {
        var fullySelected = true;
        angular.forEach(competition.game, function (game) {
            if (!$scope.prematchMultiViewGames[game.id]) {
                fullySelected = false;
            }
        });
        $scope.prematchMultiViewCompetitions[competition.id] = fullySelected;
        $scope.loadPrematchMultiView();
    };

    /**
     * @ngdoc method
     * @name removeGameFromSelection
     * @methodOf vbet5.controller:classicExplorerCtrl
     * @description Remove game from selection
     * @param {Number} game id
     * @param {Object} competition object
     */
    $scope.removeGameFromSelection = function removeGameFromSelection(id, competition) {
        $scope.prematchMultiViewGames[id] = undefined;
        $scope.gameCheckBoxClicked(competition);
        $scope.loadPrematchMultiView();
    };

    /**
     * @ngdoc method
     * @name resetPrematchMultiView
     * @methodOf vbet5.controller:classicExplorerCtrl
     * @description Reset multi view
     * @param {Boolean} true if previos competition must be handled
     */
    $scope.resetPrematchMultiView = function resetPrematchMultiView(prev) {
        $scope.prematchMultiViewGames = {};
        $scope.prematchMultiViewCompetitions = {};

        if($scope.prevCompetition[0] === 'popular_games') {
            $scope.isPopularGames = false;
            $scope.virtualSportsSelected = true;
            return;
        }

        if (prev) {
            if ($scope.prevCompetition && $scope.prevCompetition[0] && $scope.prevCompetition[1]) {
                $scope.expandCompetition($scope.prevCompetition[0], $scope.prevCompetition[1]);
            } else {
                $scope.resetPrematchMultiView();
            }
            return;
        }

        $scope.loadPrematchMultiView();
    };

    /**
     * @ngdoc method
     * @name toggleMultiView
     * @methodOf vbet5.controller:classicExplorerCtrl
     * @description Toggle multi view
     */
    $scope.toggleMultiView = function toggleMultiView() {
        $scope.switchToPopularGames = false;
        Config.env.preMatchMultiSelection = !Config.env.preMatchMultiSelection;

        Storage.set('preMatchMultiSelection', Config.env.preMatchMultiSelection);
        if (Config.env.preMatchMultiSelection) {
            $scope.loadPrematchMultiView();
        }
        reloadView();

    };

    /**
     * @ngdoc method
     * @name loadPopularGames
     * @description Loads popular games
     * @methodOf vbet5.controller:classicExplorerCtrl
     * @param {Boolean} true if you want to force game load even if they are already present in the scope
     */
    $scope.loadPopularGames = function (force) {

        if (Config.env.preMatchMultiSelection) {
            $scope.switchToPopularGames = true;
        }
        if (Config.main.loadPopularGamesForSportsBook.enabled) {

            if ($scope.virtualSportsSelected) {
                $scope.prevCompetition = ['popular_games', null];
                $scope.virtualSportsSelected = false;
            }

            if (force) {
                $scope.isPopularGames = true;
            } else {
                if ($scope.isPopularGames) {
                    $scope.resetPrematchMultiView(true);
                    return;
                }
            }

            Config.env.preMatchMultiSelection = false;

            Storage.set('preMatchMultiSelection', Config.env.preMatchMultiSelection);

            $scope.loadPrematchMultiView(true);
        }

    };

    /**
     * @ngdoc method
     * @name loadPrematchMultiView
     * @description Load prematch multi view
     * @methodOf vbet5.controller:classicExplorerCtrl
     * @param {Boolean} load only popular games based on config
     */
    $scope.loadPrematchMultiView = function loadPrematchMultiView(popular) {
        $scope.favoriteGameIsSelected = false;
        function doSubscribe() {
            var subscribingProgress = $q.defer();
            multiViewSubsciptionProgress = subscribingProgress.promise;
            //$scope.prematchGamesLoading = true;
            var prematchMultiViewGameIds = [];
            angular.forEach($scope.prematchMultiViewGames, function (val, id) {
                if (val) {
                    prematchMultiViewGameIds.push(parseInt(id, 10));
                }
            });
            var request = {
                'source': 'betting',
                'what': {
                    'sport': ['id', 'name', 'alias'],
                    'competition': ['id', 'order', 'name'],
                    'region': ['id', 'name', 'alias'],
                    game: [
                        ['id', 'start_ts', 'team1_name', 'team2_name', 'team1_external_id', 'team2_external_id', 'type',
                            'info', 'events_count', 'markets_count', 'extra', 'is_blocked', 'exclude_ids', 'is_stat_available', 'game_number', 'game_external_id']
                    ],
                    'event': ['id', 'price', 'type', 'name'],
                    'market': ['type', 'express_id', 'name']
                },
                'where': {
                    'game': {'type': 0, 'id': {'@in': prematchMultiViewGameIds}},
                    'market': {'type': {'@in': ['P1XP2', 'P1P2']}}
                }
            };

            if (Config.env.gameTimeFilter) {
                request.where.game.start_ts = Config.env.gameTimeFilter;
            }

            //Config.main.site_id
            // 23

            $scope.isPopularGames = false;
            if (popular && Config.main.loadPopularGamesForSportsBook.enabled) {

                var siteId = Config.main.site_id;

                if (Config.main.loadPopularGamesForSportsBook.testSiteId) {
                    siteId = Config.main.loadPopularGamesForSportsBook.testSiteId;
                }

                request.where = {};

                if (Config.main.loadPopularGamesForSportsBook.type1x1) {
                    request.where = {event: {type: {'@in': ['P1', 'X', 'P2']}}};
                }

                request.where[Config.main.loadPopularGamesForSportsBook.level] = {};
                request.where[Config.main.loadPopularGamesForSportsBook.level][Config.main.loadPopularGamesForSportsBook.type] = true;

                $scope.isPopularGames = true;
                $scope.prematchGamesLoading = true;
            }

            Storage.set('isPopularGames', $scope.isPopularGames);

            Zergling.subscribe(
                request,
                updatePrematchGames
            )
                .then(function (result) {
                    if (result.subid) {
                        multiViewSubId = result.subid;
                        allSubscriptions[result.subid] = result.subid;
                        subscribingProgress.resolve(result.subid);
                    }
                    if (result.data) {
                        updatePrematchGames(result.data);
                    }
                    //$scope.prematchGamesLoading = false;
                })['catch'](function (reason) {
                    subscribingProgress.resolve(null);
                    $scope.prematchGamesLoading = false;
                    console.log('Error:', reason);
                });
        }

        if (multiViewSubsciptionProgress === null) {
            doSubscribe();
        } else {
            multiViewSubsciptionProgress.then(function (subId) {
                Zergling.unsubscribe(subId);
                doSubscribe();
                multiViewSubId = null;

            });
        }
    };

    /**
     * @ngdoc method
     * @name openStatistics
     * @methodOf vbet5.controller:classicExplorerCtrl
     * @description
     * Opens statistics in popup window
     *
     * @param {Object} game game object
     */

    $scope.openStatistics = function openStatistics(game) {
        console.log(game);
        $window.open(GameInfo.getStatsLink(game), game.id, "width=940,height=600,resizable=yes,scrollbars=yes");
    };

    /**
     * @ngdoc method
     * @name expandCompetition
     * @methodOf vbet5.controller:classicExplorerCtrl
     * @description  updates open game data object
     *
     * @param {Object} competition competition object
     */
    $scope.expandCompetition = function expandCompetition(competition, sport) {
        $scope.todaysBetsSelected = false;
        $scope.isPopularGames = false;
        $scope.prevCompetition = [competition, sport];
        if (!competition || (Config.env.preMatchMultiSelection && !Config.env.live)) {
            return;
        }
        if (sport && sport.id !== VIRTUAL_SPORT_VIRTUALS.id) {
            $scope.virtualSportsSelected = false;
        }
        function doSubscribe() {
            var subscribingProgress = $q.defer();
            competitionSubsciptionProgress = subscribingProgress.promise;
            $scope.prematchGamesLoading = true;
            var requestMarketTypes = ['P1P2'];
            angular.forEach(Config.main.marketFilterTypes, function (fType) {
                requestMarketTypes.push(fType.type);
            });

            var request = {
                'source': 'betting',
                'what': {
                    'sport': ['id', 'name', 'alias'],
                    'competition': ['id', 'name'],
                    'region': ['id'],
                    game: [
                        ['id', 'start_ts', 'team1_name', 'team2_name', 'team1_external_id', 'team2_external_id', 'type', 'info', 'events_count', 'markets_count', 'extra', 'is_blocked', 'exclude_ids', 'is_stat_available', 'game_number']
                    ],
                    'event': ['id', 'price', 'type', 'name', 'order', 'base'],
                    'market': ['type', 'express_id', 'name', 'base']
                },
                'where': {
                    'competition': {'id': parseInt(competition.id, 10)},
                    'game': (Config.main.enableVisibleInPrematchGames && !Config.env.live ? {
                        '@or': ([{'type': Config.env.live ? 1 : 0}, {
                            'visible_in_prematch': 1,
                            'type': 1
                        }])
                    } : {'type': Config.env.live ? 1 : 0}),
                    'market': {'type': {'@in': requestMarketTypes}}
                }
            };
            if ($rootScope.myGames && $rootScope.myGames.length && Config.main.separateFavoritesInClassic) {
                request.where.game.id = {'@nin': $rootScope.myGames};
            }
            if ($scope.selectedUpcomingPeriod && !Config.env.live) {
                request.where.game.start_ts = {'@now': {'@gte': 0, '@lt': $scope.selectedUpcomingPeriod * 3600}};
            } else if (Config.env.gameTimeFilter) {
                request.where.game.start_ts = Config.env.gameTimeFilter;
            }
            Zergling.subscribe(
                request,
                updatePrematchGames
            )
                .then(function (result) {
                    if (result.subid) {
                        competition.gamesSubId = result.subid;
                        allSubscriptions[result.subid] = result.subid;
                        subscribingProgress.resolve(result.subid);
                    }
                    if (result.data) {
                        updatePrematchGames(result.data);
                    }
                    $scope.prematchGamesLoading = false;
                })['catch'](function (reason) {
                    subscribingProgress.resolve(null);
                    $scope.prematchGamesLoading = false;
                    console.log('Error:', reason);
                });
        }

        $scope.selectedCompetition = competition;
        $scope.selectedSport = sport || $scope.selectedSport;
        $scope.selectedRegion = competition.region || $scope.selectedRegion;

        console.log('expandCOmpetititon', competition);
        if (Config.env.live) {
            competition.expanded = !competition.expanded;
            // open game full detalis when we are in live mode
            expandFullGameDetails(competition);
        } else {
            $scope.favoriteGameIsSelected = false;
            if ($location.search().game && (!$scope.openGame || $scope.openGame.id !== Number($location.search().game))) { //open if deeplinked and different from now open
                $scope.openGameFullDetails({id: Number($location.search().game)});
            }

            if (competitionSubsciptionProgress === null) {
                doSubscribe();
            } else {
                competitionSubsciptionProgress.then(function (subId) {
                    Zergling.unsubscribe(subId);
                    doSubscribe();
                    competition.gamesSubId = null;
                });
            }
            unsubscribeFromTodayBets();
        }

        competition.active = !competition.active;
        $scope.selectCompetition(competition.id);
        selectRegion();
        if (sport) {
            selectSport();
        }

    };

    /**
     * @ngdoc method
     * @name updateTodaysBetsGames
     * @description Update todays bets games
     * @methodOf vbet5.controller:classicExplorerCtrl
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
        $scope.prematchGameViewData = prematchGameViewData;
    }
    /**
     * @ngdoc method
     * @name initTodaysBets
     * @methodOf vbet5.controller:classicExplorerCtrl
     */
    $scope.initTodaysBets = function initTodaysBets() {
        $scope.selectedSport = TODAY_BETS;
        selectSport();
        $scope.isPopularGames = false;
        $scope.favoriteGameIsSelected = false;
        if ($scope.env.preMatchMultiSelection) {
            TODAY_BETS.expanded = false;
            expandedSports[0][TODAY_BETS.id] = true; // first index is the type(live or pre-patch)of the page - in this case 0 means pre-match mode
            $scope.toggleMultiView();
            return;
        }
        if ($scope.env.live) {
            TODAY_BETS.expanded = false;
            expandedSports[0][TODAY_BETS.id] = true; // first index is the type(live or pre-patch)of the page - in this case 0 means pre-match mode
            $scope.toggleLive();
            return;
        }

        subscribeForTodaysBetsSports();
    };

    /**
     * @ngdoc method
     * @name expandTodaysBets
     * @methodOf vbet5.controller:classicExplorerCtrl
     *
     * @param {Object} sport sport object
     */
    $scope.expandTodaysBets = function expandTodaysBets(sport) {

        if (!sport) {
            return;
        }

        $scope.todaysBetsSelectedSport = sport;
        $scope.prematchGamesLoading = true;
        function doSubscribe() {
            var subscribingProgress = $q.defer();
            todaysBetsSubsciptionProgress = subscribingProgress.promise;
            var request = {
                'source': 'betting',
                'what': {
                    'sport': ['id', 'name', 'alias', "order"],
                    'region': ['id'],
                    'competition': ['id'],
                    game: [
                        ['id', 'start_ts', 'team1_name', 'team2_name', 'team1_external_id', 'team2_external_id', 'type', 'info', 'events_count', 'markets_count', 'extra', 'is_blocked', 'exclude_ids', 'is_stat_available', 'game_number']
                    ],
                    'market': ['type', 'express_id', 'name'],
                    'event': ['id', 'price', 'type', 'name']
                },
                'where': {
                    //'competition': {'id': parseInt(competition.id, 10)},
                    "sport": {
                        "id": {"@in": [sport.id]}
                    },
                    'game': {
                        type: 0,
                        '@or': [{
                            start_ts: {
                                '@gte': Moment.get().add(0, 'days').startOf("day").unix(),
                                '@lt': Moment.get().add(1, 'days').unix()
                            }
                        }]
                    },
                    'market': {'type': {'@in': ['P1XP2', 'P1P2']}}
                }
            };
            if ($rootScope.myGames && $rootScope.myGames.length && Config.main.separateFavoritesInClassic) {
                request.where.game.id = {'@nin': $rootScope.myGames};
            }
            Zergling.subscribe(
                request,
                updateTodaysBetsGames
            )
                .then(function (result) {
                    if (result.subid) {
                        //competition.gamesSubId = result.subid;
                        allSubscriptions[result.subid] = result.subid;
                        subscribingProgress.resolve(result.subid);
                    }
                    if (result.data) {
                        updateTodaysBetsGames(result.data);
                    }
                    $scope.prematchGamesLoading = false;
                })['catch'](function (reason) {
                    subscribingProgress.resolve(null);
                    $scope.prematchGamesLoading = false;
                    console.log('Error:', reason);
                });
        }
        if (todaysBetsSubsciptionProgress === null) {
            doSubscribe();
        } else {
            todaysBetsSubsciptionProgress.then(function (subId) {
                Zergling.unsubscribe(subId);
                doSubscribe();
            });
        }
    };









    $scope.favorites = {
        expanded: false,
        games: {}
    };

    /**
     * @ngdoc method
     * @name updateFavoriteGames
     * @methodOf vbet5.controller:classicExplorerCtrl
     * @description  expands(or collapses if expanded) favorites item in left menu
     *
     * @param {Object} data favorite games object
     */
    function updateFavoriteGames(data) {
        console.log('favorites', data);
        var games = {};
        angular.forEach(data.sport, function (sport) {
            angular.forEach(sport.region, function (region) {
                angular.forEach(region.competition, function (competition) {
                    angular.forEach(competition.game, function (game) {
                        game.competition = {id: competition.id, name: competition.name};
                        game.region = {id: region.id};
                        game.sport = {id: sport.id, alias: sport.alias, name: sport.name};
                        if (Config.env.live) {
                            GameInfo.hasVideo(game);
                        }
                        games[game.id] = game;
                        if ($location.search().game == game.id && (!$scope.selectedGame || $scope.selectedGame.id !== game.id)) {
                            console.log("calling openGameFullDetails", "selectedgame", $scope.selectedGame, "game id", game.id, "location", $location.search().game);
                            $scope.openGameFullDetails(game);
                        }
                    });
                });
            });
        });
        $scope.favorites.games = games;
    }

    /**
     * @ngdoc method
     * @name toggleFavorites
     * @methodOf vbet5.controller:classicExplorerCtrl
     * @description  expands(or collapses if expanded) favorites item in left menu
     *
     * @param {Boolean} keepItOpen optional, if true, will expand it
     */
    $scope.toggleFavorites = function toggleFavorites(keepItOpen) {
        $scope.favorites.expanded = keepItOpen || !$scope.favorites.expanded;
        function doSubscribe() {
            if (!$scope.favorites.expanded) {
                $scope.favorites.games = {};
                if (favoritesSubId) {
                    Zergling.unsubscribe(favoritesSubId);
                }
                return;
            }
            var subscribingProgress = $q.defer();
            favoritesSubsciptionProgress = subscribingProgress.promise;
            Zergling.subscribe(
                {
                    'source': 'betting',
                    'what': {
                        sport: ['id', 'name', 'alias'],
                        region: ['id'],
                        'competition': ['id', 'name'],
                        'game': ['id', 'start_ts', 'team1_name', 'team2_name', 'type', 'info', 'events_count', 'markets_count', 'extra', 'is_blocked', 'stats', 'tv_type', 'video_id', 'video_id2', 'video_id3', 'video_provider', 'game_number']
                    },
                    'where': {'game': {'id': {'@in': $rootScope.myGames}}}
                },
                function (data) {
                    updateFavoriteGames(data);
                }
            )
                .then(function (result) {
                    if (result.subid) {
                        favoritesSubId = result.subid;
                        allSubscriptions[result.subid] = result.subid;
                        subscribingProgress.resolve(result.subid);
                    }
                    if (result.data) {
                        updateFavoriteGames(result.data);
                    }

                })['catch'](function (reason) {
                    subscribingProgress.resolve(null);
                    console.log('Error:', reason);
                });
        }

        if (favoritesSubsciptionProgress === null) {
            doSubscribe();
        } else {
            favoritesSubsciptionProgress.then(function (subId) {
                Zergling.unsubscribe(subId);
                favoritesSubId = null;
                doSubscribe();
            });
        }
    };

    /**
     * @ngdoc method
     * @name toggleGameFavorite
     * @methodOf vbet5.controller:classicExplorerCtrl
     * @description  adds or removes(depending on if it's already there) game from 'my games' by emitting an event
     * @param {Object} game game object
     */
    $scope.toggleGameFavorite = function toggleGameFavorite(game) {
        if (!$rootScope.myGames || $rootScope.myGames.indexOf(game.id) === -1) {
            $scope.$emit('game.addToMyGames', game);
            $scope.favorites.expanded = true;
            $scope.toggleFavorites(true);
        } else {
            $scope.$emit('game.removeGameFromMyGames', game);
            $scope.toggleFavorites(true);
        }
        console.log('$scope.favorites', $scope.favorites);
    };

    $scope.$on('game.addToMyGames', function () {
        $scope.toggleFavorites(true);
    });

    if (Config.main.separateFavoritesInClassic) {
        $rootScope.$watch('myGames.length', function (newVal, oldVal) {
            if (newVal === oldVal) {
                return;
            }
            $scope.loadLeftMenuSports();
        });
    }


    /**f
     * @ngdoc method
     * @name detachVideo
     * @methodOf vbet5.controller:classicExplorerCtrl
     * @description called when video is detached. Sends game object to parent scope to show game video there
     *
     */
    $scope.pinnedGames = {};
    $scope.enlargedGame = null;

    /**
     * @ngdoc method
     * @name detachVideo
     * @methodOf vbet5.controller:classicExplorerCtrl
     * @description called when video is detached. Sends game object to parent scope to show game video there
     */
    $scope.detachVideo = function detachVideo(type) {
        $scope.pinnedGameType = type;
        $scope.isVideoDetached = true;
        $scope.openGame.video_data = null;
        GameInfo.getVideoData($scope.openGame);
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
     * @methodOf vbet5.controller:classicExplorerCtrl
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
            $scope.openGame.video_data = null;
            GameInfo.getVideoData($scope.openGame);
            $scope.isVideoDetached = false;
            $scope.openGame.activeFieldType = 'video'; //
        }
    };

    /**
     * @ngdoc method
     * @name selectPrematchTimePeriod
     * @methodOf vbet5.controller:classicExplorerCtrl
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
     * @methodOf vbet5.controller:classicExplorerCtrl
     * @description  changes live games stats mode from chart to details and back
     */
    $scope.changeStatsMode = function changeStatsMode(mode) {
        Config.env.liveStatsFlipMode = mode;
        // Config.env.liveStatsFlipMode = !Config.env.liveStatsFlipMode;
        Storage.set('liveStatsFlipMode', Config.env.liveStatsFlipMode);
    };

    /**
     * @ngdoc method
     * @name toggleStatsVisibility
     * @methodOf vbet5.controller:classicExplorerCtrl
     * @description  toggles live game statistics visibility
     */
    $scope.toggleStatsVisibility = function toggleStatsVisibility() {
        Config.env.hideLiveStats = !Config.env.hideLiveStats;
        Storage.set('hideLiveStats', Config.env.hideLiveStats);
    };

    /**
     * @ngdoc method
     * @name startInitialization
     * @methodOf vbet5.controller:classicExplorerCtrl
     * @description Initialization
     */
    $scope.startInitialization = function startInitialization() {
        GameInfo.getProviderAvailableEvents().then( function () {
            if (Storage.get('liveFiltersWithVideo')) {
                $scope.liveFilters.withVideo = true;
                liveVideoCondition = GameInfo.getVideoFilter();
            }

            if (!Storage.get('liveFiltersDisableRegions')) {
                $scope.liveFilters.disableRegions = false;
            }

            $scope.loadLeftMenuSports();
        });
    }
}]);
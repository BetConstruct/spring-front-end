/**
 * @ngdoc controller
 * @name vbet5.controller:modernViewManCtrl
 * @description
 * Explorer controller
 */
angular.module('vbet5.betting').controller('modernViewManCtrl', ['$rootScope', '$scope', 'Config', 'Zergling', 'Utils', '$filter', '$location', 'TimeoutWrapper', '$q', 'analytics', 'Storage', 'Translator', 'GameInfo', 'partner', function ($rootScope, $scope, Config, Zergling, Utils, $filter, $location, TimeoutWrapper, $q, analytics, Storage, Translator, GameInfo, partner) {
    'use strict';

    TimeoutWrapper = TimeoutWrapper($scope);
    var VIRTUAL_REGION_ALL = {id: null, alias: 'all', name: $filter('translate')('All'), order: -1};
    var VIRTUAL_REGION_UPCOMING = {id: -1, alias: 'allUpcoming', name: $filter('translate')('Upcoming'), order: -1};
    var VIRTUAL_REGION_WITHVIDEO = {id: -2, alias: 'withVideo', name: $filter('translate')('With video'), order: -1};
    var VIRTUAL_REGION_POPULAR = {id: -3, alias: 'popular', name: $filter('translate')('Popular'), order: -1};
    var VIRTUAL_SPORT_ALL = {id: null, alias: 'all', name: $filter('translate')('All'), order: -1};
    var VIRTUAL_SPORT_FAVORITE = {id: -1, alias: 'favorites', name: $filter('translate')('Favorite games'), order: -9999, game: $rootScope.myGames.length};
    // var VIRTUAL_SPORT_FINANCIALS = {
    //     id: -2,
    //     alias: 'financials',
    //     name: $filter('translate')('Financials'),
    //     order: Config.main.showFinancialsInSportList,
    //     game: 2,
    //     link: '#/financials'
    // };
    var VIRTUAL_SPORT_VIRTUALS = {
        id: -3,
        alias: 'virtualsports',
        name: $filter('translate')('Virtual sports'),
        order: Config.main.showVirtualsInSportList,
        game: 25
    };
    var VIRTUAL_MOST_POPULAR = {id: -4, alias: 'mostPopular', name: $filter('translate')(Config.main.popularMatches && Config.main.popularMatches.title || "Popular Games"), order: -1};

    var VIRTUAL_BOOSTED_BETS = {
        id: -14,
        alias: 'boostedbets',
        name: $filter('translate')('Boosted bets'),
        order: Config.main.boostedBets.order,
        game: 0
    };

    var VIRTUAL_COUPON_GAMES = {
        id: -16,
        alias: 'coupongames',
        name: $filter('translate')('Coupons'),
        order: Config.main.couponGames.order,
        game: 0
    };

    var sportListSubId = null;
    var regionListSubId = null;
    var gamesSubId = null;
    var mostPopularsListSubId = null;
    var boostedBetsListSubId = null;
    var searchParams;
    var sportSubscriptionProgress = null, regionSubscriptionProgress = null, gameSubsciptionProgress = null, subscribeToBoostedBetsProgress = null;
    $rootScope.boostedBetsEventIds = {};
    var couponPromise = null;

    $scope.withVideo = !!$location.search().video;
    var isWideScreen;

    var customSportAliasFilter = Utils.getCustomSportAliasFilter();
    var sportData;
    var coupons;
    GameInfo.checkIfTimeFilterIsNeeded();

    /**
     * @ngdoc method
     * @name createSportsListMoreDropdown
     * @methodOf vbet5.controller:modernViewManCtrl
     * @description Create sports list "more" dropdown
     */
    function createSportsListMoreDropdown() {
        $scope.sportsByLetterDividedToColumns = Utils.getPartToShowInColumns($scope.sports_list, $scope.sportListMaxVisibleItems, Config.main.sportListColumnNumber, 'name');
        // some functionality that can replace  sportsByLetterDividedToColumns function together with CSS
        $scope.additionalSports = Utils.getAdditionalItems($scope.sports_list, $scope.sportListMaxVisibleItems, 'name', 'sport');
    }

    /**
     * @ngdoc method
     * @name createRegionsListMoreDropdown
     * @methodOf vbet5.controller:modernViewManCtrl
     * @description Create region list "more" dropdown
     */
    function createRegionsListMoreDropdown() {
        $scope.regionsByLetterDividedToColumns = Utils.getPartToShowInColumns($scope.regionsList, $scope.regionsListMaxVisibleItems, Config.main.regionsListColumnNumber, 'name');
        $scope.additionalSports = Utils.getAdditionalItems($scope.sports_list, $scope.sportListMaxVisibleItems, 'name', 'sport');
    }

    //Watch sports and regions list and (re)generate the "more" dropdown block as they change
    $scope.$watch('sports_list', createSportsListMoreDropdown);
    $scope.$watch('regionsList', createRegionsListMoreDropdown);

    $scope.$on('widescreen.on', function () {
        if (Config.main.sportsOnLeft) {
            $scope.sportListMaxVisibleItems = 999; //don't limit when sport list is on left
        } else {
            $scope.sportListMaxVisibleItems = Config.main.sportListMaxVisibleItemsWide;
        }
        $scope.regionsListMaxVisibleItems = Config.main.regionsListMaxVisibleItemsWide;

        createRegionsListMoreDropdown();
        createSportsListMoreDropdown();
        isWideScreen = true;
        console.log('modern view main - widecreen on', $scope.regionsListMaxVisibleItems);
    });

    $scope.$on('widescreen.off', function () {
        $scope.regionsListMaxVisibleItems = Config.main.regionsListMaxVisibleItems;
        $scope.sportListMaxVisibleItems = Config.main.sportListMaxVisibleItems;
        createRegionsListMoreDropdown();
        createSportsListMoreDropdown();
        isWideScreen = false;
        console.log('modern view main - widecreen off', $scope.regionsListMaxVisibleItems);
    });

    $scope.upcomingPeriods = Config.main.upcomingGamesPeriods;
    $scope.upcomingRegionId = VIRTUAL_REGION_UPCOMING.id;
    /**
     * @ngdoc method
     * @name setUpcomingPeriod
     * @methodOf vbet5.controller:modernViewManCtrl
     * @description sets upcoming period duration
     * @param {Number} period period.  if null, will set default or saved one
     */
    $scope.setUpcomingPeriod = function setUpcomingPeriod(period) {
        console.log('$scope.setUpcomingPeriod', period);
        if (period === null) { //not provided, set saved or default one
            var selectedUpcomingPeriodIndex = Config.env.defaultUpcomingPeriodIndex !== undefined ? Config.env.defaultUpcomingPeriodIndex : 3; //default one
            var savedUpcomingPeriodIndex = Storage.get('upcomingPeriodIndex');
            if (savedUpcomingPeriodIndex !== null && $scope.upcomingPeriods[savedUpcomingPeriodIndex]) {
                selectedUpcomingPeriodIndex = savedUpcomingPeriodIndex;
            }
            $scope.selectedUpcomingPeriod = $scope.upcomingPeriods[selectedUpcomingPeriodIndex];
        } else {
            Storage.set('upcomingPeriodIndex', $scope.upcomingPeriods.indexOf(period));
            $scope.selectedUpcomingPeriod = period;
            $scope.resetSearchParams('game');
            $scope.selectRegion(VIRTUAL_REGION_UPCOMING);
            analytics.gaSend('send', 'event', 'explorer', 'Set Upcoming Period', {'page': $location.path(), 'eventLabel': (period + 'h')});
        }
    };
    $scope.setUpcomingPeriod(null); //init

    $scope.env = Config.env;

    /**
     * @ngdoc object
     * @name gameType
     * @propertyOf vbet5.controller:modernViewManCtrl
     * @description selected type: 1=live 0=pre-match,  used in zergling requests
     */
    searchParams = $location.search();
    if (searchParams.type !== undefined) {
        var mapping = {'live': 1, 'prematch': 0 };
        if (mapping[searchParams.type] !== undefined) {
            searchParams.type = mapping[searchParams.type];
        }
        $scope.gameType = parseInt(searchParams.type, 10);
        $scope.env.live = !!$scope.gameType;
        console.log($scope.env.live, $scope.gameType);
    } else {
        $scope.env.live = true;
        $scope.gameType = 1;
        $location.search('type', $scope.gameType);
    }


    /**
     * @ngdoc method
     * @name resetSearchParams
     * @methodOf vbet5.controller:modernViewManCtrl
     * @description
     * Removes search parameters from URL
     * @param {Object} [params]  can be one of the following:
     *
     *  * not specified  -  all parameters will be removed
     *  * single parameter name (string)  - specified parameter will be removed
     *  * array of parameters(strings)  - all specified parameters will be removed
     *
     */
    $scope.resetSearchParams = function resetSearchParams(params) {
        if (params === undefined) {
            searchParams = {};
        } else {
            if (params instanceof Object) {
                angular.forEach(params, function (param) {
                    delete searchParams[param];
                });
            } else {
                delete searchParams[params];
            }

        }
        $location.search(searchParams);
    };

    /**
     * @ngdoc method
     * @name toggleLive
     * @methodOf vbet5.controller:modernViewManCtrl
     * @description
     *
     * Toggles  live/pre-match
     * unsubscribes from all sports,regions, games subscriptions
     * then loads sports list for selected mode
     */
    $scope.toggleLive = function toggleLive() {
        $scope.env.live = !$scope.env.live;
        partner.call('liveActive', Config.env.live);

        $scope.gameType = $scope.env.live ? 1 : 0;
        analytics.gaSend('send', 'event', 'explorer', 'switch PM/LIVE', {'page': $location.path(), 'eventLabel': ($scope.env.live ? 'Live' : 'Prematch')});
        $location.search('type', $scope.gameType);
        if (sportSubscriptionProgress === null) {  //first time
            $scope.loadSportsList();
        } else {
            sportSubscriptionProgress.then(function (subId) {
                Zergling.unsubscribe(subId);
                sportListSubId = null;
                mostPopularsListSubId = null;
                boostedBetsListSubId = null;
                $scope.loadSportsList();
            });
        }
    };

    $scope.$on('toggleLive', $scope.toggleLive);

    /**
     * @ngdoc method
     * @name updateSportsList
     * @methodOf vbet5.controller:modernViewManCtrl
     * @description Update sport list
     * @param {Object} data the response data
     */
    function updateSportsList(data) {
        sportData = data;
        //ordering is done in controller, not in template because:
        // 1. it's faster (not called every $digest in ng-repeat, only on update)
        // 2. there's a controller function makeSelectedVisible, it needs already sorted list
        $scope.sports_list = Utils.objectToArray(data.sport);

        if (Config.main.showFavoriteGamesInSportList) {
            $scope.sports_list.unshift(VIRTUAL_SPORT_FAVORITE);
        }

        if (!customSportAliasFilter) {
            // if (Config.main.showFinancialsInSportList && !$scope.env.live) {
            //     $scope.sports_list.unshift(VIRTUAL_SPORT_FINANCIALS);
            // }
            if (Config.main.showVirtualsInSportList && !$scope.env.live) {
                $scope.sports_list.unshift(VIRTUAL_SPORT_VIRTUALS);
            }
            if ($scope.env.live) {
                VIRTUAL_SPORT_ALL.game = 0;
                $scope.sports_list.map(function (sport) {
                    if (sport && sport.game) {
                        VIRTUAL_SPORT_ALL.game += sport.game;
                    }
                });
                $scope.sports_list.unshift(VIRTUAL_SPORT_ALL);
            }

            if(Config.main.popularMatches && Config.main.popularMatches.enabled && !$scope.env.live) {
                $scope.sports_list.unshift(VIRTUAL_MOST_POPULAR);
            }
            if(Config.main.boostedBets && Config.main.boostedBets.enabled && !$scope.env.live && $rootScope.boostedBetsEventIds && Object.keys($rootScope.boostedBetsEventIds).length > 0) {
                $scope.sports_list.unshift(VIRTUAL_BOOSTED_BETS);
            }
            if(Config.main.couponGames && Config.main.couponGames.enabled && !$scope.env.live && coupons && coupons.length > 0) {
                $scope.sports_list.unshift(VIRTUAL_COUPON_GAMES);
            }
        }

        $scope.sports_list = $filter('orderBy')($scope.sports_list, 'order');
        if ($scope.selectedSportId && data.sport[$scope.selectedSportId]) {
            $scope.sports_list = Utils.makeSelectedVisible($scope.sports_list, {id: $scope.selectedSportId}, $scope.sportListMaxVisibleItems);
        }
    }


    function updateRegionsList(data) {
        if (data && data.region !== undefined) {
            var regionsArray = Utils.objectToArray(data.region);
            regionsArray = GameInfo.groupRegionsIfNeeded(regionsArray, $scope.selectedSportId);
            if (!$scope.selectedSportId) {
                regionsArray = groupRegionsForAllSports(regionsArray);
            }
            $scope.regionsList = $filter('orderBy')(regionsArray, 'order');
            if (!$scope.env.live && $scope.selectedSportId !== VIRTUAL_MOST_POPULAR.id && $scope.selectedSportId !== VIRTUAL_BOOSTED_BETS.id && $scope.selectedSportId !== VIRTUAL_COUPON_GAMES.id) {
                $scope.regionsList.unshift(VIRTUAL_REGION_UPCOMING);
            } else {
                if (Config.main.videoEnabled && !Config.main.customSportsBook.modern.toggleLiveButton && $scope.selectedSportId !== VIRTUAL_MOST_POPULAR.id && $scope.selectedSportId !== VIRTUAL_BOOSTED_BETS.id && $scope.selectedSportId !== VIRTUAL_COUPON_GAMES.id) {
                    $scope.regionsList.unshift(VIRTUAL_REGION_WITHVIDEO);
                }
                $scope.regionsList.unshift(VIRTUAL_REGION_ALL);
            }
            if ($scope.hasPopularGames) {
                $scope.regionsList.unshift(VIRTUAL_REGION_POPULAR);
            }
            console.log('regions list', $scope.regionsList);
        } else {
            console.warn('cannot update region list, got', data);
        }
    }

    // this function is needed for adding ids to columns for ng-repeat tracking
    function addColumnIds(columns) {
        columns.map(function (column) {
            var id = '';
            column.map(function (item) {
                id += item.id;
            });
            column.id = id;
        });
    }

    function divideToParts(arr, parts) {
        if (!arr) {
            return null;
        }
        var len = arr.length, ret = [], i = 0;
        while (i < len) {
            ret.push(arr.slice(i, i += Math.ceil((len - i) / parts--)));
        }
        return ret;
    }

    /**
     * @ngdoc method
     * @name updateGames
     * @methodOf vbet5.controller:modernViewManCtrl
     * @description
     *
     * @param {Object} data games data
     * @param {Boolean} initial indicates if initial data(not subscription update) is passed
     */
    function updateGames(data, initial) {
        $rootScope.gamesAreLoading = false;
        var firstSport = $filter('firstElement')(data.sport);
        if (firstSport
            && firstSport.id !== $scope.selectedSportId
            && $scope.selectedSportId !== VIRTUAL_SPORT_FAVORITE.id
            && $scope.selectedSportId !== VIRTUAL_SPORT_ALL.id
            && $scope.selectedSportId !== VIRTUAL_MOST_POPULAR.id
            && $scope.selectedSportId !== VIRTUAL_BOOSTED_BETS.id
            && $scope.selectedSportId !== VIRTUAL_COUPON_GAMES.id) {
            $rootScope.selectedCompetitions = null;
            $rootScope.selectedCompetitionsInColumns = null;
            return; // "late" update (user has already changed sport)
        }
        $rootScope.selectedCompetitions = [];
        $rootScope.selectedCompetitionsInColumns = [];
        angular.forEach(data.sport, function (sport) {
            angular.forEach(sport.region, function (region) {
                angular.forEach(region.competition, function (competition) {
                    competition.region = {id: region.id, name: region.name, alias: region.alias};
                    competition.gamesArray = Utils.objectToArray(competition.game) || [];
                    $rootScope.selectedCompetitions.push(competition);

                    angular.forEach(competition.game, function (game) {
                        game.competition = {id: competition.id};
                        game.region = {id: region.id, name: region.name};
                        game.sport = {id: sport.id, alias: sport.alias};
                        game.indexInMyGames = Utils.isInArray($rootScope.myGames, game.id);

                        GameInfo.checkITFAvailability(game);
                    });
                });
            });
        });
        var i, length = $rootScope.selectedCompetitions.length;
        for (i = 0; i < length; i++) {
            $rootScope.selectedCompetitions[i].name = $filter('removeParts')($rootScope.selectedCompetitions[i].name, [$rootScope.selectedSportName, $rootScope.selectedRegionName]);
        }
        $rootScope.selectedCompetitions.sort(Utils.orderSorting);
        // now always dividing to 2 columns, maybe later number of columns can be set according to screen width if needed
        $rootScope.selectedCompetitionsInColumns = divideToParts($rootScope.selectedCompetitions, 2);

        addColumnIds($rootScope.selectedCompetitionsInColumns);

        // broadcast message to open first games in each column if there's only 1 competition and less than 3 games in column and there's no deeplinked game
        if (initial && !$location.search().game) {
            var isFirstColumn = true;
            angular.forEach($rootScope.selectedCompetitionsInColumns, function (column) {
                if (column.length === 1 && $filter('count')(column[0].game) < 3 && (isWideScreen || isFirstColumn)) {
                    TimeoutWrapper(function () {
                        $rootScope.$broadcast('openGame', $filter('firstElement')(column[0].game).id);
                    }, 100);
                }
                isFirstColumn = false;
            });
        }
    }


    /**
     * @ngdoc method
     * @name loadSportsList
     * @methodOf vbet5.controller:modernViewManCtrl
     * @description
     *
     * Loads sports list and subscribes to sports
     */
    $scope.loadSportsList = function loadSportsList() {
        var subscribingProgress = $q.defer();
        sportSubscriptionProgress = subscribingProgress.promise;
        var searchSportParam = parseInt($location.search().sport, 10);

        var request = {
            'source': 'betting', 'what': {'sport': [], 'game': '@count'},
            'where': {
                'game': (Config.main.enableVisibleInPrematchGames && !Config.env.live ? {'@or': ([{ 'type': Config.env.live ? 1 : {'@in':[0,2]} }, {'visible_in_prematch': 1, 'type': 1}])} : {'type': Config.env.live ? 1 : {'@in':[0,2]}})
            }
        };

        request.where.sport = {'type': {'@ne': 1}};

        if (Config.env.gameTimeFilter) {
            request.where.game.start_ts = Config.env.gameTimeFilter;
        }

        Utils.setCustomSportAliasesFilter(request);

        if ($scope.withVideo && Config.env.live) {
            var sKey = Config.main.video.enableOptimization ? 'id' : '@or';
            request.where.game[sKey] = GameInfo.getVideoFilter();
        }

        Zergling.subscribe(
            request,
            updateSportsList
        )
            .then(function (result) {
                subscribingProgress.resolve(result.subid);
                if (result.subid) {
                    sportListSubId = result.subid;
                }
                if (result.data) {
                    updateSportsList(result.data);
                    var sportToSelect, defaultSportListIndex = (Config.main.showFavoriteGamesInSportList && /* Checking if there is a fav to select*/ $rootScope.myGames.length ) ? 0 : 1; //when favorites is enabled, it's the first item and actual sports begin from index 1
                    if (!isNaN(searchSportParam)) {
                        // although 2 lines below looks scary, they just select sport object with id specified in search
                        // and if specified sport does not exist, then first available one
                        sportToSelect = Utils.getItemBySubItemProperty(result.data.sport, 'id', [searchSportParam]);
                        sportToSelect = sportToSelect ? sportToSelect[searchSportParam] : $scope.sports_list[defaultSportListIndex];

                        if (Config.main.showFavoriteGamesInSportList && searchSportParam === VIRTUAL_SPORT_FAVORITE.id) {
                            sportToSelect = VIRTUAL_SPORT_FAVORITE;
                        }
                        if (!Config.env.live) {
                            if(Config.main.popularMatches && Config.main.popularMatches.enabled && searchSportParam === VIRTUAL_MOST_POPULAR.id) {
                                sportToSelect = VIRTUAL_MOST_POPULAR;
                            }
                            if (Config.main.showVirtualsInSportList && searchSportParam === VIRTUAL_SPORT_VIRTUALS.id) {
                                sportToSelect = VIRTUAL_SPORT_VIRTUALS;
                            }
                            if (Config.main.boostedBets && Config.main.boostedBets.enabled && searchSportParam === VIRTUAL_BOOSTED_BETS.id) {
                                sportToSelect = VIRTUAL_BOOSTED_BETS;
                            }
                            if (Config.main.couponGames && Config.main.couponGames.enabled && searchSportParam === VIRTUAL_COUPON_GAMES.id) {
                                sportToSelect = VIRTUAL_COUPON_GAMES;
                            }
                        }
                    } else {
                        sportToSelect = $rootScope.myGames && $rootScope.myGames.length ? VIRTUAL_SPORT_FAVORITE : $scope.sports_list[defaultSportListIndex];
                    }
                    if (!$rootScope.favoriteGamesSelectedAsSport ) { //not to reload view when favorites is selected
                        if(sportToSelect.id === VIRTUAL_BOOSTED_BETS.id && !$scope.boostedBetsGameIds.length){
                            subscribeToBoostedBetsProgress.then(function (a) {
                                $scope.selectSport(sportToSelect);
                            });
                        }else if (sportToSelect.id === VIRTUAL_COUPON_GAMES.id && (!coupons || !coupons.length)) {
                            couponPromise.then(function () {
                                $scope.selectSport(sportToSelect);
                            });
                        }else {
                            $scope.selectSport(sportToSelect);
                        }
                    }

                }
            })['catch'](function (reason) {
            subscribingProgress.resolve(null);
        });
    };

    /**
     * @ngdoc method
     * @name subscribeToMostPopulars
     * @methodOf vbet5.controller:modernViewManCtrl
     * @description subscribes to most popular games count
     */

    $scope.subscribeToMostPopulars = function subscribeToMostPopulars () {
        var subscribingProgress = $q.defer();
        VIRTUAL_MOST_POPULAR.game = 0;
        var request = {
            'source': 'betting', 'what': {'sport': [], 'game': '@count'},
            'where': {
                'game': {
                    'type': {'@in': [0, 2]},
                    'promoted': true
                }
            }
        };

        Zergling.subscribe(request, setPopularGamesCount)
            .then( function (result) {
                subscribingProgress.resolve(result.subid);
                if (result.subid) {
                    mostPopularsListSubId = result.subid;
                }
                setPopularGamesCount(result.data);
            })
    };

    function setPopularGamesCount (data) {
        VIRTUAL_MOST_POPULAR.game = 0;
        angular.forEach(data.sport, function (sport) {
            VIRTUAL_MOST_POPULAR.game += sport.game;
        });
    }



    /**
     * @ngdoc method
     * @name subscribeToBoostedBets
     * @methodOf vbet5.controller:modernViewManCtrl
     * @description subscribes to most popular games count
     */

    $scope.subscribeToBoostedBets = function subscribeToBoostedBets () {
        $rootScope.boostedBetsEventIds = {};
        var subscribingProgress = $q.defer();
        subscribeToBoostedBetsProgress = subscribingProgress.promise;
        VIRTUAL_MOST_POPULAR.game = 0;

        Zergling.get({}, 'get_boosted_selections').then(function (response) {
            if (response && response.details) {
                angular.forEach(response.details, function (value,key) {
                    $scope.boostedBetsGameIds.push(parseInt(key));
                    angular.forEach(value, function (value) {
                        $rootScope.boostedBetsEventIds[value.Id] = true;
                    });
                });
                if (sportData) {
                    updateSportsList(sportData);
                }
            }
            if ($scope.boostedBetsGameIds.length) {
                var request = {
                    'source': 'betting', 'what': {'sport': [], 'game': '@count'},
                    'where': {
                        'game': {
                            'id': {'@in': $scope.boostedBetsGameIds}
                        }
                    }
                };

                Zergling.subscribe(request, setBoostedGamesCount)
                    .then(function (result) {
                        if (result.subid) {
                            boostedBetsListSubId = result.subid;
                        }
                        setBoostedGamesCount(result.data);
                        subscribingProgress.resolve(result.subid);
                    });
            }

        });
    };
    $scope.boostedBetsGameIds = [];

    function setBoostedGamesCount (data) {
        VIRTUAL_BOOSTED_BETS.game = 0 ;
        angular.forEach(data.sport, function (sport) {
            VIRTUAL_BOOSTED_BETS.game += sport.game;
        });
    }

    /**
     * @ngdoc method
     * @name showFavoriteGames
     * @methodOf vbet5.controller:modernViewManCtrl
     * @description loads favorite games in main view
     */
    function showFavoriteGames() {
        function doSubscribe() {
            var subscribingProgress = $q.defer();
            gameSubsciptionProgress = subscribingProgress.promise;

            var requestMyGame = {
                'source': 'betting',
                'what': {
                    'sport': ['id', 'alias'],
                    'region': ['id', 'name', 'alias'],
                    'competition': [],
                    'game': [
                        ['id', 'start_ts', 'team1_name', 'team2_name', 'team1_external_id', 'team2_external_id', 'type', 'info', 'markets_count', 'extra', 'is_blocked', 'game_number', 'exclude_ids', 'is_stat_available', 'is_live', 'is_neutral_venue', 'is_itf', 'game_info']
                    ],
                    'event': ['id', 'price', 'type', 'name'],
                    'market': ['type', 'express_id', 'name', 'home_score', 'away_score', 'id']
                },
                'where': {
                    'game': {
                        'id': {'@in': $rootScope.myGames}
                    },
                    'market': {'type': {'@in': ['P1XP2', 'P1P2']}}
                }
            };
            Utils.addPrematchExpressId(requestMyGame);

            Utils.setCustomSportAliasesFilter(requestMyGame);

            Zergling.subscribe(requestMyGame, updateGames)
                .then(function (result) {
                    updateGames(result.data, true);
                    gamesSubId = result.subid;
                    subscribingProgress.resolve(result.subid);
                });
        }

        if (gameSubsciptionProgress) {
            gameSubsciptionProgress.then(function (subId) {
                Zergling.unsubscribe(subId);
                gamesSubId = null;
            });
        }

        if ($rootScope.myGames.length > 0) {
            doSubscribe();
        } else {
            updateGames([], true);
        }
    }


    $scope.$watch('myGames.length', function (length) {
        if ($rootScope.favoriteGamesSelectedAsSport) {
            showFavoriteGames();
        }
        VIRTUAL_SPORT_FAVORITE.game = length;
    });


    /**
     * @ngdoc method
     * @name addPopularGamesSection
     * @methodOf vbet5.controller:modernViewManCtrl
     * @description adds "popular" virtual region to regions list if there are popular games for provided sport
     * and sets corresponding $scope's hasPopularGames boolean value which is used when updating regions list
     *
     * @param {Object} sport sport object
     */
    function addPopularGamesSection(sport) {
        if (!Config.main.showPopularGames) {
            return;
        }
        var request = {
            'source': 'betting',
            'what': { game: '@count'},
            'where': {
                'game': (Config.main.enableVisibleInPrematchGames && !Config.env.live ? {'@or': ([{ 'type': Config.env.live ? 1 : {'@in':[0,2]} }, {'visible_in_prematch': 1, 'type': 1}])} : {'type': Config.env.live ? 1 : {'@in':[0,2]}}),
                sport: {id: sport.id},
                competition: {'favorite': true}
            }
        };
        Zergling.get(request).then(function (response) {
            if (response.data && response.data.game && response.data.game > 0 && $scope.selectedSportId === sport.id) {
                $scope.hasPopularGames = true;
                $scope.regionsList.unshift(VIRTUAL_REGION_POPULAR);
            } else {
                $scope.hasPopularGames = false;
            }
        });
    }

    function loadCoupons() {
        couponPromise = Zergling.get({}, "get_coupons").then(function (res) {
            coupons = res.details;
            if (sportData && coupons.length > 0) {
                updateSportsList(sportData);
            }

        });

    }

    $scope.selectCoupon = function selectCoupon(coupon) {
        if ($scope.selectedCoupon === coupon) {
            return;
        }
        $scope.selectedCoupon = coupon;
        if (regionSubscriptionProgress === null ) { //first time
            subscribeToRegionList(VIRTUAL_COUPON_GAMES);
        } else {
            regionSubscriptionProgress.then(function (subId) {
                Zergling.unsubscribe(subId);
                subscribeToRegionList(VIRTUAL_COUPON_GAMES);
                regionListSubId = null;
            });
        }
    };

    function subscribeToRegionList(sport) {
        var subscribingProgress = $q.defer();
        var regionIdToSelect;

        regionSubscriptionProgress = subscribingProgress.promise;
        var request = {
            'source': 'betting',
            'what': {'region': [], 'game': '@count'}
        };

        request.where = sport.id === VIRTUAL_MOST_POPULAR.id ? {
            'game': {
                'type': {'@in': [0, 2]},
                'promoted': true
            }
        } : {
            'sport': {'id': $scope.selectedSportId},
            'game': (Config.main.enableVisibleInPrematchGames && !Config.env.live ? {'@or': ([{ 'type': Config.env.live ? 1 : {'@in':[0,2]} }, {'visible_in_prematch': 1, 'type': 1}])} : {'type': Config.env.live ? 1 : {'@in':[0,2]}})
        };

        if (!sport.id) {
            delete request.where.sport;
        }

        if (Config.env.gameTimeFilter) {
            request.where.game.start_ts = Config.env.gameTimeFilter;
        }

        if ($scope.withVideo && Config.env.live) {
            var sKey = Config.main.video.enableOptimization ? 'id' : '@or';
            request.where.game[sKey] = GameInfo.getVideoFilter();
        }

        if(sport.id === VIRTUAL_BOOSTED_BETS.id){
            request.where =  {
                'game': {
                    'id': {'@in': $scope.boostedBetsGameIds}
                }
            };
        }
        if (sport.id === VIRTUAL_COUPON_GAMES.id ) {
            request.where =  {
                'game': {
                    'id': {'@in': $scope.selectedCoupon.Matches}
                }
            };
        }



        /*Utils.setCustomSportAliasesFilter(request);*/
        Zergling.subscribe(
            request,
            updateRegionsList
        ).then(function (result) {
            $rootScope.selectedSportName = sport.name;
            $rootScope.selectedSportAlias = sport.alias;
            subscribingProgress.resolve(result.subid);
            if (result.subid) {
                regionListSubId = result.subid;
            }
            updateRegionsList(result.data);
            var regionAliasMap = Utils.createMapFromObjItems($scope.regionsList, 'alias');
            if (searchParams.region !== undefined) {
                regionIdToSelect = parseInt(searchParams.region, 10);
                //select only if exists.  if pre-match, also allow virtual "all for today' region
                regionIdToSelect = result.data.region[regionIdToSelect] || (regionIdToSelect === VIRTUAL_REGION_UPCOMING.id && !$scope.env.live) || regionIdToSelect === VIRTUAL_REGION_WITHVIDEO.id || (regionIdToSelect === VIRTUAL_REGION_POPULAR.id && !$scope.env.live) ? regionIdToSelect : null;
            } else if ($rootScope.selectedRegionAlias && regionAliasMap && regionAliasMap[$rootScope.selectedRegionAlias] !== undefined && sport.alias !== 'all') {
                regionIdToSelect = regionAliasMap[$rootScope.selectedRegionAlias].id;
            } else if ($scope.hasPopularGames) {
                regionIdToSelect = VIRTUAL_REGION_POPULAR.id;
            } else if ($scope.env.live) { //load competitions for all regions
                console.log('LIVE, selecting all');
                regionIdToSelect = VIRTUAL_REGION_ALL.id;
            } else if ($scope.regionsList && $scope.regionsList.length) { //load competitions only for 1st region
                regionIdToSelect = $scope.regionsList[0].id;
                console.log('selecting 1st region', $scope.regionsList);
            }

            if (regionIdToSelect !== undefined) {
                $scope.selectRegion({id: regionIdToSelect});
            }

        })['catch'](function (reason) {
            subscribingProgress.resolve(null);
        });

    }

    /**
     * @ngdoc method
     * @name selectSport
     * @methodOf vbet5.controller:modernViewManCtrl
     * @description
     * Selects sport and subscribes to it's regions
     * data is processed by  updateRegionsList func.
     *
     * @param {Object} sport sport object
     */
    $scope.selectSport = function selectSport(sport) {
        if (!sport) {
            return;
        }

        if (sport.id === VIRTUAL_SPORT_VIRTUALS.id) {
            $location.path('/virtualsports');
            return;
        }
        if ($scope.selectedPrematchStreamSport !== undefined && sport.id !== $scope.selectedPrematchStreamSport &&  $scope.selectedSportId === $scope.selectedPrematchStreamSport) {
            $rootScope.broadcast("removePrematchStream");
        }
        console.log('select sport', sport);
        if (sport.id === VIRTUAL_COUPON_GAMES.id) {
            $scope.coupons = coupons;
            $scope.selectedCoupon = coupons[0];
        } else {
            $scope.coupons = undefined;
        }
        analytics.gaSend('send', 'event', 'explorer', 'select sport ' + ($scope.env.live ? '(LIVE)' : '(PM)'), {'page': $location.path(), 'eventLabel': sport.alias});
        $location.search('sport', sport.id);
        searchParams = $location.search();
        $scope.selectedSportId = sport.id;
        $scope.sports_list = Utils.makeSelectedVisible($scope.sports_list, {id: $scope.selectedSportId}, $scope.sportListMaxVisibleItems);

        $scope.regionsList = [];
        $rootScope.selectedCompetitions = [];
        $rootScope.selectedCompetitionsInColumns = [];
        $rootScope.gamesAreLoading = true;
        addPopularGamesSection(sport);

        if (sport.id === VIRTUAL_SPORT_FAVORITE.id) {
            $rootScope.favoriteGamesSelectedAsSport = true;
            $rootScope.selectedSportName = sport.name;
            $rootScope.selectedRegionName = '';
            return showFavoriteGames();
        }

        $rootScope.favoriteGamesSelectedAsSport = false;



        if (regionSubscriptionProgress === null ) { //first time
            subscribeToRegionList(sport);
        } else {
            regionSubscriptionProgress.then(function (subId) {
                Zergling.unsubscribe(subId);
                subscribeToRegionList(sport);
                regionListSubId = null;
            });
        }

    };

    function updateGamesRequest(request, gameIds) {
        request.what.game = [ 'id', 'start_ts', 'team1_name', 'team2_name', 'team1_external_id', 'team2_external_id', 'type', 'info', 'markets_count', 'extra', 'is_blocked', 'game_number', 'exclude_ids', 'is_stat_available', 'is_live', 'is_neutral_venue', 'is_itf'];
        request.where =  {
            'game': {
                'id': {'@in': gameIds}
            }

        };

        if($scope.selectedRegionId && $scope.selectedRegionId !== -1){
            request.where.region = {
                'id':  $scope.selectedRegionId
            };
        }
    }

    /**
     * @ngdoc method
     * @name selectRegion
     * @methodOf vbet5.controller:modernViewManCtrl
     * @description
     * Selects region and subscribes to it's competitions
     * data is processed by  updateGames func.
     *
     * @param {Object} region region object
     */
    $scope.selectRegion = function selectRegion(region) {
        $location.search('region', region.id);
        $scope.selectedRegionId = region.id;
        $rootScope.selectedCompetitions = [];
        $rootScope.selectedCompetitionsInColumns = [];
        $rootScope.gamesAreLoading = true;

        var selectedRegionObj = Utils.getItemBySubItemProperty($scope.regionsList, 'id', [region.id]);
        $rootScope.selectedRegionName = (selectedRegionObj ? selectedRegionObj[region.id].name : '') + ($scope.selectedRegionId === $scope.upcomingRegionId ? ' (' + Translator.get($scope.selectedUpcomingPeriod + ' hours') + ')' : '');
        $rootScope.selectedRegionAlias = selectedRegionObj ? selectedRegionObj[region.id].alias : '';
        $scope.regionsList = Utils.makeSelectedVisible($scope.regionsList, { id: $scope.selectedRegionId }, $scope.regionsListMaxVisibleItems);

        function subscribeToRegionGames() {
            var subscribingProgress = $q.defer();
            gameSubsciptionProgress = subscribingProgress.promise;
            var request = {
                'source': 'betting',
                'what': {
                    'sport': ['id', 'alias'],
                    'region': ['id', 'name', 'alias'],
                    'competition': [],
                    'game': [
                        ['id', 'start_ts', 'show_type', 'team1_name', 'team2_name', 'team1_external_id', 'team2_external_id', 'type', 'info', 'markets_count', 'extra', 'is_blocked', 'game_number', 'exclude_ids', 'is_stat_available', 'is_live', 'is_neutral_venue', 'is_itf', 'stats', "game_info"]
                    ],
                    'event': ['id', 'price', 'type', 'name'],
                    'market': ['type', 'express_id', 'name', 'home_score', 'away_score', 'id']
                }
            };
            Utils.addPrematchExpressId(request);

            request.where = {
                'market': {'type': {'@in': ['P1XP2', 'P1P2']}}
            };
            if ($scope.selectedSportId === VIRTUAL_MOST_POPULAR.id) {
                request.where.game = {
                    'type': {'@in': [0, 2]},
                    'promoted': true
                };
            } else {
                request.where.game = Config.main.enableVisibleInPrematchGames && !Config.env.live ? {'@or': ([{ 'type': Config.env.live ? 1 : {'@in':[0,2]} }, {'visible_in_prematch': 1, 'type': 1}])} : {'type': Config.env.live ? 1 : {'@in':[0,2]}};
                request.where.sport = { 'id': $scope.selectedSportId };
            }

            if (!$scope.selectedSportId) {
                delete request.where.sport;
            }

            if (Config.env.gameTimeFilter) {
                request.where.game.start_ts = Config.env.gameTimeFilter;
            }
            if ($scope.selectedRegionId && $scope.selectedRegionId !== VIRTUAL_REGION_UPCOMING.id && $scope.selectedRegionId !== VIRTUAL_REGION_WITHVIDEO.id && $scope.selectedRegionId !== VIRTUAL_REGION_POPULAR.id) { //if not defined will load competitions for all regions
                request.where.region = {'id': $scope.selectedRegionId};
            }
            if ($scope.selectedRegionId === VIRTUAL_REGION_UPCOMING.id) {
                request.where.game.start_ts = {'@now': {'@gte': 0, '@lt': $scope.selectedUpcomingPeriod * 3600}};
            } else if ($scope.selectedRegionId === VIRTUAL_REGION_WITHVIDEO.id || $scope.withVideo) {
                var sKey = Config.main.video.enableOptimization ? 'id' : '@or';
                request.where.game[sKey] = GameInfo.getVideoFilter();
            } else if ($scope.selectedRegionId === VIRTUAL_REGION_POPULAR.id) {
                request.where.competition = {'favorite': true};
            }

            if ($scope.selectedSportId === VIRTUAL_BOOSTED_BETS.id){
                updateGamesRequest(request, $scope.boostedBetsGameIds);
            }

            if ($scope.selectedSportId === VIRTUAL_COUPON_GAMES.id){
                updateGamesRequest(request, $scope.selectedCoupon.Matches);
            }

            /*Utils.setCustomSportAliasesFilter(request);*/
            Zergling.subscribe(request, updateGames)
                .then(function (result) {
                    subscribingProgress.resolve(result.subid);
                    if (result.subid) {
                        gamesSubId = result.subid;
                        $scope.noUpcoming = ($scope.selectedRegionId === VIRTUAL_REGION_UPCOMING.id && $filter('count')(result.data.sport) === 0);
                    }
                    updateGames(result.data, true);

                })['catch'](function (reason) {
                subscribingProgress.resolve(null);
            });
        }

        if (gameSubsciptionProgress === null) {
            subscribeToRegionGames();
        } else {
            gameSubsciptionProgress.then(function (subId) {
                Zergling.unsubscribe(subId);
                subscribeToRegionGames();
                gamesSubId = null;
            });
        }
    };

    /**
     * @ngdoc method
     * @name setJustForMoment
     * @methodOf vbet5.controller:modernViewManCtrl
     * @description exposes {@link vbet5.service:Utils#setJustForMoment Utils.setJustForMoment} method to modernViewManCtrl's $scope
     *
     * @param {string} name scope variable name
     * @param {mixed} value value to set
     * @param {number} [time] optional. time in milliseconds, default is 500
     */
    $scope.setJustForMoment = function setJustForMoment(name, value, time) {
        Utils.setJustForMoment($scope, name, value, time);
    };

    /**
     * Unsubscribe on page destroy
     */
    $scope.$on('$destroy', function () {
        if (sportListSubId) {
            Zergling.unsubscribe(sportListSubId);
            sportListSubId = null;
        }
        if (regionListSubId) {
            Zergling.unsubscribe(regionListSubId);
            regionListSubId = null;
        }
        if (gamesSubId) {
            Zergling.unsubscribe(gamesSubId);
            gamesSubId = null;
        }
        if(mostPopularsListSubId) {
            Zergling.unsubscribe(mostPopularsListSubId);
            mostPopularsListSubId = null;
        }
        if(boostedBetsListSubId) {
            Zergling.unsubscribe(boostedBetsListSubId);
            boostedBetsListSubId = null;
        }
        $rootScope.boostedBetsEventIds = null;
        $rootScope.favoriteGamesSelectedAsSport = false;
    });

    $scope.regionClicked = function regionClicked (region) {
        if ($scope.selectedRegionId === region.id) {
            return;
        }

        $scope.resetSearchParams('game');
        $scope.selectRegion(region);
    };

    $scope.sportClicked = function sportClicked (sport) {
        if ($scope.selectedSportId === sport.id) {
            return;
        }

        $scope.resetSearchParams(['region', 'game']);
        $scope.selectSport(sport);
    };

    $scope.upcomingPeriodClicked = function upcomingPeriodClicked (period) {
        if ($scope.selectedUpcomingPeriod === period) {
            return;
        }

        $scope.setUpcomingPeriod(period);
    };

    $scope.$on('sportsbook.handleDeepLinking', function(){ //linking to games inside sportsbook
        TimeoutWrapper(function () {
            if (Number($location.search().type) === Number(Config.env.live)) {
                var sport = Utils.getArrayObjectElementHavingFieldValue($scope.sports_list, 'id', parseInt($location.search().sport, 10));
                if (sport) {
                    $scope.selectSport(sport);
                }
            } else {
                $scope.toggleLive();
            }
        }, 100);
    });

    $scope.initModernView = function initModernView() {
        GameInfo.getProviderAvailableEvents().then(function() {
            $scope.loadSportsList();
            if (Config.main.popularMatches && Config.main.popularMatches.enabled) {
                $scope.subscribeToMostPopulars();
            }
            if (Config.main.boostedBets && Config.main.boostedBets.enabled) {
                $scope.subscribeToBoostedBets();
            }
            if (Config.main.couponGames.enabled) {
                loadCoupons();
            }
        });
    };

    /**
     * @ngdoc method
     * @name toggleVideo
     * @methodOf vbet5.controller:explorerCtrl
     * @description
     *
     * Toggles  live/pre-match
     * unsubscribes from all sports,regions, games subscriptions
     * then loads sports list for selected mode
     */
    $scope.toggleVideo = function toggleVideo(setState) {
        $scope.withVideo = !$scope.withVideo;

        if (setState !== undefined) {
            $scope.withVideo = setState;
        }

        if ($scope.withVideo) {
            $location.search('video', true);
        } else {
            $location.search('video', undefined);
        }

        if (sportSubscriptionProgress === null) {  //first time
            $scope.loadSportsList();
        } else {
            sportSubscriptionProgress.then(function (subId) {
                Zergling.unsubscribe(subId);
                sportListSubId = null;
                mostPopularsListSubId = null;
                boostedBetsListSubId = null;
                $scope.loadSportsList();
            });
        }
    };

    /**
     * @ngdoc method
     * @name groupRegionsForAllSports
     * @methodOf vbet5.controller:explorerCtrl
     * @description
     *
     * Toggles  live/pre-match
     * unsubscribes from all sports,regions, games subscriptions
     * then loads sports list for selected mode
     */
    function groupRegionsForAllSports(regionsInput) {
        var regionsAlias = {};

        angular.forEach(regionsInput, function (region){
            var gamesCount = region.game = parseInt(region.game);
            if (regionsAlias[region.alias]) {
                regionsAlias[region.alias].region_ids.push(region.id);
                regionsAlias[region.alias].sport_ids.push(region.sport_id);
                regionsAlias[region.alias].gamesCount += gamesCount;
            }
            else {
                region.region_ids = [region.id];
                region.sport_ids = [region.sport_id];
                region.gamesCount = gamesCount;
                regionsAlias[region.alias] = region;
            }
        });

        return Utils.objectToArray(regionsAlias);
    }

    $scope.selectPrematchStreaming = function selectPrematchStreaming(streamInfo, game) {
        $scope.selectedPrematchStreamSport = game.sport.id;
        $rootScope.broadcast("setPrematchStream", streamInfo);
    };
}]);

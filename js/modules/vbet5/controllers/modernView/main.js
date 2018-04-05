/**
 * @ngdoc controller
 * @name vbet5.controller:modernViewManCtrl
 * @description
 * Explorer controller
 */
angular.module('vbet5.betting').controller('modernViewManCtrl', ['$rootScope', '$scope', 'Config', 'Zergling', 'Utils', '$filter', '$location', 'TimeoutWrapper', '$q', 'analytics', 'Storage', 'Translator', 'GameInfo', function ($rootScope, $scope, Config, Zergling, Utils, $filter, $location, TimeoutWrapper, $q, analytics, Storage, Translator, GameInfo) {
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

    var sportListSubId = null;
    var regionListSubId = null;
    var gamesSubId = null;
    var mostPopularsListSubId = null;
    var searchParams;
    var sportSubscriptionProgress = null, regionSubscriptionProgress = null, gameSubsciptionProgress = null;

    $scope.withVideo = !!$location.search().video;
    var isWideScreen;

    var customSportAliasFilter = Utils.getCustomSportAliasFilter();

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
        }

        $scope.sports_list = $filter('orderBy')($scope.sports_list, 'order');
        if ($scope.selectedSportId && data.sport[$scope.selectedSportId]) {
            $scope.sports_list = Utils.makeSelectedVisible($scope.sports_list, {id: $scope.selectedSportId}, $scope.sportListMaxVisibleItems);
        }

        console.log('sports_list:', $scope.sports_list, data.sport);
    }


    function updateRegionsList(data) {
        if (data && data.region !== undefined) {
            var regionsArray = Utils.objectToArray(data.region);
            regionsArray = GameInfo.groupRegionsIfNeeded(regionsArray, $scope.selectedSportId);
            if (!$scope.selectedSportId) {
                regionsArray = groupRegionsForAllSports(regionsArray);
            }
            $scope.regionsList = $filter('orderBy')(regionsArray, 'order');
            if (!$scope.env.live && $scope.selectedSportId !== VIRTUAL_MOST_POPULAR.id) {
                $scope.regionsList.unshift(VIRTUAL_REGION_UPCOMING);
            } else {
                if (Config.main.videoEnabled && !Config.main.customSportsBook.modern.toggleLiveButton && $scope.selectedSportId !== VIRTUAL_MOST_POPULAR.id) {
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
        if (firstSport && firstSport.id !== $scope.selectedSportId && $scope.selectedSportId !== VIRTUAL_SPORT_FAVORITE.id && $scope.selectedSportId !== VIRTUAL_SPORT_ALL.id && $scope.selectedSportId !== VIRTUAL_MOST_POPULAR.id) {
            $rootScope.selectedCompetitions = null;
            $rootScope.selectedCompetitionsInColumns = null;
            return; // "late" update (user has already changed sport)
        }
        $rootScope.selectedCompetitions = [];
        $rootScope.selectedCompetitionsInColumns = [];
        angular.forEach(data.sport, function (sport) {
            angular.forEach(sport.region, function (region) {
                angular.forEach(region.competition, function (competition) {
                    if (!Config.main.GmsPlatform) {
                        competition.name = $filter('removeParts')(competition.name, [$rootScope.selectedSportName]);
                        competition.name = $filter('removeParts')(competition.name, [region.name]);
                    }
                    competition.region = {id: region.id, name: region.name, alias: region.alias};
                    competition.gamesArray = Utils.objectToArray(competition.game) || [];
                    $rootScope.selectedCompetitions.push(competition);

                    if (Utils.isInArray($rootScope.myCompetitions, competition.id) > -1) {
                        addToMyGames(competition.gamesArray);
                    }
                    angular.forEach(competition.game, function (game) {
                        game.competition = {id: competition.id};
                        game.region = {id: region.id};
                        game.sport = {id: sport.id, alias: sport.alias};
                        game.indexInMyGames = Utils.isInArray($rootScope.myGames, game.id);
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

        angular.forEach($rootScope.selectedCompetitionsInColumns, function (column) {
            angular.forEach(column, function (competition) {
                competition.indexInMyCompetitions = Utils.isInArray($rootScope.myCompetitions, competition.id);
            });
        });
    }

    /**
     * @ngdoc method
     * @name addToMyGames
     * @methodOf vbet5.controller:modernViewManCtrl
     * @description check if updated game data has games which are not included in
     * $rootScope.myGames but owned by  favourite competition
     * @param {Array} gamesArray games array
     */
    function addToMyGames(gamesArray) {
        var newGames = [],
            hashKey;
        angular.forEach(gamesArray, function (value) {
            newGames.push(parseInt(value.id, 10));
        });

        hashKey = newGames.slice().join("");

        // exit function because we already added this games
        if (addToMyGames.cache[hashKey]) {
            return;
        }
        addToMyGames.cache[hashKey] = newGames;

        angular.forEach(gamesArray, function (game) {
            if (Utils.isInArray($rootScope.myGames, game.id) < 0) {
                console.log('ADD TO MY GAMES', game);
                $rootScope.$emit('game.addToMyGames', game);
            }
        });
    }

    addToMyGames.cache = {};

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
                'game': (Config.main.enableVisibleInPrematchGames && !Config.env.live ? {'@or': ([{ 'type': Config.env.live ? 1 : Config.main.GmsPlatform ? {'@in':[0,2]} : 0 }, {'visible_in_prematch': 1, 'type': 1}])} : {'type': Config.env.live ? 1 : Config.main.GmsPlatform ? {'@in':[0,2]} : 0})
            }
        };

        request.where.sport = {'id': {'@nin': GameInfo.getVirtualSportIds()}};

        if (Config.env.gameTimeFilter) {
            request.where.game.start_ts = Config.env.gameTimeFilter;
        }

        Utils.setCustomSportAliasesFilter(request);

        if ($scope.withVideo && Config.env.live) {
            request.where.game['@or'] = GameInfo.getVideoFilter();
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
                        if(Config.main.popularMatches && Config.main.popularMatches.enabled && searchSportParam === VIRTUAL_MOST_POPULAR.id) {
                            sportToSelect = VIRTUAL_MOST_POPULAR;
                        }
                        if (Config.main.showVirtualsInSportList && searchSportParam === VIRTUAL_SPORT_VIRTUALS.id && !Config.env.live) {
                            sportToSelect = VIRTUAL_SPORT_VIRTUALS;
                        }
                    } else {
                        sportToSelect = $rootScope.myGames && $rootScope.myGames.length ? VIRTUAL_SPORT_FAVORITE : $scope.sports_list[defaultSportListIndex];
                    }
                    if (!$rootScope.favoriteGamesSelectedAsSport) { //not to reload view when favorites is selected
                        $scope.selectSport(sportToSelect);
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
                    'type': Config.main.GmsPlatform ? {'@in': [0, 2]} : 0,
                    'promoted': Config.main.GmsPlatform ? true : {'@contains': parseInt(Config.main.site_id)}
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
        })
    }

    /**
     * @ngdoc method
     * @name showFavoriteGames
     * @methodOf vbet5.controller:modernViewManCtrl
     * @description loads favorite games in main view
     */
    function showFavoriteGames() {
        function doSubscribe() {
            var subscribingProgress = $q.defer(),
                myGamesPromise,
                myCompetitionPromise,
                promises,
                subscribingCallback;
            gameSubsciptionProgress = subscribingProgress.promise;

            var requestMyGame = {
                'source': 'betting',
                'what': {
                    'sport': ['id', 'alias'],
                    'region': ['id', 'name', 'alias'],
                    'competition': [],
                    'game': [
                        ['id', 'start_ts', 'team1_name', 'team2_name', 'team1_external_id', 'team2_external_id', 'type', 'info', 'events_count', 'markets_count', 'extra', 'is_blocked', 'game_number', 'exclude_ids', 'is_stat_available', 'is_live', 'is_neutral_venue']
                    ],
                    'event': ['id', 'price', 'type', 'name'],
                    'market': ['type', 'express_id', 'name']
                },
                'where': {
                    'game': {
                        'id': {'@in': $rootScope.myGames}
                    },
                    'market': {'type': {'@in': ['P1XP2', 'P1P2']}}
                }
            };

            var requestMyCompetition = {
                'source': 'betting',
                'what': {
                    'game': ['id']
                },
                'where': {
                    'competition': {
                        'id': {'@in': $rootScope.myCompetitions}
                    },
                    'game': {
                        'type': {'@in': [0, 1]}
                    }
                }
            };

            Utils.setCustomSportAliasesFilter(requestMyGame);
            Utils.setCustomSportAliasesFilter(requestMyCompetition);

            subscribingCallback = function (result) {
                var subIds = [];
                updateGames(result[0].data, true);
                competitionCallback(result[1].data, true);
                angular.forEach(result, function (item) {
                    subIds.push(item.subid);
                });
                subscribingProgress.resolve(subIds);
                gamesSubId = subIds;
            };

            myGamesPromise = Zergling.subscribe(requestMyGame, updateGames);
            myCompetitionPromise = Zergling.subscribe(requestMyCompetition, competitionCallback);

            promises = $q.all([
                myGamesPromise,
                myCompetitionPromise
            ]);
            promises.then(subscribingCallback);
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

    /**
     * @ngdoc method
     * @name competitionCallback
     * @methodOf vbet5.controller:modernViewManCtrl
     * @param {Object} data data
     * @description This method registered as a callback of myCompetitionPromise subscriptions
     * and adding the new games to $rootScope.myGames if its necessary
     */
    function competitionCallback(data) {
        var newGames = [],
            gamesToUpdate,
            hashKey,
            existingGames = $rootScope.myGames;
        angular.forEach(data.game, function (game) {
            newGames.push(parseInt(game.id, 10));
        });

        hashKey = newGames.slice().join("");

        if (!competitionCallback.cache[hashKey]) {
            competitionCallback.cache[hashKey] = newGames;
        }

        if (!Utils.arrayEquals(existingGames, newGames)) {
            gamesToUpdate = Utils.gamesArrayToObjectArray(competitionCallback.cache[hashKey]);
            $rootScope.$emit('game.addToMyGames', gamesToUpdate);
        }
    }

    competitionCallback.cache = {};

    $scope.$watch('myGames.length', function (length) {
        if ($rootScope.favoriteGamesSelectedAsSport) {
            showFavoriteGames();
        }
        VIRTUAL_SPORT_FAVORITE.game = length;
    });

    $scope.$watch('myCompetitions.length', function () {
        if ($rootScope.favoriteGamesSelectedAsSport) {
            showFavoriteGames();
        }
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
                'game': (Config.main.enableVisibleInPrematchGames && !Config.env.live ? {'@or': ([{ 'type': Config.env.live ? 1 : Config.main.GmsPlatform ? {'@in':[0,2]} : 0 }, {'visible_in_prematch': 1, 'type': 1}])} : {'type': Config.env.live ? 1 : Config.main.GmsPlatform ? {'@in':[0,2]} : 0}),
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
        var regionIdToSelect;
        console.log('select sport', sport);

        analytics.gaSend('send', 'event', 'explorer', 'select sport ' + ($scope.env.live ? '(LIVE)' : '(PM)'), {'page': $location.path(), 'eventLabel': sport.alias});
        $location.search('sport', sport.id);
        searchParams = $location.search();
        $scope.selectedSportId = sport.id;
        console.log('sporrtlist', $scope.sports_list);
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

        function subscribeToRegionList() {
            var subscribingProgress = $q.defer();
            regionSubscriptionProgress = subscribingProgress.promise;
            var request = {
                'source': 'betting',
                'what': {'region': [], 'game': '@count'}
            };

            request.where = sport.id === VIRTUAL_MOST_POPULAR.id ? {
                'game': {
                    'type': Config.main.GmsPlatform ? {'@in': [0, 2]} : 0,
                    'promoted': Config.main.GmsPlatform ? true : {'@contains': parseInt(Config.main.site_id)}
                }
            } : {
                'sport': {'id': $scope.selectedSportId},
                'game': (Config.main.enableVisibleInPrematchGames && !Config.env.live ? {'@or': ([{ 'type': Config.env.live ? 1 : Config.main.GmsPlatform ? {'@in':[0,2]} : 0 }, {'visible_in_prematch': 1, 'type': 1}])} : {'type': Config.env.live ? 1 : Config.main.GmsPlatform ? {'@in':[0,2]} : 0})
            };

            if (!sport.id) {
                delete request.where.sport;
            }

            if (Config.env.gameTimeFilter) {
                request.where.game.start_ts = Config.env.gameTimeFilter;
            }

            if ($scope.withVideo && Config.env.live) {
                request.where.game['@or'] = GameInfo.getVideoFilter();
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

        if (regionSubscriptionProgress === null ) { //first time
            subscribeToRegionList();
        } else {
            regionSubscriptionProgress.then(function (subId) {
                Zergling.unsubscribe(subId);
                subscribeToRegionList();
                regionListSubId = null;
            });
        }
    };

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
                        ['id', 'start_ts', 'team1_name', 'team2_name', 'team1_external_id', 'team2_external_id', 'type', 'info', 'events_count', 'markets_count', 'extra', 'is_blocked', 'game_number', 'exclude_ids', 'is_stat_available', 'is_live', 'is_neutral_venue']
                    ],
                    'event': ['id', 'price', 'type', 'name'],
                    'market': ['type', 'express_id', 'name']
                }
            };
            request.where = {
                'market': {'type': {'@in': ['P1XP2', 'P1P2']}}
            };
            if ($scope.selectedSportId === VIRTUAL_MOST_POPULAR.id) {
                request.where.game = {
                    'type': Config.main.GmsPlatform ? {'@in': [0, 2]} : 0,
                    'promoted': Config.main.GmsPlatform ? true : {'@contains': parseInt(Config.main.site_id)}
                }
            } else {
                request.where.game = Config.main.enableVisibleInPrematchGames && !Config.env.live ? {'@or': ([{ 'type': Config.env.live ? 1 : Config.main.GmsPlatform ? {'@in':[0,2]} : 0 }, {'visible_in_prematch': 1, 'type': 1}])} : {'type': Config.env.live ? 1 : Config.main.GmsPlatform ? {'@in':[0,2]} : 0};
                request.where.sport = { 'id': $scope.selectedSportId };
            }

            if (!$scope.selectedSportId) {
                delete request.where.sport;
            }

            if (Config.env.gameTimeFilter) {
                request.where.game.start_ts = Config.env.gameTimeFilter;
            }
            if ($scope.selectedRegionId && $scope.selectedRegionId !== VIRTUAL_REGION_UPCOMING.id && $scope.selectedRegionId !== VIRTUAL_REGION_WITHVIDEO.id && $scope.selectedRegionId !== VIRTUAL_REGION_POPULAR.id) { //if not defined will load competitions for all regions
                if (Config.main.regionMapping && Config.main.regionMapping.enabled && GameInfo.getRegionChildren($scope.selectedRegionId)) {
                    request.where.region = { 'id': {'@in': GameInfo.getRegionChildren($scope.selectedRegionId)} };
                } else {
                    request.where.region = {'id': $scope.selectedRegionId};
                }

            }
            if ($scope.selectedRegionId === VIRTUAL_REGION_UPCOMING.id) {
                request.where.game.start_ts = {'@now': {'@gte': 0, '@lt': $scope.selectedUpcomingPeriod * 3600}};
            } else if ($scope.selectedRegionId === VIRTUAL_REGION_WITHVIDEO.id || $scope.withVideo) {
                request.where.game['@or'] = GameInfo.getVideoFilter();
            } else if ($scope.selectedRegionId === VIRTUAL_REGION_POPULAR.id) {
                request.where.competition = {'favorite': true};
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
                console.log('Error:', reason);
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
}]);
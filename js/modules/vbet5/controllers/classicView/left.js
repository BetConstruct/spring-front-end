/* global JSON, decodeURIComponent */
/**
 * @ngdoc controller
 * @name vbet5.controller:classicViewLeftController
 * @description classic view left menu controller
 *
 */

angular.module('vbet5.betting').controller('classicViewLeftController', ['$rootScope', '$scope', '$location', '$filter', '$route', '$q', '$interval', 'DomHelper', 'Utils', 'Zergling', 'ConnectionService', 'GameInfo', 'Storage', 'Config', 'Translator', 'analytics', 'TimeoutWrapper', 'partner', 'MarketTypes', 'tournamentFilter',  function ($rootScope, $scope, $location, $filter, $route, $q, $interval, DomHelper, Utils, Zergling, ConnectionService, GameInfo, Storage, Config, Translator, analytics, TimeoutWrapper, partner, MarketTypes, tournamentFilter) {
    'use strict';
    TimeoutWrapper = TimeoutWrapper($scope);
    var connectionService = new ConnectionService($scope);
    var liveGamesData;
    var liveGamesDataArray;
    var showPrematchInDashboardByDefault = $location.path() === '/dashboard/' && Config.main.dashboard.leftMenuPrematch;
    var firstTimeLoaded = true;
    var currentGameIsFinished = false;
    var pathToRemember = {live: {}, prematch: {}};
    var leftMenuPrematchSports = [];
    var leftMenuPrmeatchSportsData;
    var defaultPrematchToOpen;
    var tournamentListenerPromise = null;
    $scope.bigBetFilter = {
        "1": false, // live
        "0": false // prematch
    };
    if (Config.env.preMatchMultiSelection) {
        $scope.prematchMultiViewGames = Storage.get('prematchMultiViewGames') || {};
        $scope.prematchMultiViewCompetitions = Storage.get('prematchMultiViewCompetitions') || {};
    }
    $scope.isMultiViewVisible = ['combo', 'modern', 'asian'].indexOf(Config.main.sportsLayout) === -1;

    if ($location.path() === '/dashboard/') {
        Storage.set('liveFiltersWithVideo', false);
    }
    //setting some initial values
    $scope.liveFilters = Config.main.forgetFiltersSettings ? {
        withVideo: false,
        disableRegions: true
    } : {
        withVideo: !!Storage.get('liveFiltersWithVideo') || !!$location.search().withvideo,
        disableRegions: Config.main.selectRegionsByDefault ? false : !!Storage.get('liveFiltersDisableRegions')
    };

    $scope.upcomingPeriods = Utils.clone(Config.main.upcomingGamesPeriods);
    $scope.upcomingPeriods.unshift(0);
    $scope.selectedUpcomingPeriod = $scope.upcomingPeriods[Config.env.defaultUpcomingPeriodIndex + 1 || 0];

    $scope.leftMenuClosed = Storage.get('leftMenuToggleState') || false;
    $scope.$emit('leftMenu.closed', $scope.leftMenuClosed); //update other views

    $scope.$watch("outrightSelected", function (value) {
        $scope.$emit('leftmenu.outrightSelected', value);
    });
    $scope.activeGameId = null;
    $scope.gameCounts = {0: 0, 1: 0};
    $scope.leftMenuState = Storage.get("leftMenuState") || {
        live: {sport: {}, region: {}, competition: {}, groups: {}},
        prematch: {sport: {}, region: {}, groups: {}},
        suggestions: true
    };
    $scope.getCurrentTime = GameInfo.getCurrentTime;

    if (Config.main.disableSavingPreMatchMenuState || Config.main.expandOnlyOneSport) {
        $scope.leftMenuState.prematch = {sport: {}, region: {}, groups: {}};
    }
    if (Config.main.disableSavingLiveMenuState || Config.main.expandOnlyOneSport) {
        $scope.leftMenuState.live = {sport: {}, region: {}, competition: {}, groups: {}};
    }

    if ($location.path() === '/multiview/' && Config.main.expandFirstSportInMultiview) {
        $scope.leftMenuState.live.sport[1] = {expanded: true};
        $scope.leftMenuState.prematch.sport[1] = {expanded: true};
    }

    var deepLinkedGameId = null;

    /**
     * @ngdoc method
     * @name handleDeepLinking
     * @methodOf vbet5.controller:classicViewLeftController
     * @description checks for deep links and selects corresponding sports/regions/competitions/games
     */
    function handleDeepLinking(queryParams) {
        var params = queryParams || $location.search();
        if (Number(params.type)) { // live
            if (queryParams) {
                for (var i = 0, l = liveGamesDataArray.length; i < l; i++) {
                    if (liveGamesDataArray[i].id === params.sport) {
                        $scope.selectSport(liveGamesDataArray[i]);
                        break;
                    }
                }
            }
            $scope.leftMenuState.live.sport[Number(params.sport || null)] = {expanded: true};
            $scope.leftMenuState.live.region[Number(params.region || null)] = {expanded: true};
            $scope.leftMenuState.live.competition[Number(params.competition || null)] = {expanded: true};
            if ($location.path() !== '/multiview/' && params.game) {
                $scope.openGameFullDetails({id: Number(params.game)});
            }
        } else {  //prematch
            angular.forEach(leftMenuPrematchSports, function (sport) {  //prematch sport deeplink
                if (
                    ((!$scope.leftMenuState.prematch.sport[sport.id] || !$scope.leftMenuState.prematch.sport[sport.id].expanded) && Number(params.sport) === sport.id) ||
                    ($scope.leftMenuState.prematch.sport[sport.id] && $scope.leftMenuState.prematch.sport[sport.id].expanded && !expandedPrematchSports[sport.id])
                ) {
                    if (!$scope.selectedSport || $scope.selectedSport.id !== sport.id || !expandedPrematchSports[sport.id]) {
                        if ((!sport.isTodayBets && !sport.isOutright) || Number(params.sport) === sport.id) {
                            $scope.expandLeftMenuPrematchSport(sport, true);
                        }
                        if (Number(params.sport) === sport.id) {
                            $scope.selectSport(sport);
                        }
                    }
                }

                angular.forEach(sport.regions, function (region) {  // prematch region deeplink
                    if (
                        ((!$scope.leftMenuState.prematch.region[region.id] || !$scope.leftMenuState.prematch.region[region.id].expanded) && Number(params.region) === region.id) ||
                        (!Config.main.expandOnlyOneSport && expandedPrematchSports[sport.id] && $scope.leftMenuState.prematch.region[region.id] && $scope.leftMenuState.prematch.region[region.id].expanded && !expandedprematchRegions[region.id])
                    ) {
                        $scope.expandLeftMenuPrematchRegion(region, sport, true);
                        if ($location.path() !== '/dashboard/' && Number(params.region) === region.id) {
                            $scope.selectRegion(region);
                        }
                    }
                    angular.forEach(region.competitions, function (competition) {
                        if (!defaultPrematchToOpen) {
                            defaultPrematchToOpen = {competition: competition, sport: sport}; // first founded competition
                        }
                        if (Number(params.competition) === competition.id) {
                            // No need to check if the competition is already selected as it will be done in the 'expandCompetition' function
                            $scope.expandCompetition(competition, sport);

                            if (params.game) {
                                if ($scope.env.preMatchMultiSelection && firstTimeLoaded) {
                                    $scope.prematchMultiViewGames[params.game] = true;
                                }
                                // No need to check if the game is already selected as it will be done in the 'openGameFullDetails' function
                                $scope.openGameFullDetails({id: Number(params.game)});
                            }
                        }
                    });
                });
            });

            if (!Config.main.recommendedGames.enabled && defaultPrematchToOpen && !expandedPrematchCompetition && $location.path() !== '/dashboard/') { // bad solution but by default must open first competition of first expanded region
                TimeoutWrapper(function () {
                    if (defaultPrematchToOpen && !expandedPrematchCompetition && !$scope.todaysBets.selected && !$scope.boostedBets.selected && !Config.env.live && !$scope.couponGames.selected && !$scope.expressOfDay.selected) {
                        $scope.expandCompetition(defaultPrematchToOpen.competition, defaultPrematchToOpen.sport);
                    }
                }, 3000);
            }

        }
        deepLinkedGameId = Number(params.game);
    }

    /**
     * @ngdoc method
     * @name openInitialDefaultGameIfNeeded
     * @methodOf vbet5.controller:classicViewLeftController
     * @description opens first game on initial load if no game is opened
     */
    function openInitialDefaultGameIfNeeded(forceOpen) {
        if ('/multiview/' === $location.path() || '/dashboard/' === $location.path()) {
            return false;
        }
        var params = $location.search();
        var paramsSport = Number(params.sport);
        if (!Config.env.live && leftMenuPrematchSports.length && !$scope.todaysBets.selected && !$scope.expressOfDay.selected && !$scope.boostedBets.selected) {
            if (!$scope.selectedSport || Utils.isObjectEmpty($scope.leftMenuState.prematch.sport) || !$scope.leftMenuState.prematch.sport[$scope.selectedSport.id] || !$scope.leftMenuState.prematch.sport[$scope.selectedSport.id].expanded) {
                $scope.firstSport = $scope.firstSport || leftMenuPrematchSports[0];
                if (!expandedPrematchSports[$scope.firstSport.id] && Config.main.expandFirstSportByDefault) {
                    $scope.expandLeftMenuPrematchSport($scope.firstSport, true, true, true);
                }
                if (paramsSport === $scope.firstSport.id) {
                    $scope.selectSport($scope.firstSport);
                }
            }

            if ($scope.firstSport && $scope.firstSport.regions && $scope.firstSport.regions[0] && !expandedprematchRegions[$scope.firstSport.regions[0].id] && Utils.isObjectEmpty($scope.leftMenuState.prematch.region)) {
                $scope.expandLeftMenuPrematchRegion($scope.firstSport.regions[0], $scope.firstSport, true);
            }

        } else if (Config.env.live && liveGamesDataArray && liveGamesDataArray.length) {
            var selectedIndex;
            if (forceOpen) {
                selectedIndex = Utils.getIndex(liveGamesDataArray, 'id', $scope.liveSportGroups[0].sports[0].id);
            } else if (!$scope.selectedSport) {
                if (!params.sport) {
                    selectedIndex = Utils.getIndex(liveGamesDataArray, 'id', $scope.liveSportGroups[0] && $scope.liveSportGroups[0].sports[0].id);
                } else if (!$scope.leftMenuState.live.sport[paramsSport].expanded || !deepLinkedGameId) {
                    selectedIndex = liveGamesDataArray.map(function (sportObj) {return sportObj.id}).indexOf(paramsSport);
                }
            }

            if (selectedIndex > -1) {
                $scope.leftMenuState.live.sport[liveGamesDataArray[selectedIndex].id] = {expanded: true};
                $scope.selectSport(liveGamesDataArray[selectedIndex]);
                $scope.leftMenuState.live.region[liveGamesDataArray[selectedIndex].regions[0].id] = {expanded: true};
                $scope.selectRegion(liveGamesDataArray[selectedIndex].regions[0]);
                $scope.leftMenuState.live.groups[liveGamesDataArray[selectedIndex].groupId] = true;

                if (!deepLinkedGameId || forceOpen) {
                    $scope.gameClicked(liveGamesDataArray[selectedIndex].regions[0].competitions[0].games[0], liveGamesDataArray[0].regions[0].competitions[0]);
                    $scope.closeOtherSportsIfNeed(true);
                }
            }
        }
    }

    function handleGameFinish() {
        if (Config.env.live && $scope.selectedSport) {
            var selectedIndex = liveGamesDataArray.map(function (sportObj) {return sportObj.id}).indexOf($scope.selectedSport.id);
            if (selectedIndex > -1 && liveGamesDataArray[selectedIndex].regions[0] && liveGamesDataArray[selectedIndex].regions[0].competitions[0]) {
                $scope.leftMenuState.live.region[liveGamesDataArray[selectedIndex].regions[0].id] = {expanded: true};
                $scope.selectRegion(liveGamesDataArray[selectedIndex].regions[0]);
                $scope.gameClicked(liveGamesDataArray[selectedIndex].regions[0].competitions[0].games[0], liveGamesDataArray[0].regions[0].competitions[0]);
            } else {
                openInitialDefaultGameIfNeeded(true);
            }
        } else {
            openInitialDefaultGameIfNeeded(true);
        }
    }

    $scope.$on('sportsbook.gameFinished', function () {
        currentGameIsFinished = true;
        if (Config.env.live) {
            TimeoutWrapper(function () {
                if (currentGameIsFinished) {
                    handleGameFinish();
                    currentGameIsFinished = false;
                }
            }, 5000);
        }


    });

    $scope.$on('sportsbook.handleDeepLinking', function () { //linking to games inside sportsbook
        TimeoutWrapper(function () {
            var queryParams = Utils.copyObj($location.search());
            var needToClose = $scope.selectedSport && $scope.selectedSport.id !== queryParams.sport;
            $scope.selectedSport = null;
            if (queryParams.type == Config.env.live) {
                handleDeepLinking(queryParams);
                $scope.closeOtherSportsIfNeed(needToClose);
            } else {
                $scope.toggleLive(true, queryParams);
                $scope.closeOtherSportsIfNeed(!queryParams.type);
            }
        }, 100);
    });

    $scope.$on('sportsbook.handleTopPopulars', function () { //linking to games inside sportsbook
        TimeoutWrapper(function () {
            $scope.prematchMultiViewGames = {};
            $scope.prematchMultiViewCompetitions = {};
            if (!Config.env.preMatchMultiSelection) {
                $scope.toggleMultiView();
            }
        }, 100);
    });


    TimeoutWrapper(handleDeepLinking); //initial

    if (!Config.main.expandOnlyOneSport && (!Config.main.disableSavingPreMatchMenuState || !Config.main.disableSavingLiveMenuState)) {
        $scope.$watch('leftMenuState', function (leftMenuState) {
            Storage.set("leftMenuState", leftMenuState);
        }, true);
    }

    function backupLocation(isLive) {
        var rememberObject = pathToRemember[isLive ? 'live' : 'prematch'];
        rememberObject.region = $location.search().region;
        rememberObject.sport = $location.search().sport;
        rememberObject.competition = $location.search().competition;
        rememberObject.game = $location.search().game;
    }

    function restoreLocation(isLive) {
        var rememberObject = pathToRemember[isLive ? 'live' : 'prematch'];
        $location.search('region', rememberObject.region);
        $location.search('competition', rememberObject.competition);
        $location.search('sport', rememberObject.sport);
        $location.search('game', rememberObject.game);
    }

    function getLiveGameDataById(gameId) {
        if (!gameId) return null;
        var i, j, k, l, length = liveGamesDataArray.length;
        for (i = 0; i < length; ++i) {
            var regionLength = liveGamesDataArray[i].regions.length;
            for (j = 0; j < regionLength; ++j) {
                var competitionLength = liveGamesDataArray[i].regions[j].competitions.length;
                for (k = 0; k < competitionLength; ++k) {
                    var gamesLength = liveGamesDataArray[i].regions[j].competitions[k].games.length;
                    for (l = 0; l < gamesLength; ++l) {
                        if (liveGamesDataArray[i].regions[j].competitions[k].games[l].id === gameId) {
                            return {
                                game: liveGamesDataArray[i].regions[j].competitions[k].games[l],
                                competition: liveGamesDataArray[i].regions[j].competitions[k]
                            }
                        }
                    }
                }
            }
        }
        //favourite case
        for (i = 0, length = $scope.leftMenuFavorites.length; i < length; ++i) {
            if ($scope.leftMenuFavorites[i].id === gameId) {
                return {
                    game: $scope.leftMenuFavorites[i],
                    competition: $scope.leftMenuFavorites[i].competition
                }
            }
        }

        return null;
    }


    /**
     * @ngdoc method
     * @name toggleLive
     * @methodOf vbet5.controller:classicViewLeftController
     * @description Toggles  live/pre-match
     *
     */
    $scope.toggleLive = function toggleLive(disableLocationBackup, queryParams) {
        queryParams = queryParams || {};
        if (Config.main.expandOnlyOneSport && !disableLocationBackup) {
            backupLocation(Config.env.live);
        }
        Config.env.live = !Config.env.live;
        $location.search('type', Number(Config.env.live));
        $scope.$emit('toggleLive');
        partner.call('liveActive', Config.env.live);
        if (Config.env.live && liveGamesDataArray) {
            updateMenuLiveGames({sport: liveGamesData});
            if (Config.main.expandOnlyOneSport && !disableLocationBackup) {
                restoreLocation(true);
            }
            if (liveGamesDataArray && liveGamesDataArray.length && liveGamesDataArray[0].regions &&  liveGamesDataArray[0].regions[0]) {
                $scope.leftMenuState.live.sport[queryParams.sport || pathToRemember.live.sport || liveGamesDataArray[0].id] = {expanded: true};

                var dateToSelect = getLiveGameDataById(queryParams.game || Number(pathToRemember.live.game)) || {
                    game: liveGamesDataArray[0].regions[0].competitions[0].games[0],
                    competition: liveGamesDataArray[0].regions[0].competitions[0]
                };
                $scope.selectGame(dateToSelect.game.sport, dateToSelect.game.region, dateToSelect.competition, dateToSelect.game);
                $scope.leftMenuState.live.sport[dateToSelect.game.sport.id] = {expanded: true};
                $scope.closeOtherSportsIfNeed(true);
            }
            return;
        }
        if (!Config.env.live) {
            if (Config.main.expandOnlyOneSport && !disableLocationBackup) {
                restoreLocation(false);
            } else if (Utils.isObjectEmpty(queryParams) && Config.main.disableSavingPreMatchMenuState) {
                $location.search('region', undefined);
                $location.search('competition', undefined);
                $location.search('sport', undefined);
            } else {
                $scope.selectCompetition(expandedPrematchCompetition);
            }
        }
        openInitialDefaultGameIfNeeded();
        handleDeepLinking();
    };

    $scope.$on('toggleLive', function (event) {
        if (event.targetScope.$id !== $scope.$id) { // event is coming from another controller
            $scope.toggleLive();
        }
    });

    /**
     * @ngdoc method
     * @name selectPrematchTimePeriod
     * @methodOf vbet5.controller:classicViewLeftController
     * @description  sets pre-match time period and reloads left menu
     *
     * @param {Number} hours number of hours, 0 for no filtering
     */
    $scope.selectPrematchTimePeriod = function selectPrematchTimePeriod(hours) {
        if ($scope.selectedUpcomingPeriod === hours) {
            return;
        }
        if (hours) {
            $scope.selectTournament(null, true);
        }

        $scope.selectedUpcomingPeriod = hours;
        $scope.periodDropdownOpened = false;
        subscribeForPrematchSports(updateLeftMenuPrematchSports);
    };

    /**
     * @ngdoc method
     * @name subscribeToAllGameCounts
     * @methodOf vbet5.controller:classicViewLeftController
     * @description  Subscribes to live or pre-match all games counts and updates $scope's gameCounts object properties
     * @param {Number} type game type, 0-pre-match or 1-live
     */
    function subscribeToAllGameCounts(type) {
        var realType = type === 0 ? {'@in': [0, 2]} : type;
        var request = {
            'source': 'betting',
            'what': {'game': '@count'},
            'where': {
                'game': {'type': realType},
                'sport': {'type': {'@ne': 1}}
            }
        };

        if (!type) {
            if ($scope.selectedUpcomingPeriod) {
                request.where.game.start_ts = {'@now': {'@gte': 0, '@lt': $scope.selectedUpcomingPeriod * 3600}};
            } else if (Config.env.gameTimeFilter) {
                request.where.game.start_ts = Config.env.gameTimeFilter;
            }
        }

        Utils.setCustomSportAliasesFilter(request);

        connectionService.subscribe(request, function (data) {
            $scope.gameCounts[type] = data.game;
        }, null, true);
    }

    /**
     * @ngdoc method
     * @name updateMenuLiveGames
     * @methodOf vbet5.controller:classicViewLeftController
     * @description  updates lef menu live games
     * @param {Object} data live data object
     */
    function updateMenuLiveGames(data) {
        if (!Config.env.live && liveGamesData) {
            console.log("skipping live update, as we're not in live mode");
            return;
        }
        var filteredData = tournamentFilter.filterData(data, Config.main.sportTournaments.showInLive?$scope.selectedTournament: null);

        angular.forEach(filteredData.sport, function (sport) {
            sport.regions = [];
            sport.game = 0;
            var alphabeticalCompetitions = [];
            angular.forEach(sport.region, function (region) {
                region.competitions = [];
                region.game = 0;
                angular.forEach(region.competition, function (competition) {
                    competition.games = [];
                    competition.gameCount = 0;
                    competition.region = {alias: region.alias};
                    angular.forEach(competition.game, function (game) {
                        GameInfo.hasVideo(game); // check availability of video)

                        if (!$scope.liveFilters.withVideo || game.video_id !== undefined) {
                            game.text_info= game.text_info ? game.text_info.replace(/;/g, ',') : '';

                            if (!Config.main.hideMarketFromLeftMenu && game.market) {
                                // Adding P1XP2 or P1P2 info to the game object
                                var marketIds = Object.keys(game.market),
                                    numberOfMarkets = marketIds.length,
                                    market;

                                // If we've received two markets (making marketIds.length = 2), then we always want to pick P1XP2...
                                if (numberOfMarkets > 1) {
                                    for (var i = 0; i < numberOfMarkets; i++) {
                                        if (game.market[marketIds[i]].type === "P1XP2") {
                                            market = marketIds[i];
                                            break;
                                        }
                                    }
                                } else { //... if not that we pick the first one
                                    market = marketIds[0];
                                }
                                if (market) {
                                    game.marketInfo = game.market[market];
                                    game.marketInfo.markets = [];
                                    for (var events in game.marketInfo.event) {
                                        game.marketInfo.markets.push(game.marketInfo.event[events]);
                                    }
                                    game.marketInfo.markets.sort(Utils.orderSorting);
                                } else {
                                    game.marketInfo = {};
                                }
                            }

                            game.additionalEvents = game.markets_count;
                            game.region = {id: region.id};
                            game.competition = {id: competition.id};
                            game.sport = {id: sport.id, alias: sport.alias};

                            if (Config.main.showPlayerRegion) {
                                game.team1_name = game.team1_reg_name && game.team1_name.indexOf(game.team1_reg_name) === -1 ? game.team1_name + ' (' + game.team1_reg_name + ')' : game.team1_name;
                                game.team2_name = game.team2_reg_name && game.team2_name.indexOf(game.team2_reg_name) === -1 ? game.team2_name + ' (' + game.team2_reg_name + ')' : game.team2_name;
                            }

                            GameInfo.checkITFAvailability(game);

                            if (game.info) {
                                game.info.current_game_time = GameInfo.getCurrentTime(game.info.current_game_time, game.info.current_game_state);
                            }
                            if (game.id === deepLinkedGameId && !$scope.activeGameId) {
                                $scope.activeGameId = game.id;
                                $rootScope.$broadcast("leftMenu.gameClicked", {game: game, competition: competition});
                            }
                            if ($rootScope.myGames.indexOf(game.id) !== -1) {
                            } else if ('/multiview/' !== $location.path() || !$rootScope.multiViewLiveOpenedGamesIds || $rootScope.multiViewLiveOpenedGamesIds.indexOf(game.id) === -1) {
                                competition.games.push(game);
                                region.game++;
                                competition.gameCount++;
                            }
                        }
                    });
                    competition.games.sort(Utils.orderByStartTs);
                    if (competition.games.length !== 0) {
                        region.competitions.push(competition);
                        alphabeticalCompetitions.push(competition);
                    }

                });

                region.competitions.sort(Utils[Config.main.sportsLeftMenuSortingFunctionName]);

                if ((Config.main.sportsLeftMenuSortingFunctionName !== 'alphabeticalSorting' || !$scope.liveFilters.disableRegions) && region.competitions.length !== 0) {
                    sport.regions.push(region);
                }

                sport.game += region.game;
            });


            if (Config.main.sportsLeftMenuSortingFunctionName === 'alphabeticalSorting' && $scope.liveFilters.disableRegions) {
                var fakeRegion = {};
                fakeRegion.competitions = alphabeticalCompetitions.sort(Utils.alphabeticalSorting);
                sport.regions.push(fakeRegion);
            }

            sport.regions.sort(Utils[Config.main.sportsLeftMenuSortingFunctionName]);
        });

        liveGamesData = data.sport;
        liveGamesDataArray = Utils.objectToArray(filteredData.sport);

        $scope.liveSportGroups = sportsToGroups(
            liveGamesDataArray.filter(function (value) { return value.regions.length > 0; }).sort(Utils.orderSorting)
        );
    }

    /**
     * @ngdoc method
     * @name updateLeftMenuAfterDragDrope
     * @methodOf vbet5.controller:classicViewLeftController
     * @description  Update left menu data after drag and drop
     */
    $scope.updateLeftMenuAfterDragDrop = function updateLeftMenuAfterDragDrop() {
        updateMenuLiveGames({sport: liveGamesData});
    };

    function updateLiveMarketsCount(data) {
        $scope.gameMarketsCountMap = {};
        angular.forEach(data.game, function (game) {
            $scope.gameMarketsCountMap[game.id] = game.market;
        });
    }

    /**
     * @ngdoc method
     * @name loadLeftMenuLive
     * @methodOf vbet5.controller:classicViewLeftController
     * @description  loads left menu live part
     */
    function loadLeftMenuLive() {
        if (Config.main.customSportsBook.classic && (Config.main.customSportsBook.classic.showLive === false || Config.main.customSportsBook.classic.showLive === 0)) {
            return;
        }

        var request = {
            'source': 'betting',
            'what': {
                'sport': ['id', 'name', 'alias', 'order'],
                'competition': ['id', 'order', 'name', 'info'],
                'region': ['id', 'name', 'alias', 'order'],
                'game': [['id', 'start_ts', 'team1_name', 'team2_name', 'team1_id', 'team2_id', 'team1_reg_name', 'team2_reg_name', 'type', 'info', 'text_info', 'markets_count', 'is_blocked', 'stats', 'tv_type', 'video_id', 'video_id2', 'video_id3', 'video_provider', 'is_stat_available', 'show_type', 'game_external_id', 'team1_external_id', 'team2_external_id', 'is_itf']]
            },
            'where': {
                'game': {'type': 1},
                'sport': {'type': {'@ne': 1}}
            }
        };

        if (!Config.main.hideMarketFromLeftMenu) {
            request.what.market = ['base', 'type', 'name', 'express_id', 'id'];
            request.what.event = [];
            request.where.market = {
                display_key: 'WINNER',
                display_sub_key: 'MATCH'
            };
        }

        if ($scope.bigBetFilter["1"]) {
            request.where.competition = {"cloud_available": true};
        }

        Utils.setCustomSportAliasesFilter(request);

        connectionService.subscribe(
            request,
            updateMenuLiveGames,
            {
                'thenCallback': function () {
                    handleDeepLinking();
                    openInitialDefaultGameIfNeeded();
                    $scope.leftMenuLiveLoading = false;
                },
                'failureCallback': function () {
                    $scope.leftMenuLiveLoading = false;
                }
            }
        );

        var marketCountRequest = {
            'source': 'betting',
            'what': {
                'game': ['id'],
                'market': '@count'
            },
            'where': {
                'game': {'type': 1},
            }
        };
        connectionService.subscribe(marketCountRequest, updateLiveMarketsCount);
    }

    /**
     * @ngdoc method
     * @name toggleVideoFilter
     * @methodOf vbet5.controller:classicViewLeftController
     * @description  toggles video filter(if on , only games with video will be selected)
     */
    $scope.toggleVideoFilter = function toggleVideoFilter() {
        $scope.liveFilters.withVideo = !$scope.liveFilters.withVideo;
        Storage.set('liveFiltersWithVideo', $scope.liveFilters.withVideo);
        if ($scope.liveFilters.withVideo && Config.main.sportTournaments.showInLive) {
            $scope.selectTournament(null, true);
        }
        if (liveGamesData) {
            updateMenuLiveGames({sport: liveGamesData});
        }
    };

    /**
     * @ngdoc method
     * @name toggleGameFavorite
     * @methodOf vbet5.controller:classicViewLeftController
     * @description  adds or removes(depending on if it's already there) game from 'my games' by emitting an event
     * @param {Object} game game object
     */
    $scope.toggleGameFavorite = function toggleGameFavorite(game) {
        (!$rootScope.myGames || $rootScope.myGames.indexOf(game.id) === -1) ? $scope.$emit('game.addToMyGames', game) : $scope.$emit('game.removeGameFromMyGames', game);
        updateMenuLiveGames({sport: liveGamesData});
    };

    /**
     * @ngdoc function
     * @name removeAllFavorites
     * @methodOf vbet5.controller:classicViewLeftController
     * @description Clean all favorites competitions/games
     */
    $scope.removeAllFavorites = function removeAllFavorites() {
        $rootScope.$broadcast('game.removeAllFavorites');
        updateMenuLiveGames({sport: liveGamesData});
    };


    $scope.$on('game.removeGameFromMyGames', function () {
        updateMenuLiveGames({sport: liveGamesData});
    });

    $scope.$on('game.toggleGameFavorite', function (event, game) {
        $scope.toggleGameFavorite(game);
    });

    $scope.$on('stream.config.updated', function() {
        if (liveGamesData) {
            updateMenuLiveGames({sport: liveGamesData});
        }
    });

    /**
     * @ngdoc method
     * @name toggleRegionsFilter
     * @methodOf vbet5.controller:classicViewLeftController
     * @description  toggles region filter(if off, games in all regions will be selected)
     */
    $scope.toggleRegionsFilter = function toggleRegionsFilter() {
        $scope.liveFilters.disableRegions = !$scope.liveFilters.disableRegions;
        Storage.set('liveFiltersDisableRegions', $scope.liveFilters.disableRegions);
        if (Config.main.sportsLeftMenuSortingFunctionName === 'alphabeticalSorting') {
            loadLeftMenuLive();
        }
    };

    /**
     * @ngdoc method
     * @name toggleLeftMenu
     * @methodOf vbet5.controller:classicViewLeftController
     * @description  expands(or collapses if expanded) left menu
     *
     * @param {boolean} val - set defined value
     */
    $scope.toggleLeftMenu = function toggleLeftMenu(val) {
        $scope.leftMenuClosed = val !== undefined ? !val : !$scope.leftMenuClosed;

        Storage.set('leftMenuToggleState', $scope.leftMenuClosed);
        $scope.$emit('leftMenu.closed', $scope.leftMenuClosed);
    };

    /**
     * @ngdoc method
     * @name closeLeftMenuDependingWindowSize
     * @methodOf vbet5.controller:classicViewLeftController
     * @description Close left menu depending on window size
     */
    function closeLeftMenuDependingWindowSize() {
        if (DomHelper.getScreenResolution().x <= 1400 && $scope.leftMenuClosed == false) {
            $scope.toggleLeftMenu(false);
        } else if (DomHelper.getScreenResolution().x > 1400 && $scope.leftMenuClosed == true) {
            $scope.toggleLeftMenu(true);
        }
    }

    closeLeftMenuDependingWindowSize();

    $scope.$on('onWindowWidthResize', closeLeftMenuDependingWindowSize);

    /**
     * @ngdoc method
     * @name gameClicked
     * @methodOf vbet5.controller:classicViewLeftController
     * @description  game click handler
     *
     * @param {Object} game game object
     * @param {Object} competition competition object
     * @param {Boolean} byUser indicates if game was clicked by user:true,  or called automatically: false (deeplinking, etc)
     * @param {Boolean} fully is responsible for covering the entire central part of the
     */
    $scope.gameClicked = function gameClicked(game, competition, byUser, fully) {
        if ('/multiview/' === $location.path() && $rootScope.multiViewLiveOpenedGamesIds && $rootScope.multiViewLiveOpenedGamesIds.length === Config.main.liveMultiViewItemsAmount) {
            $rootScope.$broadcast("globalDialogs.addDialog", {
                type: "warning",
                title: "Warning",
                content: Translator.get("You can open no more than {1} games in Live Multi-View mode", [Config.main.liveMultiViewItemsAmount])
            });
            return false;
        }

        $scope.activeGameId = game.id;
        $location.search('game', Number(game.id));
        $location.search('region', game.region.id);
        $location.search('competition', competition.id);
        $location.search('sport', game.sport.id);
        $location.search('type', Number(game.type !== 2 ? game.type : 0));
        $scope.selectCompetition(competition);
        $rootScope.$broadcast("leftMenu.gameClicked", {
            game: game,
            competition: competition,
            byUser: byUser,
            fully: fully
        });
        updateMenuLiveGames({sport: liveGamesData});
    };

    /**
     * @ngdoc method
     * @name selectGame
     * @methodOf vbet5.controller:classicViewLeftController
     * @description Select game
     * @param {Object} sport object
     * @param {Object} region object
     * @param {Object} competition object
     * @param {Object} game object
     */
    $scope.selectGame = function selectGame(sport, region, competition, game) {
        if ($scope.activeGameId === game.id) {
            return;
        }
        currentGameIsFinished = false;

        $scope.gameClicked(game, competition, true);
        $scope.leftMenuState.live.region[region.id] = $scope.leftMenuState.live.region[region.id] || {};
        $scope.leftMenuState.live.region[region.id].expanded = true;
        $scope.selectSport(sport);
        $scope.selectRegion(region);
    };

    $scope.$on('game.selected', function (event, id) {
        console.log('got game.selected', id);
        $scope.activeGameId = id;
    });

    $scope.$on('multiView.gameRemoved', function () {
        console.log("multiView.gameRemoved");
        updateMenuLiveGames({sport: liveGamesData});
    });

    //---------- top buttons ---------------

    /**
     * @ngdoc method
     * @name toggleMultiView
     * @methodOf vbet5.controller:classicViewLeftController
     * @description Toggle multi view
     */
    $scope.toggleMultiView = function toggleMultiView() {
        if (!Config.env.preMatchMultiSelection && $scope.selectedSport && $scope.selectedSport.id === additionalLeftMenuItems.OUTRIGHT.id) {
            $scope.selectSport($scope.selectedSport, true);
        }
        $scope.switchToPopularGames = false;
        Config.env.preMatchMultiSelection = !Config.env.preMatchMultiSelection;
        var sport = +$location.search().sport;
        if (sport === additionalLeftMenuItems.BOOSTED_BETS.id || sport === additionalLeftMenuItems.COUPON_GAMES.id) {
            $location.search('sport', undefined);
        }
        Storage.set('preMatchMultiSelection', Config.env.preMatchMultiSelection);
        $scope.$emit('leftMenu.preMatchMultiSelection', Config.env.preMatchMultiSelection);
        $route.reload();
    };

    //------------------------------------------  PREMATCH  -----------------------------------------------------

    var expandedPrematchSports = {}, expandedprematchRegions = {}, expandedPrematchCompetition;

    var additionalLeftMenuItems = {
        VIRTUAL_SPORT_FINANCIALS: {
            id: -2,
            alias: 'financials',
            name: Translator.get('Financials'),
            order: Config.main.showFinancialsInSportList,
            game: 2,
            link: '#/financials'
        },
        SHOW_ALL_SPORTS: {
            id: -10,
            game: 0,
            innumerable: true,
            alias: 'showallsports',
            name: Translator.get('More sports')
        },
        TODAY_BETS: {
            id: -11,
            order: Config.main.todayBets.order,
            game: 0,
            innumerable: true,
            alias: 'todaybets',
            isTodayBets: true,
            link: '#/livecalendar',
            name: Translator.get("Today's bets"),
            ids: Config.main.todayBets.additionalItems.reduce(function (acc, item) {
                acc[item.id] = true;
                return acc;
            }, { '-11': true })
        },
        OUTRIGHT: {
            id: -13,
            order: Config.main.showOutright,
            innumerable: true,
            name: Translator.get('Outright'),
            alias: 'outright',
            isOutright: true
        },
        BOOSTED_BETS: {
            id: -14,
            order: Config.main.boostedBets.order,
            game: 0,
            innumerable: true,
            alias: 'boostedbets',
            link: '#/sport/?type=0&sport=-14'
        },
        RECOMMENDED_GAMES: {
            id: -15,
            order: Config.main.recommendedGames.order,
            alias: 'recommendedgames',
            name: Translator.get('Recommended Games')
        },
        COUPON_GAMES: {
            id: -16,
            order: Config.main.couponGames.order,
            alias: 'coupongames',
            name: Translator.get('Coupons'),
            link: '#/sport/?type=0&sport=-16'
        },
        EXPRESS_OF_DAY: {
            id: -17,
            order: Config.main.expressOfDay.order,
            alias: 'expressofday',
            name: Translator.get('Express of the day'),
            link: '#/sport/?type=0&sport=-17'
        }
    };

    /**
     * @ngdoc method
     * @name expandLeftMenuAllSports
     * @methodOf vbet5.controller:classicViewLeftController
     * @description  expands(or collapses all menu sports if enabled) sports menu
     *
     * @param {Boolean} force overrides value if set
     */
    function expandLeftMenuAllSports(force) {
        var showPanel = additionalLeftMenuItems.SHOW_ALL_SPORTS;
        showPanel.expanded = force !== undefined ? force : !showPanel.expanded;
        showPanel.name = $filter('translate')(showPanel.expanded ? 'Less sports' : 'More sports');
        showPanel.game = 0;
        var i = Config.main.showPrematchLimit + 1, length = $scope.prematchSportGroups.length;
        for (; i < length; ++i) {
            showPanel.game += $scope.prematchSportGroups[i].sports.length;
        }
        $scope.showPanel = showPanel;
    }

    /**
     * @ngdoc method
     * @name updateLeftMenuPrematchSports
     * @methodOf vbet5.controller:classicViewLeftController
     * @description  updates sports list
     *
     * @param {Object} data sports data object
     * @param {boolean} firstTime the loaded state
     */
    function updateLeftMenuPrematchSports(data, firstTime) {
        $scope.leftMenuIsLoading = false;
        $scope.prematchSportCount = $scope.prematchSportCount || Config.main.showPrematchLimit;
        var limit = Config.main.showPrematchLimit;
        leftMenuPrematchSports = [];
        leftMenuPrmeatchSportsData = data;
        var filteredData = tournamentFilter.filterData(data, $scope.selectedTournament);
        angular.forEach(filteredData.sport, function (sport) {
            var singleSport = {
                alias: sport.alias,
                id: sport.id,
                name: sport.name,
                order: sport.order,
                game: 0
            };

            var regions = [];

            angular.forEach(sport.region, function (region) {
                var singleRegion = {
                    alias: region.alias,
                    id: region.id,
                    name: region.name,
                    order: region.order,
                    sportId: sport.id,
                    game: 0
                };

                var competitions = [];

                angular.forEach(region.competition, function(competition) {
                    var singleCompetition = {
                        id: competition.id,
                        name: competition.name,
                        order: competition.order,
                        region: {
                            alias: region.alias,
                            name: region.name,
                            id: region.id
                        }
                    };

                    if (Config.env.preMatchMultiSelection) {
                        var games = [];
                        angular.forEach(competition.game, function (game) {
                            var singleGame = {
                                game_number: game.game_number,
                                id: game.id,
                                start_ts: game.start_ts,
                                team1_name: game.team1_name,
                                team2_name: game.team2_name
                            };

                            games.push(singleGame);
                        });

                        singleCompetition.games = games.sort(Utils.orderByStartTs);
                        singleRegion.game += games.length;
                    } else {
                        singleRegion.game += competition.game;
                    }

                    competitions.push(singleCompetition);
                });
                singleSport.game += singleRegion.game;
                singleRegion.competitions = competitions.sort(Utils.orderSorting);

                regions.push(singleRegion);
            });


            singleSport.regions = regions.sort(Utils[Config.main.sportsLeftMenuSortingFunctionName]);

            leftMenuPrematchSports.push(singleSport);
        });


        if (!$scope.selectedTournament) {
            if (Config.main.todayBets.enabled) {
                leftMenuPrematchSports.unshift(additionalLeftMenuItems.TODAY_BETS);
            }

            if (!$scope.customSportAliasFilter) {

                if (Config.main.todayBets.enabled) {
                    Config.main.todayBets.additionalItems.forEach(function (item) {
                        leftMenuPrematchSports.push(
                            angular.extend({alias: 'todaybets', isTodayBets: true, link: '#/livecalendar'}, item)
                        );
                    });
                }

                if (Config.main.showFinancialsInSportList) {
                    leftMenuPrematchSports.push(additionalLeftMenuItems.VIRTUAL_SPORT_FINANCIALS);
                }

                if (Config.main.boostedBets.enabled && !Config.env.preMatchMultiSelection && $rootScope.boostedBetsEventIds && Object.keys($rootScope.boostedBetsEventIds).length > 0) {
                    leftMenuPrematchSports.unshift(additionalLeftMenuItems.BOOSTED_BETS);
                }
                if (Config.main.showOutright) {
                    leftMenuPrematchSports.push(additionalLeftMenuItems.OUTRIGHT);
                }
                if (Config.main.recommendedGames.enabled) {
                    leftMenuPrematchSports.push(additionalLeftMenuItems.RECOMMENDED_GAMES);
                }
                var couponSport = additionalLeftMenuItems.COUPON_GAMES;
                if (Config.main.couponGames.enabled && !Config.env.preMatchMultiSelection && couponSport.coupons && couponSport.coupons.length > 0) {
                    leftMenuPrematchSports.push(additionalLeftMenuItems.COUPON_GAMES);
                }

                if (Config.main.expressOfDay.enabled && !Config.env.preMatchMultiSelection) {
                    leftMenuPrematchSports.push(additionalLeftMenuItems.EXPRESS_OF_DAY);
                }
        }


            leftMenuPrematchSports.sort(Utils.orderSorting);

            for (var i = 0; i < leftMenuPrematchSports.length; i++) {
                if(leftMenuPrematchSports[i].order !== null) {
                    $scope.firstSport = leftMenuPrematchSports[i];
                    break;
                }
            }
        }

        $scope.prematchSportGroups = sportsToGroups(leftMenuPrematchSports);

        if (limit > 0) {
            if ($scope.prematchSportGroups.length > limit) {
                $scope.prematchSportGroups.splice(limit, 0, {
                    sports: [additionalLeftMenuItems.SHOW_ALL_SPORTS],
                    hasHeader: false,
                    id: additionalLeftMenuItems.SHOW_ALL_SPORTS.id
                });
                if (firstTime) {
                    $scope.leftMenuState.prematch.sport[additionalLeftMenuItems.SHOW_ALL_SPORTS.id] = $scope.leftMenuState.prematch.sport[additionalLeftMenuItems.SHOW_ALL_SPORTS.id] || {};
                    $scope.leftMenuState.prematch.sport[additionalLeftMenuItems.SHOW_ALL_SPORTS.id].expanded = Config.main.expandMoreSportsByDefault;
                    expandedPrematchSports[additionalLeftMenuItems.SHOW_ALL_SPORTS.id] = Config.main.expandMoreSportsByDefault;
                    expandLeftMenuAllSports(Config.main.expandMoreSportsByDefault);
                }
            }
        }
        handleDeepLinking();
    }

    function sportsToGroups(sports) {
        var storeKey = Config.env.live ? 'live' : 'prematch';
        $scope.leftMenuState[storeKey].groups = $scope.leftMenuState[storeKey].groups || {};

        var others = [], sportGroups = GameInfo.SPORT_GROUPS;
        var groups = [], isGrouped;
        var i, j, sLength = sports.length, gLength = (sportGroups && sportGroups.length) || 0;
        for (i = 0; i < sLength; i += 1) {
            isGrouped = false;
            for (j = 0; j < gLength; j += 1) {
                if (sportGroups[j].SportIds.indexOf(sports[i].id) !== -1) {
                    groups[j] = groups[j] || {
                        name: sportGroups[j].Name,
                        id: sportGroups[j].GroupId,
                        sports: [],
                        order: sportGroups[j].Order,
                        hasHeader: true,
                        alias: sportGroups[j].Alias,
                        count: 0
                    };

                    $scope.leftMenuState[storeKey].groups[groups[j].id] = $scope.leftMenuState[storeKey].groups[groups[j].id] || false;

                    sports[i].groupId = sportGroups[j].GroupId;
                    groups[j].sports.push(sports[i]);
                    groups[j].count += sports[i].game;
                    isGrouped = true;
                }
            }

            if (!isGrouped) {
                sports[i].groupId = 'group_' + sports[i].id;
                others.push({
                    id: sports[i].groupId,
                    order: sports[i].order,
                    hasHeader: false,
                    sports: [sports[i]]
                });
            }
        }
        groups.clean(undefined);
        return groups.concat(others).sort(Utils.orderSorting);
    }

    /**
     * @ngdoc method
     * @name subscribeForPrematchSports
     * @methodOf vbet5.controller:classicViewLeftController
     * @description
     */
    function subscribeForPrematchSports(callback) {
        if (Config.main.customSportsBook.classic.showPrematch === false || Config.main.customSportsBook.classic.showPrematch === 0) {
            return;
        }

        $scope.leftMenuPrematchLoading = true;
        MarketTypes.load().then(function handleMarketTypes() {
            var request = {
                'source': 'betting',
                'what': {
                    'sport': ['id', 'name', 'alias', 'order'],
                    'region': ['name', 'alias', 'id', 'order'],
                    'competition': ['id', 'name', 'order'],
                    'game': '@count'},
                'where': {
                    'game': (Config.main.enableVisibleInPrematchGames ? {
                        '@or': [{'type': {'@in': [0, 2]}}, {
                            'visible_in_prematch': 1,
                            'type': 1
                        }]
                    } : {'type': {'@in': [0, 2]}}),
                    'sport': {'type': {'@ne': 1}}
                }
            };

            if ($scope.bigBetFilter["0"]) {
                request.where.competition = {"cloud_available": true};
            }

            if (Config.env.preMatchMultiSelection) {
                request.what.game = ['id', 'team1_name', 'team2_name', 'start_ts', 'game_number', '@count'];
            }

            if ($scope.selectedUpcomingPeriod) {
                request.where.game.start_ts = {'@now': {'@gte': 0, '@lt': $scope.selectedUpcomingPeriod * 3600}};
            } else if (Config.env.gameTimeFilter) {
                request.where.game.start_ts = Config.env.gameTimeFilter;
            }

            Utils.setCustomSportAliasesFilter(request);
            connectionService.subscribe(
                request,
                function (data) {
                    // callback(data, true);
                    callback(data, firstTimeLoaded);
                    firstTimeLoaded = false;
                },
                {
                    'thenCallback': function () {
                        $scope.leftMenuPrematchLoading = false;
                        openInitialDefaultGameIfNeeded();
                    }
                }
            );
        });

    }

    (function envLiveStrategy() {
        var searchParams = $location.search();
        if ($location.path() === '/multiview/') {
            Config.env.live = true;
        } else if (showPrematchInDashboardByDefault) {
            Config.env.live = 0;
        } else if (searchParams.type !== undefined) {
            var mapping = {'live': 1, 'prematch': 0};
            if (mapping[searchParams.type] !== undefined) {
                searchParams.type = mapping[searchParams.type];
            }
            Config.env.live = !!parseInt(searchParams.type, 10);
        } else if (Config.main.classicViewDefaultType !== null) {
            Config.env.live = Config.main.classicViewDefaultType === 1;
        }
        $location.search('type', Number(Config.env.live));

        if (searchParams.top_sport) {
            Config.env.preMatchMultiSelection = true;
            $scope.prematchMultiViewGames = {};
            $scope.prematchMultiViewCompetitions = {};
        }
    })();

    /**
     * @ngdoc method
     * @name selectSport
     * @methodOf vbet5.controller:modernViewMainController
     * @description Selects sport
     */
    $scope.selectSport = function selectSport(sport, clearFromLocation) {
        if (sport && sport.id === additionalLeftMenuItems.SHOW_ALL_SPORTS.id) {
            return;
        }
        $scope.selectedSport = sport || $scope.selectedSport;
        analytics.gaSend('send', 'event', 'explorer', 'select sport ' + ($scope.env.live ? '(LIVE)' : '(PM)'), {
            'page': $location.path(),
            'eventLabel': $scope.selectedSport.alias
        });
        if (clearFromLocation && sport.isOutright) {
            clearFromLocation = false;
        }
        if (!clearFromLocation && $scope.selectedSport.id === additionalLeftMenuItems.OUTRIGHT.id) {
            $location.search('sport', $scope.selectedSport.id);
            $location.search('region', undefined);
            $location.search('competition', undefined);
            $location.search('game', undefined);
        } else if (!clearFromLocation) {
            $location.search('sport', $scope.selectedSport.id);
        } else if (Number($location.search().sport) === sport.id) {
            $location.search('sport', undefined);
        }
    };

    /**
     * @ngdoc method
     * @name closeOtherSportsIfNeed
     * @methodOf vbet5.controller:classicViewLeftController
     * @description  close other expanded sports if needed
     *
     * @param {Boolean} expanded true or false
     * @param {Boolean} [closeAll] if true closes all sports
     */
    $scope.closeOtherSportsIfNeed = function closeOtherSportsIfNeed(expanded, closeAll) {
        if (expanded && Config.main.expandOnlyOneSport) {
            var sportId, key = Config.env.live ? 'live' : 'prematch';

            if ($scope.leftMenuState[key].sport) {
                for (var id in $scope.leftMenuState[key].sport) {
                    sportId = parseInt(id);
                    if (closeAll || ($scope.leftMenuState[key].sport[id].expanded && !$scope.selectedSport || $scope.selectedSport.id !== sportId)) {
                        delete $scope.leftMenuState[key].sport[id];
                        //unsubscribe from prematch sport's regions
                        if (key === 'prematch') {
                            var i = 0, length = leftMenuPrematchSports.length;
                            for (; i < length; i += 1) {
                                if (leftMenuPrematchSports[i].id === sportId) {
                                    $location.search('sport', undefined);
                                    $location.search('region', undefined);
                                    $location.search('competition', undefined);
                                    break;
                                }
                            }
                        }
                    }
                }
            }
        }
    };

    /**
     * @ngdoc method
     * @name  clickLiveCalendar
     * @methodOf vbet5.controller:classicViewLeftController
     * @description handles redirect to sportsbook if clicked from dashboard
     *
     */
    $scope.clickLiveCalendar = function clickLiveCalendar() {
        if ($location.path() === '/dashboard/') {
            $location.path('/sport');
            $scope.$emit('prematch.expandCompetition', {type: 0, sport: additionalLeftMenuItems.TODAY_BETS.id});
        }
    };



    function initRecommendedGames() {
        var recommendedQueryParams = $location.search().recommended;

        if (recommendedQueryParams) {
            try {
                var recommendations = JSON.parse(decodeURIComponent(recommendedQueryParams));

                if (angular.isArray(recommendations.games) && recommendations.games.length > 0) {
                    var request = { games: recommendations.games };

                    if (angular.isArray(recommendations.sports) && recommendations.sports.length > 0) {
                        request.sports = recommendations.sports;
                    }

                    if (angular.isArray(recommendations.competitions) && recommendations.competitions.length > 0) {
                        request.competitions = recommendations.competitions;
                        request.sortByCompetitions = true;
                    }

                    if (angular.isArray(recommendations.regions) && recommendations.regions.length > 0) {
                        request.regions = recommendations.regions;
                    }

                    $scope.outrightSelected = false;
                    $scope.todaysBets.selected = 0;
                    $scope.boostedBets.selected = false;
                    $scope.expressOfDay.selected = false;
                    $scope.recommendedGames.selected = true;

                    // Couldn't find a better solution. If sport is removed from location synchronously then it will again be set from handleDeepLinking function.
                    TimeoutWrapper(function() {
                        $location.search('recommended', undefined);
                        $location.search('sport', undefined);
                    }, 0);


                    if ($scope.env.preMatchMultiSelection) {
                        $scope.toggleMultiView();
                    } else if ($scope.env.live) {
                        $scope.toggleLive();
                    }

                    clearSelectedCompetitionRegion();

                    $scope.$emit('subscribeToRecommendedGames', request);
                }
            } catch(e) {}
        }
    }


    function loadCoupons() {
        Zergling.get({}, "get_coupons").then(function (res) {
            additionalLeftMenuItems.COUPON_GAMES.coupons = res.details;
            if (leftMenuPrmeatchSportsData && additionalLeftMenuItems.COUPON_GAMES.coupons.length > 0) {
                updateLeftMenuPrematchSports(leftMenuPrmeatchSportsData);

            }
        });
    }

    function toggleExpandedSport(sport, keepItOpen) {
        $scope.leftMenuState.prematch.sport[sport.id] = $scope.leftMenuState.prematch.sport[sport.id] || {};
        $scope.leftMenuState.prematch.sport[sport.id].expanded = keepItOpen || !$scope.leftMenuState.prematch.sport[sport.id].expanded;
        expandedPrematchSports[sport.id] = $scope.leftMenuState.prematch.sport[sport.id].expanded;
    }

    function handleLeftMenu(sport, leaveMenuOpen) {
        if ($scope.leftMenuClosed && !leaveMenuOpen) {
            TimeoutWrapper(function () {
                DomHelper.scrollVisible("sports-list-container", "sport-" + sport.alias, false);
                $scope.toggleLeftMenu(false);
            }, 500);
        } else {
            $scope.toggleLeftMenu(true);
        }
    }

    /**
     * @ngdoc method
     * @name  expandLeftMenuPrematchSport
     * @methodOf vbet5.controller:classicViewLeftController
     * @description  expands(or collapses if expanded) sports menu (loads and subscribes/ unsubscribes to it's regions)
     *
     * @param {Object} sport sports data object
     * @param {Boolean} keepItOpen - do we need to keep menu opened
     * @param {Boolean} doChainingOpen - after resolving promise call expandRegion and continue opening chain
     * @param {Boolean} leaveMenuOpen - leaveMenuOpen
     * @param {Boolean} fromLeft - from left

     */
    $scope.expandLeftMenuPrematchSport = function expandLeftMenuPrematchSport(sport, keepItOpen, doChainingOpen, leaveMenuOpen, fromLeft) {
        if (sport.id === additionalLeftMenuItems.OUTRIGHT.id) {
            $scope.leftMenuState.prematch.sport[sport.id] = {};
            $scope.selectedSport = additionalLeftMenuItems.OUTRIGHT;
            expandedPrematchSports[sport.id] = true;
            console.log("START Outright");
            if ($scope.env.preMatchMultiSelection) {
                $scope.toggleMultiView();
                return;
            }
            $scope.$emit('populateOutright', additionalLeftMenuItems.OUTRIGHT.id);
            $scope.outrightSelected = true;
            $scope.boostedBets.selected = false;
            $scope.todaysBets.selected = 0;
            $scope.expressOfDay.selected = false;
            $scope.recommendedGames.selected = false;
            return;
        }
        if (additionalLeftMenuItems.TODAY_BETS.ids[sport.id]) {
            $scope.outrightSelected = false;
            $scope.boostedBets.selected = false;
            $scope.recommendedGames.selected = false;
            $scope.expressOfDay.selected = false;
            $scope.initTodaysBets(sport);
            return;
        }
        if (sport.id === additionalLeftMenuItems.BOOSTED_BETS.id) {
            $scope.outrightSelected = false;
            $scope.todaysBets.selected = 0;
            $scope.recommendedGames.selected = false;
            $scope.expressOfDay.selected = false;
            $scope.initBoostedBets();
            $scope.boostedBets.selected = true;
            return;
        }
        if (sport.id === additionalLeftMenuItems.EXPRESS_OF_DAY.id) {
            initExpressOfDay();
            return;
        }
        if (sport.id === additionalLeftMenuItems.RECOMMENDED_GAMES.id) {
            initRecommendedGames();
            return;
        }
        if (sport.id === additionalLeftMenuItems.COUPON_GAMES.id) {
            toggleExpandedSport(sport, keepItOpen);
            if ($scope.leftMenuState.prematch.sport[sport.id].expanded)  {
                $scope.selectedSport = sport;
                $scope.selectSport();
                clearSelectedCompetitionRegion();
                var couponName = $location.search().coupon;
                var coupons = additionalLeftMenuItems.COUPON_GAMES.coupons.filter(function (item) {
                    return item.Name === couponName;
                });
                if (coupons[0]) {
                    $scope.expandCoupon(coupons[0])
                }
                sport.expanded = true;
            } else  {
                $scope.selectSport(sport, true);
            }
            handleLeftMenu(sport, leaveMenuOpen);
            return;
        }
        handleLeftMenu(sport, leaveMenuOpen);
        toggleExpandedSport(sport, keepItOpen);

        if (expandedPrematchSports[sport.id]) {
            $scope.leftMenuState.prematch.groups[sport.groupId] = true;
        } else {
            Config.main.expandOnlyOneSport && $location.search('region', undefined);
        }

        if (sport.id === additionalLeftMenuItems.SHOW_ALL_SPORTS.id) {
            expandLeftMenuAllSports();
            return;
        }

        if ($scope.leftMenuState.prematch.sport[sport.id].expanded) {
            if (Config.main.expandOnlyOneSport && sport.regions && sport.regions.length &&  (!$location.search().region || $scope.customTemplateForSport[sport.id])) {
                $scope.expandLeftMenuPrematchRegion(sport.regions[0], sport, true, fromLeft);
            }
            handleDeepLinking();
            openInitialDefaultGameIfNeeded();
        }
    };

    $scope.$on('openTodayBets', function () {
        $scope.openTodaysBets(additionalLeftMenuItems.TODAY_BETS);
    });

    /**
     * @ngdoc method
     * @name selectRegion
     * @methodOf vbet5.controller:modernViewMainController
     * @description
     * Selects region and subscribes to it's competitions
     * data is processed by updateGames func.
     * @param {Object} region object
     */
    $scope.selectRegion = function selectRegion(region) {
        //$scope.selectedRegion = region || $scope.selectedRegion;
        var regionState = Config.env.live ? $scope.leftMenuState.live.region : $scope.leftMenuState.prematch.region;
        var isExpanded = regionState[region.id] && regionState[region.id].expanded;
        $location.search('region', isExpanded? region.id: undefined);
        Config.env.live && Config.main.expandOnlyOneSport && isExpanded && closeOtherRegions(region, true);
    };

    /**
     * @ngdoc method
     * @name selectCompetition
     * @methodOf vbet5.controller:modernViewMainController
     * @description Selects competition and subscribes to it's regions
     * @param {Object} competition object
     */
    $scope.selectCompetition = function selectCompetition(competition) {
        $scope.selectedCompetition = competition || $scope.selectedCompetition;
        $location.search('competition', $scope.selectedCompetition && $scope.selectedCompetition.id);
    };

    /**
     * @ngdoc method
     * @name clearSelectedCompetitionRegion
     * @methodOf vbet5.controller:modernViewMainController
     * @description Clear selected competition region
     */
    function clearSelectedCompetitionRegion() {
        $scope.selectedCompetition = null;
        //$scope.selectedRegion = null;
        $location.search('competition', null);
        $location.search('region', null);
    }

    /**
     *
     * @param currentRegion
     * @param {Boolean} isLive
     * @description Close all opened regions except of given
     */
    function closeOtherRegions(currentRegion, isLive) {
        var states = isLive ? $scope.leftMenuState.live.region : expandedprematchRegions;
        angular.forEach(states, function (item, key) {
            if (Number(key) !== currentRegion.id) {
                console.log("closeOtherRegions", key, currentRegion.id);
                if (isLive) {
                    item.expanded = false;
                } else {
                    $scope.leftMenuState.prematch.region[key].expanded = false;
                    expandedprematchRegions[key] = false;
                }
            }
        });
    }

    /**
     * @ngdoc method
     * @name expandLeftMenuPrematchRegion
     * @methodOf vbet5.controller:classicViewLeftController
     * @description  expands(or collapses if expanded) region menu (loads and subscribes/unsubscribes to games)
     *
     * @param {Object} region region data object
     * @param {Object} sport sport data object
     * @param {Boolean} keepItOpen if true, keeps it expanded(just reloads)
     */
    $scope.expandLeftMenuPrematchRegion = function expandLeftMenuPrematchRegion(region, sport, keepItOpen, fromLeft) {
        if (!region) {//should handle why region is undefined
            return;
        }

        $scope.leftMenuState.prematch.region[region.id] = $scope.leftMenuState.prematch.region[region.id] || {};
        var skipSubscription = $scope.leftMenuState.prematch.region[region.id].expanded && expandedprematchRegions[region.id];
        $scope.leftMenuState.prematch.region[region.id].expanded = keepItOpen || !$scope.leftMenuState.prematch.region[region.id].expanded;
        expandedprematchRegions[region.id] = $scope.leftMenuState.prematch.region[region.id].expanded;

        !expandedprematchRegions[region.id] ? $location.search('region', undefined) : (Config.main.expandOnlyOneSport && $location.search('sport', sport.id));


        if ($scope.leftMenuState.prematch.region[region.id].expanded) {
            $location.search('region', region.id);

            if (Config.env.preMatchMultiSelection || Config.main.expandOnlyOneSport) {
                closeOtherRegions(region);
            }

            if (!skipSubscription) {
                if ($location.path() === '/dashboard/') {
                    if (Storage.get('liveFiltersWithVideo')) {
                        $scope.toggleVideoFilter();
                    }
                    return;
                }
                if (region.competitions) {
                    var firstCompetition = region.competitions[0];
                    var competitionToExpand = Utils.getArrayObjectElementHavingFieldValue(region.competitions, 'id', Number($location.search().competition));
                    // if (!$location.search().competition && firstCompetition &&  !expandedPrematchCompetition && ($location.search().sport === undefined || Number($location.search().sport) === sport.id)) {
                    if ((Config.main.expandOnlyOneSport || (!$location.search().competition && !expandedPrematchCompetition)) && firstCompetition && ($location.search().sport === undefined || Number($location.search().sport) === sport.id)) {
                        if (Config.env.preMatchMultiSelection && !Config.env.live) {
                            if ($location.search().game && (!$scope.openGame || $scope.openGame.id !== Number($location.search().game))) {
                                $scope.prematchMultiViewGames[$location.search().game] = true;
                                $scope.openGameFullDetails({id: Number($location.search().game)});
                            }
                        } else {
                            $scope.expandCompetition(competitionToExpand || firstCompetition, sport, !competitionToExpand, fromLeft);
                        }
                    }

                    handleDeepLinking();

                    // if user have competition id in URL we opening it
                    if (!$scope.todaysBets.selected && (!$scope.selectedCompetition || !$scope.selectedCompetition.name)) {
                        if (competitionToExpand) {
                            $scope.expandCompetition(competitionToExpand);
                        }
                    }
                }
            }
        }
    };

    /**
     * @ngdoc method
     * @name initTodaysBets
     * @methodOf vbet5.controller:classicViewMainCtrl
     */
    $scope.initTodaysBets = function initTodaysBets(sport) {
        $scope.selectedSport = sport;
        $scope.selectSport();

        $scope.isPopularGames = false;
        $scope.favoriteGameIsSelected = false;
        $scope.boostedBets.selected = false;
        $scope.expressOfDay.selected = false;

        expandedPrematchSports[sport.id] = true;

        if ($scope.env.preMatchMultiSelection) {
            $scope.toggleMultiView();
        } else if ($scope.env.live) {
            $scope.toggleLive();
        }

        clearSelectedCompetitionRegion();

        $scope.$emit('subscribeForTodaysBetsSports', sport);
    };

    /**
     * @ngdoc method
     * @name initBoostedBets
     * @methodOf vbet5.controller:classicViewMainCtrl
     */
    $scope.initBoostedBets = function initBoostedBets() {
        if ($location.path() === '/dashboard/') {
            $scope.todaysBets.selected = 0;
            $scope.boostedBets.selected = false;
            $scope.expressOfDay.selected = false;

        }
        $scope.selectedSport = additionalLeftMenuItems.BOOSTED_BETS;
        $scope.selectSport();
        $scope.isPopularGames = false;
        $scope.favoriteGameIsSelected = false;
        expandedPrematchSports[additionalLeftMenuItems.BOOSTED_BETS.id] = additionalLeftMenuItems.BOOSTED_BETS;
        clearSelectedCompetitionRegion();
        additionalLeftMenuItems.BOOSTED_BETS.expanded = true;
        $scope.$emit('subscribeForBoostedBets');
    };

    function initExpressOfDay() {
        if ($location.path() === '/dashboard/') {
            $scope.todaysBets.selected = 0;
            $scope.expressOfDay.selected = false;
            return;
        }
        $scope.outrightSelected = false;
        $scope.todaysBets.selected = 0;
        $scope.recommendedGames.selected = false;
        $scope.boostedBets.selected = false;
        $scope.expressOfDay.selected = true;
        $scope.selectedSport = additionalLeftMenuItems.EXPRESS_OF_DAY;
        $scope.selectSport();
        $location.search("game", undefined);
        $scope.isPopularGames = false;
        $scope.favoriteGameIsSelected = false;
        expandedPrematchSports[additionalLeftMenuItems.EXPRESS_OF_DAY.id] = additionalLeftMenuItems.EXPRESS_OF_DAY;
        clearSelectedCompetitionRegion();
        additionalLeftMenuItems.EXPRESS_OF_DAY.expanded = true;
        $scope.$emit('selectExpressOfDay', additionalLeftMenuItems.EXPRESS_OF_DAY);
    }

    $scope.$watch('prematchMultiViewGames', function () {
        if (Config.env.preMatchMultiSelection) {
            Storage.set("prematchMultiViewGames", $scope.prematchMultiViewGames);
            $scope.$emit('prematchMultiView.games', $scope.prematchMultiViewGames);
        }
    }, true);
    $scope.$watch('prematchMultiViewCompetitions', function () {
        if (Config.env.preMatchMultiSelection) {
            Storage.set("prematchMultiViewCompetitions", $scope.prematchMultiViewCompetitions);
        }
    }, true);

    $scope.$on('popularGamesAreLoaded', function (e, popularGamesData) {
        angular.forEach(popularGamesData.sport, function (sport) {
            angular.forEach(sport.region, function (region) {
                angular.forEach(region.competition, function (competition) {
                    angular.forEach(competition.game, function (game) {
                        $scope.gameToMultiView(game);
                    });
                });
            });
        });
    }, true);

    /**
     * @ngdoc method
     * @name competitionToMultiview
     * @methodOf vbet5.controller:classicViewLeftController
     * @description Move competition to multiview
     * @param {Object} competition object
     * @param {Object} sport
     */
    $scope.competitionToMultiview = function competitionToMultiview(competition, sport) {
        $scope.todaysBets.selected = 0;
        $scope.outrightSelected = false;
        $scope.boostedBets.selected = false;
        $scope.expressOfDay.selected = false;
        $scope.recommendedGames.selected = false;
        if ($scope.customTemplateForSport[sport.id]) {
            $location.search({
                sport: sport.id,
                region: competition.region.id,
                competition: competition.id,
                type: 0
            });
            $scope.toggleMultiView();
        }
        for (var i = competition.games.length; i--;) {
            $scope.prematchMultiViewGames[competition.games[i].id] = $scope.prematchMultiViewCompetitions[competition.id];
        }

        $scope.$emit('prematchMultiView.changeIsPopularGames', false);
    };

    /**
     * @ngdoc method
     * @name gameToMultiView
     * @methodOf vbet5.controller:classicViewLeftController
     * @description Move game to multiview
     * @param {Object} game object
     */
    $scope.gameToMultiView = function gameToMultiView(game) {
        $scope.prematchMultiViewGames[game.id] = true;
    };

    /**
     * @ngdoc method
     * @name selectNextGame
     * @methodOf vbet5.controller:classicViewLeftController
     * @description Select next game when remove it from multiSelect menu
     * @param {Object} competition object
     */
    function selectNextGame(competition, isItNotLastGame) {
        var listingGames = competition.games;

        if(listingGames.length === 1 || !isItNotLastGame) {
            $location.search('game', undefined);
            return;
        }

        var i = 0, listingGamesCount = listingGames.length;
        for(; i < listingGamesCount; i++) {
            if($scope.prematchMultiViewGames[listingGames[i].id]) {
                $scope.openGameFullDetails({id: listingGames[i].id});
                break;
            }
        }
    }

    /**
     * @ngdoc method
     * @name gameCheckBoxClicked
     * @methodOf vbet5.controller:classicViewLeftController
     * @description Game checkbox click handler
     * @param {Object} competition object
     * @param {Number} gameId - selected game id
     */
    $scope.gameCheckBoxClicked = function gameCheckBoxClicked(competition, gameId) {
        $scope.outrightSelected = false;
        var fullySelected = true;
        var isItNotLastGame = false;

        if (competition && competition.game) {
            angular.forEach(competition.game, function (game) {
                if ($scope.prematchMultiViewGames && !$scope.prematchMultiViewGames[game.id]) {
                    fullySelected = false;
                } else {
                    isItNotLastGame = true;
                }
            });
            $scope.prematchMultiViewCompetitions = $scope.prematchMultiViewCompetitions || {};
            $scope.prematchMultiViewCompetitions[competition.id] = fullySelected;
        }
        if($scope.activeGameId === gameId) {
            selectNextGame(competition, isItNotLastGame);
        }

        $scope.$emit('prematchMultiView.changeIsPopularGames', false);
    };

    $scope.$on("prematchMultiView.removeGameFromSelection", function removeGameFromSelection(event, data) {
        $scope.prematchMultiViewGames[data.id] = undefined;
        $scope.gameCheckBoxClicked(data.competition, data.id);
    });

    $scope.$on("prematchMultiView.removeCompetitionFromSelection", function removeCompetitionFromSelection(event, data) {
        angular.forEach(data.competition.games, function (game) {
            $scope.prematchMultiViewGames[game.id] = undefined;
        });
        $scope.gameCheckBoxClicked(data.competition);
    });

    /**
     * @ngdoc method
     * @name resetPrematchMultiView
     * @methodOf vbet5.controller:classicViewLeftController
     * @description Reset multi view
     * @param {Boolean} true if previos competition must be handled
     */
    function resetPrematchMultiView(prev) {
        $scope.prematchMultiViewGames = {};
        $scope.prematchMultiViewCompetitions = {};

        if (prev) {
            if ($scope.prevCompetition && $scope.prevCompetition[0] && $scope.prevCompetition[1]) {
                $scope.expandCompetition($scope.prevCompetition[0], $scope.prevCompetition[1]);
            } else {
                resetPrematchMultiView();
            }
        }
    }

    $scope.$on("prematchMultiView.reset", resetPrematchMultiView);

    /**
     * @ngdoc method
     * @name expandCompetition
     * @methodOf vbet5.controller:classicViewLeftController
     * @description Expand competition
     * @param {Object} competition object
     * @param {Object} sport object
     * @param {Boolean} openFirstGame - opens first game of selected competition
     * @param {Boolean} fromLeft expanded competition from left menu added for horse racing
     */
    $scope.expandCompetition = function expandCompetition(competition, sport, openFirstGame, fromLeft) {
        if ($location.search().competition && $scope.selectedCompetition && $scope.selectedCompetition.id === competition.id) {
            return;
        }

        expandedPrematchCompetition = competition;

        additionalLeftMenuItems.OUTRIGHT.expanded = false;
        expandedPrematchSports[additionalLeftMenuItems.OUTRIGHT.id] = false;
        $scope.outrightSelected = false;

        $scope.todaysBets.selected = 0;
        $scope.boostedBets.selected = false;
        $scope.expressOfDay.selected = false;
        $scope.recommendedGames.selected = false;
        $scope.couponGames.selected = false;

        $scope.selectCompetition(competition);
        if (sport) {
            $scope.selectSport(sport);
        }
        if (competition.region && (!$scope.leftMenuState.prematch.region[competition.region.id] || !$scope.leftMenuState.prematch.region[competition.region.id].expanded)) {
            $scope.expandLeftMenuPrematchRegion(competition.region, sport, false, fromLeft);
        }
        $rootScope.broadcast('prematch.expandCompetition', {competition: competition, sport: sport, openFirstGame: openFirstGame && Config.main.expandFirstPreMatchGame, fromLeft: fromLeft});
    };

    /**
     * @ngdoc method
     * @name expandFavoriteTeam
     * @methodOf vbet5.controller:classicViewLeftController
     * @description Expand favorite team
     * @param {Object} team object
     */
    $scope.expandFavoriteTeam = function expandFavoriteTeam(team) {
        $scope.$emit('prematch.expandFavoriteTeam', {team: team});
    };

    $scope.$on('toggleMultiView', function () {
        $scope.toggleMultiView();
    });

    $scope.$on('sportsbook.selectData', function (event, data) {
        switch (data.type) {
            case 'popular.game':
                $scope.selectFavoriteGame(data.data);
                break;
            case 'popular.competition':
                if ($location.path() === '/dashboard/') {
                    $location.path('/sport');
                }
                data.data.region && $location.search('region', data.data.region.id);
                var competitionToSelect = {
                    id: data.data.id,
                    name: data.data.name,
                    region:data.data.region
                };

                var sportToSelect = {
                    id: data.data.sport.id,
                    name: data.data.sport.name,
                    alias: data.data.sport.alias
                };

                $scope.expandCompetition(competitionToSelect, sportToSelect, true);
                break;
        }
    });

    if (Config.main.boostedBets.enabled) {
        $scope.$on("addBoostedBets", function () {
            if (leftMenuPrmeatchSportsData) {
                updateLeftMenuPrematchSports(leftMenuPrmeatchSportsData);

            }
        });
    }


    function handleTournamentUpdates() {
        if ( liveGamesData && Config.main.sportTournaments.showInLive) {
            updateMenuLiveGames({sport: liveGamesData});
        }
        if (leftMenuPrmeatchSportsData) {
            updateLeftMenuPrematchSports(leftMenuPrmeatchSportsData);
        }
    }

    function handleTournamentFilters() {
        if ($scope.bigBetFilter[+Config.env.live] &&(!Config.env.live || Config.main.tournaments.showInLive) ) {
            $scope.toggleBigBetFilter();
        }
        if($scope.selectedUpcomingPeriod !== 0 && !Config.env.live) {
            $scope.selectPrematchTimePeriod(0);
        }
        if (Config.env.live && $scope.liveFilters.withVideo && Config.main.tournaments.showInLive) {
            $scope.toggleVideoFilter();
        }

    }

    $scope.selectTournament = function selectTournament(tournament, ignoreFilters) {
        $scope.selectedTournament = tournament;
        $location.search("tournamentId", tournament?tournament.id: undefined);
        if (!ignoreFilters) {
            handleTournamentFilters();
            handleTournamentUpdates();
            if (tournament) {
                if (Config.env.live) {
                    openInitialDefaultGameIfNeeded(true);
                } else if(leftMenuPrematchSports[0] && leftMenuPrematchSports[0].regions && leftMenuPrematchSports[0].regions[0]) {
                    $scope.leftMenuState.prematch.sport[leftMenuPrematchSports[0].id] = {expanded: true};
                    $scope.leftMenuState.prematch.region[leftMenuPrematchSports[0].regions[0].id] = {expanded: true};
                    $scope.expandCompetition(leftMenuPrematchSports[0].regions[0].competitions[0], leftMenuPrematchSports[0]);
                }
            }
        }
    };


    function loadTournaments() {
        Zergling.get({product_type_id: 2, stage_list:[3,2]}, 'get_tournament_list').then(function (response) {
            $scope.tournaments = response.result.map(function(tournament) {
                var sportRuleList = tournament.SportRuleList.SelectedSportItems;
                var sportIds = [];
                var sportRuleMap = {};
                sportRuleList.forEach(function (rule) {
                    if(rule.SportId) {
                        if (sportIds.indexOf(rule.SportId)=== -1) {
                            sportIds.push(rule.SportId);
                        }
                        if (!rule.CompetitionId) {
                            sportRuleMap[rule.SportId] = {all:true};
                        } else {
                            sportRuleMap[rule.SportId] =    sportRuleMap[rule.SportId] || {};
                            sportRuleMap[rule.SportId][rule.CompetitionId] = true;
                        }

                    }
                });
                return  {
                    id: tournament.Id,
                    name: tournament.Name,
                    sportIds:sportIds,
                    sportRuleMap: sportRuleMap,
                    prizeFund: tournament.PrizeFund,
                    currencyId: tournament.CurrencyId,
                    registrationAmount: tournament.RegistrationAmount,
                    startDate: tournament.StartDate,
                    endDate: tournament.EndDate

                };

            });

            var selectedTournamentId = ($scope.selectedTournament && $scope.selectedTournament.id) || $location.search().tournamentId;
            if (selectedTournamentId) {
                var filteredTournaments = $scope.tournaments.filter(function (item) {
                    return item.id === +selectedTournamentId;
                })
                if (filteredTournaments.length) {
                    $scope.selectedTournament = filteredTournaments[0];
                } else {
                    $scope.selectedTournament = null;
                }
                handleTournamentUpdates();


            }
        });
    }

    function tournamenListener(){
        loadTournaments();
        tournamentListenerPromise = $interval(loadTournaments, 600000);
    }

    /**
     * @ngdoc method
     * @name selectFavoriteGame
     * @methodOf vbet5.controller:classicViewLeftController
     * @description Select favorite game
     * @param {Object} game object
     * @param {Boolean} fully is responsible for covering the entire central part of the
     */
    $scope.selectFavoriteGame = function selectFavoriteGame(game) {
        if (game.id === $scope.activeGameId && $location.path() !== '/dashboard/' && $rootScope.multiViewLiveOpenedGamesIds && $rootScope.multiViewLiveOpenedGamesIds.length !== 0) {
            return;
        }
        if ($location.path() === '/multiview/' && game.is_live === 0) {
            $location.search({
                'game' : game.id,
                'sport': game.sport.id,
                'competition': game.competition.id,
                'type': game.type,
                'region': game.region.id
            });
            $location.path('/sport/');
            if(game.type) $scope.toggleLive();
            return;
        }
        if ($location.path() === '/dashboard/') {
            $location.path('/sport');
        }
        if(game.is_live !== $location.search().type){
            $scope.toggleLive();
        }
        if (!game.is_live){
            $scope.expandCompetition(game.competition, game.sport, false);
        }
        $scope.gameClicked(game, game.competition, true, false);
    };

    $scope.bet = function bet(event, market, liveGame, oddType) {
        oddType = oddType || 'odd';
        var game = Utils.clone(liveGame);
        if (Config.main.phoneOnlyMarkets && Config.main.phoneOnlyMarkets.enable && game.type === 1) {
            return;
        }
        $rootScope.$broadcast('bet', {event: event, market: market, game: game, oddType: oddType});
    };

    $scope.toggleBigBetFilter = function toggleBigBetFilter() {
        $scope.bigBetFilter[+Config.env.live] = !$scope.bigBetFilter[+Config.env.live];
        if ($scope.bigBetFilter[+Config.env.live] && (!Config.env.live || Config.main.tournaments.showInLive)) {
            $scope.selectTournament(null, true);
        }
        if (Config.env.live) {
            loadLeftMenuLive();
        } else {
            // Need this part to open the first available competition of the first available region on filter change
            $scope.closeOtherSportsIfNeed(true, true);
            expandedPrematchSports = {};
            // ----------
            subscribeForPrematchSports(updateLeftMenuPrematchSports);
        }
    };

    $scope.openTodaysBets = function openTodaysBets(sport) {
        if (!$scope.env.live && $scope.todaysBets.selected === sport.id) {
            return;
        }

        $scope.expandLeftMenuPrematchSport(sport);
        $scope.clickLiveCalendar();
    };

    $scope.$on("clearSelectedCompetitionAndRegion", clearSelectedCompetitionRegion);

    (function init() {
        if (Config.main.customSportsBook.classic) {
            GameInfo.getSportGroups().then(function () {
                if (Config.main.customSportsBook.classic.showLive) {
                    $scope.leftMenuLiveLoading = true;
                    GameInfo.getProviderAvailableEvents().then(function () {
                        subscribeToAllGameCounts(1);
                        loadLeftMenuLive();
                    });
                }

                if (Config.main.customSportsBook.classic.showPrematch) {
                    subscribeToAllGameCounts(0);
                    if (Config.main.couponGames.enabled) {
                        loadCoupons();
                    }
                    subscribeForPrematchSports(updateLeftMenuPrematchSports);
                }
            });
            if (Config.main.sportTournaments.enabled) {
                tournamenListener();
            }
        }
    })();

    $scope.$on("$destroy", function () {
        if (tournamentListenerPromise) {
            $interval.cancel(tournamentListenerPromise);
            tournamentListenerPromise = undefined;
        }
    })
}]);

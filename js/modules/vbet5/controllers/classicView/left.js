/**
 * @ngdoc controller
 * @name vbet5.controller:classicViewLeftController
 * @description classic view left menu controller
 *
 */
angular.module('vbet5.betting').controller('classicViewLeftController', ['$rootScope', '$scope',  '$location', '$filter', '$route', '$q', 'DomHelper', 'Utils', 'Zergling', 'ConnectionService', 'GameInfo', 'Storage', 'Config', 'Translator', 'analytics', 'TimeoutWrapper', function ($rootScope, $scope, $location, $filter, $route, $q, DomHelper, Utils, Zergling, ConnectionService, GameInfo, Storage, Config, Translator, analytics, TimeoutWrapper) {
    'use strict';
    TimeoutWrapper = TimeoutWrapper($scope);
    var connectionService = new ConnectionService($scope);
    var liveGamesData;
    var showPrematchInDashboardByDefault = $location.path() === '/dashboard/' && Config.main.dashboard.leftMenuPrematch;
    var firstTimeLoaded = true;
    var hoveredLiveGameSubscriptionSubids = {};
    var currentGameIsFinished =false;
    var pathToRemember = {live: {}, prematch:{}};
    var leftMenuPrematchSports = [];
    var defaultPrematchToOpen;
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
        if (Storage.get('liveFiltersWithVideo')) {
            Storage.set('liveFiltersWithVideo', false);
        }
    }
    //setting some initial values
    $scope.liveFilters = {
        withVideo: Config.main.forgetFiltersSettings ? false : !!Storage.get('liveFiltersWithVideo'),
        disableRegions: Config.main.forgetFiltersSettings ? true : (Storage.get('liveFiltersDisableRegions') === undefined) ? !Config.main.selectRegionsByDefault : Storage.get('liveFiltersDisableRegions')
    };

    $scope.upcomingPeriods = Utils.clone(Config.main.upcomingGamesPeriods);
    $scope.upcomingPeriods.unshift(0);
    $scope.selectedUpcomingPeriod = $scope.upcomingPeriods[Config.env.defaultUpcomingPeriodIndex + 1 || 0];

    $scope.leftMenuClosed = Storage.get('leftMenuToggleState') || false;
    $scope.$emit('leftMenu.closed', $scope.leftMenuClosed); //update other views
    $scope.$watch("virtualSportsSelected", function(value){ $scope.$emit('leftmenu.virtualSportsSelected', value)});
    $scope.$watch("outrightSelected", function(value){ $scope.$emit('leftmenu.outrightSelected', value)});
    $scope.activeGameId = null;
    $scope.gameCounts = {0: 0, 1: 0};
    $scope.leftMenuState = Storage.get("leftMenuState") || { live: { sport: {}, region: {}, competition: {}, groups: {}}, prematch: {sport: {}, region: {}, groups: {}}};
    $scope.getCurrentTime = GameInfo.getCurrentTime;

    if (Config.main.disableSavingPreMatchMenuState || Config.main.expandOnlyOneSport) {
        $scope.leftMenuState.prematch = {sport: {}, region: {}, groups: {}};
    }
    if (Config.main.disableSavingLiveMenuState || Config.main.expandOnlyOneSport) {
        $scope.leftMenuState.live = { sport: {}, region: {}, competition: {}, groups: {}}
    }

    if ($location.path() === '/multiview/' && Config.main.expandFirstSportInMultiview && !Storage.get('multiViewFirstSportExpanded')) {
        $scope.leftMenuState.live.sport[1] = {expanded: true};
        $scope.leftMenuState.prematch.sport[1] = {expanded: true};
        Storage.set('multiViewFirstSportExpanded', true);
    }

    var favoriteGames = {};
    var deepLinkedGameId = null;

    /**
     * @ngdoc method
     * @name handleDeepLinking
     * @methodOf vbet5.controller:classicViewLeftController
     * @description checks for deep links and selects corresponding sports/regions/competitions/games
     */
    function handleDeepLinking() {
        var params = $location.search();
        if (Number(params.type)) { // live
            $scope.leftMenuState.live.sport[Number(params.sport || null)] = {expanded: true};
            $scope.leftMenuState.live.region[Number(params.region || null)] = {expanded: true};
            $scope.leftMenuState.live.competition[Number(params.competition || null)] = {expanded: true};
        } else {  //prematch
            angular.forEach(leftMenuPrematchSports, function (sport) {  //prematch sport deeplink
                if (
                    ((!$scope.leftMenuState.prematch.sport[sport.id] || !$scope.leftMenuState.prematch.sport[sport.id].expanded) && Number(params.sport) === sport.id) ||
                    ($scope.leftMenuState.prematch.sport[sport.id] && $scope.leftMenuState.prematch.sport[sport.id].expanded && !expandedPrematchSports[sport.id])
                ) {
                    if (!$scope.selectedSport || $scope.selectedSport.id !== sport.id || !expandedPrematchSports[sport.id]) {
                        if ((!sport.isTodayBets && !sport.isVirtualSport && !sport.isOutright) || Number(params.sport) === sport.id) {
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
                        if (Number(params.competition) === competition.id && (!$scope.selectedCompetition || $scope.selectedCompetition.id !== competition.id)) {
                            $scope.expandCompetition(competition, sport);
                            if ($scope.env.preMatchMultiSelection) {
                                var game_id = $location.search().game;
                                if(game_id) {
                                    $scope.prematchMultiViewGames[game_id] = true;
                                    $scope.openGameFullDetails({id: Number(game_id)});
                                }
                            }
                        }
                        // prematch game deep link will be handled in another controller, it's not part of left menu
                    });
                });
            });

            if (defaultPrematchToOpen && !expandedPrematchCompetition && $location.path() !== '/dashboard/') { // bad solution but by default must open first competition of first expanded region
                TimeoutWrapper(function() {
                    if (defaultPrematchToOpen && !expandedPrematchCompetition && !additionalLeftMenuItems.TODAY_BETS.expanded && !Config.env.live) {
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
        if ('/multiview/' === $location.path()) {
            return false;
        }
        var params = $location.search();
        var paramsSport = Number(params.sport);
        if (!Config.env.live && leftMenuPrematchSports.length) {
            if (!$scope.selectedSport || Utils.isObjectEmpty($scope.leftMenuState.prematch.sport) || !$scope.leftMenuState.prematch.sport[$scope.selectedSport.id] || !$scope.leftMenuState.prematch.sport[$scope.selectedSport.id].expanded) {
                $scope.firstSport = $scope.firstSport || leftMenuPrematchSports[0];
                if (!expandedPrematchSports[$scope.firstSport.id] && Config.main.expandFirstSportByDefault && $scope.firstSport.id !== additionalLeftMenuItems.VIRTUAL_SPORT_VIRTUALS.id) {
                    $scope.expandLeftMenuPrematchSport($scope.firstSport, true, true, true);
                }
                if (paramsSport === $scope.firstSport.id) {
                    $scope.selectSport($scope.firstSport);
                }
            }

            if ($scope.firstSport.regions && $scope.firstSport.regions[0] && !expandedprematchRegions[$scope.firstSport.regions[0].id] && Utils.isObjectEmpty($scope.leftMenuState.prematch.region))
            {
                $scope.expandLeftMenuPrematchRegion($scope.firstSport.regions[0], $scope.firstSport, true);
            }

        } else if (Config.env.live && liveGamesData && liveGamesData.length) {
            var selectedIndex;
            if (forceOpen) {
                selectedIndex = 0;
            } else if (!$scope.selectedSport) {
                if (!params.sport) {
                    selectedIndex = 0;
                } else if (!$scope.leftMenuState.live.sport[paramsSport].expanded || !deepLinkedGameId) {
                    selectedIndex = liveGamesData.map(function (sportObj) {return sportObj.id}).indexOf(paramsSport);
                }
            }

            if (selectedIndex > -1) {
                $scope.leftMenuState.live.sport[liveGamesData[selectedIndex].id] = {expanded : true};
                $scope.selectSport(liveGamesData[selectedIndex]);
                $scope.leftMenuState.live.region[liveGamesData[selectedIndex].regions[0].id] = {expanded : true};
                $scope.selectRegion(liveGamesData[selectedIndex].regions[0]);
                $scope.leftMenuState.live.groups[liveGamesData[selectedIndex].groupId] = true;

                if (!deepLinkedGameId || forceOpen) {
                    $scope.gameClicked(liveGamesData[selectedIndex].regions[0].competitions[0].games[0], liveGamesData[0].regions[0].competitions[0]);
                    $scope.closeOtherSportsIfNeed(true);
                }
            }
        }
    }

    $scope.$on('sportsbook.gameFinished', function() {
        currentGameIsFinished = true;
        if(Config.env.live) {
            TimeoutWrapper(function () {
                if(currentGameIsFinished) {
                    openInitialDefaultGameIfNeeded(true);
                    currentGameIsFinished = false;
                }
            }, 5000);
        }


    });

    $scope.$on('sportsbook.handleDeepLinking', function() { //linking to games inside sportsbook
        TimeoutWrapper(function () {
            $scope.selectedSport = null;
            if (Number($location.search().type) === Number(Config.env.live)) {
                handleDeepLinking();
            } else {
                $scope.toggleLive();
            }
        }, 100);
    });

    $scope.$on('sportsbook.handleTopPopulars', function(){ //linking to games inside sportsbook
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
        $scope.$watch('leftMenuState', function (leftMenuState) { Storage.set("leftMenuState", leftMenuState); }, true);
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
        var i, j, k, l, length = liveGamesData.length;
        for (i = 0; i < length; ++i) {
            var regionLength = liveGamesData[i].regions.length;
            for (j = 0; j < regionLength; ++j) {
                var competitionLength = liveGamesData[i].regions[j].competitions.length;
                for (k = 0; k < competitionLength; ++k) {
                    var gamesLength = liveGamesData[i].regions[j].competitions[k].games.length;
                    for (l = 0; l < gamesLength; ++l) {
                        if (liveGamesData[i].regions[j].competitions[k].games[l].id === gameId) {
                            return {
                                game: liveGamesData[i].regions[j].competitions[k].games[l],
                                competition: liveGamesData[i].regions[j].competitions[k]
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
    $scope.toggleLive = function toggleLive() {
        if (Config.main.expandOnlyOneSport) {
            backupLocation(Config.env.live);
        }
        Config.env.live = !Config.env.live;
        $location.search('type', Number(Config.env.live));
        $scope.$emit('toggleLive');
        if (Config.env.live && liveGamesData) {
            updateMenuLiveGames({sport: liveGamesData});
            if (Config.main.expandOnlyOneSport) {
                restoreLocation(true);
            }
            if (liveGamesData && liveGamesData.length) {
                $scope.leftMenuState.live.sport[pathToRemember['live'].sport || liveGamesData[0].id] = {expanded: true};

                var dateToSelect = getLiveGameDataById(Number(pathToRemember['live'].game)) || {
                    game : liveGamesData[0].regions[0].competitions[0].games[0],
                    competition: liveGamesData[0].regions[0].competitions[0]
                };
                $scope.selectGame(dateToSelect.game.sport, dateToSelect.game.region, dateToSelect.competition, dateToSelect.game);
                $scope.leftMenuState.live.sport[dateToSelect.game.sport.id] = {expanded: true};
                $scope.closeOtherSportsIfNeed(true);
            }
            return;
        }
        if (!Config.env.live) {
            if (Config.main.expandOnlyOneSport) {
                restoreLocation(false);
            } else if (Config.main.disableSavingPreMatchMenuState) {
                $location.search('region', undefined);
                $location.search('competition', undefined);
                $location.search('sport', undefined);
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
        var realType = Config.main.GmsPlatform && type === 0 ? {'@in':[0, 2]} : type;
        var request = {
            'source': 'betting',
            'what': {'game': '@count'},
            'where': {'game': {'type': realType}}
        };

        if (!type) {
            if ($scope.selectedUpcomingPeriod) {
                request.where.game.start_ts = {'@now': {'@gte': 0, '@lt': $scope.selectedUpcomingPeriod * 3600}};
            } else if (Config.env.gameTimeFilter) {
                request.where.game.start_ts = Config.env.gameTimeFilter;
            }
        }
        var restrictedsportIds = Config.main.showVirtualsInSportList ? Config.main.virtualSportIds.insvirtualsports : GameInfo.getVirtualSportIds();
        request.where.sport = {'id': {'@nin': restrictedsportIds}};
        
        Utils.setCustomSportAliasesFilter(request);

        if (type && $scope.liveFilters.withVideo) {
            request.where.game['@or'] = GameInfo.getVideoFilter();
        }

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

        angular.forEach(data.sport, function (sport) {
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
                                game.competition = {id: competition.id};
                            } else {
                                game.marketInfo = {};
                            }
                        }

                        game.additionalEvents = Config.main.showEventsCountInMoreLink ? game.events_count : game.markets_count;
                        game.region = {id: region.id};
                        game.sport = {id: sport.id};

                        if(Config.main.showPlayerRegion) {
                            game.team1_name = game.team1_reg_name && game.team1_name.indexOf(game.team1_reg_name) === -1 ? game.team1_name + ' (' + game.team1_reg_name + ')' : game.team1_name;
                            game.team2_name = game.team2_reg_name && game.team2_name.indexOf(game.team2_reg_name) === -1 ? game.team2_name + ' (' + game.team2_reg_name + ')' : game.team2_name;
                        }

                        GameInfo.hasVideo(game); // check availability of video
                        if(game.info){
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
                    });
                    competition.games.sort(function (a, b) {return a.start_ts - b.start_ts; });
                    if (competition.games.length !== 0){
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


        liveGamesData = Utils.objectToArray(data.sport).filter(function (value) { return value.regions.length > 0; }).sort(Utils.orderSorting);

        $scope.liveSportGroups = sportsToGroups(liveGamesData);
    }

    /**
     * @ngdoc method
     * @name loadLeftMenuLive
     * @methodOf vbet5.controller:classicViewLeftController
     * @description  loads left menu live part
     */
    function loadLeftMenuLive() {
        if (Config.main.customSportsBook.classic && (Config.main.customSportsBook.classic.showLive === false || Config.main.customSportsBook.classic.showLive === 0)){
            return;
        }

        var request = {
            'source': 'betting',
            'what': {
                'sport': ['id', 'name', 'alias', 'order'],
                'competition': ['id', 'order', 'name'],
                'region': ['id', 'name', 'alias', 'order'],
                'game': [['id', 'start_ts', 'team1_name', 'team2_name','team1_reg_name', 'team2_reg_name', 'type', 'info', 'events_count', 'markets_count', 'is_blocked', 'stats', 'tv_type', 'video_id', 'video_id2', 'video_id3', 'video_provider', 'is_stat_available', 'show_type', 'game_external_id', 'team1_external_id', 'team2_external_id']]
            },
            'where': {'game': {'type': 1}}
        };

        if(!Config.main.hideMarketFromLeftMenu) {
            request.what.market = ['base', 'type', 'name', 'express_id'];
            request.what.event = [];
            request.where.market = {'type': { '@in': ['P1XP2','P1P2'] } };
        }

        if ($scope.bigBetFilter["1"]) {
            request.where.competition = {"cloud_available": true};
        }

        var restrictedsportIds = Config.main.showVirtualsInSportList ? Config.main.virtualSportIds.insvirtualsports : GameInfo.getVirtualSportIds();
        request.where.sport = {'id': {'@nin': restrictedsportIds}};

        if ($scope.liveFilters.withVideo) {
            request.where.game['@or'] = GameInfo.getVideoFilter();
        }

        Utils.setCustomSportAliasesFilter(request);

        $scope.leftMenuLiveLoading = true;
        connectionService.subscribe(
            request,
            updateMenuLiveGames,
            {
                'thenCallback': function (response) {
                    handleDeepLinking();
                    openInitialDefaultGameIfNeeded();
                    $scope.leftMenuLiveLoading = false;
                },
                'failureCallback': function () {
                    $scope.leftMenuLiveLoading = false;
                }
            }
        );
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
        loadLeftMenuLive();
    };

    /**
     * @ngdoc method
     * @name toggleGameFavorite
     * @methodOf vbet5.controller:classicViewLeftController
     * @description  adds or removes(depending on if it's already there) game from 'my games' by emitting an event
     * @param {Object} game game object
     */
    $scope.toggleGameFavorite = function toggleGameFavorite(game) {
        if (!$rootScope.myGames || $rootScope.myGames.indexOf(game.id) === -1) {
            $scope.$emit('game.addToMyGames', game);
        } else {
            $scope.$emit('game.removeGameFromMyGames', game);
        }
        updateMenuLiveGames({sport: liveGamesData});
    };

    $scope.$on('game.removeGameFromMyGames', function() {
        updateMenuLiveGames({sport: liveGamesData});
    });

    $scope.$on('game.toggleGameFavorite', function (event, game) { $scope.toggleGameFavorite(game); });

    /**
     * @ngdoc method
     * @name toggleRegionsFilter
     * @methodOf vbet5.controller:classicViewLeftController
     * @description  toggles region filter(if off, games in all regions will be selected)
     */
    $scope.toggleRegionsFilter = function toggleRegionsFilter() {
        $scope.liveFilters.disableRegions = !$scope.liveFilters.disableRegions;
        Storage.set('liveFiltersDisableRegions', $scope.liveFilters.disableRegions);
        if(Config.main.sportsLeftMenuSortingFunctionName === 'alphabeticalSorting') {
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
        if(DomHelper.getScreenResolution().x <= 1400 && $scope.leftMenuClosed == false) {
            $scope.toggleLeftMenu(false);
        } else if(DomHelper.getScreenResolution().x > 1400 && $scope.leftMenuClosed == true)  {
            $scope.toggleLeftMenu(true);
        }
    }

    closeLeftMenuDependingWindowSize();

    DomHelper.onWindowResize(closeLeftMenuDependingWindowSize);
    
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

        // unsubscribing from active game, before "click"-ing to new one
        connectionService.unsubscribe(hoveredLiveGameSubscriptionSubids[$scope.activeGameId]);
        delete hoveredLiveGameSubscriptionSubids[$scope.activeGameId];

        $scope.activeGameId = game.id;
        $location.search('game', Number(game.id));
        $location.search('region', game.region.id);
        $location.search('competition', competition.id);
        $location.search('sport', game.sport.id);
        $location.search('type', Number(game.type !== 2 ? game.type : 0));
        $scope.selectCompetition(competition);
        $rootScope.$broadcast("leftMenu.gameClicked", {game: game, competition: competition, byUser: byUser, fully: fully});
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
    $scope.selectGame = function selectGame (sport, region, competition, game) {
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

    $scope.leftMenuHoveredGamesSubscriptionQueue = [];

    /**
     * @ngdoc method
     * @name addGameHoveredInLeftMenuToSubscribtionQueue
     * @methodOf vbet5.controller:classicViewLeftController
     * @description Add game hovered in left menu to subscribtion queue
     * @param {Object} game object
     */
    $scope.addGameHoveredInLeftMenuToSubscribtionQueue = function addGameHoveredInLeftMenuToSubscribtionQueue (game) {
        if (!Config.main.prefetchLeftMenuHoveredLivesGames.enabled
            || game.id === $scope.activeGameId
            || $location.path() === '/dashboard/'
            || $location.path() === '/multiview/'
        ) {
            return;
        }

        $scope.leftMenuHoveredGamesSubscriptionQueue.push(TimeoutWrapper(function () {

            connectionService.subscribe(
                {
                    'source': 'betting',
                    'what': {
                        'sport': ['id', 'name', 'alias'],
                        'competition': ['id', 'name'],
                        'region': ['id'],
                        'game': [],
                        'market': [],
                        'event': []
                    },
                    'where': {'game': {'id': game.id}}
                },
                function (result) {
                    if (!result) {
                        return;
                    }

                    if (game.id === $scope.activeGameId) {
                        $scope.updateOpenGame(result);
                    }
                },
                {
                    'thenCallback': function (result) {
                        if (result.data) {
                            $rootScope.$broadcast(
                                "leftMenu.hoveredLiveGameFullDataArrived",
                                {
                                    'gameData': result.data,
                                    'gameId': game.id
                                }
                            );
                        }

                        hoveredLiveGameSubscriptionSubids[game.id] = result.subid;
                    }
                },
                true
            );
        }, Config.main.prefetchLeftMenuHoveredLivesGames.prefetchAfter));
    };

    /**
     * @ngdoc method
     * @name emptyLeftMenuHoveredGameSubscriptionQueue
     * @methodOf vbet5.controller:classicViewLeftController
     * @description Empty left menu hovered game subscription queue
     * @param {Object} game object
     */
    $scope.emptyLeftMenuHoveredGameSubscriptionQueue = function emptyLeftMenuHoveredGameSubscriptionQueue (game) {
        if (!Config.main.prefetchLeftMenuHoveredLivesGames.enabled || $location.path() === '/dashboard/') {
            return;
        }

        var i;
        var numberOfQueueItemsToCancel = $scope.leftMenuHoveredGamesSubscriptionQueue.length;
        numberOfQueueItemsToCancel = numberOfQueueItemsToCancel >= 1 ? numberOfQueueItemsToCancel - 1 : 0;

        for (i = 0; i < numberOfQueueItemsToCancel; i++) {
            TimeoutWrapper.cancel($scope.leftMenuHoveredGamesSubscriptionQueue[i]);
            delete $scope.leftMenuHoveredGamesSubscriptionQueue[i];
        }

        if (game.id !== $scope.activeGameId) {
            connectionService.unsubscribe(hoveredLiveGameSubscriptionSubids[game.id]);
            delete hoveredLiveGameSubscriptionSubids[game.id];
        }

        $rootScope.$broadcast('leftMenu.hoveredLiveGameFullDataArrived', null);
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
        VIRTUAL_SPORT_VIRTUALS: {
            id: -3,
            alias: 'virtualsports',
            name: Translator.get('Virtual sports'),
            order: Config.main.showVirtualsInSportList,
            game: 30,
            isVirtualSport: true
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
            link: '#/livecalendar'
        },
        OUTRIGHT: {
            id: -13,
            order: Config.main.showOutright,
            innumerable: true,
            name: Translator.get('Outright'),
            alias: 'outright',
            isOutright: true
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
    $scope.expandLeftMenuAllSports = function expandLeftMenuAllSports(force) {
        var showPanel = additionalLeftMenuItems.SHOW_ALL_SPORTS;
        showPanel.expanded = force !== undefined ? force : !showPanel.expanded;
        showPanel.name = $filter('translate')(showPanel.expanded ? 'Less sports' : 'More sports');
        showPanel.game = 0;
        var i = Config.main.showPrematchLimit + 1, length = $scope.prematchSportGroups.length;
        for (; i < length; ++i) {
            showPanel.game += $scope.prematchSportGroups[i].sports.length;
        }
        $scope.showPanel = showPanel;
    };

    /**
     * @ngdoc method
     * @name updateLeftMenuPrematchSports
     * @methodOf vbet5.controller:classicViewLeftController
     * @description  updates sports list
     *
     * @param {Object} data sports data object
     */
    function updateLeftMenuPrematchSports(data, firstTime) {
        $scope.sportListIsLoading = false;
        $scope.leftMenuIsLoading = false;
        $scope.prematchSportCount = $scope.prematchSportCount || Config.main.showPrematchLimit;
        var limit = Config.main.showPrematchLimit;

        leftMenuPrematchSports = Utils.objectToArray(data.sport);

        if (!$scope.customSportAliasFilter) {
            $scope.firstSport = leftMenuPrematchSports.sort(Utils.orderSorting)[0];
            if (Config.main.showFinancialsInSportList) {
                leftMenuPrematchSports.unshift(additionalLeftMenuItems.VIRTUAL_SPORT_FINANCIALS);
            }
            if (Config.main.showVirtualsInSportList) {
                leftMenuPrematchSports.unshift(additionalLeftMenuItems.VIRTUAL_SPORT_VIRTUALS);
            }

            if (Config.main.todayBets.enabled) {
                leftMenuPrematchSports.unshift(additionalLeftMenuItems.TODAY_BETS);
            }
            if (Config.main.showOutright) {
                leftMenuPrematchSports.unshift(additionalLeftMenuItems.OUTRIGHT);
            }

            leftMenuPrematchSports.sort(Utils.orderSorting);
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
                    if (Config.main.expandMoreSportsByDefault) {
                        $scope.leftMenuState.prematch.sport[additionalLeftMenuItems.SHOW_ALL_SPORTS.id].expanded = true;
                        expandedPrematchSports[additionalLeftMenuItems.SHOW_ALL_SPORTS.id] = true;
                    }
                    $scope.expandLeftMenuAllSports($scope.leftMenuState.prematch.sport[additionalLeftMenuItems.SHOW_ALL_SPORTS.id].expanded);
                }
            }
        }
        handleDeepLinking();
    }

    function sportsToGroups (sports) {
        var storeKey = Config.env.live ? 'live' : 'prematch';
        $scope.leftMenuState[storeKey].groups = $scope.leftMenuState[storeKey].groups || {};

        var others = [], sportGroups = GameInfo.SPORT_GROUPS;
        var groups = [], isGrouped;
        var i,j, sLength = sports.length, gLength = (sportGroups && sportGroups.length) || 0;
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
        return groups.concat(others).sort(Utils.orderSorting);
    }

    /**
     * @ngdoc method
     * @name subscribeForPrematchSports
     * @methodOf vbet5.controller:classicViewLeftController
     * @description
     */
    function subscribeForPrematchSports(callback) {
        if (Config.main.customSportsBook.classic && (Config.main.customSportsBook.classic.showPrematch === false || Config.main.customSportsBook.classic.showPrematch === 0)){
            return;
        }
        var request = {
            'source': 'betting',
            'what': {'sport': ['id', 'name', 'alias', 'order'], 'game': '@count'},
            'where': {
                'game': (Config.main.enableVisibleInPrematchGames ? {'@or': [{'type': Config.main.GmsPlatform ? {'@in': [0, 2]} : 0}, {'visible_in_prematch': 1, 'type': 1}]} : {'type': Config.main.GmsPlatform ? {'@in': [0, 2]} : 0})
            }
        };

        if ($scope.bigBetFilter["0"]) {
            request.where.competition = {"cloud_available": true};
        }

        var restrictedsportIds = Config.main.showVirtualsInSportList ? Config.main.virtualSportIds.insvirtualsports : GameInfo.getVirtualSportIds();
        request.where.sport = {'id': {'@nin': restrictedsportIds}};

        if ($scope.selectedUpcomingPeriod && !Config.env.live) {
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
                    openInitialDefaultGameIfNeeded();
                }
            }
        );
    }

    var searchParams = $location.search();
    if (!showPrematchInDashboardByDefault && searchParams.type !== undefined) {
        var mapping = {'live': 1, 'prematch': 0};
        if (mapping[searchParams.type] !== undefined) {
            searchParams.type = mapping[searchParams.type];
        }
        Config.env.live = !!parseInt(searchParams.type, 10);
    } else {
        if (searchParams.type === undefined && Config.main.classicViewDefaultType !== undefined && !showPrematchInDashboardByDefault && $location.path() !== '/multiview/') {
            Config.env.live = Config.main.classicViewDefaultType === 1;
        } else {
            Config.env.live = !showPrematchInDashboardByDefault;
        }
        $location.search('type', Number(Config.env.live));
    }
    if (searchParams.top_sport) {
        Config.env.preMatchMultiSelection = true;
        $scope.prematchMultiViewGames = {};
        $scope.prematchMultiViewCompetitions = {};
    }

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
     * @param {Boolean} closeAll if true closes all sports
     */
    $scope.closeOtherSportsIfNeed = function closeOtherSportsIfNeed(expanded, closeAll) {
        if (expanded && Config.main.expandOnlyOneSport) {
            var sportId, key =  Config.env.live ? 'live' : 'prematch';

            if ($scope.leftMenuState[key].sport) {
                for (var id in $scope.leftMenuState[key].sport) {
                    sportId = parseInt(id);
                    if (closeAll || ($scope.leftMenuState[key].sport[id].expanded && $scope.selectedSport.id !== sportId)) {
                        delete $scope.leftMenuState[key].sport[id];
                        //unsubscrobe from prematch sport's regions
                        if (key === 'prematch') {
                            var i = 0, length = leftMenuPrematchSports.length;
                        }
                        for (; i < length; i += 1) {
                            if (leftMenuPrematchSports[i].id === sportId) {
                                $location.search('sport', undefined);
                                $location.search('region', undefined);
                                $location.search('competition', undefined);
                                unsubscribeFromPrematchSportRegions(leftMenuPrematchSports[i]);
                                break;
                            }
                        }
                    }
                }
            }
        }
    };

    /**
     * @ngdoc method
     * @name updateLeftMenuSportRegions
     * @methodOf vbet5.controller:classicViewLeftController
     * @description  updates sports data object by adding regions list to it
     *
     * @param {Object} sport sports data object to update with its regions
     * @param {Object} data regions data object
     */
    function updateLeftMenuSportRegions(sport, data) {
        console.log('updateLeftMenuSportRegions got', sport, data);
        sport.regions = Utils.objectToArray(data.region);
        sport.regions = GameInfo.groupRegionsIfNeeded(sport.regions, sport.id);
        sport.regions.sort(Utils[Config.main.sportsLeftMenuSortingFunctionName]);

        angular.forEach(sport.regions, function (region) {
            region.sportId = sport.id;
        });

        $scope.leftMenuIsLoading = false;
        handleDeepLinking();
        openInitialDefaultGameIfNeeded();
    }

    /**
     * @ngdoc method
     * @name  clickLiveCalendar
     * @methodOf vbet5.controller:classicViewLeftController
     * @description handles redirect to sportsbook if clicked from dashboard
     *
     */
    $scope.clickLiveCalendar = function clickLiveCalendar () {
        if ($location.path() === '/dashboard/') {
            $location.path('/sport');
            $scope.$emit('prematch.expandCompetition', {type: 0, sport: additionalLeftMenuItems.TODAY_BETS.id});
        }
    };

    /**
     * @ngdoc method
     * @name  expandLeftMenuPrematchSport
     * @methodOf vbet5.controller:classicViewLeftController
     * @description  expands(or collapses if expanded) sports menu (loads and subscribes/unsubscribes to it's regions)
     *
     * @param {Object} sport sports data object
     * @param {Boolean} keepItOpen - do we need to keep menu opened
     * @param {Boolean} doChainingOpen - after resolving priiomise call expandRegion and continue opening chain
     * @param {Boolean} leaveMenuOpen - leaveMenuOpen
     */
    $scope.expandLeftMenuPrematchSport = function expandLeftMenuPrematchSport(sport, keepItOpen, doChainingOpen, leaveMenuOpen) {
        if (sport.id === additionalLeftMenuItems.OUTRIGHT.id) {
            $scope.leftMenuState.prematch.sport[sport.id] = {};
            $scope.leftMenuState.prematch.sport[sport.id].expanded = true;
            additionalLeftMenuItems.OUTRIGHT.expanded = true;
            $scope.selectedSport = additionalLeftMenuItems.OUTRIGHT;
            expandedPrematchSports[sport.id] = true;
            console.log("START Outright");
            if ($scope.env.preMatchMultiSelection) {
                $scope.toggleMultiView();
                return;
            }
            $scope.$emit('populateOutright', additionalLeftMenuItems.OUTRIGHT.id);
            $scope.outrightSelected = true;
            return;
        }
        if (sport.id === additionalLeftMenuItems.TODAY_BETS.id) {
            $scope.virtualSportsSelected = false;
            $scope.outrightSelected = false;
            $scope.initTodaysBets();
            return;
        }

        if ($scope.leftMenuClosed && !leaveMenuOpen) {
            TimeoutWrapper(function () {
                DomHelper.scrollVisible("sports-list-container", "sport-" + sport.alias, false);
                $scope.toggleLeftMenu(false);
            }, 500);
        } else {
            $scope.toggleLeftMenu(true);
        }

        $scope.leftMenuState.prematch.sport[sport.id] = $scope.leftMenuState.prematch.sport[sport.id] || {};
        $scope.leftMenuState.prematch.sport[sport.id].expanded = keepItOpen || !$scope.leftMenuState.prematch.sport[sport.id].expanded;
        expandedPrematchSports[sport.id] = $scope.leftMenuState.prematch.sport[sport.id].expanded;

        if (expandedPrematchSports[sport.id]) {
            $scope.leftMenuState.prematch.groups[sport.groupId] = true;
        } else {
            Config.main.expandOnlyOneSport && $location.search('region', undefined);
        }

        if (sport.id === additionalLeftMenuItems.SHOW_ALL_SPORTS.id) {
            $scope.expandLeftMenuAllSports();
            return;
        }

        if (sport.id === additionalLeftMenuItems.VIRTUAL_SPORT_VIRTUALS.id) {
            $location.path('/virtualsports');
            return;
        } else if ($scope.leftMenuState.prematch.sport[additionalLeftMenuItems.VIRTUAL_SPORT_VIRTUALS.id]) {
            $scope.virtualSportsSelected = false;
            $scope.leftMenuState.prematch.sport[additionalLeftMenuItems.VIRTUAL_SPORT_VIRTUALS.id].expanded = false;
            $location.search('vsport', undefined);
        }

        unsubscribeFromPrematchSportRegions(sport);

        if ($scope.leftMenuState.prematch.sport[sport.id].expanded) {
            sport.loading = true;

            var request = {
                'source': 'betting',
                'what': {'region': ['name', 'alias', 'id', 'order'], 'game': '@count'},
                'where': {
                    'sport': {'id': sport.id},
                    'game': (Config.main.enableVisibleInPrematchGames ? {'@or': ([{'type': Config.main.GmsPlatform ? {'@in': [0, 2]} : 0}, {'visible_in_prematch': 1, 'type': 1}])} : {'type': Config.main.GmsPlatform ? {'@in': [0, 2]} : 0})
                }
            };
            if ($scope.bigBetFilter["0"]) {
                request.where.competition = {"cloud_available": true};
            }
            if ($scope.selectedUpcomingPeriod) {
                request.where.game.start_ts = {'@now': {'@gte': 0, '@lt': $scope.selectedUpcomingPeriod * 3600}};
            } else if (Config.env.gameTimeFilter) {
                request.where.game.start_ts = Config.env.gameTimeFilter;
            }
            sport.regions = [];
            connectionService.subscribe(
                request,
                function (data) {
                    updateLeftMenuSportRegions(sport, data);
                },
                {
                    'thenCallback': function (response) {
                        if (response.subid) {
                            sport.regionsSubId = response.subid;
                            sport.loading = false;
                            Config.main.expandOnlyOneSport && !$location.search().region &&  $scope.expandLeftMenuPrematchRegion(sport.regions[0], sport, true);
                        }
                    },
                    'failureCallback': function () {
                        sport.loading = false;
                    }
                },
                true
            );
        }
    };

    /**
     * @description gets sport and unsubscribes from it's regions and games
     * @param {Object} sport object
     */
    function unsubscribeFromPrematchSportRegions(sport) {
        if (sport.regionsSubId) {
            connectionService.unsubscribe(sport.regionsSubId);
            delete sport.regionsSubId;

            // unsubscribe from nested regions
            if (sport.regions) {
                sport.regions.forEach(function (region) {
                    if ($scope.leftMenuState.prematch.region[region.id] && $scope.leftMenuState.prematch.region[region.id].expanded && region.gamesSubId) {
                        expandedprematchRegions[region.id] = undefined;
                        connectionService.unsubscribe(region.gamesSubId);
                        delete region.gamesSubId;
                    }
                });
            }
            // remove regions which are not needed
            if (!$scope.liveFilters.disableRegions) {
                sport.regions = null;
            }
        }
    }

    $scope.$on('openTodayBets', function() {
        $scope.expandLeftMenuPrematchSport(additionalLeftMenuItems.TODAY_BETS);
    });

    /**
     * @ngdoc method
     * @name  getFavoriteCompetitionToOpen
     * @methodOf vbet5.controller:classicViewLeftController
     * @description Get favorite competition to open
     * @param {Object} sport object
     */
    function getFavoriteCompetitionToOpen(sport) {
        var position = 0, i, length = sport.favoriteCompetition.length, competitionId = parseInt($location.search().competition);
        if (competitionId) {
            for (i = 0; i < length; i++) {
                if (sport.favoriteCompetition[i].id === competitionId) {
                    position = i;
                    break;
                }
            }
        }
        return position;
    }

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
        var regionState = Config.env.live ?  $scope.leftMenuState.live.region : $scope.leftMenuState.prematch.region;
        var isExpanded = regionState[region.id] && regionState[region.id].expanded;
        isExpanded && $location.search('region', region.id);
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
        var states = isLive ?  $scope.leftMenuState.live.region : expandedprematchRegions;
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
        if (!isLive && $scope.selectedRegion && $scope.selectedRegion.gamesSubId) {
            connectionService.unsubscribe($scope.selectedRegion.gamesSubId);
            delete $scope.selectedRegion.gamesSubId;
        }
    }

    /**
     * @ngdoc method
     * @name updateLeftMenuRegionGames
     * @methodOf vbet5.controller:classicViewLeftController
     * @description  updates regions data object by adding sports list to it
     *
     * @param {Object} region region data object to update with its sports
     * @param {Object} data competitions/games data object
     */
    function updateLeftMenuRegionGames(region, data, sport) {
        region.competitions = [];
        angular.forEach(data.region, function (regionData) {
            angular.forEach(regionData.competition, function (competition) {
                if (!Config.main.GmsPlatform) {
                    competition.name = $filter('removeParts')(competition.name, [sport.name]);
                    competition.name = $filter('removeParts')(competition.name, [regionData.name]);
                }
                competition.region = {'alias': regionData.alias, name: regionData.name, id: regionData.id};
                GameInfo.replaceRegionFieldsIfNeeded(competition.region);
                if (competition.game) {
                    competition.games = Utils.objectToArray(competition.game).sort(function (a, b) {
                        return a.start_ts - b.start_ts;
                    });

                    //if (Config.env.live) {
                    //    var i, length;
                    //    for (i = 0, length = competition.games.length; i < length; i += 1) {
                    //        GameInfo.hasVideo(competition.games[i]);
                    //    }
                    //}
                }
                region.competitions.push(competition);
            });
        });


        region.competitions.sort(Utils.orderSorting);
        $scope.leftMenuIsLoading = false;
        //handleDeepLinking();
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
    $scope.expandLeftMenuPrematchRegion = function expandLeftMenuPrematchRegion(region, sport, keepItOpen) {
        if (Config.env.preMatchMultiSelection || Config.main.expandOnlyOneSport) {
            closeOtherRegions(region);
        }

        $scope.leftMenuState.prematch.region[region.id] = $scope.leftMenuState.prematch.region[region.id] || {};
        var skipSubscription = $scope.leftMenuState.prematch.region[region.id].expanded && expandedprematchRegions[region.id];
        $scope.leftMenuState.prematch.region[region.id].expanded = keepItOpen || !$scope.leftMenuState.prematch.region[region.id].expanded;
        expandedprematchRegions[region.id] =  $scope.leftMenuState.prematch.region[region.id].expanded;

        !expandedprematchRegions[region.id] ? $location.search('region', undefined) : (Config.main.expandOnlyOneSport && $location.search('sport', sport.id));


        if (region.gamesSubId) {
            connectionService.unsubscribe(region.gamesSubId);
            delete region.gamesSubId;
        }

        if ($scope.leftMenuState.prematch.region[region.id].expanded && !skipSubscription) {
            region.loading = true;

            var request = {
                'source': 'betting',
                'what': {
                    'competition': ['id', 'name', 'order'],
                    'region': ['name', 'alias', 'id']
                },
                'where': {
                    'game': (Config.main.enableVisibleInPrematchGames  ? {'@or': ([{'type': Config.main.GmsPlatform ? {'@in': [0, 2]} : 0}, {'visible_in_prematch': 1, 'type': 1}])} : {'type': Config.main.GmsPlatform ? {'@in': [0, 2]} : 0})
                }
            };
            if ($scope.bigBetFilter["0"]) {
                request.where.competition = {"cloud_available": true};
            }
            if (region.id !== -1) {
                if (Config.main.regionMapping && Config.main.regionMapping.enabled && GameInfo.getRegionChildren(region.id)) {
                    request.where.region = {'id': {'@in': GameInfo.getRegionChildren(region.id)}};
                } else {
                    request.where.region = {'id': region.id};
                }

            }
            if ($scope.selectedUpcomingPeriod) {
                request.where.game.start_ts = {'@now': {'@gte': 0, '@lt': $scope.selectedUpcomingPeriod * 3600}};
            } else if (Config.env.gameTimeFilter) {
                request.where.game.start_ts = Config.env.gameTimeFilter;
            }

            if (Config.env.preMatchMultiSelection) {
                request.what.game = ['id', 'team1_name', 'team2_name', 'start_ts', 'game_number'];
            }
            connectionService.subscribe(
                request,
                function (data) {
                    updateLeftMenuRegionGames(region, data, sport);
                },
                {
                    'thenCallback': function (result) {
                        if (result.subid) {
                            region.gamesSubId = result.subid;
                        }

                        if ($location.path() === '/dashboard/') {
                            if (Storage.get('liveFiltersWithVideo')) {
                                $scope.toggleVideoFilter();
                            }
                            return;
                        }

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
                                $scope.expandCompetition(competitionToExpand ? competitionToExpand : firstCompetition, sport);
                            }
                        }

                        handleDeepLinking();

                        // if user have competition id in URL we opening it
                        if (!$scope.todaysBetsSelected && (!$scope.selectedCompetition || !$scope.selectedCompetition.name)) {
                            if (competitionToExpand) {
                                $scope.expandCompetition(competitionToExpand);
                            }
                        }

                        region.loading = false;
                    },
                    'failureCallback': function () {
                        region.loading = false;
                    }
                },
                true
            );
        }
    };

    /**
     * @ngdoc method
     * @name initTodaysBets
     * @methodOf vbet5.controller:classicViewMainCtrl
     */
    $scope.initTodaysBets = function initTodaysBets() {
        if ($location.path() === '/dashboard/') {
            $scope.todaysBetsSelected = false;
        }
        $scope.selectedSport = additionalLeftMenuItems.TODAY_BETS;
        $scope.selectSport();
        $scope.isPopularGames = false;
        $scope.favoriteGameIsSelected = false;
        expandedPrematchSports[additionalLeftMenuItems.TODAY_BETS.id] = additionalLeftMenuItems.TODAY_BETS;
        if ($scope.env.preMatchMultiSelection) {
            additionalLeftMenuItems.TODAY_BETS.expanded = false;
            expandedprematchRegions[additionalLeftMenuItems.TODAY_BETS.id] = true;
            $scope.toggleMultiView();
            return;
        }
        if ($scope.env.live) {
            additionalLeftMenuItems.TODAY_BETS.expanded = false;
            expandedprematchRegions[additionalLeftMenuItems.TODAY_BETS.id] = true;
            $scope.toggleLive();
            return;
        }
        clearSelectedCompetitionRegion();
        additionalLeftMenuItems.TODAY_BETS.expanded =  true;
        $scope.$emit('subscribeForTodaysBetsSports');
    };

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
     */
    $scope.competitionToMultiview = function competitionToMultiview(competition) {
        $scope.virtualSportsSelected = false;
        $scope.outrightSelected = false;
        angular.forEach(competition.game, function (game) {
            $scope.prematchMultiViewGames[game.id] = $scope.prematchMultiViewCompetitions[competition.id];
        });
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
     * @name gameCheckBoxClicked
     * @methodOf vbet5.controller:classicViewLeftController
     * @description Game checkbox click handler
     * @param {Object} competition object
     */
    $scope.gameCheckBoxClicked = function gameCheckBoxClicked(competition) {
        $scope.outrightSelected = false;
        var fullySelected = true;
        if (competition && competition.game) {
            angular.forEach(competition.game, function (game) {
                if ($scope.prematchMultiViewGames && !$scope.prematchMultiViewGames[game.id]) {
                    fullySelected = false;
                }
            });
            $scope.prematchMultiViewCompetitions = $scope.prematchMultiViewCompetitions || {};
            $scope.prematchMultiViewCompetitions[competition.id] = fullySelected;
        }

        $scope.$emit('prematchMultiView.changeIsPopularGames', false);
    };

    $scope.$on("prematchMultiView.removeGameFromSelection", function removeGameFromSelection(event, data) {
        $scope.prematchMultiViewGames[data.id] = undefined;
        $scope.gameCheckBoxClicked(data.competition);
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
     */
    $scope.expandCompetition = function expandCompetition(competition, sport) {
        if ($location.search().competition && $scope.selectedCompetition && $scope.selectedCompetition.id === competition.id) {
            return;
        }
        expandedPrematchCompetition = competition;
        additionalLeftMenuItems.OUTRIGHT.expanded = false;
        expandedPrematchSports[additionalLeftMenuItems.OUTRIGHT.id] = false;
        $scope.outrightSelected = false;
        $scope.selectCompetition(competition);
        if (sport) {
            $scope.selectSport(sport);
        }
        if (competition && competition.region) {
            $scope.selectRegion(competition.region);
        }
        additionalLeftMenuItems.TODAY_BETS.expanded = false;

        $rootScope.broadcast('prematch.expandCompetition', {competition: competition, sport: sport});
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
                $scope.selectFavoriteGame(data.data, true);
                break;
            case 'popular.competition':
                if ($location.path() === '/dashboard/') {
                    $location.path('/sport');
                } else {
                    data.data.region && $location.search('region', data.data.region.id);
                    $scope.expandCompetition(data.data, data.data.sport);
                }
                break;
        }
    });

    /**
     * @ngdoc method
     * @name selectFavoriteGame
     * @methodOf vbet5.controller:classicViewLeftController
     * @description Select favorite game
     * @param {Object} game object
     * @param {Boolean} fully is responsible for covering the entire central part of the
     */
    $scope.selectFavoriteGame = function selectFavoriteGame(game, fully) {
        if (game.id === $scope.activeGameId && $location.path() !== '/dashboard/') {
            return;
        }

        if ($location.path() === '/dashboard/') {
            $location.path('/sport');
        }

        $scope.gameClicked(game, game.competition, true, true);
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

    (function init() {
        GameInfo.getSportGroups().then(function() {
            if (!Config.main.customSportsBook.classic || (Config.main.customSportsBook.classic.showLive !== false && Config.main.customSportsBook.classic.showLive !== 0 )){
                GameInfo.getProviderAvailableEvents().then( function () {
                    Config.main.customSportsBook.classic.showLive && subscribeToAllGameCounts(1);
                    loadLeftMenuLive();
                });
            }

            Config.main.customSportsBook.classic.showPrematch && subscribeToAllGameCounts(0);
            subscribeForPrematchSports(updateLeftMenuPrematchSports);
        });
    })();

    $scope.$on('$destroy', function() {
        // Need this to avoid side effect with $location.search()
        $scope.expandCompetition = function(){};
        $scope.expandLeftMenuPrematchRegion = function() {};
    });
}]);
/* global VBET5 */
/**
 * @ngdoc controller
 * @name vbet5.controller:asianViewMainController
 * @description
 *  asian view controller
 */
VBET5.controller('asianViewMainController', ['$rootScope', '$scope', '$filter', '$location', '$route', '$interval', 'Utils', 'Zergling', 'ConnectionService', 'StreamService', 'Moment', '$q', 'Translator', 'GameInfo', 'AsianMarkets', 'Storage', 'Config', 'TimeoutWrapper', 'asianViewGmsBasaltChanger', '$window', 'DomHelper',
    function ($rootScope, $scope, $filter, $location, $route, $interval, Utils, Zergling, ConnectionService, StreamService, Moment, $q, Translator, GameInfo, AsianMarkets, Storage, Config, TimeoutWrapper, asianViewGmsBasaltChanger, $window, DomHelper) {
        'use strict';

        $rootScope.footerMovable = true; // make footer movable for this controller

        TimeoutWrapper = TimeoutWrapper($scope);
        var connectionService = new ConnectionService($scope);
        var streamService = new StreamService($scope);
        var sportDataId;
        $scope.activeGameId = null;
        $scope.selectedCompetitionsModel = {};
        $scope.competitionsList = [];
        $scope.collapedCompetitions = {};
        $scope.getVideoData = GameInfo.getVideoData;
        $scope.isEventInBetSlip = GameInfo.isEventInBetSlip;
        $scope.orderedByTime = Config.main.competitionsOrderByTimeInAsianView;
        $scope.marketGameCounts = {};
        $scope.sortAscending = true;
        $scope.visibleSetsNumber = 5;
        $scope.framesCount = GameInfo.framesCount;
        $scope.getStatWidth = GameInfo.getStatWidth;
        $scope.getCurrentTime = GameInfo.getCurrentTime;
        $scope.liveGamesSoccerTemplate = GameInfo.liveGamesSoccerTemplate;
        $scope.dotaGamesList = GameInfo.dotaGamesList;
        $scope.selectedAll = true;
        $scope.liveGamesSoccerTemplate = GameInfo.liveGamesSoccerTemplate;
        $scope.dotaGamesList = GameInfo.dotaGamesList;
        $scope.slideSets = GameInfo.slideSets;
        $scope.animationSoundsMap = GameInfo.animationSoundsMap;
        $scope.showFrameAlias = GameInfo.showFrameAlias;
        $scope.expandedHdpGames = {};
        $scope.pinnedGames = {};
        $scope.selectedMarketGroup = {};
        $scope.countDown = {
            remaining: 0
        };

        var asianConf = Config.main.asian;

        var MARKET_GROUP_ALL = {
            id: -2,
            name: 'All'
        };
        var MARKET_GROUP_OTHER = {
            id: -1,
            name: 'Other'
        };

        if (!Storage.get('asianTheme') && Config.main.asianThemeByCountry && $rootScope.geoCountryInfo && Config.main.asianThemeByCountry[$rootScope.geoCountryInfo.countryCode]) {
            Storage.set('asianTheme', Config.main.asianThemeByCountry[$rootScope.geoCountryInfo.countryCode]);
        }

        $scope.themeSelector = {
            name: Storage.get('asianTheme') || asianConf.asianDefaultTheme || 'default'
        };

        $scope.bet = function bet(event, market, openGame, oddType) {
            console.log("bet", event, market, openGame, oddType);
            oddType = oddType || 'odd';
            var game = Utils.clone(openGame);
            $rootScope.$broadcast('bet', {event: event, market: market, game: game, oddType: oddType});
        };

        /**
         * @ngdoc method
         * @name animationSoundOn
         * @methodOf vbet5.controller:asianViewMainController
         * @description  indicates the animation sound state
         */
        $scope.animationSoundOn = function animationSoundOn() {
            return $scope.openGame && !$scope.openGame.isAnimationMute && $scope.openGame.activeFieldType !== 'video' && Config.env.sound > 0 && !$scope.hideVideoAndAnimationBox && !$scope.isVideoDetached;
        };

        $scope.openStatistics = function openStatistics(game) {
            $window.open(GameInfo.getStatsLink(game), game.id, "width=940,height=600,resizable=yes,scrollbars=yes");
        };

        var gameCountSubscriptions = {}, gamesSubId = null, leftMenuSubId = null, competitionsFilterSubId = null, singleGameSubId = null, expandedHdpGamesSubIds = {};
        var checkOneTime = true;
        var competitionFilterData = {}, storageFilterData = {};
        var marketTypedistinction = Config.main.GmsPlatform ? 'display_key' : 'show_type';

        $scope.asianMarkets = AsianMarkets;
        AsianMarkets.marketsBySport = Config.main.GmsPlatform ? AsianMarkets.marketsBySportGms : AsianMarkets.marketsBySportBazalt;

        var lastCenterData = {};
        var leftMenuSports;
        var LEFT_MENU = Config.main.asianLeftMenu ||  {
                FUTURE: 0,
                LIVE: 1,
                TODAY: 2
            };
        var ALL_COMPETITIONS = {
            id: -1,
            name: Translator.get('All'),
            order: -1,
            alias: 'All'
        };
        $scope.leftMenuState = {
            favorites: {expanded: true}
        };
        $scope.selectedMenuType = {active: LEFT_MENU.LIVE};
        $scope.LEFT_MENU = LEFT_MENU;

        $scope.dayFilter = [];
        $scope.filters = {
            selectedDays: [],
            allDays: {name: "Future Dates", selected: null}
        };

        function updateLeftMenu(data) {
            leftMenuSports = Utils.objectToArray(data.sport) || [];
            if ($scope.selectedMenuType.active === LEFT_MENU.LIVE && asianConf.enableAllTabInLiveSection) {
                leftMenuSports.unshift(ALL_COMPETITIONS);
            }
            $scope.leftMenuState[$scope.selectedMenuType.active] = $scope.leftMenuState[$scope.selectedMenuType.active] || {};
            var sportGroups = GameInfo.SPORT_GROUPS;
            var otherGroups = [], groups = [], isGrouped;
            var i,j, sLength = leftMenuSports.length, gLength = (sportGroups && sportGroups.length) || 0;
            for (i = 0; i < sLength; i += 1) {
                isGrouped = false;
                for (j = 0; j < gLength; j += 1) {
                    if (sportGroups[j].SportIds.indexOf(leftMenuSports[i].id) !== -1) {
                        groups[j] = groups[j] || {
                            name: sportGroups[j].Name,
                            id: sportGroups[j].GroupId,
                            sports: [],
                            order: sportGroups[j].Order,
                            hasHeader: true,
                            alias: sportGroups[j].Alias,
                            count: 0
                        };

                        $scope.leftMenuState[$scope.selectedMenuType.active][groups[j].id] = $scope.leftMenuState[$scope.selectedMenuType.active][groups[j].id] || false;

                        leftMenuSports[i].groupId = sportGroups[j].GroupId;
                        groups[j].sports.push(leftMenuSports[i]);
                        groups[j].count += leftMenuSports[i].game;
                        isGrouped = true;
                    }
                }

                if (!isGrouped) {
                    leftMenuSports[i].groupId = 'group_' + leftMenuSports[i].id;
                    otherGroups.push({
                        id: leftMenuSports[i].groupId,
                        order: leftMenuSports[i].order,
                        hasHeader: false,
                        sports: [leftMenuSports[i]]
                    });
                    leftMenuSports[i].groupId = otherGroups[otherGroups.length - 1].id;
                    $scope.leftMenuState[$scope.selectedMenuType.active][leftMenuSports[i].id] = true;
                }
            }
            groups.clean(undefined);
            $scope.sportsGroup = groups.concat(otherGroups).sort(Utils.orderSorting);
        }

        $scope.changeStatsMode = function changeStatsMode(mode) {
            $scope.flipMode = mode;
        };

        function unsubscribe(id) {
            if (id) {
                connectionService.unsubscribe(id);
            }
        }

        $scope.toggleCompetition = function toggleCompetition(competitionId) {
            if ($scope.collapedCompetitions[competitionId]) {
                delete $scope.collapedCompetitions[competitionId];
            } else {
                $scope.collapedCompetitions[competitionId] = true;
            }
        };

        $scope.setMenuType = function setMenuType(value) {
            Config.env.live = value === LEFT_MENU.TODAY ? false : value;
            $scope.selectedMenuType.active = value;
            $location.search('menuType', value);
            $location.search('sport', undefined);
            $location.search('competition', undefined);
            $location.search('region', undefined);
            $location.search('game', undefined);
            $location.search('type', Config.env.live ? 1 : 0);
            loadLeftMenu();
        };

        $scope.$on('asianMenu', function () {
            $scope.selectedMenuType.active = +!$scope.selectedMenuType.active;
            loadLeftMenu();
        });

        /**
         * @ngdoc method
         * @name setTimeFilter
         * @methodOf vbet5.controller:asianViewMainController
         * @description adds time conditions to request according to type selected in left menu (future, live, today)
         *
         * @param {Object} request request object
         */
        function setTimeFilter(request) {
            request.where.game = request.where.game || {};

            var visibleInPrematch = function () {
                if (Config.main.enableVisibleInPrematchGames) {
                    request.where.game['@or'].push({
                        'visible_in_prematch': 1
                    });
                }
            };
            switch ($scope.selectedMenuType.active) {
                case LEFT_MENU.FUTURE:
                    request.where.game['@or'] = [{'type': {'@in': [0, 2]}}];
                    visibleInPrematch();
                    break;
                case LEFT_MENU.LIVE:
                    request.where.game.type = 1;
                    break;
                case LEFT_MENU.TODAY:
                    var todayFilter = {
                        'start_ts': {
                            '@gte': $scope.dayFilter[0].from,
                            '@lt': $scope.dayFilter[0].to
                        }
                    };

                    request.where.game['@or'] = [todayFilter];

                    if (asianConf.removeLiveGamesFromTodaySection) {
                        todayFilter.type = Config.main.GmsPlatform ? {'@in': [0, 2]} : 0;
                        visibleInPrematch();
                    }
                    break;
            }
        }

        /**
         * @ngdoc method
         * @name subscribeToLiveGameCounts
         * @methodOf vbet5.controller:asianViewMainController
         * @description  Subscribes to live games counts and updates $scope's liveGamesCount object properties
         */
        function subscribeToLiveGameCounts() {
            var request = {
                'source': 'betting',
                'what': {'game': '@count'},
                'where': {'game': {'type': 1}, market: {}}
            };
            request.where.market[marketTypedistinction] = {"@gt": ""};
            Utils.setCustomSportAliasesFilter(request);
            connectionService.subscribe(
                request,
                function (data) {
                    $scope.liveGamesCount = data.game;
                    ALL_COMPETITIONS.game = data.game;
                },
                null, true);
        }

        var countDownPromise, waitingPromise;
        $scope.resetCountDown = function resetCountDown(destroy) {
            if (!asianConf.countdown.enabled) {
                return;
            }

            $scope.countDown.remaining = 0;
            waitingPromise && $interval.cancel(countDownPromise);
            waitingPromise && TimeoutWrapper.cancel(waitingPromise);

            var resetInterval = function () {
                $scope.countDown.remaining = asianConf.countdown[$scope.selectedMenuType.active];
                countDownPromise = $interval(function() {
                    if ($scope.countDown.remaining > 0) {
                        $scope.countDown.remaining -= 1;
                    } else {
                        $scope.resetCountDown();
                    }
                }, 1000)
            };

            !destroy && (waitingPromise = TimeoutWrapper(resetInterval, 500));
        };

        var competitionsKey = "";
        function resetCompetitionData() {
            $scope.selectedPage = 0;
            $scope.expandedHdpGames = {};
            $scope.pages = null;
            competitionsKey = "";
        }

        function calculatePages (centerData) {
            var pages = centerData.competitions[sportDataId] && centerData.competitions[sportDataId].length ? parseInt(centerData.competitions[sportDataId].length / asianConf.competitionsPerPage) + (centerData.competitions[sportDataId].length % asianConf.competitionsPerPage && 1) : 1;
            $scope.pages = [];
            for (var i = 0; i < pages; i++) {
                $scope.pages.push(i);
            }
            var currentPage = parseInt(Storage.get('asianCurrentPage'), 10) || false;

            if (currentPage !== false && currentPage < $scope.pages.length) {
                $scope.currenctPage = currentPage || 0;
           //     $scope.paginationPosition = ($scope.currenctPage < 4 ? 4 : ($scope.currenctPage > $scope.pages.length - 5 ? $scope.pages.length - 5  : $scope.currenctPage) || 0);
            }
        }

        function updateHdpSequence (game, sequenceIndex) {
            if (sequenceIndex.all) {
                return;
            }
            var k, s;
            if (game.availableSequences && game.availableSequences.length) {
                for (k = 0; k < game.availableSequences.length; k++) {
                    s = game.availableSequences[k];

                    if (sequenceIndex.sequencesExclude && sequenceIndex.sequencesExclude.indexOf(s.sequence) === -1 && game['selectedSequence' + sequenceIndex.index]) {
                        if (game['selectedSequence' + sequenceIndex.index].subKey === s.subKey && game['selectedSequence' + sequenceIndex.index].sequence === s.sequence) {
                            return;
                        }
                    }

                    if (sequenceIndex.sequences && sequenceIndex.sequences.indexOf(s.sequence) !== -1 && game['selectedSequence' + sequenceIndex.index]) {
                        if (game['selectedSequence' + sequenceIndex.index].subKey === s.subKey && game['selectedSequence' + sequenceIndex.index].sequence === s.sequence) {
                            return;
                        }
                    }
                }
                for (k = 0; k < game.availableSequences.length; k++) {
                    s = game.availableSequences[k];

                    if (sequenceIndex.sequencesExclude && sequenceIndex.sequencesExclude.indexOf(s.sequence) === -1) {
                        game['selectedSequence' + sequenceIndex.index] = s;
                        return;
                    }

                    if (sequenceIndex.sequences && sequenceIndex.sequences.indexOf(s.sequence) !== -1) {
                        game['selectedSequence' + sequenceIndex.index] = s;
                        return;
                    }
                }
            }
        }

        function updateGames(data) {
            var centerData = {};
            centerData.competitions = [];
            angular.forEach(data.sport, function (sportData) {
                sportDataId = sportData.id;
                centerData.competitions[sportData.id] = centerData.competitions[sportData.id] || [];
                angular.forEach(sportData.region, function (region) {
                    angular.forEach(region.competition, function (competition) {
                        if (!Config.main.GmsPlatform) {
                            competition.name = $filter('removeParts')(competition.name, [sportData.name]);
                        }
                        if (competition.game) {
                            competition.games = Utils.objectToArray(competition.game);
                            angular.forEach(competition.games, function (game) {
                                game.sport = {'alias': sportData.alias, name: sportData.name, id: sportData.id};
                                game.region = {'alias': region.alias, name: region.name, id: region.id};
                                game.competition = {name: competition.name, id: competition.id};
                                game.hasVideo = GameInfo.hasVideo(game);
                                if(Config.main.showPlayerRegion) {
                                    game.team1_name = game.team1_reg_name && game.team1_name.indexOf(game.team1_reg_name) === -1 ? game.team1_name + ' (' + game.team1_reg_name + ')' : game.team1_name;
                                    game.team2_name = game.team2_reg_name && game.team2_name.indexOf(game.team2_reg_name) === -1 ? game.team2_name + ' (' + game.team2_reg_name + ')' : game.team2_name;
                                }
                                asianViewGmsBasaltChanger(game, AsianMarkets);

                                if (Config.main.GmsPlatform && $scope.selectedMarket.key === 'HDP' && Config.main.asian && Config.main.asian.separateMatchEventsOnHDP) {
                                    angular.forEach(Config.main.asian.separateMatchEventsOnHDP, function (sequenceIndex) {
                                        updateHdpSequence(game, sequenceIndex);
                                    })
                                }
                            });
                        }
                        centerData.competitions[sportData.id].push(competition);
                    });
                });
                centerData.competitions[sportData.id].sort($scope.sortAscending ? Utils.orderSorting : Utils.orderSortingReverse);
                var availableCompetitions = centerData.competitions[sportData.id].map(function(competition) {return competition.id; }).join("-");
                if (competitionsKey != availableCompetitions) {
                    calculatePages(centerData);
                    if (!$scope.selectedPage || $scope.selectedPage > $scope.pages.length - 1) $scope.selectPage(undefined,  true);
                    $scope.$broadcast('$$rebind::competitions-change');
                    competitionsKey = availableCompetitions;
                }
            });
            if ($scope.orderedByTime) {
                $scope.orderByTime(centerData);
            } else {
                $scope.centerData = centerData;
            }
            // lastCenterData = centerData;
            lastCenterData =  Utils.cloneDeep(centerData);
            // $scope.marketGamesAreLoading = false;

            if (centerData && centerData.competitions && centerData.competitions.length === 0) {
                if (checkOneTime &&  ($scope.selectedMenuType.active !== LEFT_MENU.FUTURE || ($scope.dateFilterGameCount && $scope.dateFilterGameCount[0] && dayCounter() === 0)) && $scope.marketGameCounts && $scope.marketGameCounts[$scope.selectedSport.alias]) {
                    var count = 0;
                    angular.forEach($scope.marketGameCounts[$scope.selectedSport.alias], function (marketCount) {
                        count += marketCount;
                    });
                    if (count > 0) {
                        $scope.openMarket({key: 'OUR'});
                        checkOneTime = false;
                    }
                }

                $scope.filterName = '';
            }

        }

        $scope.clearPage = function clearPage() {
            Storage.set('asianCurrentPage', null);
        };

        $scope.selectPage = function (page, dontSetStorage) {
            page === undefined && (page = parseInt(Storage.get('asianCurrentPage'), 10) || 0);
            (page > $scope.pages.length - 1) && (page = 0);
            if (Storage.get("menuType") !== undefined && parseInt(Storage.get("menuType")) !== $scope.selectedMenuType.active) {
                page = 0;
                dontSetStorage = false;
            }
            $scope.selectedPage = page;
     //       $scope.paginationPosition = (page < 4 ? 4 : (page > $scope.pages.length - 5 ? $scope.pages.length - 5  : page) || 0);
            $scope.$broadcast('$$rebind::competitions-change');
            Storage.set("menuType", $scope.selectedMenuType.active.toString());
            !dontSetStorage && Storage.set('asianCurrentPage', page.toString());
        };

        function updateOpenGame(data) {
            if (Utils.isObjectEmpty(data.sport) && $scope.activeGameId) {
                $scope.openGameFinished = true;
                var gameId = $scope.activeGameId;
                TimeoutWrapper(function(){
                    if($scope.openGame && gameId === $scope.openGame.id){
                        $scope.goBackFromOpenGame();
                    }
                }, 5000);
            } else {
                $scope.openGameFinished = false;
            }
            angular.forEach(data.sport, function (sport) {
                angular.forEach(sport.region, function (region) {
                    angular.forEach(region.competition, function (competition) {
                        angular.forEach(competition.game, function (game) {
                            game.sport = {id: sport.id, alias: sport.alias, name: sport.name};
                            game.region = {id: region.id, name: region.name};
                            game.competition = {id: competition.id, name: competition.name};
                            game.availableMarketGroups = {};
                            $scope.openGame = game;
                            if(Config.main.showPlayerRegion) {
                                $scope.openGame.team1_name = $scope.openGame.team1_reg_name && $scope.openGame.team1_name.indexOf($scope.openGame.team1_reg_name) === -1 ? $scope.openGame.team1_name + ' (' + $scope.openGame.team1_reg_name + ')' : $scope.openGame.team1_name;
                                $scope.openGame.team2_name = $scope.openGame.team2_reg_name && $scope.openGame.team2_name.indexOf($scope.openGame.team2_reg_name) === -1 ? $scope.openGame.team2_name + ' (' + $scope.openGame.team2_reg_name + ')' : $scope.openGame.team2_name;
                            }
                            $scope.openGame.setsOffset = $scope.openGame.setsOffset || 0;
                            // if teams shirt colors equal we change them to default colors
                            if ($scope.openGame.info && $scope.openGame.info.shirt1_color === $scope.openGame.info.shirt2_color) {
                                $scope.openGame.info.shirt1_color = "ccc";
                                $scope.openGame.info.shirt2_color = "f00";
                            }
                            if ($scope.openGame.type === 1) { // live game
                                if($scope.openGame.info){
                                    $scope.openGame.info.current_game_time = GameInfo.getCurrentTime($scope.openGame.info.current_game_time, $scope.openGame.info.current_game_state);
                                }
                                GameInfo.updateGameStatistics($scope.openGame);
                                GameInfo.extendLiveGame($scope.openGame);

                                if($scope.openGame.sport.alias === "Soccer" || $scope.openGame.alias === 'CyberFootball') {
                                    GameInfo.generateTimeLineEvents($scope.openGame, $scope);
                                    GameInfo.addOrderingDataToSoccerGameEvents($scope.openGame);
                                }
                            }


                            if ($scope.openGame.sport.alias === "HorseRacing") {
                                GameInfo.getHorseRaceInfo($scope.openGame.info, $scope.openGame.market, "Winner");
                            }

                            streamService.monitoring($scope, 'openGame', 'pinnedGames', 'enlargedGame');

                            var groupCountChecker = {}; // @TODO right solution is grouping markets before this block.

                            angular.forEach(game.market, function (market) {
                                if (!market.group_id) {
                                    market.group_id = MARKET_GROUP_OTHER.id;
                                    market.group_name = MARKET_GROUP_OTHER.name;
                                }
                                groupCountChecker[market.group_id] = groupCountChecker[market.group_id] || {};

                                if (game.availableMarketGroups[market.group_id]) {
                                    if(!groupCountChecker[market.group_id][market.type + market.name]) {
                                        game.availableMarketGroups[market.group_id].count++;
                                        groupCountChecker[market.group_id][market.type + market.name] = market.type + market.name;
                                    }
                                } else {
                                    game.availableMarketGroups[market.group_id] = {name: market.group_name, id: market.group_id, count: 1};
                                    groupCountChecker[market.group_id][market.type + market.name] = market.type + market.name;
                                }

                                angular.forEach(market.event, function (event) {
                                    //event.name = $filter('improveName')(event.name, game);
                                    event.name = $filter('removeParts')(event.name, [market.name]);
                                });


                                /*CORRECT SCORE*/
                                if(market.display_key === 'CORRECT SCORE') {
                                    GameInfo.reorderMarketEvents(market, 'correctScore');
                                } else{
                                    market.events = Utils.objectToArray(market.event);
                                }
                            });

                            game.availableMarketGroups = Utils.objectToArray(game.availableMarketGroups);
                            game.availableMarketGroups.unshift(MARKET_GROUP_ALL);

                            if (Config.main.sportMarketGroupsOrder) {
                                var index;
                                game.availableMarketGroups.sort(function(a) {
                                    index = Config.main.sportMarketGroupsOrder.indexOf(a.id);
                                    return index < 0 ? a.id : index
                                });
                            }
                        });
                    });
                });
            });

            $scope.marketGamesAreLoading = false;

            if ($scope.openGame) {
                $location.search('type', $scope.openGame.type === 1 ? 1 : 0);
                $location.search('sport', $scope.openGame.sport.id);
                $location.search('competition', $scope.openGame.competition.id);
                $location.search('region', $scope.openGame.region.id);
                $location.search('game', $scope.openGame.id);

                $scope.openGame.markets = Utils.objectToArray(Utils.groupByItemProperties($scope.openGame.market, ['type', 'name']));

                if ($scope.openGame.markets) {
                    $scope.openGame.markets.sort(function (a, b) {
                        return a[0].order - b[0].order;
                    });
                    angular.forEach($scope.openGame.markets, function (groupedMarkets) {
                        //groupedMarkets[0].name = $filter('improveName')(groupedMarkets[0].name, $scope.openGame);
                        groupedMarkets.events = groupedMarkets.event ? Utils.objectToArray(groupedMarkets.event) : '';
                        if(groupedMarkets[0].type) {
                            groupedMarkets[0].fullType = (groupedMarkets[0].type || '') + (groupedMarkets[0].period || '');
                        }
                    });
                }

                var selectedGroupId = $scope.openGame.selectedMarketGroupId !== undefined ? $scope.openGame.selectedMarketGroupId : $scope.openGame.availableMarketGroups[0].id;
                $scope.selectMarketsGroup(selectedGroupId, true);
            }
        }

        $scope.selectMarketsGroup = function selectMarketsGroup(groupId, forceUpdate) {
            if (!forceUpdate && $scope.openGame.selectedMarketGroupId === groupId) {
                return;
            }
            $scope.selectedMarketsGroup = [];
            $scope.openGame.selectedMarketGroupId = groupId;

            if (groupId=== MARKET_GROUP_ALL.id) {
                $scope.selectedMarketsGroup = $scope.openGame.markets;
            } else {
                var i, subArr, length = $scope.openGame.markets.length;
                for (i = 0; i < length; ++i) {
                    subArr = $scope.openGame.markets[i].filter(function(market) {
                        return market.group_id === groupId;
                    });
                    if (subArr.length) {
                        $scope.selectedMarketsGroup.push(subArr);
                    }
                }
            }
        };

        $scope.goBackFromOpenGame = function goBackFromOpenGame() {
            $scope.openMarket({key: $scope.previouslyOpenedMarketKey}, null, null, true);
            $scope.previouslyOpenedMarketKey = null;
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
                    $scope.openGame.video_data = undefined;
                    if(Config.main.video.autoPlay) {
                        GameInfo.getVideoData($scope.openGame);
                    }
                }
                $scope.isVideoDetached = false;
                $scope.openGame.activeFieldType = 'video'; //
            }
        };

        /**
         * @ngdoc method
         * @name toggleVideoAndAnimationBox
         * @methodOf vbet5.controller:asianViewMainController
         * @description  name says it all
         */
        $scope.toggleVideoAndAnimationBox = function toggleVideoAndAnimationBox() {
            $scope.hideVideoAndAnimationBox = !$scope.hideVideoAndAnimationBox;
        };

        /**
         * @ngdoc method
         * @name loadAllEvents
         * @methodOf vbet5.controller:asianViewMainController
         * @description load all events when more is clicked
         */
        $scope.loadAllEvents = function loadAllEvents(gameId, sportId) {
            if (gamesSubId) {
                connectionService.unsubscribe(gamesSubId);
                gamesSubId = null;
            }
            if (Object.keys(expandedHdpGamesSubIds).length !== 0) {
                connectionService.unsubscribe(expandedHdpGamesSubIds);
            }

            $scope.marketGamesAreLoading = true;
            $scope.resetCountDown(true);

            $scope.activeGameId = gameId;
            if ($scope.selectedMarket.key !== "FULLGAME") {
                $scope.previouslyOpenedMarketKey = $scope.selectedMarket.key;
            }
            $scope.selectedMarket = {key: 'FULLGAME'};
            $scope.$broadcast('$$rebind::selectedMarket-change');

            var request = {
                'source': 'betting',
                'what': {
                    sport: ['id', 'name', 'alias'],
                    competition: ['name', 'order', 'id'],
                    region: ['name', 'alias', 'id'],
                    game: [],
                    market: [],
                    event: []
                },
                'where': {
                    'game': {'id': +gameId}
                }
            };
            if(sportId) {
                request.where.sport =  {'id': sportId};
            } /*else if ($scope.selectedSport.id !== ALL_COMPETITIONS.id) {
                request.where.sport =  {'id': $scope.selectedSport.id};
            }*/
            connectionService.subscribe(
                request,
                updateOpenGame,
                {
                    'thenCallback': function (result) {
                        singleGameSubId = result.subid;
                        $scope.resetCountDown();
                    }
                }
            );
        };

        /**
         * @ngdoc method
         * @name loadGames
         * @methodOf vbet5.controller:asianViewMainController
         * @description
         */
        $scope.loadGames = function loadGames() {
            $scope.marketGamesAreLoading = true;
            $scope.resetCountDown(true);

            $scope.centerData = {};
            var showTypes = asianConf.markets && asianConf.markets[$scope.selectedSport.alias] && asianConf.markets[$scope.selectedSport.alias][$scope.selectedMarket.key] && asianConf.markets[$scope.selectedSport.alias][$scope.selectedMarket.key][$scope.selectedMenuType.active === 1 ? 'live' : 'prematch']
                || ($scope.asianMarkets.marketsBySport[$scope.selectedSport.alias] || $scope.asianMarkets.marketsBySport.Default)[$scope.selectedMarket.key];
            var request = {
                'source': 'betting',
                'what': {
                    sport: ['id', 'name', 'alias'],
                    competition: ['name', 'order', 'id'],
                    region: ['name', 'alias', 'id'],
                    game: ['id', 'team1_name', 'team2_name','team1_reg_name', 'team2_reg_name', 'info', 'start_ts', 'type', 'text_info', 'events_count', 'is_blocked', 'markets_count', 'stats', 'strong_team', 'is_neutral_venue', 'is_stat_available', 'tv_type', 'video_id', 'video_id2', 'video_id3', 'video_provider'],
                    market: ['base', 'id', 'name', 'order', 'sequence', 'show_type', 'display_key', 'display_sub_key', 'market_type', 'home_score', 'away_score', 'main_order'],
                    event: ['name', 'id', 'base', 'type', 'type_1', 'price', 'show_type']
                },
                'where': {
                    'market': {}
                }
            };
            Utils.setCustomSportAliasesFilter(request);

            if (Config.main.GmsPlatform && $scope.selectedMarket.key === 'HDP') {
                request.where.market['@or'] = [];
                for (var i = 0, length = showTypes.length; i < length; i++) {
                    var obj = {'display_key': showTypes[i]};
                    if (!AsianMarkets.ignoreMainOrderFor[showTypes[i]]) {
                        obj.main_order = {'@in': asianConf.optimalMarkets};
                        //obj.optimal=true;
                    }

                    if (obj.display_key !== 'ODD/EVEN' || asianConf.showOddEvenMarketsInOverview) {
                        request.where.market['@or'].push(obj);
                    }
                }
            } else {
                request.where.market[marketTypedistinction] = {'@in': showTypes};
            }

            setTimeFilter(request);
            request.where.competition = request.where.competition || {}; // ???


            if (($scope.selectedMenuType.active === LEFT_MENU.FUTURE) && $scope.filters.selectedDaysTimeIntervals && $scope.filters.selectedDaysTimeIntervals.length > 0) {
                if (request.where.game['@or']) {
                    var firstOr = request.where.game['@or'];
                    request.where.game['@and'] = [{'@or': firstOr}, {'@or': $scope.filters.selectedDaysTimeIntervals}];
                    delete request.where.game['@or'];
                } else {
                    request.where.game['@or'] = $scope.filters.selectedDaysTimeIntervals;
                }
            }
            if ($scope.selectedSport.id !== ALL_COMPETITIONS.id) {
                request.where.sport = {'id': $scope.selectedSport.id};
            }
            request.where.competition.id = {'@in': ($scope.competitionsList && $scope.competitionsList.length) ? $scope.competitionsList : ['-1']};

            connectionService.subscribe(
                request,
                updateGames,
                {
                    'thenCallback': function (result) {
                        if (result.subid) {
                            gamesSubId = result.subid;
                        }
                        $scope.marketGamesAreLoading = false;
                        $scope.resetCountDown();
                    }
                }
            );
        };

        /**
         * @ngdoc method
         * @name loadExtraMarkets
         * @methodOf vbet5.controller:asianViewMainController
         * @description subscribe to expanded games all hdp markets
         * @param game
         */
        function loadExtraMarkets(game) {
            game.extraMarketsLoading = true;

            var request = {
                'source': 'betting',
                'what': {
                    game: ['id', 'team1_name', 'team2_name', 'info', 'start_ts', 'type', 'text_info', 'events_count', 'is_blocked', 'markets_count', 'strong_team'],
                    market: ['base', 'id', 'name', 'order', 'sequence', 'show_type', 'display_key', 'display_sub_key', 'optimal', 'home_score', 'away_score', 'market_type'],
                    event: ['name', 'id', 'base', 'type', 'price', 'show_type', 'type_1']
                },
                'where': {
                    'sport': {'id': game.sport.id},
                    'game': {'id': game.id},
                    'market': {'main_order': {'@nin': asianConf.optimalMarkets}}   //'market': {'optimal': false}
                }
            };

            request.where.market[marketTypedistinction] = {'@in': [ "HANDICAP", "TOTALS"]};
            setTimeFilter(request);
            if (($scope.selectedMenuType.active === LEFT_MENU.FUTURE) && $scope.filters.selectedDaysTimeIntervals && $scope.filters.selectedDaysTimeIntervals.length > 0) {
                request.where.game['@or'] = $scope.filters.selectedDaysTimeIntervals;
            }

            function updateExpandedHdpGame(data) {
                var gameDetails = data.game;
                if (gameDetails && gameDetails[game.id]) {
                    gameDetails[game.id].sport = {'alias': game.sport.alias, name: game.sport.name, id: game.sport.id};
                    gameDetails[game.id].region = {
                        'alias': game.region.alias,
                        name: game.region.name,
                        id: game.region.id
                    };
                    gameDetails[game.id].competition = {name: game.competition.name, id: game.competition.id};
                    asianViewGmsBasaltChanger(gameDetails[game.id], AsianMarkets);

                    $scope.expandedHdpGames[game.id] = gameDetails[game.id];

                    if($scope.expandedHdpGames[game.id].markets[game.selectedSequence.subKey]) {
                        angular.forEach($scope.expandedHdpGames[game.id].markets[game.selectedSequence.subKey][game.selectedSequence.sequence], function(marketType) {
                            marketType.sort(function(a, b) {
                                return a.base - b.base;
                            });
                        });
                    }
                } else {

                }
                delete game.extraMarketsLoading;
                $rootScope.$broadcast('$$rebind::expandedHdpGames-change');
            }

            connectionService.subscribe(
                request,
                updateExpandedHdpGame,
                {
                    'thenCallback': function (result) {
                        if (result.subid) {
                            expandedHdpGamesSubIds[game.id] = result.subid;
                        }
                    }
                },
                true
            );
        }

        /**
         * @ngdoc method
         * @name toggleExtraMarkets
         * @methodOf vbet5.controller:asianViewMainController
         * @description show/hide handicap extra markets
         * @param game
         */
        $scope.toggleExtraMarkets = function toggleExtraMarkets(game) {
            game.expanded = !game.expanded;

            if (game.expanded) {
                loadExtraMarkets(game);
            } else {
                //unsubscribe from this game's extra markets
                connectionService.unsubscribe(expandedHdpGamesSubIds[game.id]);
                delete $scope.expandedHdpGames[game.id];
            }
        };


        /**
         * @ngdoc method
         * @name updateCompetitionsFilterData
         * @methodOf vbet5.controller:asianViewMainController
         * @description receives available competitions list from swarm and stroes in corresponding scope variable
         */
        function updateCompetitionsFilterData(data) {
            $scope.competitionsFilter = [];
            if (data.region) {
                angular.forEach(data.region, function (region) {
                    angular.forEach(region.competition, function (competition) {
                        competition.regionName = region.name;
                        if (!Config.main.GmsPlatform) {
                            competition.name = $filter('removeParts')(competition.name, [$scope.selectedSport.name]);
                            competition.name = $filter('removeParts')(competition.name, [region.name]);
                        }
                        $scope.competitionsFilter.push(competition);
                    });
                });
            }

            $scope.checkAll();
            $scope.updateCompetitionsFilter();
        }

        function fillCompetitionsList() {
            angular.forEach($scope.selectedCompetitionsModel, function (value, competition) {
                angular.forEach($scope.competitionsFilter, function (updatedCompetition) {
                    if (value && +competition === updatedCompetition.id) {
                        $scope.competitionsList.push(+competition);
                    }
                });
            });
        }

        /**
         * @ngdoc method
         * @name updateCompetitionsFilter
         * @methodOf vbet5.controller:asianViewMainController
         * @description updates competitions filter (when OK cis clicked)
         */
        $scope.updateCompetitionsFilter = function updateCompetitionsFilter() {
            $scope.competitionsList = [];

            if ($scope.selectedMenuType.active === LEFT_MENU.FUTURE && competitionFilterData && competitionFilterData[$scope.selectedSport.id]) {
                angular.forEach(competitionFilterData[$scope.selectedSport.id], function (value, competition) {
                    angular.forEach($scope.competitionsFilter, function (updatedCompetition) {
                        if (value && +competition === updatedCompetition.id) {
                            $scope.competitionsList.push(+competition);
                        }
                    });
                });
            } else {
                fillCompetitionsList();
            }
        };

        /**
         * @ngdoc method
         * @name saveFilterData
         * @methodOf vbet5.controller:asianViewMainController
         * @description receives filter data and save in Local Storage
         */
        $scope.saveFilterData = function saveFilterData() {
            if ($scope.selectedMenuType.active === LEFT_MENU.FUTURE) {
                if (storageFilterData[$scope.selectedSport.id]) {
                    Utils.MergeRecursive(storageFilterData[$scope.selectedSport.id], $scope.selectedCompetitionsModel);
                } else {
                    storageFilterData[$scope.selectedSport.id] = $scope.selectedCompetitionsModel;
                }
                Storage.set('storageFilterData', storageFilterData, asianConf.storageFilterData || 86400000);

                competitionFilterData = storageFilterData;

                $scope.competitionsList = [];
                $scope.selectedCompetitionsModel = competitionFilterData[$scope.selectedSport.id];

                fillCompetitionsList();

                var deferred = $q.defer();
                var dataFilterGameCounts = deferred.promise;
                loadDateFilterGameCounts($scope.selectedMarket, deferred);
                dataFilterGameCounts.then(function (data) {
                    updateDateFilters(data);
                    $scope.loadGames();
                });
            } else {
                $scope.competitionsList = [];
                angular.forEach($scope.selectedCompetitionsModel, function (value, competition) {
                    if (value) {
                        $scope.competitionsList.push(+competition);
                    }
                });
                $scope.loadGames();
            }
            $scope.showCompetitionsSelector = false;
        };

        /**
         * @ngdoc method
         * @name loadAvailableCompetitionsForSelectedMarket
         * @methodOf vbet5.controller:asianViewMainController
         * @description loads available competitions list for competitions filter
         */
        function loadAvailableCompetitionsForSelectedMarket(market, skipDateFilterReset) {
            $scope.selectedCompetitions = null;

            var showTypes = ($scope.asianMarkets.marketsBySport[$scope.selectedSport.alias] || $scope.asianMarkets.marketsBySport.Default)[$scope.selectedMarket.key];

            if (!asianConf.showOddEvenMarketsInOverview) {
                var oddEvenIndex = showTypes.indexOf('ODD/EVEN');
                oddEvenIndex > -1 && showTypes.splice(oddEvenIndex, 1);
            }

            var request = {
                'source': 'betting',
                'what': {
                    competition: [],
                    region: ['name']
                },
                'where': {
                    // 'sport': {'id': $scope.selectedSport.id},
                    'sport': {},
                    'market': {}
                }
            };
            if ($scope.selectedSport.id !== ALL_COMPETITIONS.id) {
                request.where.sport.id = $scope.selectedSport.id;
            }
            Utils.setCustomSportAliasesFilter(request);
            request.where.market[marketTypedistinction] = {'@in': showTypes};
            setTimeFilter(request);

            connectionService.subscribe(
                request,
                function (data) {
                    updateCompetitionsFilterData(data, true);
                },
                {
                    'thenCallback': function (result) {
                        if (result.subid) {
                            competitionsFilterSubId = result.subid;
                        }

                        if (result.data) {
                            updateCompetitionsFilterData(result.data);
                            if ($scope.selectedMenuType.active === LEFT_MENU.FUTURE && !skipDateFilterReset) {
                                var deferredCount = $q.defer();
                                var dataFilterGameCountPromise = deferredCount.promise;
                                loadDateFilterGameCounts(market, deferredCount);
                                dataFilterGameCountPromise.then(function (data) {
                                    updateDateFilters(data);
                                    $scope.loadGames();
                                });
                            } else {
                                $scope.loadGames();
                            }
                        }
                    }
                }
            );
        }

        function updateMarketGameCounts(data, sportAlias, marketsGroup) {
            $scope.marketGameCounts[sportAlias] = $scope.marketGameCounts[sportAlias] || {};
            $scope.marketGameCounts[sportAlias][marketsGroup] = data.game;
        }

        function loadSportMarketGameCounts(sport, showTypes, marketsGroup) {
            var request = {
                'source': 'betting',
                'what': {
                    'game': '@count'
                },
                where: {
                    "sport": {id: sport.id},
                    "market": {}
                }
            };
            request.where.market[marketTypedistinction] = {'@in': showTypes};
            setTimeFilter(request);

            connectionService.subscribe(
                request,
                function (data) {
                    updateMarketGameCounts(data, sport.alias, marketsGroup);
                },
                {
                    'thenCallback': function (result) {
                        if (result.subid) {
                            gameCountSubscriptions[result.subid] = result.subid;
                        }
                    }
                },
                true
            );
        }

        function loadDateFilterGameCounts(market, deferred) {
            var selectedMarket = market || $scope.selectedMarket;
            $scope.dateFilterGameCount = [];
            $scope.dateFilterDaysCount = 0;
            var showTypes = ($scope.asianMarkets.marketsBySport[$scope.selectedSport.alias] || $scope.asianMarkets.marketsBySport.Default)[selectedMarket.key];
            if ($scope.selectedSport.id) {
                var i, request, callsProcessed = 0;
                for (i = 0; i < 8; i++) {
                    request = {
                        'source': 'betting',
                        'what': {'game': '@count'},
                        'where': {
                            'sport': {'id': $scope.selectedSport.id},
                            'game': {
                                'start_ts': {
                                    '@gte': i === 7 ? $scope.dayFilter[6].to : $scope.dayFilter[i].from,
                                    '@lt': i === 7 ? '' : $scope.dayFilter[i].to
                                }
                            },
                            'market': {},
                            'competition': ($scope.competitionsList && $scope.competitionsList.length) ? {'id': {'@in': $scope.competitionsList}} : {'id': {'@in': ['-1']}}
                        }
                    };
                    request.where.game['@or'] = [{'type': {'@in': [0, 2]}}];
                    if (Config.main.enableVisibleInPrematchGames) {
                        request.where.game['@or'].push({
                            'visible_in_prematch': 1
                        });
                    }

                    request.where.market[marketTypedistinction] = {'@in': showTypes};
                    (function () {
                        var iParent = i;

                        Zergling.get(request).then(function (result) {

                            console.log('DAY DATA RECEIVED', iParent , result.data);

                            $scope.dateFilterGameCount[iParent] = result.data;
                            callsProcessed++;
                            if (callsProcessed > 7) {
                                deferred.resolve($scope.dateFilterGameCount);
                            }
                            $scope.dateFilterDaysCount = dayCounter();
                        })['catch'](function (reason) {
                        });

                    } ());

                }
            }
        }

        function closeOpenGame() {
            $scope.openGame = null;
            $scope.activeGameId = null;
            if (singleGameSubId) {
                connectionService.unsubscribe(singleGameSubId);
                singleGameSubId = null;
            }
        }

        $scope.openSport = function openSport(sport, market, initial) {
            $window.scrollTo(0, 0);
            checkOneTime = true;
            $scope.collapedCompetitions = {};
            $location.search('sport', sport.id);
            if(!initial) {
                $location.search('competition', undefined);
                $location.search('region', undefined);
                $location.search('game', undefined);
            }

            var gameIsOpenned = initial && $location.search().game;
            if(!gameIsOpenned) {
                closeOpenGame();
            }

            if ($scope.selectedSport && $scope.selectedSport.id === sport.id && !initial) {
                $scope.selectedSport.closedTab = !$scope.selectedSport.closedTab;
                if (market && $scope.previouslyOpenedMarketKey) {
                    $scope.openMarket(market);
                    $scope.previouslyOpenedMarketKey = null;
                }
                return;
            }

            $scope.selectedSport = sport;

            if (sport.groupId) {
                $scope.leftMenuState[$scope.selectedMenuType.active][sport.groupId] = true;
            }

            connectionService.unsubscribe(gameCountSubscriptions)['finally'](function () {
                if ($scope.selectedMenuType.active !== LEFT_MENU.LIVE) {
                    angular.forEach(AsianMarkets.marketsBySport[sport.alias] || AsianMarkets.marketsBySport.Default, function (markets, marketsGroup) {
                        loadSportMarketGameCounts(sport, markets, marketsGroup);
                    });
                }

                if (gameIsOpenned) {
                    $scope.loadAllEvents($location.search().game);
                }
            });

            if (market) {
                $scope.openMarket(market, null, gameIsOpenned);
            }
        };

        /**
         * @ngdoc method
         * @name openMarket
         * @methodOf vbet5.controller:asianViewMainController
         * @description selects sport market and loads right side view for it
         */
        $scope.openMarket = function openMarket(market, sport, gameIsOpenned, skipDateFilterReset) {

            if(!gameIsOpenned) {
                $location.search('competition', undefined);
                $location.search('region', undefined);
                $location.search('game', undefined);
            }

            if(Object.keys(expandedHdpGamesSubIds).length !== 0) {
                connectionService.unsubscribe(expandedHdpGamesSubIds);
            }

            resetCompetitionData();

            if (sport && sport.id === $scope.selectedSport.id && $scope.selectedMenuType &&
                LEFT_MENU.LIVE !== $scope.selectedMenuType.active && $scope.selectedMarket && $scope.selectedMarket.key === market.key) {
                return;
            }
            if(!gameIsOpenned) {
                closeOpenGame();
            }

            $scope.marketGamesAreLoading = true;
            $scope.selectedCompetitionsModel = {};
            $scope.selectedMarket = market;
            $scope.$broadcast('$$rebind::selectedMarket-change');
            if (market.key === 'HDP') {
                // var sport = AsianMarkets.marketsBySport[$scope.selectedSport.alias] || AsianMarkets.marketsBySport.Default;
                $scope.pointsTypeForMarket = 'TOTALS';
            }
            var storageFilteredData = Storage.get('storageFilterData') || {};
            if ($scope.selectedMenuType.active === LEFT_MENU.FUTURE && storageFilteredData && storageFilteredData[$scope.selectedSport.id]) {
                $scope.competitionsList = [];
                competitionFilterData = storageFilteredData;
                $scope.selectedCompetitionsModel = competitionFilterData[$scope.selectedSport.id];

                fillCompetitionsList();
            } else {
                $scope.selectedCompetitionsModel = {};
                competitionFilterData = {};
                $scope.competitionsList = [];
            }
            !gameIsOpenned && loadAvailableCompetitionsForSelectedMarket(market, skipDateFilterReset);
        };

        function loadLeftMenu() {
            unsubscribe(leftMenuSubId);
            $scope.leftMenuIsLoading = true;

            GameInfo.getSportGroups().then(function () {
                var request = {
                    'source': 'betting',
                    'what': {
                        'sport': ['id', 'name', 'alias', 'order'],
                        'game': '@count'
                    },
                    where: {
                        "market": {}
                    }
                };
                request.where.market[marketTypedistinction] = {'@gt': ""};

                setTimeFilter(request);

                Utils.setCustomSportAliasesFilter(request);

                connectionService.subscribe(
                    request,
                    updateLeftMenu,
                    {
                        'thenCallback': function (result) {
                            if (result.subid) {
                                leftMenuSubId = result.subid;
                            }

                            if (result.data) {
                                var sport = $location.search().sport && Utils.getArrayObjectElementHavingFieldValue(leftMenuSports, 'id', +$location.search().sport);
                                if (sport) {
                                    $scope.openSport(sport, {key: 'HDP'}, true);
                                } else {
                                    $location.search('competition', undefined);
                                    $location.search('region', undefined);
                                    $location.search('game', undefined);

                                    if ($scope.sportsGroup && $scope.sportsGroup.length > 0 && $scope.sportsGroup[0].sports && $scope.sportsGroup[0].sports.length > 0) {
                                        $scope.openSport($scope.sportsGroup[0].sports[0], {key: 'HDP'}, true);
                                    }
                                }
                            }

                            $scope.leftMenuIsLoading = false;
                        }
                    }
                );
            });
        }


        $scope.$watch('env.authorized', function (newValue, oldValue) {
            if (newValue !== oldValue) {
                storageFilterData = Storage.get('storageFilterData') || {};
                if (leftMenuSports) {
                    var sport = $location.search().sport && Utils.getArrayObjectElementHavingFieldValue(leftMenuSports,'id', +$location.search().sport);
                    if(sport) {
                        $scope.openSport(sport, {key: 'HDP'}, true);
                    } else {
                        $scope.openSport(leftMenuSports[0], {key: 'HDP'}, true);
                    }
                }
            }
        });

        function createDayNames() {
            var i;
            for (i = 0; i < 7; i++) {
                $scope.dayFilter.push({
                    to: Moment.get().add(i, 'days').endOf("day").unix(),
                    from: Moment.get().add(i, 'days').startOf("day").unix(),
                    id: i,
                    name: Moment.get().add(i, 'days').startOf("day").format("ddd D")
                });
            }
        }

        function updateDateFilters(data) {
            $scope.filters.selectedDays = $scope.filters.selectedDays || [];
            $scope.filters.allDays.selected = false;

            var i, days = [], gameCount = 0, defaultDays = [];
            for (i = 0; i < 7; ++i) {
                if (data[i]) {
                    if (data[i].game !== 0) {
                        if (asianConf.daysToSelectByDefault.indexOf(i) !== -1) {
                            defaultDays.push(i);
                        }

                        if (!defaultDays.length && i > asianConf.daysToSelectByDefault[asianConf.daysToSelectByDefault.length - 1]) {
                            defaultDays = [i];
                        }

                        if ($scope.filters.selectedDays[i]) {
                            gameCount += data[i].game;
                            days.push({
                                'start_ts': {
                                    '@gte': $scope.dayFilter[i].from,
                                    '@lt': $scope.dayFilter[i].to
                                }
                            });
                        }
                    } else {
                        $scope.filters.selectedDays[i] = false;
                    }
                }
            }
            if (!days.length) {
                if (defaultDays.length) {
                    for (i = 0; i < defaultDays.length; ++i) {
                        days.push({
                            'start_ts': {
                                '@gte': $scope.dayFilter[defaultDays[i]].from,
                                '@lt': $scope.dayFilter[defaultDays[i]].to
                            }
                        });
                        gameCount += data[defaultDays[i]].game;
                        $scope.filters.selectedDays[defaultDays[i]] = true;
                    }
                    $scope.filters.selectedDaysTimeIntervals =  days;
                    $scope.filterName = defaultDays.length > 1 ? "..." : $scope.dayFilter[defaultDays[0]].name;
                    $scope.filterCount = gameCount;
                } else {
                    $scope.filters.selectedDaysTimeIntervals = [{'start_ts': {'@gte': $scope.dayFilter[6].to}}];
                    $scope.filterName = Translator.get("Future Dates");
                    $scope.filterCount = data[7].game;
                    $scope.filters.allDays.selected = true;
                }
            } else {
                $scope.filters.selectedDaysTimeIntervals =  days;
                $scope.filterCount = gameCount;
            }
        }

        /**
         * Initialize controller
         */
        function init() {
            if ($location.search().menuType !== undefined) {
                $scope.selectedMenuType.active = parseInt($location.search().menuType, 10);
            } else if ($location.search().type !== undefined) {
                $scope.selectedMenuType.active = parseInt($location.search().type, 10);
            } else if (asianConf.asianLeftMenuDefaultType) {
                $scope.selectedMenuType.active = asianConf.asianLeftMenuDefaultType; //LEFT_MENU.TODAY value
            } else {
                $scope.selectedMenuType.active = Config.env.live ? LEFT_MENU.LIVE : LEFT_MENU.FUTURE;
            }
            createDayNames();
            loadLeftMenu();
            subscribeToLiveGameCounts();

            if (Config.main.availableAsianViewThemes.length > 1) {
                angular.forEach(Config.main.availableAsianViewThemes, function (theme) {
                    if (theme.name === $scope.themeSelector.name) {
                        $scope.loadTheme(theme);
                    }
                });
            }
        }

        /**
         * Initialize controller
         */
        function dayCounter() {
            var count = 0, i;
            for (i = 0; i < 8; i += 1) {
                if ($scope.dateFilterGameCount && $scope.dateFilterGameCount[i] && $scope.dateFilterGameCount[i].game != 0) {
                    count += 1;
                }
            }

            return count;
        }

        /**
         * Handle date filter OK button
         */
        $scope.dateFilterConfirm = function dateFilterConfirm() {
            resetCompetitionData();
            $scope.loadGames();
        };

        /**
         * Handle allDay checkbox
         */
        $scope.toggleAllDays = function toggleAllDays() {
            if (dayCounter() === 1) {
                return;
            }
            if ($scope.filters.allDays.selected) {
                $scope.filters.selectedDays = [];
                $scope.filters.selectedDaysTimeIntervals = [{'start_ts': {'@gte': $scope.dayFilter[6].to}}];
                $scope.filterName = Translator.get("Future Dates");
                $scope.filterCount = $scope.dateFilterGameCount[7].game;
            } else {
                var i;
                for (i = 0; i < 8; i += 1) {
                    if ($scope.dateFilterGameCount[i].game > 0) {
                        $scope.filters.selectedDaysTimeIntervals = [{
                            'start_ts': {
                                '@gte': $scope.dayFilter[i].from,
                                '@lt': $scope.dayFilter[i].to
                            }
                        }];
                        $scope.filters.selectedDays[i] = true;
                        $scope.filterName = $scope.dayFilter[i].name;
                        $scope.filterCount = $scope.dateFilterGameCount[i].game;
                        break;
                    }
                }
            }
        };

        /**
         * Handle day checkboxes select then load games
         */
        $scope.toggleDay = function toggleDay() {
            $scope.filterCount = 0;
            if (dayCounter() === 1) {
                return;
            }
            var days = [], count = 0, name = '';

            if ($scope.filters.allDays.selected) {
                $scope.filters.allDays.selected = false;
            }

            angular.forEach($scope.dayFilter, function (selected, id) {
                if ($scope.filters.selectedDays[id]) {
                    name = $scope.dayFilter[id].name;
                    $scope.filterCount += $scope.dateFilterGameCount[id].game;
                    count++;
                    if ($scope.filters.selectedDays[id - 1]) {
                        days[days.length - 1] = {'@gte': days[days.length - 1]['@gte'], '@lt': $scope.dayFilter[id].to};
                    } else {
                        days.push({'@gte': $scope.dayFilter[id].from, '@lt': $scope.dayFilter[id].to});
                    }
                }
            });

            $scope.filters.selectedDaysTimeIntervals = days.length === 0 ? [{'start_ts': {'@gte': $scope.dayFilter[6].to}}] : days.map(function (element) {
                return {'start_ts': element};
            });
            if (count !== 0) {
                $scope.filterName = count === 1 ? name : "...";
            } else {
                $scope.filterName = Translator.get("Future Dates");
                $scope.filterCount = $scope.dateFilterGameCount[7].game;
                $scope.filters.allDays.selected = true;
            }
        };

        $scope.changeSortOrder = function changeSortOrder() {
            $scope.sortAscending = !$scope.sortAscending;
            $scope.orderByTime();
        };

        /**
         * @ngdoc method
         * @name sortByDate
         * @methodOf vbet5.controller:sortByDate
         * @description Order games by time
         */
        var doOrderByTime =function (centerData) {
            if (!$scope.orderedByTime) {
                $scope.centerData = lastCenterData;
                angular.forEach($scope.centerData.competitions, function (value, key) {
                    $scope.centerData.competitions[key].sort($scope.sortAscending ? Utils.orderSorting : Utils.orderSortingReverse);
                    $scope.$broadcast('$$rebind::competitions-change');
                });

                calculatePages($scope.centerData);
                return;
            }
            $scope.centerData = $scope.centerData || {};
            var orderedGroupedGames = [];
            var dataToOrder = (centerData && centerData.competitions) || $scope.centerData.competitions;
            angular.forEach(dataToOrder, function (competitions, sportId) {
                orderedGroupedGames[sportId] =  orderedGroupedGames[sportId] || [];
                angular.forEach(competitions, function (competition, key) {
                    orderedGroupedGames[sportId] = orderedGroupedGames[sportId].concat(competition.games);
                });
            });

            var compareFn = $scope.sortAscending ? function (a, b) {
                if (a.start_ts === b.start_ts) {
                    return a.id - b.id;
                }
                return a.start_ts - b.start_ts;
            } : function (a, b) {
                return b.start_ts - a.start_ts;
            };
            angular.forEach(orderedGroupedGames, function (orderedGames, key) {
                orderedGroupedGames[key].sort(compareFn);
            });
            $scope.centerData.competitions = [];
            angular.forEach(orderedGroupedGames, function (orderedGames, key) {
                var i, length = orderedGames.length;
                var orderedCompetitions = [];
                for (i = 0; i < length; i++) {
                    if (!orderedCompetitions.length || orderedCompetitions[orderedCompetitions.length - 1].id !== orderedGames[i].competition.id) {
                        orderedCompetitions.push({
                            name: orderedGames[i].competition.name,
                            id: orderedGames[i].competition.id,
                            games: []
                        });
                    }
                    orderedCompetitions[orderedCompetitions.length - 1].games.push(orderedGames[i]);
                }
                $scope.centerData.competitions[key] = orderedCompetitions;
            });
            calculatePages($scope.centerData);
            $scope.$broadcast('$$rebind::competitions-change');

        };

        /**
         * @ngdoc method
         * @name orderByTime
         * @methodOf vbet5.controller:orderByTime
         * @description the function used only in template; it calls function in the local scope with some delay
         */
        $scope.orderByTime = function orderByTime(param) {
            $scope.filterLoading = true;
            TimeoutWrapper(function () {
                doOrderByTime(param);
                $scope.$broadcast('$$rebind::competitions-change');
                $scope.filterLoading = false;
            }, 100);
        };

        /**
         * @ngdoc method
         * @name checkAll
         * @methodOf vbet5.controller:asianViewMainController
         * @description Marks all checkboxes if checkAll button is checked and unmarks them if checkAll is not checked
         */
        $scope.checkAll = function checkAll(force) {
            if (!force && $scope.selectedMenuType.active === LEFT_MENU.FUTURE && competitionFilterData && competitionFilterData[$scope.selectedSport.id]) {
                $scope.selectedAll = false;
                $scope.selectedCompetitionsModel = competitionFilterData[$scope.selectedSport.id];
            } else if (force) {
                if ($scope.selectedAll) {
                    angular.forEach($scope.competitionsFilter, function (competition) {
                        $scope.selectedCompetitionsModel[competition.id] = true;
                    });
                    storageFilterData[$scope.selectedSport.id] = $scope.selectedCompetitionsModel;
                } else {
                    angular.forEach($scope.competitionsFilter, function (competition) {
                        angular.forEach($scope.selectedCompetitionsModel, function (competitionModel, modelId) {
                            if (competition.id === +modelId) {
                                $scope.selectedCompetitionsModel[modelId] = false;
                            }
                        });
                    });
                storageFilterData[$scope.selectedSport.id] = $scope.selectedCompetitionsModel;
            }
        } else {
            angular.forEach($scope.competitionsFilter, function (competition) {
                if ($scope.selectedCompetitionsModel[competition.id] === undefined) {
                        $scope.selectedCompetitionsModel[competition.id] = true;
                }
            });
        }
            $scope.allowFiltering();
        };

        /**
         *@ngdoc method
         * @name cancelCompetitionsSelector
         * @methodOf vbet5.controller:asianViewMainController
         * @description Revert temporary changes
         */
        $scope.cancelCompetitionsSelector = function cancelCompetitionsSelector() {
            $scope.showCompetitionsSelector = false;
            $scope.selectedCompetitionsModel = {};
            angular.forEach($scope.competitionsList, function (competition) {
                $scope.selectedCompetitionsModel[competition] = true;
            });
            $scope.selectedAll = ($scope.competitionsList.length === $scope.competitionsFilter.length);
        };

        /**
         * @ngdoc method
         * @name allCompatitionsCheck
         * @methodOf vbet5.controller:asianViewMainController
         * @description Checks if one of the checkboxes is not marked removes the mark from checkAll button as well
         * @param state:{boolean} the state of the clicked element
         */
        $scope.allCompatitionsCheck = function allCompatitionsCheck(state) {
            $scope.allowFiltering();
            if (!state) {
                $scope.selectedAll = state;
            }
        };

        /**
         * @ngdoc method
         * @name allowFiltering
         * @methodOf vbet5.controller:asianViewMainController
         * @description Checks whether at list one competition is chosen to allow the filtering
         * @returns {boolean}
         */
        $scope.allowFiltering = function allowFiltering() {
            var i = 0;
            if (!Object.keys($scope.selectedCompetitionsModel).length) {
                $scope.enableFiltering = false;
                return;
            }
            $scope.enableFiltering = false;
            angular.forEach($scope.competitionsFilter, function (competition) {
                angular.forEach($scope.selectedCompetitionsModel, function (competitionModel, modelId) {
                    if (competition.id === +modelId && competitionModel) {
                        i++;
                        $scope.enableFiltering = true;
                    }
                });
            });
            if ($scope.competitionsFilter.length === i && i > 0) {
                $scope.selectedAll = true;
            }
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
                if (basePrice === nonBasePrice && marketType === 'Home') return '';
                if (basePrice > nonBasePrice)  return '';
            }

            return $filter('handicapBaseFormat')(recalculatedBase, undefined, true, true);
        };

        /**
         * @ngdoc method
         * @name fixDisplayTime
         * @methodOf vbet5.controller:asianViewMainController
         * @description removes reduntant text from game time info
         * @param {String} gameTime
         */
        $scope.fixDisplayTime = function fixDisplayTime(gameTime) {
            if (!gameTime) {
                return;
            }
            return gameTime.split(' ').length === 2 ? gameTime.split(' ')[1] : gameTime.split(' ')[0];
        };

        /**
         * @ngdoc method
         * @name fixSportTabScroll
         * @methodOf vbet5.controller:asianViewMainController
         * @description clear fixed element classes
         */
        $scope.fixSportTabScroll = function fixSportTabScroll() {
            $scope.$broadcast('forceElementRefresh');
        };

        /**
         * @ngdoc method
         * @name loadTheme
         * @methodOf vbet5.controller:asianViewMainController
         * @description load theme
         * @param {Object} theme time
         */
        $scope.loadTheme = function loadTheme(theme) {
            Storage.set('asianTheme', theme.name);
            $scope.themeSelector.name = theme.name;
            $scope.themeSelector.show = false;
            DomHelper.clearCss('asian');
            if (theme.css) {
                var css = DomHelper.addCss(theme.css, null, null, 'asian');
                $scope.isCssLoading = true;
                css.onload = function () {
                    $scope.isCssLoading = false;
                    $scope.$apply();
                };
            }
            Utils.setBodyClass(theme.class, 'asian');
        };

        $scope.toggleGameFavorite = function toggleGameFavorite(game) {
            if (!$rootScope.myGames || $rootScope.myGames.indexOf(game.id) === -1) {
                $scope.$emit('game.addToMyGames', game);
            } else {
                $scope.$emit('game.removeGameFromMyGames', game);
            }
        };

        $scope.selectFavoriteGame = function selectFavoriteGame(game) {
            if($scope.activeGameId !== game.id){
                $scope.loadAllEvents(game.id, game.sport.id);
            }
        };

        init();

        $scope.$on('sportsbook.handleDeepLinking', function () { //linking to games inside sportsbook
            TimeoutWrapper(function () {
                $route.reload(); // it must be implement withoud rote.reload. neet to handle deepLinking
            }, 100);
        });

        $scope.$on("asianView.selectFavorite", function(event, game) {
            $scope.selectFavoriteGame(game);
        });

        $scope.$on('changingSportsbookLayout', function () {
            $location.search('menuType', undefined);
        });

        $scope.$on('$destroy', function () {
            countDownPromise && $interval.cancel(countDownPromise);
        });
    }]);

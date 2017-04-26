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
angular.module('vbet5.betting').controller('classicViewCenterController', ['$rootScope', '$scope', '$filter', 'Config', 'ConnectionService', 'Utils', 'Storage', 'GameInfo', 'partner', 'TimeoutWrapper', '$location', function ($rootScope, $scope, $filter, Config, ConnectionService, Utils, Storage, GameInfo, partner, TimeoutWrapper, $location) {
    'use strict';
    $rootScope.footerMovable = true;
    TimeoutWrapper = TimeoutWrapper($scope);
    var connectionService = new ConnectionService($scope);

    var firstTimeLoaded = false;
    var openGameId;

    var MARKET_GROUP_ALL = {
        id: -2,
        name: 'All'
    };
    var MARKET_GROUP_OTHER = {
        id: -1,
        name: 'Other'
    };
    var MARKET_GROUP_FAVORITE = {
        id: -3,
        name: 'Favorite',
        count: 0
    };

    var hoveredLiveGameFullData;
    $scope.visibleSetsNumber = 5; // number of sets to be visible for multiset games

    $scope.eachWayPlace = GameInfo.eachWayPlace;
    $scope.framesCount = GameInfo.framesCount;
    $scope.isExtraTime = GameInfo.isExtraTime;
    $scope.getCurrentTime = GameInfo.getCurrentTime;
    $scope.showFrameAlias = GameInfo.showFrameAlias;
    $scope.displayBase = GameInfo.displayBase;
    $scope.isEventInBetSlip = GameInfo.isEventInBetSlip;
    $scope.displayEventLimit = GameInfo.displayEventLimit;
    $scope.cancelDisplayEventLimit = GameInfo.cancelDisplayEventLimit;
    $scope.GamesWithStatsBlock =  GameInfo.GamesWithStatsBlock;
    $scope.liveGamesSoccerTemplate = GameInfo.liveGamesSoccerTemplate;
    $scope.dotaGamesList = GameInfo.dotaGamesList;
    $scope.slideSets = GameInfo.slideSets;

    //make video available as soon as user logs in
    $scope.$on('loggedIn', checkVideoAvailability);     // restoring login case
    $scope.$on('login.loggedIn', checkVideoAvailability); //normal login case

    /**
     * @ngdoc method
     * @name checkVideoAvailability
     * @methodOf vbet5.controller:classicViewCenterController
     * @description Check video availability
     */
    function checkVideoAvailability() {
        if ($scope.openGame && Config.main.video.autoPlay) {
            if (!$scope.openGame.video_id && Config.main.defaultStreaming && Config.main.defaultStreaming.enabled) {
                $scope.openGame.tv_type = Config.main.defaultStreaming.tvType;
                $scope.openGame.video_data = Config.main.defaultStreaming.streamUrl;
                return;
            }
            if ($rootScope.profile) {
                GameInfo.getVideoData($scope.openGame);
            } else {
                var profilePromise = $rootScope.$watch('profile', function () {
                    if ($rootScope.profile) {
                        profilePromise();
                        GameInfo.getVideoData($scope.openGame);
                    }
                });
            }
        }
    }

    //and unavailable when he logs out
    $scope.$on('login.loggedOut', function () {
        if ($scope.openGame && $scope.openGame.video_data) {
            $scope.openGame.video_data = null;
        }
        if ($scope.pinnedGames) {
            $scope.pinnedGames = {};
        }
    });

    //synchronize video with user balance
    $scope.$watch('profile.balance', function (newValue, oldValue) {
        if ($scope.openGame && Config.main.video.autoPlay) {
            if (newValue === 0 && $rootScope.profile.initial_balance === 0) {
                $scope.openGame.video_data = null;
            } else if (oldValue === 0 && newValue > 0 && !$scope.openGame.video_data) {
                GameInfo.getVideoData($scope.openGame);
            }
        }
    });

    /**
     * @ngdoc method
     * @name restoreVideo
     * @methodOf vbet5.controller:classicViewCenterController
     * @description Restore video
     */
    $scope.restoreVideo = function restoreVideo(game) {
        if ($rootScope.conf.video) {
            $rootScope.conf.video.autoPlay = true;
        }
        var hasVideo = GameInfo.hasVideo(game);
        if (hasVideo) {
            GameInfo.getVideoData(game);
        } else if (Config.main.defaultStreaming && Config.main.defaultStreaming.enabled) {
            game.tv_type = Config.main.defaultStreaming.tvType;
            game.video_data = Config.main.defaultStreaming.streamUrl;
        }
    };

    /**
     * @ngdoc method
     * @name populateExpandedMarkets
     * @methodOf vbet5.controller:classicViewCenterController
     * @description
     *
     * @param {Object} marketsPack contains  markets
     * @param {Number} numberToExpand number of markets that should be expanded by default
     */
    var populateExpandedMarkets = function populateExpandedMarkets(marketsPack, numberToExpand) {
        var index = 1, key;
        if (numberToExpand !== 'all') {
            for (key in marketsPack) {
                if (index > numberToExpand) {
                    break;
                }
                if (marketsPack.hasOwnProperty(key)){
                    if (!$scope.expandedMarkets[$scope.openGame.id]) {
                        $scope.expandedMarkets[$scope.openGame.id] = [];
                        $scope.expandedMarkets[$scope.openGame.id].push(marketsPack[key][0].name);
                    } else if (Utils.isInArray($scope.expandedMarkets[$scope.openGame.id], marketsPack[key][0].name) === -1) {
                        $scope.expandedMarkets[$scope.openGame.id].push(marketsPack[key][0].name);
                    }
                    index++;

                }
            }
        }
    };

    /**
     * @ngdoc method
     * @name divideMarketsArray
     * @description  divinding the openGame.markets into two parts for making ng-repeat in two different columns
     * @methodOf vbet5.controller:classicViewCenterController
     * @param {Array} markets markets
     */
    function divideMarketsArray(markets) {
        if (!angular.isArray(markets)) {
            $scope.marketsFirstPack = $scope.marketsSecondPack = null;
            return;
        }
        var filteredMarkets;
        switch ($scope.openGame.selectedMarketGroupId) {
            case MARKET_GROUP_ALL.id:
                filteredMarkets = markets;
                break;
            case MARKET_GROUP_FAVORITE.id:
                filteredMarkets = $scope.openGame.sport.favouriteMarkets;
                break;
            default:
                filteredMarkets = markets.filter(function (market){
                    return $scope.openGame.selectedMarketGroupId === market[0].group_id || $scope.openGame.selectedMarketGroupId === market[0].second_group_id || (!market[0].group_id && !market[0].second_group_id && $scope.openGame.selectedMarketGroupId === MARKET_GROUP_OTHER);
                });

        }

        var halfLength = Math.ceil(filteredMarkets.length / 2);
        $scope.marketsFirstPack = filteredMarkets.filter(function (value, index) {
            return Config.main.classicMarkets2ColSorting ? !(index %2) : (index < halfLength);
        });
        $scope.marketsSecondPack = filteredMarkets.filter(function (value, index) {
            return Config.main.classicMarkets2ColSorting ? (index %2) : (index >= halfLength);
        });
        if (firstTimeLoaded && Config.main.numberOfExpandedMarkets) {
            populateExpandedMarkets($scope.marketsFirstPack, Config.main.numberOfExpandedMarkets);
        }
    }


    /**
     * @ngdoc method
     * @name selectMarketGroup
     * @description  sets selected market group and reorders markets according to it
     * @methodOf vbet5.controller:classicViewCenterController
     * @param {Number} groupId group id to select
     */
    $scope.selectMarketGroup = function selectMarketGroup(groupId) {
        console.log("selectMarketGroup", groupId);
        $scope.openGame.selectedMarketGroupId = groupId;
        divideMarketsArray($scope.openGame.markets);
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
        //console.log('updateOpenGame', data);
        if (Utils.isObjectEmpty(data.sport) && openGameId) {
            $rootScope.$broadcast('liveGame.gameRemoved', openGameId);
            $scope.openGameFinished = true;
            $rootScope.$broadcast('sportsbook.gameFinished');
        } else {
            $scope.openGameFinished = false;
        }
        var siteId = parseInt(Config.main.site_id, 10);
        angular.forEach(data.sport, function (sport) {
            angular.forEach(sport.region, function (region) {
                angular.forEach(region.competition, function (competition) {
                    angular.forEach(competition.game, function (game) {
                        var availableMarketGroups = {};
                        game.sport = {id: sport.id, alias: sport.alias, name: sport.name};
                        game.region = {id: region.id, alias: region.alias};
                        game.competition = {id: competition.id, name: competition.name};
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
                        if ($scope.openGame.type === 1) {
                            if($scope.openGame.info){
                                $scope.openGame.info.current_game_time = GameInfo.getCurrentTime($scope.openGame.info.current_game_time, $scope.openGame.info.current_game_state);
                            }
                            GameInfo.updateGameStatistics($scope.openGame);
                            GameInfo.extendLiveGame($scope.openGame);

                            if($scope.openGame.sport.alias === "Soccer" || $scope.openGame.sport.alias === "CyberFootball") {
                                GameInfo.generateTimeLineEvents($scope.openGame, $scope);
                                GameInfo.addOrderingDataToSoccerGameEvents($scope.openGame);
                            }
                        }
                        if ($scope.openGame.sport.alias === "HorseRacing") {
                            GameInfo.getHorseRaceInfo($scope.openGame.info, $scope.openGame.market, "Winner");
                        }

                        var hasVideo = GameInfo.hasVideo($scope.openGame);
                        if (hasVideo) {
                            if ($scope.openGame.video_data === undefined && Config.main.video.autoPlay) {
                                $scope.openGame.video_data = null; //not to call this several times before getVideoData fills the field
                                if ($scope.pinnedGames && !$scope.pinnedGames[$scope.openGame.id]) {
                                    GameInfo.getVideoData($scope.openGame);
                                    if ($scope.enlargedGame && $scope.enlargedGame.id !== $scope.openGame.id) {
                                        $scope.enlargedGame = !Config.main.detachedVideoSizes[$scope.openGame.tv_type] ? $scope.openGame : null;
                                    }
                                } else {
                                    $scope.openGame.activeFieldType = 'field';
                                }
                            }
                        } else if ($scope.openGame.type === 1 && Config.main.defaultStreaming && Config.main.defaultStreaming.enabled) {
                            $scope.openGame.tv_type = Config.main.defaultStreaming.tvType;
                            $scope.openGame.video_data = Config.main.defaultStreaming.streamUrl;
                            if ($scope.enlargedGame) {
                                $scope.enlargedGame = $scope.openGame;
                            }
                            hasVideo = true;
                        } else if($scope.enlargedGame) {
                            $scope.enlargedGame = null;
                        }

                        if ($scope.openGame.activeFieldType === undefined) {
                            $scope.openGame.activeFieldType = hasVideo && !$scope.enlargedGame && (Config.env.authorized || $rootScope.loginInProgress || !$scope.openGame.has_animation) ? 'video' : 'field';
                        }

                        GameInfo.updateOpenGameTextInfo($scope.openGame);

                        angular.forEach(game.market, function (market) {
                            if (!market.group_id && !market.second_group_id) {
                                market.group_id = MARKET_GROUP_OTHER.id;
                                market.group_name = MARKET_GROUP_OTHER.name;
                            }

                            if (game.is_cashout_disabled && game.is_cashout_disabled.length && game.is_cashout_disabled.indexOf(siteId) > -1) {
                                market.cashout = false;
                            }

                            if (availableMarketGroups[market.group_id]) {
                                availableMarketGroups[market.group_id].count++;
                            } else {
                                availableMarketGroups[market.group_id] = {name: market.group_name, id: market.group_id, count: 1};
                            }
                            if (market.second_group_id) {
                                if (availableMarketGroups[market.second_group_id]) {
                                    availableMarketGroups[market.second_group_id].count++;
                                } else {
                                    availableMarketGroups[market.second_group_id] = {name: market.second_group_name || market.name || market.group_name, id: market.second_group_id, count: 1};
                                }
                            }

                            angular.forEach(market.event, function (event) {
                                event.name = $filter('removeParts')(event.name, [market.name]);
                                if (Config.main.dontReplaceP1P2WithTeamNamesForEvents) {
                                    if (!Config.main.dontReplaceP1P2WithTeamNamesForEvents[market.type]) {
                                        event.name = $filter('improveName')(event.name, game);
                                    }
                                }
                                else if (Config.main.replaceP1P2WithTeamNames) {
                                    event.name = $filter('improveName')(event.name, game);
                                }
                            });
                            if(market.display_key === 'CORRECT SCORE') {
                                GameInfo.reorderCSMarketEvents(market);
                            } else {
                                market.events = Utils.objectToArray(market.event);
                                Utils.createDummyEvents(market);
                            }
                        });
                        availableMarketGroups = Utils.objectToArray(availableMarketGroups);
                        var additionalGroups = [MARKET_GROUP_FAVORITE, MARKET_GROUP_ALL];

                        game.availableMarketGroups = availableMarketGroups.length > 1 ? additionalGroups.concat(availableMarketGroups) : additionalGroups;

                        if (Config.main.sportMarketGroupsOrder) {
                            var index;
                            angular.forEach(game.availableMarketGroups, function (marketGroup) {
                                index = Config.main.sportMarketGroupsOrder.indexOf(marketGroup.id);
                                if (-1 !== index) {
                                    marketGroup.order = index;
                                } else {
                                    marketGroup.order = marketGroup.id;
                                }
                            });
                            game.availableMarketGroups.sort(Utils.orderSorting);
                        }

                        game.selectedMarketGroupId = game.selectedMarketGroupId || game.availableMarketGroups[1].id;

                    });
                });
            });
        });

        if ($scope.openGame) {
            $scope.openGame.markets = Utils.objectToArray(Utils.groupByItemProperties($scope.openGame.market, ['type', 'name']));

            if ($scope.openGame.markets) {
                $scope.openGame.markets.sort(function (a, b) {
                    return a[0].order - b[0].order;
                });
                angular.forEach($scope.openGame.markets, function (groupedMarkets) {
                    groupedMarkets[0].name = $filter('improveName')(groupedMarkets[0].name, $scope.openGame);
                    groupedMarkets.events = groupedMarkets.event ? Utils.objectToArray(groupedMarkets.event) : '';
                    if(groupedMarkets[0].type) {
                        groupedMarkets[0].fullType = (groupedMarkets[0].type || '') + (groupedMarkets[0].period || '');
                    }
                });
            }

            separateSpecialMarkets($scope.openGame.markets);
            angular.forEach($scope.specialMarkets, function(specialMarket) {
                if ($scope.selectedMarketTab[specialMarket[0].type] && $scope.selectedMarketTab[specialMarket[0].type].id) {
                    var noTabIsSelected = true;
                    specialMarket.forEach(function (item) {
                        if (item.id === $scope.selectedMarketTab[specialMarket[0].type].id) {
                            noTabIsSelected = false;
                        }
                    });
                    if (noTabIsSelected) {
                        $scope.selectedMarketTab[specialMarket[0].type].id = specialMarket[0].id;
                        $scope.selectedMarketTab[specialMarket[0].type].name = specialMarket[0].name;
                    }
                } else {
                    $scope.selectedMarketTab[specialMarket[0].type] = {};
                    $scope.selectedMarketTab[specialMarket[0].type].id = specialMarket[0].id;
                    $scope.selectedMarketTab[specialMarket[0].type].name = specialMarket[0].name;
                }
            });
            $scope.openGame.initialMarkets = Utils.clone($scope.openGame.markets);
            $scope.onlyFirstMarket = $scope.openGame.initialMarkets ? $scope.openGame.initialMarkets[0] : null;
            initFavouriteMarkets($scope.openGame);
            divideMarketsArray($scope.openGame.markets);
            console.log('open game', $scope.openGame);
        }
    };

    /**
     * @ngdoc method
     * @name separateSpecialMarkets
     * @description  moves special markets from openGame.markets into separate array, in order to show them on top of all markets
     * @methodOf vbet5.controller:classicViewCenterController
     * @param {Array} markets markets
     */
    function separateSpecialMarkets(markets) {
        if (!angular.isArray(markets)) {
            $scope.specialMarkets = null;
            return;
        }
        if (Config.main.specialMarkets && Config.main.specialMarkets.length) {
            var length = Config.main.specialMarkets.length;
            $scope.specialMarkets = markets.filter(function (value, index) {
                var i, found = false;
                for (i = 0; i < length; i++) {
                    if (value[0].type === Config.main.specialMarkets[i].type) {
                        value[0].tabsType = Config.main.specialMarkets[i].tabsType;
                        found = true;
                        break;
                    }
                }
                return found;
            });
            if ($scope.specialMarkets) {
                var j, index;
                var foundMarketsLength = $scope.specialMarkets.length;
                for (j = 0; j < foundMarketsLength; j++) {
                    index = markets.indexOf($scope.specialMarkets[j]);
                    markets.splice(index, 1);
                }
                //group only by type
                var ungroupedMarkets =  $scope.specialMarkets.selectMany(function (a) {return a; });
                $scope.specialMarkets = Utils.groupByItemProperty(ungroupedMarkets, 'type', '');
            }
        }
    }

    /**
     * @ngdoc method
     * @name openGameFullDetails
     * @methodOf vbet5.controller:classicViewCenterController
     * @description  expands(or collapses if expanded) region menu (loads and subscribes/unsibscribes to game)
     *
     * @param {Object} game game data object
     * @param {Boolean} fromCustomWidget if it from custom widget
     * @param {Object} competition competition data object
     */
    $scope.openGameFullDetails = function openGameFullDetails(game, competition, fromCustomWidget, fromLeftMenu) {
        if ($scope.selectedGame && $scope.selectedGame.id === game.id) {
            console.log("game already selected");
            return;
        }

        $scope.currentGameIsFinished = false;
        firstTimeLoaded = true;
        $scope.selectedMarketTab = {};
        openGameId = game.id;
        $scope.$broadcast('game.selected', openGameId);

        if (Config.main.customSportsBook.enabled && fromCustomWidget && !Config.main.customSportsBook.classic.showMarkets) {
            partner.handleGameClick(game, competition, $scope.selectedSport.id);
            return;
        }
        console.log('openGameFullDetails', game, competition);
        $scope.selectedGame = game;

        $scope.favoriteGameIsSelected = ($rootScope.myGames.indexOf(game.id) !== -1);
        $scope.favoriteGameFromLeftMenu = $scope.favoriteGameIsSelected && fromLeftMenu;

        if (competition) {
            $scope.selectedCompetition = competition;
        }

        $scope.openGameLoading = true;
        $scope.selectGame(game.id);

        if (Config.main.prefetchLeftMenuHoveredLivesGames.enabled
            && hoveredLiveGameFullData
            && hoveredLiveGameFullData.gameId === game.id
        ) {
            $scope.updateOpenGame(hoveredLiveGameFullData.gameData);
            $scope.openGameLoading = false;
        } else {
            var request =  {
                'source': 'betting',
                'what': {
                    'sport': ['id', 'name', 'alias'],
                    'competition': ['id', 'name'],
                    'region': ['id', 'alias'],
                    'game': [],
                    'market': [],
                    'event': []
                },
                'where': {'game': {'id': game.id}}
            };
            /*Utils.setCustomSportAliasesFilter(request);*/
            connectionService.subscribe(
                request,
                $scope.updateOpenGame,
                {
                    'thenCallback': function () {
                        $scope.openGameLoading = false;
                    },
                    'failureCallback': function () {
                        $scope.openGameLoading = false;
                    }
                },
                $location.path() === '/multiview/' ? true : false
            );
        }
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
        var currentMinute = game.info.currMinute || 0;
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
        $scope.isLiveGamePinned = !$scope.isLiveGamePinned;
        if ($scope.isLiveGamePinned && Config.env.hideLiveStats) {
            Config.env.hideLiveStats = false;
            $scope.showStatsBlock = !Config.env.hideLiveStats;
        }
        Storage.set('LiveGamePin', $scope.isLiveGamePinned);
    };

    if (Storage.get('LiveGamePin')) {
        $scope.isLiveGamePinned = Storage.get('LiveGamePin');
    }

    //initial values for ordering of horse_cards
    $scope.raceCardsPredicate = 'cloth';
    $scope.raceCardsReverce = false;

    /**
     * @ngdoc method
     * @name raceCardsColumnClick
     * @methodOf vbet5.controller:classicViewCenterController
     * @description changes data that  used for ordering raceCards elements
     *
     * @param {String} orderItem orderItem string: value of predicate
     */
    $scope.raceCardsColumnClick = function raceCardsColumnClick(orderItem) {
        if (orderItem === 'price' && !$scope.openGame.info.race.horseStats[0].event.price) {
            return;
        }
        if ($scope.raceCardsPredicate === orderItem) {
            $scope.raceCardsReverce = !$scope.raceCardsReverce;
        } else {
            $scope.raceCardsReverce = false;
            $scope.raceCardsPredicate = orderItem;
        }
    };

    /**
     * @ngdoc method
     * @name raceCardsOrder
     * @methodOf vbet5.controller:classicViewCenterController
     * @description to be used by the comparator to determine the order of  raceCards elements
     *
     * @param {Object} horseStat horseStat object
     */
    $scope.raceCardsOrder = function raceCardsOrder(horseStat) {
        switch ($scope.raceCardsPredicate) {
        case 'cloth':
            return parseInt(horseStat.cloth, 10);
        case 'price':
            return parseFloat(horseStat.event.price);
        }

        return -1;
    };

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
     * @name toggleGroupedMarket
     * @methodOf vbet5.controller:classicViewCenterController
     * @description expanding/collapsing grouped markets
     * @param {String} marketName grouped marketName
     */
    $scope.toggleGroupedMarket = function (marketName) {
        firstTimeLoaded = false;
        if ($scope.expandedMarkets[$scope.openGame.id] && Utils.isInArray($scope.expandedMarkets[$scope.openGame.id], marketName) > -1) {
            Utils.removeElementFromArray($scope.expandedMarkets[$scope.openGame.id], marketName);
        } else {
            if (!$scope.expandedMarkets[$scope.openGame.id]) {
                $scope.expandedMarkets[$scope.openGame.id] = [];
            }
            $scope.expandedMarkets[$scope.openGame.id].push(marketName);
        }
    };

    /**
     * @ngdoc method
     * @name isMarketClosed
     * @methodOf vbet5.controller:classicViewCenterController
     * @description Checks if the market is closed
     * @param {String} Market name
     */
    $scope.isMarketClosed = function isMarketClosed(marketName) {
        if ($scope.openGame) {
            var result = $scope.expandedMarkets[$scope.openGame.id] && Utils.isInArray($scope.expandedMarkets[$scope.openGame.id], marketName) !== -1;
            if (!Config.main.numberOfExpandedMarkets || Config.main.numberOfExpandedMarkets === 'all') {
                return result;
            }
            return !result;
        }
    };

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
     * @name addToFavouriteMarkets
     * @methodOf vbet5.controller:classicViewCenterController
     * @description Adds market to favorites list for sport
     * @param {Array} groupedMarkets array of market(s) of same type
     */
    $scope.addToFavouriteMarkets = function addToFavouriteMarkets(groupedMarkets) {
        var index = $scope.openGame.sport.favouriteMarkets.indexOf(groupedMarkets);
        if (index === -1) {
            $scope.openGame.sport.favouriteMarkets.push(groupedMarkets);
            $scope.openGame.sport.favouriteMarketsTypes.push(groupedMarkets[0].fullType);
        } else {
            $scope.openGame.sport.favouriteMarketsTypes.splice($scope.openGame.sport.favouriteMarketsTypes.indexOf(groupedMarkets[0].fullType), 1);
            $scope.openGame.sport.favouriteMarkets.splice(index, 1);

            if ($scope.openGame.selectedMarketGroupId === MARKET_GROUP_FAVORITE.id) {
                if (!$scope.openGame.sport.favouriteMarkets.length) {
                    $scope.openGame.selectedMarketGroupId = MARKET_GROUP_ALL.id;
                }

                divideMarketsArray($scope.openGame.markets);
            }
        }

        MARKET_GROUP_FAVORITE.count = $scope.openGame.sport.favouriteMarkets.length;

        var store = Storage.get('favouriteMarketsTypes') || {'0': {}, '1': {}, '2': {}};
        store[$scope.openGame.type] = store[$scope.openGame.type] || {}; // Should be deleted after some time: type 2 was added after implementing this functionality, so people who has favourite markets, will receive an error when adding market  with type=2
        store[$scope.openGame.type][$scope.openGame.sport.id] = $scope.openGame.sport.favouriteMarketsTypes;
        Storage.set('favouriteMarketsTypes', store);
    };

    /**
     * @ngdoc method
     * @name initFavouriteMarkets
     * @methodOf vbet5.controller:classicViewCenterController
     * @description Separates favorite markets and puts them in game's favouriteMarkets field
     * @param {Object} game current open game object
     */
    function initFavouriteMarkets(game) {
        if (0 === game.fullType) {
            return 0;
        }
        var store = Storage.get('favouriteMarketsTypes');
        game.sport.favouriteMarketsTypes = store && store[game.type] && store[game.type][game.sport.id] ? store[game.type][game.sport.id] : [];
        game.sport.favouriteMarkets = [];
        var market;
        if (game.sport.favouriteMarketsTypes.length && game.markets) {
            angular.forEach(game.sport.favouriteMarketsTypes, function (fullType) {
                market = $scope.getArrayObjectElementHavingFieldValue(game.markets, "fullType", fullType);
                if (market) {
                    game.sport.favouriteMarkets.push(market);
                }
            });
        }

        MARKET_GROUP_FAVORITE.count = $scope.openGame.sport.favouriteMarkets.length;
    }

    /**
     * @ngdoc method
     * @name getArrayObjectElementHavingFieldValue
     * @methodOf vbet5.controller:classicViewCenterController
     * @description Returns item with specefied field and value
     * @param {Object} Input array
     * @param {String} Field
     * @param {String} Value
     * Returns {Object} Matched item
     */
    $scope.getArrayObjectElementHavingFieldValue = function getArrayObjectElementHavingFieldValue (array, field, value) {
        var i;
        for (i = 0; i < array.length; i++) {
            if (array[i][0][field] === value) {
                return array[i];
            }
        }
        return null;
    };
}]);
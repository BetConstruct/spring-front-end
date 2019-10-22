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
angular.module('vbet5.betting').controller('classicViewCenterController', ['$rootScope', '$scope', '$filter', 'Config', 'ConnectionService', 'StreamService', 'Utils', 'Storage', 'GameInfo', 'partner', 'TimeoutWrapper', '$location', 'analytics', 'BetService', function ($rootScope, $scope, $filter, Config, ConnectionService, StreamService, Utils, Storage, GameInfo, partner, TimeoutWrapper, $location, analytics, BetService) {
    'use strict';
    $rootScope.footerMovable = true;
    TimeoutWrapper = TimeoutWrapper($scope);

    $scope.getVideoData = GameInfo.getVideoData;
    $scope.displayBase = GameInfo.displayBase;
    $scope.isEventInBetSlip = GameInfo.isEventInBetSlip;

    var connectionService = new ConnectionService($scope);
    var streamService = new StreamService($scope);

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
    $scope.isEventInBetSlip = GameInfo.isEventInBetSlip;
    $scope.GamesWithStatsBlock = GameInfo.GamesWithStatsBlock;

    /**
     * @ngdoc method
     * @name populateExpandedMarkets
     * @methodOf vbet5.controller:classicViewCenterController
     * @description
     *
     * @param {Object} marketsPack contains  markets
     * @param  numberToExpand number of markets that should be expanded by default
     */
    var populateExpandedMarkets = function populateExpandedMarkets(marketsPack, numberToExpand) {
        var index = 1, key;
            for (key in marketsPack) {
                if (marketsPack.hasOwnProperty(key)){
                    if(numberToExpand === 'all' || numberToExpand === undefined || index <= numberToExpand) {
                        if (!$scope.expandedMarkets[$scope.openGame.id]) {
                            $scope.expandedMarkets[$scope.openGame.id] = {};
                            $scope.expandedMarkets[$scope.openGame.id][marketsPack[key][0].name] = true;
                        } else  {
                            $scope.expandedMarkets[$scope.openGame.id][marketsPack[key][0].name] = true;
                        }
                    }else {
                        if (!$scope.expandedMarkets[$scope.openGame.id]) {
                            $scope.expandedMarkets[$scope.openGame.id] = {};
                            $scope.expandedMarkets[$scope.openGame.id][marketsPack[key][0].name] = false;
                        } else  {
                            $scope.expandedMarkets[$scope.openGame.id][marketsPack[key][0].name] = false;
                        }
                    }
                    index++;
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
                filteredMarkets = markets.filter(function (market) {
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
        if (firstTimeLoaded) {
            populateExpandedMarkets($scope.marketsFirstPack, Config.main.numberOfExpandedMarkets);
            var secondPackOpeningCount = (Config.main.numberOfExpandedMarkets !== 'all' && Config.main.numberOfExpandedMarkets !== undefined)?(Config.main.numberOfExpandedMarkets - $scope.marketsFirstPack.length): Config.main.numberOfExpandedMarkets;
            populateExpandedMarkets($scope.marketsSecondPack, secondPackOpeningCount);
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
        firstTimeLoaded = true;
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
        angular.forEach(data.sport, function (sport) {
            angular.forEach(sport.region, function (region) {
                angular.forEach(region.competition, function (competition) {
                    angular.forEach(competition.game, function (game) {
                        var availableMarketGroups = {};
                        game.sport = {id: sport.id, alias: sport.alias, name: sport.name};
                        game.region = {id: region.id, alias: region.alias, name: region.name};
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

                        streamService.monitoring($scope, 'openGame', 'pinnedGames', 'enlargedGame');

                        angular.forEach(game.market, function (market) {
                            if (!market.group_id && !market.second_group_id) {
                                market.group_id = MARKET_GROUP_OTHER.id;
                                market.group_name = MARKET_GROUP_OTHER.name;
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
                            if (market.display_key === 'CORRECT SCORE' && BetService.constants.customCorrectScoreLogic.indexOf($scope.openGame.sport.alias ) > -1) {
                                GameInfo.reorderMarketEvents(market, 'correctScore');
                            } else if (BetService.constants.marketsPreDividedByColumns.indexOf(market.market_type) > -1) {
                                GameInfo.reorderMarketEvents(market, 'preDivided');
                            } else {
                                market.events = Utils.objectToArray(market.event);
                                Utils.createDummyEvents(market);
                            }
                        });
                        availableMarketGroups = Utils.objectToArray(availableMarketGroups);
                        var additionalGroups = [MARKET_GROUP_FAVORITE, MARKET_GROUP_ALL];

                        game.availableMarketGroups = availableMarketGroups.length > 1 || (availableMarketGroups.length === 1 && availableMarketGroups[0].id !== MARKET_GROUP_OTHER.id) ? additionalGroups.concat(availableMarketGroups) : additionalGroups;

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
            var groupKey = ['market_type', 'name_template', 'sequence', 'point_sequence'];
            $scope.openGame.markets = Utils.objectToArray(Utils.groupByItemProperties($scope.openGame.market, groupKey));

            if ($scope.openGame.markets) {
               sortMarkets($scope.openGame.markets);

                angular.forEach($scope.openGame.markets, function (groupedMarkets) {
                    groupedMarkets[0].name = $filter('improveName')(groupedMarkets[0].name, $scope.openGame);
                    groupedMarkets.events = groupedMarkets.event ? Utils.objectToArray(groupedMarkets.event) : '';
                    groupedMarkets[0].cashout = groupedMarkets[0].cashout && !!($rootScope.env.live ? $rootScope.partnerConfig.is_cashout_live : $rootScope.partnerConfig.is_cashout_prematch);
                    groupedMarkets[0].eachWayTerms = BetService.getEachWayTerms(groupedMarkets[0]);
                    groupedMarkets[0].fullType = (groupedMarkets[0].market_type || groupedMarkets[0].type || '') + (groupedMarkets[0].period || groupedMarkets[0].sequence || '');
                    groupedMarkets[0].showStatsIcon = Config.main.enableH2HStat && $scope.openGame.is_stat_available && Config.main.marketStats[groupedMarkets[0].market_type];

                    if ($rootScope.conf.hideExpressIds || !groupedMarkets[0].hasOwnProperty('express_id')) {
                        groupedMarkets[0].express_id = undefined;
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
            $scope.specialMarkets = markets.filter(function (value) {
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
     * @param {Object} competition competition data objectD
     * @param {Boolean} fromLeftMenu from where come event
     * @param {Boolean} fully is responsible for covering the entire central part of the
     */
    $scope.openGameFullDetails = function openGameFullDetails(game, competition, fromCustomWidget, fromLeftMenu, fully) {
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

        $scope.favoriteGameIsSelected = fully || $rootScope.myGames.indexOf(game.id) !== -1;
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
                    'region': ['id', 'alias', 'name'],
                    'game': [],
                    'market': [],
                    'event': []
                },
                'where': {'game': {'id': game.id}}
            };

            game.sport && game.sport.id && (request.where.sport = {'id': game.sport.id});

            if (Config.main.customSportsBook.classic.showLive === false || Config.main.customSportsBook.classic.showLive === 0) {
                request.where.game.type = {'@in': [0, 2]};
            } else if (Config.main.customSportsBook.classic.showPrematch === false || Config.main.customSportsBook.classic.showPrematch === 0) {
                request.where.game.type = 1;
            }

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
                $location.path() === '/multiview/'
            );

            if (fully || game.type === 1) { //notify main to unsubscribe from previous subscriptions
                $scope.$emit('leftMenu.fullGmeSelected');
            }
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

    //initial values for ordering of horse_cards
    $scope.raceCardsPredicate = 'cloth';
    $scope.raceCardsReverce = false;
    $scope.raceCardsPredicateDog = 'order';

    /**
     * @ngdoc method
     * @name raceCardsColumnClick
     * @methodOf vbet5.controller:classicViewCenterController
     * @description changes data that  used for ordering raceCards elements
     *
     * @param {String} orderItem orderItem string: value of predicate
     */
    $scope.raceCardsColumnClick = function raceCardsColumnClick(orderItem) {
        if (orderItem === 'price'
           && $scope.openGame.info.race
           && !$scope.openGame.info.race.horseStats[0].event.price) {
            return;
        }
        if ($scope.raceCardsPredicate === orderItem || $scope.raceCardsPredicateDog === orderItem) {
            $scope.raceCardsReverce = !$scope.raceCardsReverce;
        } else {
            $scope.raceCardsReverce = false;
            $scope.raceCardsPredicate = orderItem;
            $scope.raceCardsPredicateDog = orderItem;
        }
    };

    /**
     * @ngdoc method
     * @name raceCardsOrder
     * @methodOf vbet5.controller:classicViewCenterController
     * @description to be used by the comparator to determine the order of  raceCards elements
     *
     * @param {Object} state object
     */
    $scope.raceCardsOrder = function raceCardsOrder(state) {
        switch ($scope.raceCardsPredicate) {
            case 'cloth':
                return parseInt(state.cloth, 10);
            case 'price':
                return parseFloat(state.event.price);
            case 'odds':
                return parseFloat(state.price);
            case 'order':
                return parseFloat(state.order);
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
     * @param {String} marketName grouped marketName
     */
    $scope.toggleGroupedMarket = function (marketName) {
        firstTimeLoaded = false;
        $scope.expandedMarkets[$scope.openGame.id][marketName] = !$scope.expandedMarkets[$scope.openGame.id][marketName];
    };



    /**
     * @ngdoc method
     * @name addToFavouriteMarkets
     * @methodOf vbet5.controller:classicViewCenterController
     * @description Adds market to favorites list for sport
     * @param {Array} groupedMarkets array of market(s) of same type
     */
    $scope.addToFavouriteMarkets = function addToFavouriteMarkets(groupedMarkets) {
        var analyticsText = "";
        var index = $scope.openGame.sport.favouriteMarketsTypes.indexOf(groupedMarkets[0].fullType);
        if (index === -1) {
            analyticsText = "addToFavouriteMarkets";
            $scope.openGame.sport.favouriteMarkets.push(groupedMarkets);
            $scope.openGame.sport.favouriteMarketsTypes.push(groupedMarkets[0].fullType);
        } else {
            analyticsText = "removeFromFavouriteMarkets";
            $scope.openGame.sport.favouriteMarketsTypes.splice(index, 1);
            $scope.openGame.sport.favouriteMarkets = $scope.openGame.sport.favouriteMarkets.filter(function(market) {
                return market[0].fullType !== groupedMarkets[0].fullType;
            });

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
        analytics.gaSend('send', 'event', 'explorer', analyticsText + (Config.main.sportsLayout),  {'page': $location.path(), 'eventLabel': analyticsText});
        console.log('gaSend-',analyticsText);
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
     * @param {Array} array
     * @param {String} field
     * @param {String} value
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

    // Unable to find nicer way to do this
    $scope.$on('sportsbook.updateStatsBlockState', function (e, data) {
        $scope.showStatsBlock = !!data;
    });

    /**
     * @ngdoc method
     * @name sortMarkets
     * @methodOf vbet5.controller:classicViewCenterController
     * @description Sort markets deeply with all levels
     * @param {Array} markets
     */
    function sortMarkets(markets) {
        markets.sort(function (a, b) {
            return a[0].order - b[0].order;
        });
        for (var i = markets.length; i--;) {
            markets[i].sort(Utils.orderSorting);
            for (var j = markets[i].length; j--;) {
                markets[i][j].events.sort(Utils.orderSorting);
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
     * @param {Boolean} fully is responsible for covering the entire central part of the
     */
    $scope.openGameFullDetailsMultiview = function openGameFullDetailsMultiview(game, competition, fromCustomWidget, fromLeftMenu, fully) {
        if ($scope.selectedGame && $scope.selectedGame.id === game.id) {
            console.log("game already selected");
            return;
        }

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

        $scope.favoriteGameIsSelected = fully || $rootScope.myGames.indexOf(game.id) !== -1;
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
                    'region': ['id'],
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
                true
            );
        }
    };
}]);

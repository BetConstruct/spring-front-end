/**
 * @ngdoc controller
 * @name vbet5.controller:covid19Ctrl
 */
VBET5.controller('covid19Ctrl', ['$rootScope', '$scope', '$sce', '$timeout', '$location', '$window', '$filter', 'AuthData', 'Config', 'covid19Socket', 'ConnectionService', 'GameInfo',  'Utils', 'BetService', 'analytics', 'Storage', function ($rootScope, $scope, $sce, $timeout, $location, $window, $filter, AuthData, Config, covid19Socket, ConnectionService, GameInfo, Utils, BetService, analytics, Storage) {
    'use strict';

    var GAME_ID = 16157335;
    var SPORT_ID = 90;
    var REGION_ID = 10090;
    var COMPETITION_ID = 18273020;
    var COUNTRY_PER_PAGE = 50;

    var allCountries = [];

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

    $scope.todaysBets = {
        selected: 0, // Selected "Today's bets" type (e.g. all Today's bets or custom additionalItem from Config)
        selectedSport: 0 // Currently selected sport
    };
    $scope.recommendedGames = { selected: false };
    $scope.boostedBets = {selected : false};

    var isCalledExpandCompetition = false;

    var firstTimeLoaded = false;
    var loadCovid19Game = null;

    var liveClickPromise;
    var preMatchClickPromise;


    function listenPreMatchClick () {
        preMatchClickPromise = $scope.$on('prematch.expandCompetition', function(event, data ) {
            if (!isCalledExpandCompetition) {
                isCalledExpandCompetition = true;
                return;
            }
            $location.path('/sport');
            $location.search({
                type: 0,
                sport: data.sport.id,
                competition: data.competition.id
            });
        });
    }

    function listenLiveClick () {
        liveClickPromise = $scope.$on("leftMenu.gameClicked", function (event, data) {
            if (data.byUser) {
                $location.path('/sport');
                $location.search({
                    type: data.game.type,
                    sport: data.game.sport.id,
                    competition: data.competition.id,
                    region: data.game.region.id,
                    game: data.game.id
                });
            }
        });
    }

    $scope.handleLiveClick = function handleLiveClick() {
        if (preMatchClickPromise) {
            preMatchClickPromise();
        }
        $timeout(listenLiveClick, 0);
    };

    $scope.handlePreMatchClick = function handlePreMatchClick() {
        if (liveClickPromise) {
            liveClickPromise();
        }
        $timeout(listenPreMatchClick, 0);
    };

    $scope.$on('leftMenu.closed', function (event, isClosed) {
        $scope.leftMenuClosed = isClosed;
    });

    $scope.$on("prematchMultiView.changeIsPopularGames", function (event, isPopularGames) {
        $location.search({type: 0});
        $location.path('/sport');
        $scope.isPopularGames = isPopularGames;
    });
   function sortAsc(item1, item2) {
        var value1 = item1[$scope.sortData.column];
        var value2 = item2[$scope.sortData.column];
        if (value1 === value2) {
            return 0;
        } else {
            return value1 > value2? 1:-1;
        }

    }
    function sortDesc(item1, item2) {
        var value1 = item1[$scope.sortData.column];
        var value2 = item2[$scope.sortData.column];
        if (value1 === value2) {
            return 0;
        } else {
            return value1 > value2? -1:1;
        }

    }

    function sortAllCountries() {
        allCountries.sort($scope.sortData.type === 'asc'? sortAsc: sortDesc);
    }

    function createPages(countries) {
       var count = parseInt(countries.length / COUNTRY_PER_PAGE, 10) + ((countries.length % COUNTRY_PER_PAGE) && 1);
       $scope.pages = [];
       for(var i = 0; i < count;  ++i) {
           $scope.pages.push(i);
       }
    }

    $scope.selectPage = function selectPage(pageIndex) {
       if ($scope.currentPage !== pageIndex) {
           $scope.currentPage = pageIndex;
       }
      $scope.countries = allCountries.slice(pageIndex * COUNTRY_PER_PAGE, pageIndex * COUNTRY_PER_PAGE + COUNTRY_PER_PAGE);
    };

   $scope.sortColumn = function sorColumn(column) {
       if (column === $scope.sortData.column) {
           $scope.sortData.type = $scope.sortData.type === 'asc'? 'desc': 'asc';
       } else {
           $scope.sortData.column = column;
           $scope.sortData.type = 'desc';
       }
       $scope.currentPage = 0;
       sortAllCountries();
       $scope.selectPage($scope.currentPage);

   };

    function getData() {
        covid19Socket.subscribe("getAll", function (response) {
            $scope.allData = response.data;
        });
        covid19Socket.subscribe("getCountries", function (response) {
            var data = response.data || [];
            allCountries = data.map(function (item) {
                item.countryClass = item.country.toLowerCase().replace(/[ .-]/g, '');
                return item;
            });
            $scope.worldData = allCountries.length > 0? allCountries[0] : {};
            sortAllCountries();
            createPages(allCountries);
            $scope.selectPage($scope.currentPage);

        });
    }

    if (Config.main.showCovid19Game) {
        var connectionService = new ConnectionService($scope);
        $scope.isEventInBetSlip = GameInfo.isEventInBetSlip;

        /**
         * @ngdoc method
         * @name getArrayObjectElementHavingFieldValue
         * @methodOf vbet5.controller:covid19Ctrl
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

        /**
         * @ngdoc method
         * @name separateSpecialMarkets
         * @description  moves special markets from openGame.markets into separate array, in order to show them on top of all markets
         * @methodOf vbet5.controller:covid19Ctrl
         * @param {Array} markets markets
         */
        var separateSpecialMarkets = function separateSpecialMarkets(markets) {
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
        };

        /**
         * @ngdoc method
         * @name bet
         * @methodOf vbet5.controller:covid19Ctrl
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

       var setLocation = function setLocation() {
            $location.search({
                game: GAME_ID,
                region: REGION_ID,
                sport: SPORT_ID,
                competition: COMPETITION_ID,
                type: 0
            });
        };


        /**
         * @ngdoc method
         * @name setActiveMarketTab
         * @methodOf vbet5.controller:covid19Ctrl
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
         * @methodOf vbet5.controller:covid19Ctrl
         * @description expanding/collapsing grouped markets
         * @param {String} marketName grouped marketName
         */
        $scope.toggleGroupedMarket = function (marketName) {
            firstTimeLoaded = false;
            $scope.expandedMarkets[$scope.openGame.id][marketName] = !$scope.expandedMarkets[$scope.openGame.id][marketName];
        };
        /**
         * @ngdoc method
         * @name populateExpandedMarkets
         * @methodOf vbet5.controller:covid19Ctrl
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
         * @methodOf vbet5.controller:covid19Ctrl
         * @param {Array} markets markets
         */
        var divideMarketsArray = function divideMarketsArray(markets) {
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
                        return $scope.openGame.selectedMarketGroupId === market[0].group_id  || (!market[0].group_id && $scope.openGame.selectedMarketGroupId === MARKET_GROUP_OTHER);
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
        };

        /**
         * @ngdoc method
         * @name selectMarketGroup
         * @description  sets selected market group and reorders markets according to it
         * @methodOf vbet5.controller:covid19Ctrl
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
         * @name addToFavouriteMarkets
         * @methodOf vbet5.controller:covid19Ctrl
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
         * @methodOf vbet5.controller:covid19Ctrl
         * @description Separates favorite markets and puts them in game's favouriteMarkets field
         * @param {Object} game current open game object
         */
        var initFavouriteMarkets = function initFavouriteMarkets(game) {
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
        };






        /**
         * @ngdoc method
         * @name updateOpenGame
         * @methodOf vbet5.controller:covid19Ctrl
         * @description  updates open game data object
         *
         * @param {Object} data game data object
         */
        $scope.updateOpenGame = function updateOpenGame(data) {
            //console.log('updateOpenGame', data);

            $scope.openGameFinished = false;
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




                            var groupCountChecker = {};

                            angular.forEach(game.market, function (market) {
                                if (!market.group_id) {
                                    market.group_id = MARKET_GROUP_OTHER.id;
                                    market.group_name = MARKET_GROUP_OTHER.name;
                                }

                                groupCountChecker[market.group_id] = groupCountChecker[market.group_id] || {};
                                if (availableMarketGroups[market.group_id]) {
                                    if(!groupCountChecker[market.group_id][market.type + market.name]) {
                                        availableMarketGroups[market.group_id].count++;
                                        groupCountChecker[market.group_id][market.type + market.name] = market.type + market.name;
                                    }
                                } else {
                                    availableMarketGroups[market.group_id] = {name: market.group_name, id: market.group_id, count: 1};
                                    groupCountChecker[market.group_id][market.type + market.name] = market.type + market.name;
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
                                if (BetService.constants.marketsPreDividedByColumns[market.type]) {
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
                var groupKey = ['type', 'name_template', 'sequence', 'point_sequence'];
                $scope.openGame.markets = Utils.objectToArray(Utils.groupByItemProperties($scope.openGame.market, groupKey));

                if ($scope.openGame.markets) {
                    Utils.sortMarketGroupsWithNestedEvents($scope.openGame.markets);

                    angular.forEach($scope.openGame.markets, function (groupedMarkets) {
                        groupedMarkets[0].name = $filter('improveName')(groupedMarkets[0].name, $scope.openGame);
                        groupedMarkets[0].cashout = groupedMarkets[0].cashout && !!($rootScope.env.live ? $rootScope.partnerConfig.is_cashout_live : $rootScope.partnerConfig.is_cashout_prematch);
                        groupedMarkets[0].eachWayTerms = BetService.getEachWayTerms(groupedMarkets[0]);
                        groupedMarkets[0].fullType = (groupedMarkets[0].type || groupedMarkets[0].type || '') + (groupedMarkets[0].period || groupedMarkets[0].sequence || '');
                        groupedMarkets[0].showStatsIcon = Config.main.enableH2HStat && $scope.openGame.is_stat_available && Config.main.marketStats[groupedMarkets[0].type];

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

        loadCovid19Game = function loadCovid19Game() {

            $scope.currentGameIsFinished = false;
            $scope.selectedMarketTab = {};
            $scope.$broadcast('game.selected', GAME_ID);

            $scope.favoriteGameIsSelected =  $rootScope.myGames.indexOf(GAME_ID) !== -1;
            $scope.favoriteGameFromLeftMenu = false;
            firstTimeLoaded = true;

            setLocation();
            $scope.openGameLoading = true;

            var prematchGameRequest = ["id", "show_type", "markets_count", "start_ts", "is_live", "is_blocked", "is_neutral_venue","team1_id", "team2_id", "game_number", "text_info", "is_stat_available", "type", "info", "team1_name", "team2_name", "tv_info", "stats","add_info_name"];

            var request = {
                'source': 'betting',
                'what': {
                    'sport': ['id', 'name', 'alias'],
                    'competition': ['id', 'name'],
                    'region': ['id', 'alias', 'name'],
                    'game': prematchGameRequest,
                    'market': ["id", "col_count", "type", "name_template", "sequence", "point_sequence", "express_id", "cashout", "display_key", "display_sub_key", "group_id", "name", "group_name", "order", "extra_info"],
                    'event': ["order", "id", "type_1", "type", "type_id", "original_order", "name", "price", "nonrunner", "ew_allowed", "sp_enabled", "extra_info", "base", "home_value", "away_value", "display_column"]
                },
                'where': {
                    'game': {'id': GAME_ID, 'type': {'@in': [0, 2]}},
                    'sport': {'id': SPORT_ID},
                    'region': {'id': REGION_ID},
                    'competition': {'id': COMPETITION_ID}
                }
            };

            connectionService.subscribe(
                request,
                $scope.updateOpenGame,
                {
                    'thenCallback': function () {
                        $scope.openGameLoading = false;
                        firstTimeLoaded = false;

                    },
                    'failureCallback': function () {
                        $scope.openGameLoading = false;
                        firstTimeLoaded = false;

                    }
                }
            );

        };
    }


    (function init() {

        $rootScope.footerMovable = true;
        $rootScope.env.live = false;
        $location.search({});
        $location.search("type", 0);
        listenPreMatchClick ();


        $scope.sortData = {
            column: 'cases',
            type: 'desc'
        };
        $scope.currentPage = 0;
        $scope.expandedCountriesMap = {};

        $scope.columns = [
            {
                title: 'Countries',
                name: 'country'
            },
            {
                title: 'Total Cases',
                name: 'cases'
            },
            {
                title: 'Total Recovered',
                name: 'recovered'
            },
            {
                title: 'Active Cases',
                name: 'active'
            }
        ];
        covid19Socket.init(getData);
        if (Config.main.showCovid19Game) {
            loadCovid19Game();
        }
    })();




    $scope.$on("$destroy", function () {
        covid19Socket.close();
    });
    $scope.openGameFullDetails = function () {};

}]);

/**
 * @ngdoc controller
 * @name vbet5.controller:virtualSportsCtrl
 * @description
 * virtualSports controller
 */
angular.module('vbet5.betting').controller('virtualSportsCtrl', ['$scope', '$rootScope', '$filter', 'Config', 'ConnectionService', 'Utils', '$location', 'GameInfo', 'Storage', 'analytics', 'DomHelper', function ($scope, $rootScope, $filter, Config, ConnectionService, Utils, $location, GameInfo, Storage, analytics, DomHelper) {
    'use strict';
    $rootScope.footerMovable = true;

    //var countdownPromise;
    var connectionService = new ConnectionService($scope);

    var streamDetails = {
        tvType: null,
        videoId: null
    };
    var MARKET_GROUP_ALL = {
        id: -2,
        name: 'All'
    };
    var MARKET_GROUP_FAVORITE = {
        id: -3,
        name: 'Favorite',
        count: 0
    };
    var MARKET_GROUP_OTHER = {
        id: -1,
        name: 'Other'
    };

    $scope.nonRaceSports = {
        ids: [56, 57, 132, 173, 174]
    };

    $scope.marketGroupFilter = {
        id: MARKET_GROUP_ALL.id
    };

    var marketsPreDividedByColumns = [
        'MatchWinningMargin',
        'SetWinningMargin',
        'WinningMargin',
        'CorrectScore',
        'Firstset/match',
        'SetsEffectiveness',
        'SeriesCorrectScore',
        'CurrectScoreGroup',
        'MatchBettingAndTeamsToScore',
        'CurrectScoreTennisKined',
        'CurrectScoreFootballKined',
        'MatchBettingBothTeamsToScore',
        'CorrecctScoreInsp',
        'HalfTimeFullTime',
        'HalfTimeCorrecctScore',
        'HalfTimeFullTimeDoubleChance',
        'ExtraTimeHomeTeamCorrectTotal',
        'ExtraTimeAwayTeamCorrectTotal',
        'OutcomeandBothTeamToScore',
        'DoubleChanceAndBothTeamToScore',
        'DoubleChanceAndBothTeamToScore',
        'TotalAndBothTeamsToScore',
        'FirstHalfOutcomeAndBothTeamToScore',
        'SecondHalfOutcomeAndBothTeamToScore',
        '1stHalf-2ndHalfBothToScore',
        'GameCorrectScore',
        'CorrecctScoreGroup',
        'MatchTieBreakCorrectScore',
        'SetTieBreakCorrectScore',
        '1stSet-Match',
        'TeamScorecast',
        '1stGame/2ndGameWinner',
        '2ndGame/3thGameWinner',
        '3thGame/4thGameWinner',
        '4thGame/5thGameWinner',
        '5thGame/6thGameWinner',
        '6thGame/7thGameWinner',
        '7thGame/8thGameWinner',
        '8thGame/9thGameWinner',
        '9thGame/10thGameWinner',
        '10thGame/11thGameWinner',
        '11thGame/12thGameWinner',
        'SetScore',
        'MatchTieBreakCorrectScore'
    ]; // Market types which are pre-divided by back-end into 2 columns

    $scope.alreadyRunningTextEnable = false;
    $scope.selectedGameId = 0;
    $scope.selectedRanges = {
        selectedSportId: -1,
        selectedCompetitionId: -1
    };
    $scope.results = {
        open: false
    };
    $scope.vPlayerState = {
        isLoaded: false,
        fullscreen: false,
        data: null
    };
    $scope.favoriteMarketTypes = Storage.get('vs_favorite_market_types') || {};
    $scope.selectedGroup = {
        id: undefined
    };
    $scope.collapsedMarkets = {};

    $scope.leftMenuClosed = false;


    /**
     * @ngdoc method
     * @name toggleLeftMenu
     * @methodOf vbet5.controller:virtualSportsCtrl
     * @description  expands(or collapses if expanded) left menu
     *
     */
    $scope.toggleLeftMenu = function toggleLeftMenu() {
        $scope.leftMenuClosed = !$scope.leftMenuClosed;
    };


    /**
     * @ngdoc method
     * @name closeLeftMenuDependingWindowSize
     * @methodOf vbet5.controller:virtualSportsCtrl
     * @description Close left menu depending on window size
     */
    function closeLeftMenuDependingWindowSize() {
        var width = DomHelper.getWindowSize().width;

        if (width <= 1279 && !$scope.leftMenuClosed) {
            $scope.toggleLeftMenu();
        } else if (width > 1279 && $scope.leftMenuClosed) {
            $scope.toggleLeftMenu();
        }
    }

    closeLeftMenuDependingWindowSize();
    $scope.$on('onWindowResize', closeLeftMenuDependingWindowSize);


    /**
     * @ngdoc method
     * @name updateSections
     * @methodOf vbet5.controller:virtualSportsCtrl
     * @description Update Sections
     * @param {object} data sports data
     */
    function updateSections(data) {
        $scope.sections = Utils.objectToArray(data.sport);
        $scope.sections.sort(Utils.orderSorting);
        if (!$scope.selectedVirtualSport) {
            var sportToLoad = $scope.sections[0];
            if ($location.search().vsport) {
                sportToLoad = Utils.getArrayObjectElementHavingFieldValue($scope.sections, 'id', parseInt($location.search().vsport, 10)) || sportToLoad;
            }
            if (sportToLoad) {
                $scope.loadCompetitions(sportToLoad, true);
            }
        }

        if (Config.main.virtualSportLabels) {
            angular.forEach($scope.sections, function (section) {
                section.label = Config.main.virtualSportLabels[section.alias];
            });
        }

        angular.forEach($scope.sections, function (section) {

            section.game = Utils.objectToArray(section.game);
            if (section.game && section.game.length) {
                section.game.sort(function (a, b) {
                    return (a.start_ts - b.start_ts);
                });
                section.game = section.game.filter(function (a) {
                    return (a.start_ts > Math.round((new Date()).getTime() / 1000));
                });
                section.prematch_ts = section.game[0] ? section.game[0].start_ts : "";
            }

        });
    }

    $scope.toggleResultsPopUp = function toggleResultsPopUp(state) {
        $scope.results.open = state;
    };


    /**
     * @ngdoc method
     * @name loadVirtualSports
     * @methodOf vbet5.controller:virtualSportsCtrl
     * @description Load virtualSports sections from swarm
     */
    function loadVirtualSports() {
        var virtualSportIdsKey = $location.path().split('/').join('');
        var request = {
            'source': 'betting',
            'what': {'sport': ['id', 'name', 'alias', 'order'], 'game': ['@count','start_ts', 'text_info']},
            'where': {
                'game' : {
                    '@or' : [{ type: 0}, {visible_in_prematch: true, type: 4}]
                },
                'sport': {'id': {'@in': Config.main.virtualSportIds[virtualSportIdsKey]}}
            }
        };

        connectionService.subscribe(
            request,
            updateSections
        );
    }

    /**
     * @ngdoc method
     * @name updateCompetitions
     * @methodOf vbet5.controller:virtualSportsCtrl
     * @description
     * @param {Object} data competitions data object
     */
    function updateCompetitions(data) {

        $scope.competitions = Utils.objectToArray(data.competition);
        angular.forEach($scope.competitions, function (competition) {
            competition.name = $filter('removeParts')(competition.name, [$scope.selectedVirtualSport.name]);
        });
        if (!$scope.selectedVirtualCompetition) {
            var competitionToLoad = $location.search().competition && Utils.getArrayObjectElementHavingFieldValue($scope.competitions, 'id', parseInt($location.search().competition, 10)) || $scope.competitions[0];
            $scope.loadGames(competitionToLoad);
        }
        console.log('updateCompetitions', $scope.competitions);
    }

    /**
     * @ngdoc method
     * @name loadCompetitions
     * @methodOf vbet5.controller:virtualSportsCtrl
     * @description loads competitions of provided sport
     * @param {Object} sport sport object
     * @param {Boolean} isUpdateSectionsCallback
     */
    $scope.loadCompetitions = function loadCompetitions(sport, isUpdateSectionsCallback) {

        if ($scope.competitionsLoading || $scope.gameIsLoading || $scope.gamesAreLoading || $scope.selectedVirtualSport && $scope.selectedVirtualSport.id === sport.id) {
            return;
        }


        $scope.selectedRanges.selectedSportId = sport.id;
        $scope.selectedVirtualCompetition = null;
        $location.search('vsport', sport.id);
        $scope.selectedVirtualSport = sport;
        $scope.competitionsLoading = true;
        if (!isUpdateSectionsCallback) {
            $scope.gameToShow = undefined;
        }

        connectionService.subscribe(
            {
                'source': 'betting',
                'what': {'competition': ['id', 'name', 'order']},
                'where': {
                    'game' : {
                        '@or' : [{ type: 0}, {visible_in_prematch: true, type: 4}]
                    },
                    'sport': {'id': sport.id}
                }
            },
            updateCompetitions,
            {
                'failureCallback': function () {
                    $scope.competitionsLoading = false;
                    $scope.vPlayerState.data = null;
                }
            }
        );
    };

    /**
     * @ngdoc method
     * @name updateGames
     * @methodOf vbet5.controller:virtualSportsCtrl
     * @description updates competition's games data
     * @param {Object} data games data object
     */
    function updateGames(data) {
        $scope.games = Utils.objectToArray(data.game);
        if ($scope.games && $scope.games.length) {
            $scope.games.sort(function (a, b) { return a.start_ts - b.start_ts; });
        }
        if ($scope.games) {
            var gameToLoad = $location.search().game && Utils.getArrayObjectElementHavingFieldValue($scope.games, 'id', parseInt($location.search().game, 10)) || $scope.games[0];

            $scope.openGame(gameToLoad);
        }
    }

    /**
     * @ngdoc method
     * @name loadGames
     * @methodOf vbet5.controller:virtualSportsCtrl
     * @description Loads competition's games
     * @param {Object} competition competition object
     */
    $scope.loadGames = function loadGames(competition) {
        if ($scope.gameIsLoading || $scope.gamesAreLoading) {
            return;
        }

        $scope.selectedRanges.selectedCompetitionId = competition.id;
        $scope.selectedVirtualCompetition = null;

        $location.search('competition', competition.id);
        if (!competition.id) {
            console.warn("cannot load competition games, competition has no id");
            return;
        }
        $scope.gamesAreLoading = true;
        $scope.selectedVirtualCompetition = competition;

        connectionService.subscribe(
            {
                'source': 'betting',
                'what': {'game': ['game_number', 'team1_name', 'team2_name', 'id', 'start_ts', 'text_info']},
                'where': {
                    'competition': { 'id': competition.id },
                    'game' : {
                        '@or' : [{ type: 0}, {visible_in_prematch: true, type: 4}]
                    }
                }
            },
            updateGames,
            {
                'thenCallback': function () {
                    $scope.gamesAreLoading = false;
                },
                'failureCallback': function () {
                    $scope.gamesAreLoading = false;
                }
            }
        );
    };

    /*/!**
     * @ngdoc method
     * @name countDown
     * @methodOf vbet5.controller:virtualSportsCtrl
     * @description Next game countdown timer
     *!/
    function countDown() {
        $scope.remainingSeconds -= 1;
        $scope.countdown = Moment.moment.duration(1000 * $scope.remainingSeconds);
        if ($scope.remainingSeconds > 0) {
            countdownPromise = TimeoutWrapper(countDown, 1000);
        }
    }*/

    var VIRTUAL_ICONS_PATHS = {
       'VirtualHorseRacing': 'virtualhorses',
       'VirtualGreyhoundRacing': 'virtualdogs',
       'VirtualCarRacing': 'virtualcarracing',
       'VirtualBicycle': 'virtualbicycle',
       'InspiredTrotting': 'inspiredhorseracing',
       'InspiredGreyhoundRacing': 'inspiredgreyhoundracing',
       'InspiredCycling': 'inspiredcycling',
       'InspiredSpeedway': 'inspiredspeedway',
       'InspiredMotorRacing': 'inspiredmotorracing',
       'InspiredHorseRacing': 'inspiredhorseracing'
    };

    /**
     * @ngdoc method
     * @name createRacingNumberPath
     * @methodOf vbet5.controller:virtualSportsCtrl
     * @description Create racing number path
     * @param {Number} Image number
     * @param {Number} Animals list length
     */
    function createRacingNumberPath(imgNumber, animalsListLength) {
        if (imgNumber) {
            var path = 'images/classic/virtual-betting/';
            if ($scope.gameToShow.sport.alias === 'VirtualDogs' || $scope.gameToShow.sport.alias === 'VirtualGreyhoundRacing') {
                path += animalsListLength;
            }
            path += VIRTUAL_ICONS_PATHS[$scope.gameToShow.sport.alias] + '/' + imgNumber + '.svg';
            return path;
        }
    }
    /**
     * @ngdoc method
     * @name getEventInfo
     * @methodOf vbet5.controller:virtualSportsCtrl
     * @description  set some attributes for event
     * @param {Object} event the event
     */
    function getEventInfo(event) {
        var i, virtuals = $scope.gameToShow.info.virtual;
        var length = virtuals.length, animalCount = 0;

        for (i = 0; i < length; i += 1) {

            if (virtuals[i].AnimalName === event.type) {
                if (!event.number && virtuals[i].Number) {
                    event.number = virtuals[i].Number;
                }
                if (!event.animalName && virtuals[i].AnimalName) {
                    event.animalName = virtuals[i].AnimalName;
                }
                if (!event.playerName && virtuals[i].PlayerName) {
                    event.playerName = virtuals[i].PlayerName;
                }
                if (!event.RacerTextureID && virtuals[i].RacerTextureID) {
                    event.RacerTextureID = virtuals[i].RacerTextureID;
                }
            }

            if (virtuals[i].RacerTextureID) {
                virtuals[i].numberPath = 'images/classic/virtual-betting/' + VIRTUAL_ICONS_PATHS[$scope.gameToShow.sport.alias] + '/' + virtuals[i].RacerTextureID + '.png';
            } else if (virtuals[i].Number) {
                virtuals[i].numberPath = createRacingNumberPath(virtuals[i].Number, length);
                animalCount++;
            }
        }
    }

    /**
     * @ngdoc method
     * @name updateOpenGameData
     * @methodOf vbet5.controller:virtualSportsCtrl
     * @description updates and processes game data
     * @param {Object} data game data object
     */
    function updateOpenGameData(data) {
        var selectedGame = null;
        angular.forEach(data.sport, function (sport) {
            angular.forEach(sport.region, function (region) {
                angular.forEach(region.competition, function (competition) {
                    angular.forEach(competition.game, function (game) {
                        game.sport = {id: sport.id, alias: sport.alias};
                        game.region = {id: region.id};
                        game.competition = {id: competition.id, name: competition.name};
                        game.additionalGameInfo = '№ ' + game.game_number + ' / ' + game.team1_name + (game.team2_name ? ' vs ' + game.team2_name : '');
                        selectedGame = game;
                    });
                });
            });
        });
        $scope.gameToShow = selectedGame;
        if (!selectedGame) {
            $scope.loadGames($scope.selectedVirtualCompetition);
            return;
        }

        if (selectedGame.market) {
            $scope.gameToShow.markets = Utils.objectToArray(selectedGame.market);
            if ($scope.gameToShow.markets.length) {
                $scope.gameToShow.markets.sort(Utils.orderSorting);
            } else if ($scope.selectedGameId === $scope.gameToShow.id) {
                for (var i = 0 , length = $scope.games.length; i < length; ++i) {
                    if ($scope.games[i].id === $scope.selectedGameId && $scope.games[i+1]) {
                        loadGameToShow($scope.games[i+1]);
                        $scope.alreadyRunningTextEnable = true;
                        return;
                    }
                }
            }
        }

        // Group markets by name
        var selectedGameMarkets = {};
        var orderSet = 0;

        angular.forEach($scope.gameToShow.markets, function (market) {
            if (selectedGameMarkets[market.name]) {
                var evtKey = '';
                if (market.event) {
                    orderSet += 20;
                    for (evtKey in market.event) {
                        if (market.event.hasOwnProperty(evtKey)) {
                            market.event[evtKey].order += orderSet;
                            selectedGameMarkets[market.name].event[evtKey] = market.event[evtKey];
                        }
                    }
                }
            } else {
                selectedGameMarkets[market.name] = market;
            }
        });

        $scope.gameToShow.markets = Utils.objectToArray(selectedGameMarkets);

        if ($scope.gameToShow.markets.length) {
            var availableMarketGroups = {}, selectedGroupId = 0;
            angular.forEach($scope.gameToShow.markets, function (market) {
                market.events = Utils.objectToArray(market.event);
                if (market.events) {
                    if (marketsPreDividedByColumns.indexOf(market.market_type) > -1) {
                        GameInfo.reorderMarketEvents(market, 'preDivided');
                    } else {market.events.sort(Utils.orderSorting);
                        market.named_events = Utils.groupByItemProperty(market.events, 'type');}
                }
                angular.forEach(market.events, function (event) {
                    event.name = $filter('improveName')(event.name, $scope.gameToShow);
                    event.name = $filter('removeParts')(event.name, [market.name]);

                    getEventInfo(event);
                });
                //group markets to groups
                if ($scope.nonRaceSports.ids.indexOf($scope.selectedVirtualSport.id) !== -1) {
                    if (!market.group_id) {
                        market.group_id = MARKET_GROUP_OTHER.id;
                        market.group_name = MARKET_GROUP_OTHER.name;
                    }

                    if (availableMarketGroups[market.group_id]) {
                        availableMarketGroups[market.group_id].count++;
                    } else {
                        availableMarketGroups[market.group_id] = {name: market.group_name, id: market.group_id, count: 1};
                    }

                    $scope.selectedGroup.id && market.group_id === $scope.selectedGroup.id && (selectedGroupId = market.group_id);
                }
            });

            if ($scope.nonRaceSports.ids.indexOf($scope.selectedVirtualSport.id) !== -1) {
                availableMarketGroups = Utils.objectToArray(availableMarketGroups);
                var additionalGroups = [MARKET_GROUP_FAVORITE, MARKET_GROUP_ALL];

                $scope.gameToShow.availableMarketGroups = (availableMarketGroups.length > 1 || (availableMarketGroups.length === 1 && availableMarketGroups[0].id !== MARKET_GROUP_OTHER.id)) ? additionalGroups.concat(availableMarketGroups) : additionalGroups;
                initFavouriteMarkets($scope.gameToShow);

                if ($scope.selectedGroup.id !== MARKET_GROUP_FAVORITE.id || !MARKET_GROUP_FAVORITE.count) {
                    $scope.selectedGroup.id = selectedGroupId || $scope.gameToShow.availableMarketGroups[1].id;
                }
            }
        }

        $scope.vSMarketsFirstPack = $scope.gameToShow.markets.slice(); // Clone array elements
        $scope.vSMarketsSecondPack = $scope.vSMarketsFirstPack.splice( $scope.gameToShow.markets.length / 2);

        if (GameInfo.hasVideo($scope.gameToShow)) {
            if ($scope.gameToShow.tv_type !== streamDetails.tvType || $scope.gameToShow.video_id !== streamDetails.videoId) {
                $scope.vPlayerState.data = null;
                $scope.providerId = $scope.gameToShow.tv_type;
                GameInfo.getVideoData($scope.gameToShow, true).then(function () {
                    if ($scope.gameToShow) {
                        streamDetails.tvType = $scope.gameToShow.tv_type;
                        streamDetails.videoId = $scope.gameToShow.video_id;
                        $scope.vPlayerState.data = $scope.gameToShow.video_data;
                    }
                });
            }
        }
        $scope.gameToShow.isVirtual = true;
        $scope.gameToShow.displayTitle = $scope.gameToShow.text_info;
    }

    /**
     * @ngdoc method
     * @name switchMarketsColumnView
     * @methodOf vbet5.controller:virtualSportsCtrl
     * @description switch virtual sport column view(1 or 2 column)
     */
    $scope.marketIsOneColumn = Storage.get('markets_in_one_column') === undefined
        ? !!Config.main.marketsInOneColumn
        : Storage.get('markets_in_one_column');

    $scope.switchMarketsColumnView = function() {
        $scope.marketIsOneColumn = !$scope.marketIsOneColumn;
        Storage.set('markets_in_one_column', $scope.marketIsOneColumn);
    };

    /**
     * @ngdoc method
     * @name openGame
     * @methodOf vbet5.controller:virtualSportsCtrl
     * @description loads selected game data
     * @param {Object} game game object
     */
    $scope.openGame = function openGame(game) {
        if ($scope.selectedGameId === game.id) return;

        $location.search('game', game.id);
        $scope.selectedGameId = game.id;
        $scope.alreadyRunningTextEnable = false;

        if (!$scope.gameToShow || $scope.selectedGameId !== $scope.gameToShow.id) {
            $scope.gameToShow = null;
            loadGameToShow(game);
        }
    };

    function loadGameToShow(game) {
        $scope.gameIsLoading = true;
        connectionService.subscribe(
            {
                'source': 'betting',
                'what': {sport: ['id', 'alias'], competition: ['id', 'name'], region: ['id'], game: [], market: [], event: []},
                'where': {'game': {'id': game.id}}
            },
            updateOpenGameData,
            {
                'thenCallback': function () {
                    $scope.gameIsLoading = false;
                    $scope.competitionsLoading = false;
                },
                'failureCallback': function () {
                    $scope.gameIsLoading = false;
                    $scope.competitionsLoading = false;
                }
            }
        );
    }

    /**
     * @ngdoc method
     * @name bet
     * @methodOf vbet5.controller:virtualSportsCtrl
     * @description  sends a message to betslip to add a bet
     *
     * @param {Object} event event object
     * @param {Object} market event's market object
     * @param {Object} openGame game object
     * @param {String} [oddType] odd type (odd or sp)
     */
    $scope.bet = function bet(event, market, openGame, oddType) {
        oddType = oddType || 'odd';
        var game = Utils.clone(openGame);
        $rootScope.$broadcast('bet', {event: event, market: market, game: game, oddType: oddType});
    };

    $scope.isEventInBetSlip =  GameInfo.isEventInBetSlip;
    $scope.eachWayPlace = GameInfo.eachWayPlace;

    //initial values for ordering of data
    $scope.dataPredicate = 'Number';
    $scope.dataReverce = false;

    /**
     * @ngdoc method
     * @name dataColumnClick
     * @methodOf vbet5.controller:virtualSportsCtrl
     * @description changes data that  used for ordering data elements
     *
     * @param {String} orderItem orderItem string: value of predicate
     */
    $scope.dataColumnClick = function dataColumnClick(orderItem) {
        if ($scope.dataPredicate === orderItem) {
            $scope.dataReverce = !$scope.dataReverce;
        } else {
            $scope.dataReverce = false;
            $scope.dataPredicate = orderItem;
        }
    };

    /**
     * @ngdoc method
     * @name raceCardsOrder
     * @methodOf vbet5.controller:virtualSportsCtrl
     * @description to be used by the comparator to determine the order of  raceCards elements
     *
     * @param {Object} event horseStat object
     */
    $scope.dataOrder = function dataOrder(event) {
        switch ($scope.dataPredicate) {
        case 'type':
            return parseInt(event.number, 10);
        case 'price':
            return parseFloat(event.price);
        }

        return -1;
    };

    /**
     * @ngdoc method
     * @name toggleMarket
     * @methodOf vbet5.controller:virtualSportsCtrl
     * @description expanding/collapsing markets
     * @param {String} type the market's market_type
     */

    $scope.toggleMarket = function toggleMarket(type) {
        $scope.collapsedMarkets[$scope.selectedVirtualSport.id] = $scope.collapsedMarkets[$scope.selectedVirtualSport.id] || {};
        if ($scope.collapsedMarkets[$scope.selectedVirtualSport.id][type]) {
            delete $scope.collapsedMarkets[$scope.selectedVirtualSport.id][type];
        } else {
            $scope.collapsedMarkets[$scope.selectedVirtualSport.id][type] = true;
        }
    };

    /**
     * @ngdoc method
     * @name initFavouriteMarkets
     * @methodOf vbet5.controller:virtualSportsCtrl
     * @description calculates favorite markets and count
     * @param {Object} game current open game object
     */
    function initFavouriteMarkets(game) {
        var count = 0, length = game.markets.length, i;
        for (i = 0; i < length; i += 1) {
            if ($scope.favoriteMarketTypes[$scope.selectedVirtualSport.id] && $scope.favoriteMarketTypes[$scope.selectedVirtualSport.id].indexOf(game.markets[i].market_type) !== -1) {
                game.markets[i].isFavorite = true;
                count++;
            }
        }

        MARKET_GROUP_FAVORITE.count = count;
    }

    /**
     * @ngdoc method
     * @name addToFavouriteMarkets
     * @methodOf vbet5.controller:virtualSportsCtrl
     * @description Adds market to favorites list for sport
     * @param {Object} market array of market(s) of same type
     */

    $scope.addToFavouriteMarkets = function addToFavouriteMarkets(market) {
        if (!market) { return }
        var analyticsText = "";
        $scope.favoriteMarketTypes[$scope.selectedVirtualSport.id] = $scope.favoriteMarketTypes[$scope.selectedVirtualSport.id] || [];
        var index = $scope.favoriteMarketTypes[$scope.selectedVirtualSport.id].indexOf(market.market_type);
        if (index !== -1) {
            analyticsText = "removeFromVSFavouriteMarkets";
            $scope.favoriteMarketTypes[$scope.selectedVirtualSport.id].splice(index, 1);
            market.isFavorite = false;
            MARKET_GROUP_FAVORITE.count--;
            !MARKET_GROUP_FAVORITE.count && $scope.selectedGroup.id === -3 && ($scope.selectedGroup.id = $scope.gameToShow.availableMarketGroups[1].id);
        } else {
            analyticsText = "addToVSFavouriteMarkets";
            $scope.favoriteMarketTypes[$scope.selectedVirtualSport.id].push(market.market_type);
            market.isFavorite = true;
            MARKET_GROUP_FAVORITE.count++;
        }

        Storage.set("vs_favorite_market_types", $scope.favoriteMarketTypes);
        analytics.gaSend('send', 'event', 'explorer', analyticsText + (Config.main.sportsLayout),  {'page': $location.path(), 'eventLabel': analyticsText});
        console.log('gaSend-',analyticsText);
    };

    /**
     * @ngdoc method
     * @name getArrow
     * @methodOf vbet5.controller:virtualSportsCtrl
     * @description Get arrow state based on +-
     */
    $scope.getArrow = function getArrow(input) {

        if ($scope.arrowHide === 'hide') {
            return 'hide-arrow';
        }

        switch (input) {
        case 1:
            return 'top-arrow';
        case -1:
            return 'bot-arrow';
        default:
            return '';
        }
    };
    $scope.$on('sportsbook.handleDeepLinking', function () {
        if ($location.search().vsport && $scope.selectedRanges.selectedSportId !== parseInt($location.search().vsport, 10) ) {
            var sportToLoad = Utils.getArrayObjectElementHavingFieldValue($scope.sections, 'id', parseInt($location.search().vsport, 10));
            if (sportToLoad) {
                $scope.loadCompetitions(sportToLoad);
            }
        }
    });
    loadVirtualSports();
}]);

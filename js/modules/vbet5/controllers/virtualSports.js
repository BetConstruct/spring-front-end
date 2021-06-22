/**
 * @ngdoc controller
 * @name vbet5.controller:virtualSportsCtrl
 * @description
 * virtualSports controller
 */
angular.module('vbet5.betting').controller('virtualSportsCtrl', ['$scope', '$rootScope', '$filter', 'Config', 'ConnectionService', 'Utils', '$location', 'GameInfo', 'Storage', 'analytics', 'DomHelper', 'Translator', function ($scope, $rootScope, $filter, Config, ConnectionService, Utils, $location, GameInfo, Storage, analytics, DomHelper, Translator) {
    'use strict';
    $rootScope.footerMovable = true;
    $scope.videoStreaming = {};

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

    var currentGameSubId = null;

    $scope.nonRaceSports = {
        ids: [1, 2, 7, 56, 57, 132, 173, 174, 188, 209]
    };

    $scope.marketGroupFilter = {
        id: MARKET_GROUP_ALL.id
    };
    $scope.roundsState = { selectedRound: null};
    $scope.leagueVideoState = {selected: null};

    var marketsPreDividedByColumns = [
        'MatchWinningMargin',
        'GameWinningMargin',
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



    var LEAGUE_ID_MAP = {188: true, 7: true};
    $scope.constants = {
        'MARKET_GROUP_ALL': MARKET_GROUP_ALL,
        'MARKET_GROUP_FAVORITE': MARKET_GROUP_FAVORITE,
        'MARKET_GROUP_OTHER': MARKET_GROUP_OTHER,
        'marketsPreDividedByColumns': marketsPreDividedByColumns,
    };
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
        fullscreen: false
    };
    $scope.videoData = null;
    $scope.favoriteMarketTypes = Storage.get('vs_favorite_market_types') || {};
    $scope.selectedGroup = {
        id: undefined
    };
    $scope.collapsedMarkets = {};

    $scope.leftMenuClosed = false;
    $scope.expandedGames = {};


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
    $scope.$on('onWindowWidthResize', closeLeftMenuDependingWindowSize);


    /**
     * @ngdoc method
     * @name updateSections
     * @methodOf vbet5.controller:virtualSportsCtrl
     * @description Update Sections
     * @param {object} data sports data
     */
    function updateSections(data) {
        $scope.sections = Utils.objectToArray(angular.copy(data.sport));
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
                section.game = section.game.filter(function (a) {
                    return (a.start_ts > Math.round((new Date()).getTime() / 1000));
                });
                section.game.sort(Utils.orderByStartTs);
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
        var request = {
            'source': 'betting',
            'what': {'competition': ['id', 'name', 'order', 'info']},
            'where': {
                'game' : {
                    '@or' : [{ type: 0}, {visible_in_prematch: true, type: 4}]
                },
                'sport': {'id': sport.id}
            }
        };
        if (LEAGUE_ID_MAP[sport.id]) {
            $scope.roundsState.selectedRound = null;
            $scope.leagueVideoState.selected = null;
            $scope.expandedGames = {};
            $location.search('game', undefined);
        }
        connectionService.subscribe(
            request,
            updateCompetitions,
            {
                'failureCallback': function () {
                    $scope.competitionsLoading = false;
                    $scope.videoData = null;
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
            $scope.games.sort(Utils.orderByStartTs);
        }
        if ($scope.games) {
            if (LEAGUE_ID_MAP[$scope.selectedRanges.selectedSportId]) {
                var previousRounds = angular.copy($scope.rounds);
                var result = [];
                var gameLength = $scope.games.length;
                var currentGroupIndex = 0;
                var previousRound = null;
                for (var i =0; i < gameLength; ++i) {
                    var game = $scope.games[i];
                    if (game.info && game.info.virtual && game.info.virtual.length > 4) {
                        game.video_id = game.info.virtual[3].video_id;
                        game.round = game.info.virtual[4].round;
                        game.info.scores = game.info.virtual[2].SecondHalf.split(":");
                    }
                    if (previousRound && game.round !== previousRound) {
                        currentGroupIndex += 1;
                        result.push([game]);
                        previousRound = game.round;
                    } else if (game.round === previousRound) {
                        result[currentGroupIndex].push(game);
                    } else {
                        result.push([game]);
                        previousRound = game.round;

                        if ($scope.roundsState.selectedRound === null) {
                            $scope.roundsState.selectedRound  = 0;
                            $scope.expandedGames[game.id] = true;
                        }
                    }


                }
                $scope.rounds = result;

                if (previousRounds) {
                    var round = previousRounds[$scope.roundsState.selectedRound][0].round;
                    var foundIndex = null;
                    for(var j = $scope.rounds.length; j--;) {
                        if ($scope.rounds[j][0].round === round) {
                            foundIndex = j;
                            break;
                        }
                    }
                    if (foundIndex !== null) {
                        $scope.roundsState.selectedRound = foundIndex;
                    } else {
                        $scope.roundsState.selectedRound = 0;
                    }
                } else {
                    $scope.roundsState.selectedRound = 0;
                }
                if ($scope.leagueVideoState.selected === null) {
                    $scope.loadVideo($scope.rounds[0][0]);
                } else {
                    var contains = false;
                    var games = $scope.rounds[0];
                    for(var i = games.length; i--; ) {
                        if (games[i].video_id === $scope.leagueVideoState.selected) {
                            contains = true;
                            break;
                        }
                    }
                    if (!contains) {
                        $scope.loadVideo($scope.rounds[0][0]);
                    }
                }
                $scope.competitionsLoading = false;
                if (currentGameSubId) {
                    connectionService.unsubscribe(currentGameSubId);
                    currentGameSubId = null;
                }
            } else {
                var gameToLoad = $location.search().game && Utils.getArrayObjectElementHavingFieldValue($scope.games, 'id', parseInt($location.search().game, 10)) || $scope.games[0];

                $scope.openGame(gameToLoad);
            }



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
        var request = {
            'source': 'betting',
            'what': {'game': ['game_number', 'team1_name', 'team2_name', 'id', 'start_ts', 'text_info', 'info', 'tv_type']},
            'where': {
                'competition': { 'id': competition.id },
                'game' : {
                    '@or' : [{ type: 0}, {visible_in_prematch: true, type: 4}]
                }
            }
        };
        connectionService.subscribe(
            request,
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
        'VirtualMarbleRacing': 'virtualcarracing',
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
     * @name initFavouriteMarkets
     * @methodOf vbet5.controller:virtualSportsCtrl
     * @description calculates favorite markets and count
     * @param {Array} markets the selected games markets
     */
    function initFavouriteMarkets(markets) {
        var count = 0;

        for (var i = markets.length; i--;) {
            var market = markets[i][0];
            if ($scope.favoriteMarketTypes[$scope.selectedVirtualSport.id] && $scope.favoriteMarketTypes[$scope.selectedVirtualSport.id].indexOf(market.type) !== -1) {
                market.isFavorite = true;
                count++;
            }
        }

        MARKET_GROUP_FAVORITE.count = count;
    }

    function prepareMarket(market) {
        market.events = Utils.objectToArray(market.event);
        if (market.events) {
            if (marketsPreDividedByColumns.indexOf(market.type) > -1) {
                GameInfo.reorderMarketEvents(market, 'preDivided');
            } else {market.events.sort(Utils.orderSorting);
                market.named_events = Utils.groupByItemProperty(market.events, 'type');}
        }
        angular.forEach(market.events, function (event) {
            event.name = $filter('improveName')(event.name, $scope.gameToShow);
            event.name = $filter('removeParts')(event.name, [market.name]);

            getEventInfo(event);
        });
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
                        game.additionalGameInfo = Translator.get(game.team2_name ? '№ {1} / {2} vs {3}' : '№ {1} / {2}', [game.game_number, game.team1_name, game.team2_name]);
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

        var i;

        if (selectedGame.market) {
            var groupedMarkets, isGameNonRacing = $scope.nonRaceSports.ids.indexOf($scope.selectedVirtualSport.id) !== -1;
            if (isGameNonRacing) {
                groupedMarkets = Utils.objectToArray(Utils.groupByItemProperties(selectedGame.market, ['name']));
                $scope.vSMarketsSecondPack = [];
                $scope.vSMarketsFirstPack = [];
            } else {
                groupedMarkets = Utils.objectToArray(selectedGame.market);
            }

            if (groupedMarkets && groupedMarkets.length) {
                var market;
                if (isGameNonRacing) {
                    var availableMarketGroups = {}, selectedGroupId = 0;
                    for (i = groupedMarkets.length; i--;) {
                        for (var j = groupedMarkets[i].length; j--;) {
                            market = groupedMarkets[i][j];

                            prepareMarket(market);
                            market.express_id = Utils.calculateExpressId(market, $scope.gameToShow.type)

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
                    }
                    availableMarketGroups = Utils.objectToArray(availableMarketGroups);
                    var additionalGroups = [MARKET_GROUP_FAVORITE, MARKET_GROUP_ALL];

                    $scope.gameToShow.availableMarketGroups = (availableMarketGroups.length > 1 || (availableMarketGroups.length === 1 && availableMarketGroups[0].id !== MARKET_GROUP_OTHER.id)) ? additionalGroups.concat(availableMarketGroups) : additionalGroups;
                    initFavouriteMarkets(groupedMarkets);

                    if ($scope.selectedGroup.id !== MARKET_GROUP_FAVORITE.id || !MARKET_GROUP_FAVORITE.count) {
                        $scope.selectedGroup.id = selectedGroupId || $scope.gameToShow.availableMarketGroups[1].id;
                    }
                    Utils.sortMarketGroupsWithNestedEvents(groupedMarkets);

                    $scope.vSMarketsSecondPack = groupedMarkets.splice(Math.ceil(groupedMarkets.length / 2));
                    $scope.vSMarketsFirstPack = groupedMarkets;

                } else {
                    for (i = groupedMarkets.length; i--;) {
                        market = groupedMarkets[i];
                        prepareMarket(market);
                    }

                    $scope.gameToShow.markets = groupedMarkets.sort(Utils.orderSorting);
                }

            } else {
                for (i = 0; i < $scope.games.length; ++i) {
                    if ($scope.games[i].id === $scope.selectedGameId && $scope.games[i+1]) {
                        loadGameToShow($scope.games[i+1]);
                        if ($scope.selectedGameId !== $scope.gameToShow.id) {
                            $scope.selectedGameId = $scope.games[i+1].id;
                        }
                        $scope.alreadyRunningTextEnable = true;
                        return;
                    }
                }
            }
        }

        $scope.loadVideo($scope.gameToShow);
        $scope.gameToShow.isVirtual = true;
        $scope.gameToShow.displayTitle = $scope.gameToShow.text_info;
    }

    /**
     * @ngdoc method
     * @name switchMarketsColumnView
     * @methodOf vbet5.controller:virtualSportsCtrl
     * @description switch virtual sport column view(1 or 2 column)
     */
    $scope.marketIsOneColumn = Storage.get('markets_in_one_column') === undefined  ? !!Config.main.marketsInOneColumn : Storage.get('markets_in_one_column');

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
        if ($scope.selectedGameId === game.id) {return;}

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
        var request = {
            'source': 'betting',
            'what': {
                sport: ['id', 'alias'],
                competition: ['id', 'name'],
                region: ['id'],
                game: [["id", "markets_count", "start_ts", "is_live", "is_blocked", "is_neutral_venue","team1_id", "team2_id", "game_number", "text_info", "is_stat_available", "match_length", "type", "scout_provider", "info", "stats", "team1_name", "team2_name", "tv_info" , "video_id", "video_id2", "video_id3", "tv_type" ]],
                market: ["id", "col_count", "type", "sequence", "express_id", "cashout", "display_key", "display_sub_key", "group_id", "name", "group_name", "order" ],
                event: ["order", "id", "type_1", "type", "type_id", "original_order", "name", "price", "base", "home_value", "away_value", "display_column"]
            },
            'where': {'game': {'id': game.id}}
        };
        Utils.addPrematchExpressId(request);
        connectionService.subscribe(
            request,
            updateOpenGameData,
            {
                'thenCallback': function (res) {
                    $scope.gameIsLoading = false;
                    $scope.competitionsLoading = false;
                    currentGameSubId = res.subid;
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
     * @name addToFavouriteMarkets
     * @methodOf vbet5.controller:virtualSportsCtrl
     * @description Adds market to favorites list for sport
     * @param {Object} market array of market(s) of same type
     */

    $scope.addToFavouriteMarkets = function addToFavouriteMarkets(market) {
        if (!market) { return; }
        var analyticsText = "";
        $scope.favoriteMarketTypes[$scope.selectedVirtualSport.id] = $scope.favoriteMarketTypes[$scope.selectedVirtualSport.id] || [];
        var index = $scope.favoriteMarketTypes[$scope.selectedVirtualSport.id].indexOf(market.type);
        if (index !== -1) {
            analyticsText = "removeFromVSFavouriteMarkets";
            $scope.favoriteMarketTypes[$scope.selectedVirtualSport.id].splice(index, 1);
            market.isFavorite = false;
            MARKET_GROUP_FAVORITE.count--;
            !MARKET_GROUP_FAVORITE.count && $scope.selectedGroup.id === -3 && ($scope.selectedGroup.id = $scope.gameToShow.availableMarketGroups[1].id);
        } else {
            analyticsText = "addToVSFavouriteMarkets";
            $scope.favoriteMarketTypes[$scope.selectedVirtualSport.id].push(market.type);
            market.isFavorite = true;
            MARKET_GROUP_FAVORITE.count++;
        }

        Storage.set("vs_favorite_market_types", $scope.favoriteMarketTypes);
        analytics.gaSend('send', 'event', 'explorer', analyticsText + (Config.main.sportsLayout),  {'page': $location.path(), 'eventLabel': analyticsText});
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
    $scope.$on('sportsbook.handleDeepLinking', Utils.debounce(function () {
        if ($location.search().vsport) {
            var sportToLoad = Utils.getArrayObjectElementHavingFieldValue($scope.sections, 'id', parseInt($location.search().vsport, 10));
            if (sportToLoad) {
                $scope.loadCompetitions(sportToLoad);
            }
        }
    }, 100));
    loadVirtualSports();

    /**
     * @ngdoc method
     * @name loadVideo
     * @methodOf vbet5.controller:virtualSportsCtrl
     * @description Load video for given game
     * @param {Object} game
     */
    $scope.loadVideo = function loadVideo(game) {
        if (game.tv_type !== streamDetails.tvType || game.video_id !== streamDetails.videoId) {
            if (LEAGUE_ID_MAP[$scope.selectedRanges.selectedSportId]) {
                $scope.leagueVideoState.selected = game.video_id;
            }
            $scope.videoData = null;
            $scope.providerId = game.tv_type;
            GameInfo.getVideoData(game, true).then(function () {
                if (game) {
                    streamDetails.tvType = game.tv_type;
                    streamDetails.videoId = game.video_id;
                    $scope.videoData = game.video_data;
                }
            });
        }
    };
}]);

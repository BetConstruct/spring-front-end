/**
 * @ngdoc controller
 * @name vbet5.controller:virtualSportsCtrl
 * @description
 * virtualSports controller
 */
angular.module('vbet5.betting').controller('virtualSportsCtrl', ['$scope', '$rootScope', '$filter', 'Config', 'ConnectionService', 'Utils', '$location', 'TimeoutWrapper', 'GameInfo', 'Moment', 'Zergling', function ($scope, $rootScope, $filter, Config, ConnectionService, Utils, $location, TimeoutWrapper, GameInfo, Moment, Zergling) {
    'use strict';

    TimeoutWrapper = TimeoutWrapper($scope);
    $rootScope.footerMovable = true;

    var countdownPromise;
    var connectionService = new ConnectionService($scope);

    $scope.selectedGame = null;
    $scope.countdown = 0;
    $scope.selectedRanges = {
        selectedSportId: -1,
        selectedCompetitionId: -1
    };
    $scope.fullScreenVideo = {enabled: false};


    /**
     *
     * @param sport
     */
    function getVirtualSportResults(sport) {
        if($scope.selectedVirtualSport && $scope.selectedVirtualSport.id !== sport.id) {
            $scope.virtualResults = null;
        }
        var command = [1124639783, 1369527874].indexOf(sport.id) !== -1 ? 'get_score_results_last_hour' : 'get_virtual_results_last_hour';

        Zergling.get({"sport_id": sport.id}, command).then(function (data) {
            var result = data;
            if(data && data.details) {
                $scope.virtualResults = data.details.game;
                //add changes... DO NOT FORGET to change swarm url !!!
            }
        })['catch'] (function(reason) {
            console.log('Error', reason);
        })
    }

    /**
     * @ngdoc method
     * @name updateSections
     * @methodOf vbet5.controller:virtualSportsCtrl
     * @description Update Sections
     * @param {object} data sports data
     */
    function updateSections(data) {
        console.log('virtual sports:', data);
        $scope.sections = Utils.objectToArray(data.sport);
        $scope.sections.sort(function (a, b) {return a.order - b.order; });
        if (!$scope.selectedVirtualSport) {
            var sportToLoad = $scope.sections[0];
            if ($location.search().vsport) {
                sportToLoad = Utils.getArrayObjectElementHavingFieldValue($scope.sections, 'id', parseInt($location.search().vsport, 10)) || sportToLoad;
            }
            if (sportToLoad) {
                $scope.loadCompetitions(sportToLoad);
            }
        }
    }

    /**
     * @ngdoc method
     * @name resetVideoAndCountDown
     * @methodOf vbet5.controller:virtualSportsCtrl
     * @description name says it
     *
     * @param {boolean} needToResetVideo true or false
     */
    function resetVideoAndCountDown(needToResetVideo) {
        if ($scope.videoIsLoaded && needToResetVideo && $scope.videoData) {
            $scope.stopVideo();
        }
        TimeoutWrapper.cancel(countdownPromise);
        $scope.remainingSeconds = 0;
        $scope.countdown = 0;
    }

    /**
     * @ngdoc method
     * @name loadVirtualSports
     * @methodOf vbet5.controller:virtualSportsCtrl
     * @description Load virtualSports sections from swarm
     */
    $scope.loadVirtualSports = function loadVirtualSports() {
        resetVideoAndCountDown(true);
        var request = {
            'source': 'betting',
            'what': {'sport': ['id', 'name', 'alias', 'order'], 'game': '@count'},
            'where': {
                'game' : {
                    '@or' : [{ type: 0}, {visible_in_prematch: true, type: 4}]
                },
                'sport': {'id': {'@in': Config.main.virtualSportIds}}
            }
        };

        connectionService.subscribe(
            request,
            updateSections
        );
    };

    /**
     * @ngdoc method
     * @name init
     * @methodOf vbet5.controller:virtualSportsCtrl
     * @description Initialize VirtualSports controller
     */
    function init() {
        $scope.loadVirtualSports();
    }

    init();

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
            var competitionToLoad = $scope.competitions[0];
            if ($location.search().competition) {
                competitionToLoad = Utils.getArrayObjectElementHavingFieldValue($scope.competitions, 'id', parseInt($location.search().competition, 10)) || competitionToLoad;
            }
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
     */
    $scope.loadCompetitions = function loadCompetitions(sport) {

        if ($scope.gameIsLoading || $scope.gamesAreLoading) {
            return;
        }

        var needToResetVideo = sport.id !== $scope.selectedRanges.selectedSportId;
        resetVideoAndCountDown(needToResetVideo);
       // getVirtualSportResults(sport);

        $scope.selectedRanges.selectedSportId = sport.id;
        $scope.selectedVirtualCompetition = null;
        $scope.selectedGame = null;
        $location.search('vsport', sport.id);
        $scope.selectedVirtualSport = sport;
        $scope.competitionsLoading = true;

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
                'thenCallback': function () {
                    $scope.competitionsLoading = false;
                },
                'failureCallback': function () {
                    $scope.competitionsLoading = false;
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
        //if (!$scope.selectedGame) {
        if ($scope.games) {
            var gameToLoad = $scope.games[0];
            if ($location.search().game) {
                gameToLoad = Utils.getArrayObjectElementHavingFieldValue($scope.games, 'id', parseInt($location.search().game, 10)) || gameToLoad;
            }
            $scope.openGame(gameToLoad);
            getVirtualSportResults($scope.selectedVirtualSport);
        }
        console.log('updateGames', $scope.games);
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

        var needToResetVideo = competition.id !== $scope.selectedRanges.selectedCompetitionId;
        resetVideoAndCountDown(needToResetVideo);
        $scope.selectedRanges.selectedCompetitionId = competition.id;
        $scope.selectedVirtualCompetition = null;
        console.log('loadGames', competition);
        $scope.selectedGame = null;
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

    /**
     * @ngdoc method
     * @name countDown
     * @methodOf vbet5.controller:virtualSportsCtrl
     * @description Next game countdown timer
     */
    function countDown() {
        $scope.remainingSeconds -= 1;
        $scope.countdown = Moment.moment.duration(1000 * $scope.remainingSeconds);
        if ($scope.remainingSeconds > 0) {
            countdownPromise = TimeoutWrapper(countDown, 1000);
        }
    }

    var VIRTUAL_ICONS_PATHS = {
       'VirtualHorseRacing': 'virtualhorses',
       'VirtualGreyhoundRacing': 'virtualdogs',
       'VirtualCarRacing': 'virtualcarracing',
       'InspiredTrotting': 'inspiredhorseracing',
       'InspiredGreyhoundRacing': 'inspiredgreyhoundracing',
       'InspiredCycling': 'inspiredcycling',
       'InspiredSpeedway': 'inspiredspeedway',
       'InspiredMotorRacing': 'inspiredmotorracing',
       'InspiredHorseRacing': 'Inspiredhorseracing'
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
            if ($scope.selectedGame.sport.alias === 'VirtualDogs' || $scope.selectedGame.sport.alias === 'VirtualGreyhoundRacing') {
                path += animalsListLength;
            }
            path += VIRTUAL_ICONS_PATHS[$scope.selectedGame.sport.alias] + '/' + imgNumber + '.svg';
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
        var i, virtuals = $scope.selectedGame.info.virtual;
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
                virtuals[i].numberPath = 'images/classic/virtual-betting/' + VIRTUAL_ICONS_PATHS[$scope.selectedGame.sport.alias] + '/' + virtuals[i].RacerTextureID + '.png';
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
        console.log('updateOpenGameData', data);
        var selectedGame = null;
        angular.forEach(data.sport, function (sport) {
            angular.forEach(sport.region, function (region) {
                angular.forEach(region.competition, function (competition) {
                    angular.forEach(competition.game, function (game) {
                        game.sport = {id: sport.id, alias: sport.alias};
                        game.region = {id: region.id};
                        game.competition = {id: competition.id, name: competition.name};
                        selectedGame = game;
                    });
                });
            });
        });
        $scope.selectedGame = selectedGame;
        if (!selectedGame) {
            $scope.loadGames($scope.selectedVirtualCompetition);
            $scope.countdown = 0;
            return;
        }
        if (!Config.main.disableVirtualSportsCountDown && $scope.selectedGame.info && $scope.selectedGame.info.virtual && $scope.selectedGame.info.virtual.length && $scope.selectedGame.info.virtual[$scope.selectedGame.info.virtual.length - 1].RemainingTime !== undefined) {
            if ($scope.remainingSeconds < 1) {
                $scope.remainingSeconds = $scope.selectedGame.info.virtual[$scope.selectedGame.info.virtual.length - 1].RemainingTime;
                TimeoutWrapper.cancel(countdownPromise);
                countDown();
            } else if ($scope.selectedGame.info.virtual[$scope.selectedGame.info.virtual.length - 1].RemainingTime === 0) {
                $scope.remainingSeconds = 0;
            }
        }

        $scope.selectedGame.markets = Utils.objectToArray($scope.selectedGame.market);
        if ($scope.selectedGame.market) {
            $scope.selectedGame.markets.sort(Utils.orderSorting);
        }

        // Group markets by name
        var selectedGameMarkets = {};
        var orderSet = 0;

        angular.forEach($scope.selectedGame.markets, function (market) {
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

        $scope.selectedGame.markets = Utils.objectToArray(selectedGameMarkets);

         angular.forEach($scope.selectedGame.markets, function (market) {
            market.events = Utils.objectToArray(market.event);
            if (market.events) {
                market.events.sort(Utils.orderSorting);
                market.named_events = Utils.groupByItemProperty(market.events, 'type');
            }
            angular.forEach(market.events, function (event) {
                event.name = $filter('improveName')(event.name, $scope.selectedGame);
                event.name = $filter('removeParts')(event.name, [market.name]);

                getEventInfo(event);
            });
        });

        if (GameInfo.hasVideo($scope.selectedGame)) {
            if ($scope.selectedGame.video_data === undefined) {
                $scope.selectedGame.video_data = null; //not to call this several times before getVideoData fills the field
                $scope.providerId = $scope.selectedGame.tv_type;
                GameInfo.getVideoData($scope.selectedGame, true).then(function () {
                    if ($scope.selectedGame) {
                        $scope.videoData = $scope.selectedGame.video_data;
                    }
                });
            }
        }
        $scope.selectedGame.isVirtual = true;
        $scope.selectedGame.displayTitle = $scope.selectedGame.text_info;

        console.log('updateGameData', $scope.selectedGame);
    }

    /**
     * @ngdoc method
     * @name openGame
     * @methodOf vbet5.controller:virtualSportsCtrl
     * @description loads selected game data
     * @param {Object} game game object
     */
    $scope.openGame = function openGame(game) {
        $location.search('game', game.id);
        $scope.remainingSeconds = 0;
        TimeoutWrapper.cancel(countdownPromise);
        $scope.gameIsLoading = true;
        $scope.selectedGame = null;

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
                },
                'failureCallback': function () {
                    $scope.gameIsLoading = false;
                }
            }
        );
    };


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


}]);
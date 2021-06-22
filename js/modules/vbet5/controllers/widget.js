/**
 * @ngdoc controller
 * @name vbet5.controller:widgetCtrl
 * @description
 * Custom widgets controller
 */
VBET5.controller('widgetCtrl', ['$rootScope', '$scope', 'TimeoutWrapper', '$window', 'Config', 'ConnectionService', 'Zergling', 'Utils', 'GameInfo', function($rootScope, $scope, TimeoutWrapper, $window, Config, ConnectionService, Zergling, Utils, GameInfo) {
    'use strict';


    TimeoutWrapper = TimeoutWrapper($scope);
    var timer;
    var liveGamesSubId;
    var maxGamesCount = 5;
    var sliderDuration = 15000;
    var slideIndex = 0;
    var connectionService = new ConnectionService($scope);

    $scope.vbet5AvailableAnimations  = {'Soccer': true, 'Tennis': true, 'Basketball': true};

    $scope.liveGames = [];
    $scope.newSlideAvailable = false;
    $scope.activeSlideGame = {};


    /**
     * @ngdoc method
     * @name continueSlide
     * @methodOf vbet5.controller:widgetCtrl
     * @description continues sliding to next games
     */
    $scope.continueSlide = function continueSlide() {
        if($scope.liveGames.length === 1) {
            return;
        }
        timer = TimeoutWrapper(function() {
            console.log('Widget Timeout', $scope.activeSlideGame.id);

            $scope.newSlideAvailable = false;
            $scope.widgetSlide('next');
        }, sliderDuration);

    }

    /**
     * @ngdoc method
     * @name loadRandomLiveGames
     * @methodOf vbet5.controller:widgetCtrl
     * @param {Number} gamesCount number of games to be loaded
     * @description loads random live games
     */
    function loadRandomLiveGames(gamesCount) {
        Zergling.get({
            'source': 'betting',
            'what': {
                'game':['id']
            },
            'where': {
                'sport': {
                    'alias': {
                        '@nin': 'Soccer'
                    }
                },
                'game': {
                    'type': 1
                }
            }
        })
        .then(function(response) {
            if(!response || !response.data) {
                return;
            }

            $scope.liveGames = $scope.liveGames.concat(Utils.objectToArray(response.data.game).slice(0,gamesCount));

            if($scope.liveGames.length) {
                loadGame($scope.liveGames[slideIndex].id);
            }

        })['catch'](function(reason) {
            console.log(reason);
        })
    }


    /**
     * @ngdoc method
     * @name loadSoccerLiveGames
     * @methodOf vbet5.controller:widgetCtrl
     * @description when no games pre selected from backend, load random live soccer games
     */
    function loadSoccerLiveGames() {
        Zergling.get({
            'source': 'betting',
            'what': {
                'game': ['id']
            },
            'where': {
                'sport':{'alias': {'@in': 'Soccer'}},
                'game': {'type': 1}
            }
        })
        .then(function(response) {
            if(!response || !response.data || !response.data.game) {
                return;
            }

            $scope.liveGames = Utils.objectToArray(response.data.game);

            if(!$scope.liveGames.length) {
                loadRandomLiveGames(maxGamesCount);
            } else {
                if($scope.liveGames.length < maxGamesCount) {
                    loadRandomLiveGames(maxGamesCount - $scope.liveGames.length);
                } else {
                    loadGame($scope.liveGames[slideIndex].id);
                }
            }

        })['catch'](function(reason) {
            console.log(reason);
        })
    }

     /**
     * @ngdoc method
     * @name loadGame
     * @methodOf vbet5.controller:widgetCtrl
     * @param {Number} gameId game id
     * @description checks if game is Live game
     */
    function loadGame(gameId) {
        Zergling.get({
            'source': 'betting',
            'what': {
                'game': ['id']
            },
            'where': {'game': {'id': gameId}}
        })
        .then(function(response) {
            if(response && response.data && response.data.game && !Utils.isObjectEmpty(response.data.game)) {
                $scope.activeSlideGame = Utils.objectToArray(response.data.game)[0];
                $scope.newSlideAvailable = true;
                $scope.continueSlide();

            } else {
                $scope.liveGames.splice(slideIndex,1);

                if(!$scope.liveGames.length) {
                    loadSoccerLiveGames();
                    return;
                }

                if(slideIndex === $scope.liveGames.length) {
                    slideIndex = 0;
                }

                loadGame($scope.liveGames[slideIndex].id);
            }
        })['catch'](function(reason) {
            console.log('live Widget catch',reason);
        });
    }


    /**
     * @ngdoc method
     * @name broadCastGameDetails
     * @methodOf vbet5.controller:widgetCtrl
     * @description handles game click
     * @param {Object} game
     */
    $scope.broadCastGameDetails = function broadCastGameDetails(game) {
        var message = {action: 'open_game'};
        if(game) {
            message.data = {
                gameId: game.id,
                competitionId: game.competition.id,
                regionId: game.region.id,
                sportId: game.sport.id,
                type: game.type === 1? 1: 0
            };
        } else {
            message.data = {gameId: $scope.activeSlideGame.id};
        }
        $window.parent.postMessage(
            message,
            '*'
        );
    };

    /**
     * @ngdoc method
     * @name pauseSlider
     * @methodOf vbet5.controller:widgetCtrl
     * @description name describes it all
     */
    $scope.pauseSlider = function pauseSlider() {
        TimeoutWrapper.cancel(timer);
    };

    /**
     * @ngdoc method
     * @name updateGame
     * @methodOf vbet5.controller:widgetCtrl
     * @description updates games list
     * @param {Array} games list of games
     */
    function updateGame(games) {
        if(!games || !games.game || !Utils.objectToArray(games.game).length) {
            loadSoccerLiveGames();
            return;
        }

        $scope.liveGames = Utils.objectToArray(games.game);
        if(slideIndex >= $scope.liveGames.length) {
            slideIndex = 0;
        }
        loadGame($scope.liveGames[slideIndex].id);
    }

    /**
    * @ngdoc method
    * @name getLiveGamesList
    * @methodOf vbet5.controller:widgetCtrl
    * @description subscribe for favorite/promoted games and load live games list when these games become live
    */
    $scope.getLiveGamesList = function getLiveGamesList() {
        if(!Config.main.loadLiveWidgetGamesFrom) {
            loadSoccerLiveGames();
            return;
        }
        Config.env.live = true;
        var request = {
            'source': 'betting',
            'what': {
                'game': ['id', 'type']
            },
            'where': {
                'game': {'type': 1}
            }
        };

        request.where.game[Config.main.loadLiveWidgetGamesFrom.type] = true;

        connectionService.subscribe(
            request,
            updateGame,
            {
                'thenCallback': function (result) {
                    if(result.subid) {
                        liveGamesSubId = result.subid;
                    }
                }
            }
        );
    };

    /**
     * @ngdoc method
     * @name widgetSlide
     * @methodOf vbet5.controller:widgetCtrl
     * @description slides to next/previous slide
     * @param {String} direction prev/next direction to slide
     */
    $scope.widgetSlide = function widgetSlide(direction) {
        if (direction === 'prev') {
                slideIndex = slideIndex > 0 ? slideIndex-1 : $scope.liveGames.length-1;
        } else if(direction === 'next') {
                slideIndex = slideIndex < $scope.liveGames.length-1 ? slideIndex + 1 : 0;
        }
        TimeoutWrapper.cancel(timer);
        $scope.newSlideAvailable = false;
        loadGame($scope.liveGames[slideIndex].id);
    };

    /**
     * @ngdoc method
     * @name openGameById
     * @methodOf vbet5.controller:widgetCtrl
     * @description Load game by id
     * @param {String} game id as string or number
     */
    $scope.openGameById = function openGame (gameId) {
        gameId = parseInt(gameId, 10);
        if (!gameId) {
            return;
        }

        var request = {
            'source': 'betting',
            'what': {
                'sport': ['alias'],
                'game': ['id', 'start_ts', 'team1_name', 'team2_name', 'info', 'markets_count', 'type', 'team1_id', 'team2_id', 'team1_external_id', 'team2_external_id', 'is_live', 'last_event', 'stats']
            },
            'where': {
                'game': {'id': gameId}
            }
        };

        function updateWidgetGame (response) {
            if (response && response.sport) {
                angular.forEach(response.sport, function (sport) {
                    angular.forEach(sport.game, function (game) {
                        game.sport = sport;
                        $scope.openGame = game;
                        $scope.openGame.activeFieldType = 'field';
                        GameInfo.extendLiveGame($scope.openGame);
                    });
                });
            }
        }

        connectionService.subscribe(
            request,
            updateWidgetGame
        );
    };

    $scope.$on('bet', function(event, data) {
        if(!data) {
            return;
        }
        var message ={
            action: 'place_bet',
            data: {
                'event': data.event.id,
                'market': data.market.id,
                'type': data.game.type,
                'sport': data.game.sport.id,
                'region': data.game.region.id,
                'competition': data.game.competition.id,
                'game': data.game.id,
                'start_ts': data.game.start_ts
            }
        };
        $window.parent.postMessage(message,'*');
    });

    $scope.$on('$routeChangeStart', function() {
        TimeoutWrapper.cancel(timer);
        if(liveGamesSubId) {
            Zergling.unsubscribe(liveGamesSubId);
        }
    });
}]);

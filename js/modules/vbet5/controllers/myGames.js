/* global VBET5 */
/**
 * @ngdoc controller
 * @name vbet5.controller:myGamesCtrl
 * @description
 *  "My games" controller.
 *  Responsible for managing and showing "my games" block.
 *  Games ids' list is kept in $rootScope.myGames
 *  and is syncronized with local storage on every update(adding or removing a game)
 */
VBET5.controller('myGamesCtrl', ['$scope', '$rootScope', '$location', '$route', 'Utils', 'Storage', 'ConnectionService', 'Zergling', 'Config', 'GameInfo', '$cookies', '$window',  function ($scope, $rootScope, $location, $route, Utils, Storage, ConnectionService, Zergling, Config, GameInfo, $cookies, $window) {
    'use strict';

    $scope.myGamesloaded = false;
    $scope.offset = 0;
    $scope.allGamesCount = 0;
    $rootScope.leftMenuFavorites = [];

    var allGames, subId = null;
    var connectionService = new ConnectionService($scope);

    $rootScope.myGames = $cookies.getObject("myGames") || Storage.get('myGames') || [];
    $rootScope.myCompetitions = Storage.get('myCompetitions') || [];

    /**
     * @ngdoc method
     * @name getVisibleGames
     * @methodOf vbet5.controller:myGamesCtrl
     * @description Returns array of visible games
     *
     * @param {Array} games all "my games"
     * @returns {Array} visible games
     */
    function getVisibleGames(games) {
        return games.slice($scope.offset, $scope.offset + $scope.gamesToShow);
    }

    $scope.$on('widescreen.on', function () {
        $scope.gamesToShow = 4;
        $scope.games = allGames && getVisibleGames(allGames);
    });

    $scope.$on('widescreen.off', function () {
        $scope.gamesToShow = 3;
        $scope.games = allGames && getVisibleGames(allGames);
    });


    /**
     * @ngdoc method
     * @name updateMyGames
     * @methodOf vbet5.controller:myGamesCtrl
     * @description receives game data from swarm, modifies structure a little bit and sets needed scope variables
     *
     * @param {Object} data games data object
     */
    function updateMyGames(data) {
        console.log('favorite games from swarm', data);
        var games = [];
        angular.forEach(data.sport, function (sport) {
            angular.forEach(sport.region, function (region) {
                angular.forEach(region.competition, function (competition) {
                    angular.forEach(competition.game, function (game) {
                        game.sport = {id: sport.id, alias: sport.alias, name: sport.name};
                        game.competition = {id: competition.id, name: competition.name};
                        game.region = {id: region.id};
                        if (game.info && game.info.shirt1_color === game.info.shirt2_color) {
                            game.info.shirt1_color = "ccc";
                            game.info.shirt2_color = "f00";
                        }
                        if (game.type === 1 && (game.sport.alias === "Soccer" || game.sport.alias === "CyberFootball")) {
                            GameInfo.extendLiveGame(game);
                            GameInfo.generateTimeLineEvents(game, $scope);
                            if (game.live_events) { //need this for sorting
                                game.live_events.map(function (event) {
                                    event.add_info_order = parseInt(event.add_info, 10);
                                });
                            }
                        }
                        if (game.type === 1 && game.sport.alias === "HorseRacing") {
                            GameInfo.getHorseRaceInfo(game.info);
                        }

                        GameInfo.hasVideo(game); // check availability of video

                        games.push(game);
                    });
                });
            });
        });
        games.sort(function (a, b) {return a.start_ts - b.start_ts; }); //sort by date
        // remove games that don't exist anymore by taking game ids from update (except those, which are already deleted from $rootScope.myGames)
        $rootScope.leftMenuFavorites = games;
        $rootScope.myGames = games.map(function (game) {return game.id; }).reduce(function (acc, curr) {if ($rootScope.myGames.indexOf(curr) !== -1) {acc.push(curr); }  return acc; }, []);

        Storage.set('myGames', $rootScope.myGames);
        checkAndSetCookie('myGames', $rootScope.myGames);
        allGames = games;
        $scope.allGamesCount = allGames.length;
        if ($scope.offset > 0 && $scope.offset + $scope.gamesToShow > $scope.allGamesCount) {
            $scope.offset--;
        }
        $scope.games = getVisibleGames(allGames);
        $scope.myGamesloaded = true;
    }

    $scope.framesCount = GameInfo.framesCount;


    /**
     * @ngdoc method
     * @name slide
     * @methodOf vbet5.controller:myGamesCtrl
     * @description Slides visible games left or right by changing $scope's **offset** variable
     *
     * @param {String} direction direction, 'left' or 'right'
     */
    $scope.slide = function slide(direction) {
        if (direction === 'left') {
            if ($scope.offset > 0) {
                $scope.offset--;
            }
        } else if (direction === 'right') {
            if ($scope.offset < allGames.length - $scope.gamesToShow) {
                $scope.offset++;
            }
        }
        $scope.games = getVisibleGames(allGames);
    };


    /**
     * @ngdoc method
     * @name loadMyGames
     * @methodOf vbet5.controller:myGamesCtrl
     * @description Loads all games(having ids from $rootScope.myGames) and subscribes to updates
     *
     */
    function loadMyGames() {
        $scope.myGamesloaded = false;

        if (!$rootScope.myGames.length) {
            updateMyGames({"sport": {}});
            return;
        }

        connectionService.subscribe(
            {
                'source': 'betting',
                'what': {
                    'game': [],
                    'sport': ['id', 'alias', 'name'],
                    'competition': ['id', 'name'],
                    'region': ['id']
                },
                'where': {
                    'game': {
                        'id': {'@in': $rootScope.myGames }
                    }
                }
            },
            updateMyGames,
            {
                'thenCallback': function (response) {
                    subId = response.subid;
                    $scope.myGamesloaded = true;
                }
            }
        );
    }


    // This acts like an initializer when the app is loaded. If there are myGames it subscribes to them during the initial load.
    var myGamesWatcher = $rootScope.$watch('myGames.length', function myGamesWatcherFunc() {
        if (subId) {
            connectionService.unsubscribe(subId);
            subId = null;
        }
        loadMyGames();
    });

    $scope.$on('$destroy', function () {
        if (myGamesWatcher) {
            myGamesWatcher();
        }
    });

    $rootScope.$on('game.addToMyCompetition', function (event, competition) {
        if ($rootScope.myCompetitions === undefined) {
            $rootScope.myCompetitions = [];
        }
        if ($rootScope.myCompetitions.indexOf(competition.id) === -1) {
            competition.indexInMyCompetitions = 0;
            $rootScope.myCompetitions.push(competition.id);
        }

        Storage.set('myCompetitions', $rootScope.myCompetitions);
        loadMyGames();
    });


    $rootScope.$on('game.addToMyGames', function (event, game) {
        if (!$scope.myGamesloaded) {
            return;
        }
        if ($rootScope.myGames === undefined) {
            $rootScope.myGames = [];
        } else {
            if (angular.isArray(game)) {
                angular.forEach(game, function (value) {
                    if (Utils.isInArray($rootScope.myGames, value.id) < 0) {
                        value.indexInMyGames = 0;
                        $rootScope.myGames.push(value.id);
                    }
                });
            } else {
                if (Utils.isInArray($rootScope.myGames, game.id) < 0) {
                    game.indexInMyGames = 0;
                    $rootScope.myGames.push(game.id);
                }

            }
        }

        Storage.set('myGames', $rootScope.myGames);
        checkAndSetCookie('myGames', $rootScope.myGames);
    });

    $rootScope.$on('game.removeGameFromMyGames', function (event, game) {
        $scope.removeGameFromSaved(game);
    });

    $rootScope.$on('game.removeGameFromMyCompetition', function (event, competition) {
        $scope.removeGameFromMyCompetition(competition);
    });


    /**
     * @ngdoc method
     * @name removeFavoriteGame
     * @methodOf vbet5.controller:myGamesCtrl
     * @description $emit event to deleting game from myFavourites
     *
     * @param {Object} game game object
     */
    $scope.removeFavoriteGame = function (game) {
        $scope.$emit('game.removeGameFromMyGames', game);
        $scope.$emit('game.removeGameFromMyCompetition', game.competition);
    };

    /**
     * @ngdoc method
     * @name removeGameFromSaved
     * @methodOf vbet5.controller:myGamesCtrl
     * @description removes game from "my games" and updates scope and local storage
     *
     * @param {Object} game game object
     */
    $scope.removeGameFromSaved = function removeGameFromSaved(data) {
        console.log('game.addToMyGames', '$rootScope.myGames', $rootScope.myGames);
        if (!$scope.myGamesloaded) {
            return;
        }
        /**
         * remove from $rootScope and local storage
         * @param game
         */
        function removeGame(game) {
            var pos = $rootScope.myGames.indexOf(game.id);

            if (typeof game === 'object') {
                game.indexInMyGames = -1;
            }

            $rootScope.myGames.splice(pos, 1);
            Storage.set('myGames', $rootScope.myGames);
            checkAndSetCookie('myGames', $rootScope.myGames);
            if ($rootScope.myGames.length === 0) {
                if ($rootScope.myCasinoGames && $rootScope.myCasinoGames.length) {
                    $rootScope.env.sliderContent = 'casinoSavedGames';
                } else {
                    $rootScope.env.showSlider = false;
                    $rootScope.env.sliderContent = '';
                }
            }
        }

        if (angular.isArray(data)) {
            var i;
            for (i = 0; i < data.length; i++) {
                removeGame(data[i]);
            }
        } else {
            removeGame(data);
        }
    };

    /**
     * @ngdoc method
     * @name removeGameFromMyCompetition
     * @methodOf vbet5.controller:myGamesCtrl
     * @description removes competition from "my competitions" and updates scope and local storage
     *
     * @param {Array} || {String}
     */
    $scope.removeGameFromMyCompetition = function removeGameFromMyCompetition(competition) {
        function removeCompetition(competition) {
            var pos = $rootScope.myCompetitions.indexOf(competition);
            if (pos > -1) {
                $rootScope.myCompetitions.splice(pos, 1);

                Storage.set('myCompetitions', $rootScope.myCompetitions);

                if ($rootScope.myCompetitions.length !== 0) {
                    loadMyGames();
                }
            }
        }
        if (angular.isArray(competition)) {
            var i;
            for (i = 0; i < competition.length; i++) {
                removeCompetition(competition[i]);
            }
        } else {
            competition.indexInMyCompetitions = -1;
            removeCompetition(competition.id);
        }


    };



    /**
     * @ngdoc method
     * @name gotoGame
     * @methodOf vbet5.controller:myGamesCtrl
     * @description  Navigates to provided game
     * @param {Object} game game object
     */
    function gotoGame(game) {
        $rootScope.env.sliderContent = '';
        $rootScope.env.showSlider = false;
        var neededPath = Utils.getPathAccordintToAlias(game.sport.alias);
        var locationParams = {
            'game' : game.id,
            'sport': Config.main.showFavoriteGamesInSportList && Config.main.sportsLayout === "modern" ? -1 : game.sport.id,
            'competition': game.competition.id,
            'type': game.type === 2 ? 0 : game.type,
            'region': game.region.id
        };
        var absoluteLink = getPrefixLink('#' + neededPath);
        if (!absoluteLink) {
            $location.search(locationParams);
            if ($location.path() !== neededPath + '/') {
                $location.path(neededPath);
            } else {
                $route.reload();
            }
        } else {
            $window.location.href = absoluteLink + '/?game=' + locationParams.game + '&sport=' + locationParams.sport + '&competition=' + locationParams.competition + '&region=' + locationParams.region + '&type=' + locationParams.type;
        }
    };


    /**
     * @ngdoc method
     * @name chooseFavorite
     * @methodOf vbet5.controller:myGamesCtrl
     * @description  Navigates to chosen favorite game
     * @param {Object} game - game object
     */
    $scope.chooseFavorite = function chooseFavorite(game) {
        if (Config.main.sportsLayout !== "modern" && $location.path() === "/sport/") {
            switch (Config.main.sportsLayout) {
                case "classic":
                case "euro2016":
                    $rootScope.$broadcast("sportsbook.selectData", {type: "popular.game", data: game});
                    break;
                case "asian":
                    $rootScope.$broadcast("asianView.selectFavorite", game);
                    break;
                case "combo":
                    if ($location.search().game !== game.id) {
                        $location.search({
                            "game": game.id,
                            "sport": game.sport.id,
                            "competition": game.competition.id,
                            "type": game.type === 2 ? 0 : game.type,
                            "region": game.region.id
                        });
                        $rootScope.$broadcast("comboView.handleDeepLinking");
                    }
                    break;
            }
            $rootScope.$broadcast("slider.close");
        } else {
            gotoGame(game);
        }
    };

    /**
     * @ngdoc method
     * @name checkAndSetCookie
     * @methodOf vbet5.controller:myGamesCtrl
     * @description  Sets cookie if enabled in config
     * @param {String} Cookie key
     * @param {String} Cookie value
     */
    function checkAndSetCookie(key, value) {
        if (Config.main.useAuthCookies) {
            var cookieOptions = {
                domain: $window.location.hostname.split(/\./).slice(-2).join("."),
                path: "/",
                expires: new Date((new Date()).getTime() + Config.main.authSessionLifetime)
            };
            $cookies.putObject(key, value, cookieOptions);
        }
    }

    /**
     * @ngdoc method
     * @name prefixLinkIfNeeded
     * @methodOf vbet5.service.TopMenu
     * @description prefixes given link with hostname depending on config
     *
     * @param {String} link relative link
     * @returns {String} absolute or relative link depending on match in config
     */
    function getPrefixLink(link) {
        if (Config.main.domainSpecificPrefixes && Config.main.domainSpecificPrefixes[$window.location.hostname] && (Config.main.domainSpecificPrefixes[$window.location.hostname][link] || Config.main.domainSpecificPrefixes[$window.location.hostname][link + '/'])) {
            return (Config.main.domainSpecificPrefixes[$window.location.hostname][link] || Config.main.domainSpecificPrefixes[$window.location.hostname][link + '/']) + link;
        }
        return null;
    }
    
}]);

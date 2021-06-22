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
VBET5.controller('myGamesCtrl', ['$scope', '$rootScope', '$location', '$route', 'Utils', 'Storage', 'ConnectionService', 'Zergling', 'Config', 'GameInfo', '$cookies', '$window', 'analytics', function ($scope, $rootScope, $location, $route, Utils, Storage, ConnectionService, Zergling, Config, GameInfo, $cookies, $window, analytics) {
    'use strict';

    $scope.myGamesloaded = false;
    $scope.offset = 0;
    $scope.allGamesCount = 0;
    $rootScope.leftMenuFavorites = [];

    var allGames, subId = null;
    var connectionService = new ConnectionService($scope);

    $rootScope.myGames = $cookies.getObject("myGames") || Storage.get('myGames') || [];

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
                        if (game.type === 1 && game.sport.alias === "Soccer") {
                            GameInfo.extendLiveGame(game);
                            GameInfo.generateTimeLineEvents(game, $scope);

                            if (game.live_events) { //need this for sorting
                                game.live_events.map(function (event) {
                                    event.add_info_order = parseInt(event.add_info, 10);
                                });
                            }
                        }
                        if (game.type === 1 && game.sport.alias === "HorseRacing") {
                            GameInfo.getRacingInfo(game.id, game.info);
                        }

                        GameInfo.hasVideo(game); // check availability of video
                        GameInfo.checkITFAvailability(game);
                        if (game.market) {
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
                                game.marketInfo.markets.sort(Utils.orderSorting);
                                game.competition = {id: competition.id};
                            } else {
                                game.marketInfo = {};
                            }
                        }

                        games.push(game);
                    });
                });
            });
        });
        // remove games that don't exist anymore by taking game ids from update (except those, which are already deleted from $rootScope.myGames)
        $rootScope.leftMenuFavorites = games.sort(Utils.orderByStartTs); //sort by date
        $rootScope.myGames = games.map(function (game) {return game.id; }).reduce(function (acc, curr) {if ($rootScope.myGames.indexOf(curr) !== -1) {acc.push(curr); }  return acc; }, []);

        Storage.set('myGames', $rootScope.myGames);
        Utils.checkAndSetCookie('myGames', $rootScope.myGames, Config.main.authSessionLifetime);
        allGames = games;
        $scope.allGamesCount = allGames.length;
        if ($scope.offset > 0 && $scope.offset + $scope.gamesToShow > $scope.allGamesCount) {
            $scope.offset = Math.max($scope.allGamesCount - $scope.gamesToShow, 0);
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

        var request = {
            'source': 'betting',
            'what': {
                'game': ["id", "markets_count", "start_ts", "is_live", "is_blocked", "is_neutral_venue","team1_id", "team2_id", "game_number", "text_info", "is_stat_available", "type",  "info", "stats", "team1_name", "team2_name", "tv_info","match_length","last_event","live_events"  ],
                'sport': ['id', 'alias', 'name'],
                'competition': ['id', 'name'],
                'region': ['id']
            },
            'where': {
                'game': {
                    'id': {'@in': $rootScope.myGames}
                }
            }
        };

        if (!Config.main.hideMarketFromLeftMenu) {
            request.what.game = [request.what.game]; // outer join for games that don't have P1XP2 or P1P2
            request.what.market = ['base', 'type', 'name', 'express_id', 'id'];
            Utils.addPrematchExpressId(request);

            request.what.event = [];
            request.where.market = {
                display_key: 'WINNER',
                display_sub_key: 'MATCH'
            };
        }

        connectionService.subscribe(
            request,
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
        analytics.gaSend('send', 'event', 'explorer', 'addToMyGames' + (Config.main.sportsLayout),  {'page': $location.path(), 'eventLabel': "addToMyGames"});
        console.log('gaSend-', 'addToMyGames');
        Utils.checkAndSetCookie('myGames', $rootScope.myGames, Config.main.authSessionLifetime);
    });

    $rootScope.$on('game.removeGameFromMyGames', function (event, game) {
        $scope.removeGameFromSaved(game);
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
        $rootScope.$broadcast('game.removeGameFromMyGames', game);
    };

    /**
     * @ngdoc method
     * @name removeGameFromSaved
     * @methodOf vbet5.controller:myGamesCtrl
     * @description removes game from "my games" and updates scope and local storage
     *
     * @param {Object} data game object
     * @param {Boolean} skipAnalytics
     */
    $scope.removeGameFromSaved = function removeGameFromSaved(data, skipAnalytics) {
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

            Utils.checkAndSetCookie('myGames', $rootScope.myGames, Config.main.authSessionLifetime);
            if ($rootScope.myGames.length === 0 && $rootScope.env.sliderContent === 'savedGames') {
                if ($rootScope.myCasinoGames && $rootScope.myCasinoGames.length) {
                    $rootScope.env.sliderContent = 'casinoSavedGames';
                }
            }
        }

        if (angular.isArray(data)) {
            var i, j;
            for (i = 0, j = data.length; i < j; i++) {
                removeGame(data[i]);
            }
        } else {
            removeGame(data);
        }

        if (!skipAnalytics) {
            analytics.gaSend('send', 'event', 'explorer', 'removeFromMyGames' + (Config.main.sportsLayout), {'page': $location.path(),'eventLabel': "removeFromMyGames"});
            console.log('gaSend-', 'removeFromMyGames');
        }
    };

    $scope.removeAllGamesFromSaved = function removeAllGamesFromSaved() {
        $scope.removeGameFromSaved($rootScope.leftMenuFavorites, true);
        analytics.gaSend('send', 'event', 'explorer', 'removeAllGamesFromSaved' + (Config.main.sportsLayout), {'page': $location.path(),'eventLabel': "removeAllGamesFromSaved"});
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
            'game': game.id,
            'sport': Config.main.showFavoriteGamesInSportList && Config.main.sportsLayout === "modern" ? -1 : game.sport.id,
            'competition': game.competition.id,
            'type': game.type === 2 ? 0 : game.type,
            'region': game.region.id
        };
        var absoluteLink = Utils.getPrefixLink('#' + neededPath);
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
    }


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
}]);

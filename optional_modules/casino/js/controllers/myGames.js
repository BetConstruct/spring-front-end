/**
 * @ngdoc controller
 * @name CASINO.controller:casinoMyGamesCtrl
 * @description
 *  "My casino games" controller.
 *  Responsible for managing and showing "my casino games" block.
 *  Games list is kept in $rootScope.myCasinoGames
 *  and is syncronized with local storage on every update(adding or removing a casino game)
 */

CASINO.controller('casinoMyGamesCtrl', ['$scope', '$rootScope', 'Storage', '$location', 'CConfig', 'Config', '$window', '$cookies', 'analytics', 'casinoManager', 'Utils', 'casinoData', function($scope, $rootScope, Storage, $location, CConfig, Config, $window, $cookies, analytics, casinoManager, Utils, casinoData) {
    'use strict';

    (function init(){
        var gameIds = $cookies.getObject("myCasinoGames") || Storage.get("myCasinoGames") || [];
        $scope.confData = CConfig;
        $scope.casinoGamesLoaded = false;
        if (gameIds.length) {
            casinoData.getGames({id: gameIds} ).then(function (response) {
                if (response && response.data && response.data.status !== -1) {
                    $rootScope.myCasinoGames = response.data.games;
                    $rootScope.myCasinoGames.sort(function (game1, game2) {
                        return gameIds.indexOf(game1.id) - gameIds.indexOf(game2.id);
                    });
                    if ($rootScope.myCasinoGames.length) { // This needs to be done for properly adding 'active' class for fav games
                        $rootScope.myCasinoGamesIds = $rootScope.myCasinoGames.reduce(function makeObject(acc, curr) {
                            acc[curr.id] = true;
                            return acc;
                        }, {});
                    } else {
                        $rootScope.myCasinoGamesIds = {};
                    }
                    showVisibleGames();
                }
            });

        } else {
            $rootScope.myCasinoGames = [];
            $rootScope.myCasinoGamesIds = {};
        }
    })();


    /**
     * @ngdoc method
     * @name getVisibleGames
     * @methodOf CASINO.controller:casinoMyGamesCtrl
     * @description Returns array of visible games
     *
     * @param {Array} games all "my casino games"
     * @returns {Array} visible games
     */
    function getVisibleGames(games) {
        return games.slice(0).reverse().slice($scope.offset, $scope.offset + $scope.GAMES_TO_SHOW);
    }

    /**
     * @ngdoc method
     * @name showVisibleGames
     * @methodOf CASINO.controller:casinoMyGamesCtrl
     * @description get array of visible games and show their
     */
    function showVisibleGames() {
        if (!$rootScope.myCasinoGames) {
            return;
        }
        $scope.offset = 0;
        $scope.casinoGamesLoaded = false;
        $scope.myCasinoSavedGames = getVisibleGames($rootScope.myCasinoGames);
        $scope.casinoGamesLoaded = true;
    }

    $scope.$on('widescreen.on', function () {
        $scope.GAMES_TO_SHOW = CConfig.main.myGamesToShow.wideScreenOn;
        showVisibleGames();
    });

    $scope.$on('widescreen.off', function () {
        $scope.GAMES_TO_SHOW = CConfig.main.myGamesToShow.wideScreenOff;
        showVisibleGames();
    });

    /**
     * @ngdoc method
     * @name slide
     * @methodOf CASINO.controller:casinoMyGamesCtrl
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
            if ($scope.offset < $rootScope.myCasinoGames.length - $scope.GAMES_TO_SHOW) {
                $scope.offset++;
            }
        }

        $scope.myCasinoSavedGames = getVisibleGames($rootScope.myCasinoGames);
    };

    function mapMyGames(games) {
        return games.map(function (game) {
            return game.id;
        });
    }

    /**
     * @ngdoc method
     * @name removeGameFromSaved
     * @methodOf CASINO.controller:casinoMyGamesCtrl
     * @description removes game from "my games" and updates scope and local storage
     *
     * @param {Number} gameID gameID number
     * @param {Boolean} skipAnalytics
     */

    $scope.removeGameFromSaved = function removeGameFromSaved(gameID, skipAnalytics) {
        var games = $rootScope.myCasinoGames, i, j;
        $rootScope.myCasinoGamesIds[gameID] = false;

        for (i = 0, j = games.length; i < j; i += 1) {
            if (games[i].id === gameID) {
                games.splice(i, 1);
                break;
            }
        }

        if ($scope.offset > 0 && $scope.offset + $scope.GAMES_TO_SHOW > games.length) {
            $scope.offset--;
        }

        $scope.myCasinoSavedGames = getVisibleGames(games);
        var gameIds =  mapMyGames(games);

        Storage.set('myCasinoGames', gameIds);

        if(!skipAnalytics){
            analytics.gaSend('send', 'event', 'explorer', "removeFromMyCasinoGames" + (Config.main.sportsLayout),  {'page': $location.path(), 'eventLabel': "removeFromMyCasinoGames"});
            console.log('gaSend-',"removeFromMyCasinoGames");
        }

        Utils.checkAndSetCookie("myCasinoGames", gameIds, Config.main.authSessionLifetime);

        if (games.length === 0 && $rootScope.myGames.length) {
            $rootScope.env.sliderContent = 'savedGames';
        }
    };
    /**
     * @ngdoc method
     * @name openGame
     * @methodOf CASINO.controller:casinoMyGamesCtrl
     * @description  open selected game
     */

    $scope.openGame = function openGame(game, gameType) {
        $rootScope.env.sliderContent = '';
        $rootScope.env.showSlider = false;

        casinoManager.navigateToRightRouteAndOpenGame(game, gameType);
    };

    $scope.$on('game.addToMyCasinoGames', function (event, game) {
        if ($rootScope.myCasinoGames === undefined) {
            $rootScope.myCasinoGames = [];
        }
        $rootScope.myCasinoGames.push(game);
        $rootScope.myCasinoGamesIds[game.id] = true;
        var gamesIds = mapMyGames($rootScope.myCasinoGames);

        Storage.set('myCasinoGames', gamesIds);
        analytics.gaSend('send', 'event', 'explorer', "addToMyCasinoGames" + (Config.main.sportsLayout),  {'page': $location.path(), 'eventLabel': "addToMyCasinoGames"});
        console.log('gaSend-',"addToMyCasinoGames");
        Utils.checkAndSetCookie('myCasinoGames', gamesIds, Config.main.authSessionLifetime);

        $scope.myCasinoSavedGames = getVisibleGames($rootScope.myCasinoGames);
    });

    $scope.$on('game.removeGameFromMyCasinoGames', function (event, game) {
        $scope.removeGameFromSaved(game.id);
    });

    $scope.removeAllGamesFromSaved = function removeAllGamesFromSaved() {
        $rootScope.myCasinoGames.slice().forEach(function (game) {
            $scope.removeGameFromSaved(game.id, true);
        });
        analytics.gaSend('send', 'event', 'explorer', 'removeAllGamesFromSaved' + (Config.main.sportsLayout), {'page': $location.path(),'eventLabel': "removeAllGamesFromSaved"});
    };

    $scope.$on('casinoGamesList.toggleSaveToMyCasinoGames', function (event, game) { // casino game list v2  favorite remove
        $scope.removeGameFromSaved(game.id);
    });
    $scope.$on('casinoGamesList.openGame', function(e, data) {
        if (data.skipFavorite || !data.game) return;
        $scope.openGame(data.game, data.playMode);
    });
}]);

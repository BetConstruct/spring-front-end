/**
 * @ngdoc controller
 * @name CASINO.controller:casinoSpecialGamesCtrl
 * @description
 * special games pages controller
 */

angular.module('casino').controller('providerGamesCtrl', ['$rootScope', '$scope', '$location', 'casinoManager', 'casinoData', '$timeout', 'Utils', function ($rootScope, $scope, $location, casinoManager, casinoData, $timeout, Utils) {
    'use strict';

    $rootScope.footerMovable = true;

    function getUrl( mode) {
        $scope.frameUrl = null;
        $scope.showLoginWarningPopup = false;
        $timeout(function() {
            $scope.frameUrl = casinoManager.getGameUrl({ game: $scope.selectedGame, gameMode: mode });
        }, 50);
    }

    function openGame() {
        if ($scope.selectedGame) {
            if ($rootScope.env.authorized) {
                getUrl("real");
            } else if ($scope.selectedGame.types.funMode || $scope.selectedGame.types.viewMode) {
                getUrl("fun");
            } else {
                $scope.showLoginWarningPopup = true;
                $scope.frameUrl = null;
            }

        }
    }

    $scope.selectGame = function selectGame(game) {
        if ($scope.selectedGame.extearnal_game_id !== game.extearnal_game_id) {
            $scope.selectedGame = game;
            $location.search("game", game.extearnal_game_id);

            if (!$rootScope.loginInProgress) {
                openGame();
            }
        }
    };

    (function init() {
        $scope.loading = true;
        $scope.selectedGame = {};
        var providers = $location.path().split('/')[2];

        casinoData.getGames({provider: providers}).then(function (response) {
            if(response.data && response.data.games) {
                $scope.games = response.data.games;
                if ($scope.games.length) {
                    var initialSelectedGameId = $location.search().game || $scope.games[0].extearnal_game_id;
                    for (var i = 0; i < $scope.games.length; i++) {
                        if ($scope.games[i].extearnal_game_id === initialSelectedGameId) {
                            $scope.selectGame($scope.games[i]);
                        }
                        $scope.games[i].alias = Utils.generateSlugFromName($scope.games[i].name);
                    }
                }
            }
        })["finally"](function () {
            $scope.loading = false;
        });
    })();

    $scope.$watch('env.authorized', function (newValue, oldValue) {
        if (newValue !== oldValue) {
            openGame();
        }
    });

    $scope.$on("$destroy", function () {
        $scope.frameUrl = null;
    });
}]);

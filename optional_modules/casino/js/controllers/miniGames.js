/**
 * @ngdoc controller
 * @name CASINO.controller:casinoMiniGamesCtrl
 * @description
 * mini games under betslip controller
 */

CASINO.controller('casinoMiniGamesCtrl', ['$rootScope', '$scope', '$sce', 'Config', 'CConfig', 'Zergling', '$timeout', 'Utils', 'casinoData', 'casinoManager', '$interval', 'Geoip', 'Storage', function ($rootScope, $scope, $sce, Config, CConfig, Zergling, $timeout, Utils, casinoData, casinoManager, $interval, Geoip, Storage) {
    'use strict';

    $scope.gameIsLoading = false;

    $scope.gameOptions = {
        selectedIndex: '0',
        toggleMiniGamesDropdown: false,
        showGames: true,
        hideIframe: Storage.get('mini_games_state') !== undefined ? Storage.get('mini_games_state') : Config.main.minimizeMiniGamesUnderBetslip,
        frameUrl: ''
    };

    var MINI_GAMES_CATEGORY_ID = 52, gameSlideInterval, countryCode = '';

    $scope.stopAutoSlideGames = function stopAutoSlideGames () {
        $interval.cancel(gameSlideInterval);
        gameSlideInterval = undefined;
    };

    $scope.autoSlideGames = function autoSlideGames() {
        if($scope.gameOptions.hideIframe ||  $scope.gameOptions.frameUrl !== '') {
            $scope.stopAutoSlideGames();
            return;
        }
        if (!angular.isDefined(gameSlideInterval)) {
            gameSlideInterval = $interval(function () {
                $scope.slideMiniGames('right');
            }, 4000);
        }
    };



    $scope.$on('betslip.isEmpty', function () {
        $scope.gameOptions.showGames = true;
    });
    $scope.$on('betslip.hasEvents', function () {
        $scope.gameOptions.showGames = false;
    });

    $scope.toggleFrame = function toggleFrame () {
        $scope.gameOptions.hideIframe = !$scope.gameOptions.hideIframe;
        $scope.autoSlideGames();

        Storage.set('mini_games_state', $scope.gameOptions.hideIframe);
    };



    $scope.loadGame = function loadGame() {
        if (!$scope.gameOptions.showGames || $scope.gameOptions.hideIframe) {
            return;
        }
        $scope.gameOptions.frameUrl = '';
        var game = $scope.gameOptions.games && $scope.gameOptions.games[parseInt($scope.gameOptions.selectedIndex) || 0];
        if (!game) {
            return;
        }
        $scope.gameIsLoading = true;

        $timeout(function () {
            $scope.gameOptions.frameUrl = casinoManager.getGameUrl({game: game, id: 'miniGames', gameMode: $rootScope.env.authorized ? 'real' : 'fun'});
        }, 30);
    };

    $scope.$watch('env.authorized', function (newValue, oldValue) {
        if (newValue !== oldValue && $scope.gameOptions.frameUrl !== '') { $scope.loadGame(); }
    });

    $scope.selectMiniGame = function selectMiniGame(index) {
        $scope.gameOptions.toggleMiniGamesDropdown = false;
        $scope.gameOptions.selectedIndex = index;

        $scope.loadGame();
    };

    $scope.slideMiniGames = function slideMiniGames(direction) {
        $scope.gameOptions.frameUrl = '';
        switch (direction) {
            case 'left':
                $scope.gameOptions.selectedIndex === 0 ? $scope.gameOptions.selectedIndex = $scope.gameOptions.games.length - 1 : --$scope.gameOptions.selectedIndex;
                break;
            case 'right':
                $scope.gameOptions.selectedIndex === $scope.gameOptions.games.length - 1 ? $scope.gameOptions.selectedIndex = 0 : ++$scope.gameOptions.selectedIndex;
                break;
        }
    };

    $scope.$on('$destroy', $scope.stopAutoSlideGames);

    (function init() {
        Geoip.getGeoData(false).then(function (data) {
            data && data.countryCode && (countryCode = data.countryCode);
        })['finally'](function () {
            casinoData.getGames({
                category: MINI_GAMES_CATEGORY_ID,
                country: countryCode,
                additionalParams: '&mini_games=1'
            }).then(function(response) {
                if (response && response.data && response.data.status !== -1) {
                    $scope.gameOptions.games = response.data.games;

                    !$scope.gameOptions.hideIframe && $scope.autoSlideGames();
                }
            });
        });
    })();
}]);

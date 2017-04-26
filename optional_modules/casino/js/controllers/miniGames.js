/**
 * @ngdoc controller
 * @name CASINO.controller:casinoMiniGamesCtrl
 * @description
 * mini games under betslip controller
 */

CASINO.controller('casinoMiniGamesCtrl', ['$rootScope', '$scope', '$sce', 'CConfig', 'Zergling', 'TimeoutWrapper', 'Utils', 'casinoData', function ($rootScope, $scope, $sce, CConfig, Zergling, TimeoutWrapper, Utils, casinoData) {
    'use strict';

    $scope.showGames = true;
    $scope.rotationPaused = false;
    $scope.gameList = null;
    $scope.gameIsLoading = false;
    $scope.toggleMiniGamesDropdown = false;
    $scope.gameOptions = {
        selectedIndex: '0'
    };

    var MINI_GAMES_CATEGORY_ID = 52;

    TimeoutWrapper = TimeoutWrapper($scope);

    $scope.$on('betslip.isEmpty', function () {
        $scope.showGames = true;
    });
    $scope.$on('betslip.hasEvents', function () {
        $scope.showGames = false;
    });


    $scope.loadGame = function loadGame() {
        $scope.frameUrl = '';
        $scope.gameIsLoading = true;
        var game = $scope.gameOptions.games && $scope.gameOptions.games[parseInt($scope.gameOptions.selectedIndex) || 0];
        if (!game) {
            return;
        }
        var provider = game.provider || game.gameProvider,
            gameId = game.front_game_id || game.gameID,
            externalId = game.extearnal_game_id || game.externalID,
            gameOption = game.game_options ? game.game_options : '';

        if (CConfig.main.providersThatWorkWithSwarm.indexOf(provider) !== -1) {
            Zergling.get({'skin_host': CConfig.cUrlPrefix, 'provider': provider, 'game_id': gameId, 'external_game_id': externalId, 'mode': $rootScope.env.authorized ? 'real' : 'fun'}, 'casino_game_url')
                .then(function (data) {
                    $scope.gameIsLoading = false;
                    if (data && data.url) {
                        $scope.frameUrl = $sce.trustAsResourceUrl(data.url);
                    }
                });
        } else {
            var urlPrefix = CConfig.main.providersThatWorkWithCasinoBackend && CConfig.main.providersThatWorkWithCasinoBackend.providers.indexOf(provider) !== -1 ? CConfig.main.providersThatWorkWithCasinoBackend.url : CConfig.cUrlPrefix + CConfig.cGamesUrl;

            var gameUrl = urlPrefix + "?gameid=" + gameId + "&provider=" + provider + gameOption + '&lan=' + $rootScope.env.lang + '&partnerid=' + CConfig.main.partnerID;
            if ($rootScope.env.authorized) {
                Zergling.get({'game_id': parseInt(externalId)}, 'casino_auth').then(function (response) {
                    $scope.gameIsLoading = false;
                    if (response && response.result && response.result.has_error == "False") {
                        var userInfo = '&token=' + response.result.token + '&username=' + response.result.username + '&balance=' + response.result.balance + '&currency=' + response.result.currency + '&userid=' + response.result.id + '&nickname=' + response.result.nickname + '&firstname=' + $rootScope.profile.first_name + '&lastname=' + $rootScope.profile.last_name;
                        $scope.frameUrl = $sce.trustAsResourceUrl(gameUrl +userInfo + '&mode=real');
                    }
                });
            } else {
                TimeoutWrapper(function () {
                    $scope.gameIsLoading = false;
                    $scope.frameUrl = $sce.trustAsResourceUrl(gameUrl + '&mode=fun');
                }, 20);
            }
        }
    };

    $scope.$watch('env.authorized', function (newValue, oldValue) {
        if (newValue !== oldValue) { $scope.loadGame(); }
    });

    if ($rootScope.conf.casinoVersion === 2) {
        casinoData.getGames(MINI_GAMES_CATEGORY_ID).then(function(response) {
            if (response && response.data && response.data.status !== -1) {
                $scope.gameOptions.games = response.data.games;
                $scope.loadGame();
            }
        });
    } else {
        casinoData.getAllMiniGames(CConfig.main.partnerID).then(function(response) {
            if (response.data) {
                $scope.gameOptions.games = Utils.objectToArray(response.data);
                $scope.loadGame();
            }
        });
    }


    $scope.selectMiniGame = function selectMiniGame(index) {
        $scope.toggleMiniGamesDropdown = false;
        $scope.gameOptions.selectedIndex = index;
        $scope.loadGame();
    };

    $scope.slideMiniGames = function slideMiniGames(direction) {
        switch (direction) {
            case 'left':
                $scope.gameOptions.selectedIndex == 0 ? $scope.gameOptions.selectedIndex = $scope.gameOptions.games.length - 1 : --$scope.gameOptions.selectedIndex;
                $scope.loadGame();
                break;
            case 'right':
                $scope.gameOptions.selectedIndex == $scope.gameOptions.games.length - 1 ? $scope.gameOptions.selectedIndex = 0 : ++$scope.gameOptions.selectedIndex;
                $scope.loadGame();
                break;
        }
    };
}]);

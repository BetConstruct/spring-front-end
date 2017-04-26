/**
 * @ngdoc controller
 * @name vbet5.controller:classicViewMainCtrl
 * @description
 * Classic mode view controller
 */
angular.module('vbet5.betting').controller('euro2016CenterController', ['$rootScope', '$scope', '$controller', 'Config', 'ConnectionService', 'Utils', '$filter', '$location', 'TimeoutWrapper', '$q', 'Storage', 'GameInfo', '$window', 'partner', 'Moment', function ($rootScope, $scope, $controller, Config, ConnectionService, Utils, $filter, $location, TimeoutWrapper, $q, Storage, GameInfo, $window, partner, Moment) {
    'use strict';

    TimeoutWrapper = TimeoutWrapper($scope);
    var connectionService = new ConnectionService($scope);
    var firstTimeLoaded = false;
    var openGameId;

    angular.extend(this, $controller('classicViewCenterController', {
        $rootScope: $rootScope,
        $scope: $scope,
        TimeoutWrapper: TimeoutWrapper,
        $filter: $filter,
        $q: $q,
        Config: Config,
        Utils: Utils,
        Storage: Storage,
        GameInfo: GameInfo,
        partner: partner
    }));

    /**
     * @ngdoc method
     * @name openGameFullDetails
     * @methodOf vbet5.controller:classicViewCenterController
     * @description  expands(or collapses if expanded) region menu (loads and subscribes/unsibscribes to game)
     *
     * @param {Object} game game data object
     * @param {Boolean} fromCustomWidget if it from custom widget
     * @param {Object} competition competition data object
     */
    $scope.openGameFullDetailsMultiview = function openGameFullDetailsMultiview(game, competition, fromCustomWidget, fromLeftMenu) {
        if ($scope.selectedGame && $scope.selectedGame.id === game.id) {
            console.log("game already selected");
            return;
        }

        firstTimeLoaded = true;
        $scope.selectedMarketTab = {};
        openGameId = game.id;
        $scope.$broadcast('game.selected', openGameId);

        if (Config.main.customSportsBook.enabled && fromCustomWidget && !Config.main.customSportsBook.classic.showMarkets) {
            partner.handleGameClick(game, competition, $scope.selectedSport.id);
            return;
        }
        console.log('openGameFullDetails', game, competition);
        $scope.selectedGame = game;

        $scope.favoriteGameIsSelected = ($rootScope.myGames.indexOf(game.id) !== -1);
        $scope.favoriteGameFromLeftMenu = $scope.favoriteGameIsSelected && fromLeftMenu;

        if (competition) {
            $scope.selectedCompetition = competition;
        }

        $scope.openGameLoading = true;
        $scope.selectGame(game.id);

        if (Config.main.prefetchLeftMenuHoveredLivesGames.enabled
            && hoveredLiveGameFullData
            && hoveredLiveGameFullData.gameId === game.id
        ) {
            $scope.updateOpenGame(hoveredLiveGameFullData.gameData);
            $scope.openGameLoading = false;
        } else {
            var request =  {
                'source': 'betting',
                'what': {
                    'sport': ['id', 'name', 'alias'],
                    'competition': ['id', 'name'],
                    'region': ['id'],
                    'game': [],
                    'market': [],
                    'event': []
                },
                'where': {'game': {'id': game.id}}
            };
            /*Utils.setCustomSportAliasesFilter(request);*/
            connectionService.subscribe(
                request,
                $scope.updateOpenGame,
                {
                    'thenCallback': function () {
                        $scope.openGameLoading = false;
                    },
                    'failureCallback': function () {
                        $scope.openGameLoading = false;
                    }
                },
                true
            );
        }
    };
}]);
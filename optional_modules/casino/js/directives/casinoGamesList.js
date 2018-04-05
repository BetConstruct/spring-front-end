CASINO.directive('casinoGamesList', ['$rootScope', 'CConfig', function($rootScope, CConfig) {
    'use strict';

    return {
        restrict: 'E',
        replace: true,
        template: '<ng-include src="templateUrl"/>',
        scope: {
            gamesList: '=',
            showConditions: '=',
            gameShowConditions: '=',
            gamesLimit: '=',
            additionalData: '=',
            selectedCategory: '=',
            showDeleteBtn: '=',
            useBigIcons: '=',
            templateUrl: '@'
        },
        link: function(scope) {
            scope.confData = CConfig;

            scope.templateUrl = 'optional_modules/casino/templates/directive/casino-new-games-list.html';
            scope.userOS = $rootScope.userOS;
            scope.openGame = function openGame(game, mode) {
                scope.$emit('casinoGamesList.openGame', {game: game, playMode: mode});
            };

            scope.toggleSaveToMyCasinoGames = function toggleSaveToMyCasinoGames(game) {
                scope.$emit('casinoGamesList.toggleSaveToMyCasinoGames', game);
            };

            scope.isFromSaved = function isFromSaved(gameId) {
                var games = $rootScope.myCasinoGames || [], i, j;
                for (i = 0, j = games.length; i < j; i += 1) {
                    if (games[i].id === gameId) {
                        return true;
                    }
                }
                return false;
            };
            scope.removeGameFromSaved = function removeGameFromSaved(gameId) {
                scope.$emit('game.removeGameFromMyCasinoGames',{id:gameId});
            }
        }
    };
}]);
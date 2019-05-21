CASINO.directive('casinoGamesList', ['$rootScope', 'CConfig', function($rootScope, CConfig) {
    'use strict';

    return {
        restrict: 'E',
        replace: true,
        templateUrl: 'optional_modules/casino/templates/directive/casino-games-list' + (CConfig.version === 2 ? '-v2' : '') + '.html',
        scope: {
            jackpotGames: '=',
            gamesList: '=',
            showConditions: '=',
            gameShowConditions: '=',
            gamesLimit: '=',
            additionalData: '=',
            selectedCategory: '=',
            showDeleteBtn: '=',
            hideFavoriteButton: '=',
            useBigIcons: '='
        },
        link: function(scope) {
            scope.confData = CConfig;
            scope.openGame = function openGame(game, mode) {
                scope.$emit('casinoGamesList.openGame', {game: game, playMode: mode});
            };

            scope.toggleSaveToMyCasinoGames = function toggleSaveToMyCasinoGames(game) {
                scope.$emit('casinoGamesList.toggleSaveToMyCasinoGames', game);
            };
            scope.removeGameFromSaved = function removeGameFromSaved(gameId) {
                scope.$emit('game.removeGameFromMyCasinoGames',{id:gameId});
            };
        }
    };
}]);
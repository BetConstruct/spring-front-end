CASINO.directive('casinoGamesList', ['$rootScope', 'CConfig', "$window",function ($rootScope, CConfig, $window) {
    'use strict';

    return {
        restrict: 'E',
        replace: true,
        templateUrl: 'optional_modules/casino/templates/directive/casino-games-list-v2.html',
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
            useBigIcons: '=',
            hideIfNotInView: '='
        },
        link: function (scope, el) {
            scope.confData = CConfig;
            scope.openGame = function openGame(game, mode) {
                scope.$emit('casinoGamesList.openGame', {game: game, playMode: mode});
            };

            scope.toggleSaveToMyCasinoGames = function toggleSaveToMyCasinoGames(game) {
                scope.$emit('casinoGamesList.toggleSaveToMyCasinoGames', game);
            };
            scope.removeGameFromSaved = function removeGameFromSaved(gameId) {
                scope.$emit('game.removeGameFromMyCasinoGames', {id: gameId});
            };
            var blockElement = el[0];
            var container;

            var oldResult;

            function elementInViewport() {
                if(!container){
                    container = blockElement.getElementsByClassName('all-games-container')[0];
                }

                var viewportOffset = blockElement.getBoundingClientRect();
                var result = ((viewportOffset.top + viewportOffset.height +200 ) > 0 ) && (viewportOffset.top < window.innerHeight + 200 );

                if (result !== oldResult) {
                    if (!result) {
                        container.classList.add('hide-games');
                    } else {
                        container.classList.remove('hide-games');
                    }
                }
                oldResult = result;
            }

            if (scope.hideIfNotInView) {
                $window.addEventListener('scroll', elementInViewport);
            }
            scope.$on('$destroy', function () {
                $window.removeEventListener('scroll', elementInViewport);
            });
        }
    };
}]);
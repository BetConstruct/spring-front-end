CASINO.directive('getCasinoGame', ['casinoData', function(casinoData) {
    'use strict';
    return {
        restrict: 'A',
        scope: false,
        link: function(scope, elem, attrs) {
            var gameId = attrs.getCasinoGame;

            if (gameId && scope.games) {
               for (var i = 0, length = scope.games.length; i < length; ++i) {
                   if (scope.games[i].id === gameId) {
                       scope.game = scope.games[i];
                       return;
                   }
               }
            }

            casinoData.getGames(null, null, null, null, null, null, null, [gameId]).then(function (response) {
                if (response && response.data && response.data.status !== -1) {
                    scope.game = response.data.games[0];
                }
            });
        }
    };
}]);
CASINO.directive('getCasinoGame', ['$rootScope', '$location', 'casinoData', function($rootScope, $location, casinoData) {
    'use strict';
    return {
        restrict: 'A',
        scope: false,
        link: function(scope, elem, attrs) {
            var gameId = attrs.getCasinoGame;
            function showFrame () {
                if ($location.search().showNestedFrame === 'true') {
                    scope.showNestedFrame = true;
                    $rootScope.casinoGameOpened = 1;
                    $location.search('showNestedFrame', undefined);
                }
            }

            showFrame();

            scope.$on("$locationChangeSuccess", showFrame);

            if (gameId && scope.games) {
               for (var i = 0, length = scope.games.length; i < length; ++i) {
                   if (scope.games[i].id === gameId) {
                       scope.game = scope.games[i];
                       return;
                   }
               }
            }

            casinoData.getGames({id: [gameId]}).then(function (response) {
                if (response && response.data && response.data.status !== -1) {
                    scope.game = response.data.games[0];
                }
            });


        }
    };
}]);

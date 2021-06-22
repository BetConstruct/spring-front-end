CASINO.directive('casinoPromotedGames', ['$rootScope', '$filter', 'CConfig', 'casinoData', 'casinoManager', 'Geoip', function ($rootScope, $filter, CConfig, casinoData, casinoManager, Geoip) {
    'use strict';

    return {
        restrict: 'A',
        replace: true,
        templateUrl: $filter('fixPath')('optional_modules/casino/templates/directive/casino-games-list-v2.html'),
        scope: {
            limit: '=',
            pageCategory: '@',
            gamesCategory: '=',
            gamesProvider: '=',
            smallItem: '='
        },
        link: function (scope) {
            scope.confData = CConfig;
            scope.jackpotGames = !scope.smallItem;
            var limit = scope.limit || (scope.jackpotGames ? 10 : 12);
            var pageCategory = scope.pageCategory || 'home';
            scope.useBigIcons = true;

            var countryCode;

            function getGames() {
                casinoData.getGames({
                    category: scope.gamesCategory,
                    provider: scope.gamesProvider,
                    country: countryCode,
                    offset: 0,
                    limit: limit,
                    additionalParams: (scope.gamesCategory || scope.gamesProvider) ? '' : '&show_for=' + pageCategory
                }).then(function (response) {
                    if (response && response.data && response.data.status !== -1) {
                        scope.gamesList = response.data.games;
                    }

                    scope.showConditions = true;
                });
            }

            Geoip.getGeoData(false).then(function (data) {
                if (data && data.countryCode) {
                    countryCode = data.countryCode;
                }

            })['finally'](function () {
                getGames();
            });

            scope.openGame = function openGame(game, mode) {
                casinoManager.navigateToRightRouteAndOpenGame(game, mode);
            };

            scope.toggleSaveToMyCasinoGames = function toggleSaveToMyCasinoGames(game) {
                casinoManager.toggleSaveToMyCasinoGames($rootScope, game);
            };
        }
    };
}]);

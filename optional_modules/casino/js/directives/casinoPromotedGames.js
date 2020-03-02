CASINO.directive('casinoPromotedGames', ['$rootScope', '$filter', 'CConfig', 'casinoData', 'casinoManager', 'Geoip', function($rootScope, $filter, CConfig, casinoData, casinoManager, Geoip) {
    'use strict';

    return {
        restrict: 'A',
        replace: true,
        templateUrl: $filter('fixPath')('optional_modules/casino/templates/directive/casino-games-list.html'),
        scope: {
            limit: '=',
            pageCategory: '@'
        },
        link: function(scope) {
            scope.confData = CConfig;
            scope.limit = scope.limit || 10;
            scope.pageCategory = scope.pageCategory || 'home';
            scope.useBigIcons = true;

            var countryCode;

            function getGames () {
                casinoData.getGames(null, null, countryCode, 0, scope.limit, null, null, null, null, '&show_for=' + scope.pageCategory).then(function(response) {
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

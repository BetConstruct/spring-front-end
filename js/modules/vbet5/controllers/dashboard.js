/**
 * @ngdoc controller
 * @name vbet5.controller:dashboardCtrl
 * @description
 * Sports live dashboard controller
 */
angular.module('vbet5.betting').controller('dashboardCtrl', ['$rootScope', '$scope', '$location', 'Config', 'Zergling', 'Moment', 'Utils', function ($rootScope, $scope, $location, Config, Zergling, Moment, Utils) {
    'use strict';
    $rootScope.footerMovable = true;
    $scope.showGames = false;
    $scope.featuredGamesSlider = {closed: false };
    /**
     * Today's Bets
     */
    $scope.toDay = Moment.get().unix();

    $scope.$on('leftMenu.closed', function (event, isClosed) {
        $scope.leftMenuClosed = isClosed;
    });

    $scope.$on("leftMenu.gameClicked", function (event, data) {
        if (!data.byUser) {
            return;
        }
        console.log('dashboard: leftMenu.gameClicked', data);
        $location.path('/sport');
    });

    $scope.$on('leftMenu.preMatchMultiSelection', function (event, data) {
        console.log('dashboard: leftMenu.preMatchMultiSelection', data);
        $location.path('/sport');
    });


    $scope.$on('prematchMultiView.games', function (event, data) {
        console.log('dashboard: prematchMultiView.games', data);
        //$location.path('/sport');
    });

    $scope.$on('prematch.expandCompetition', function (event, data) {
        console.log('dashboard: expandCompetition', data);
        $location.path('/sport');
    });

    $scope.$on('populateOutright', function (event, sportId) {
        $location.path('/sport');
        $location.search().sport = sportId;
    });

    /**
     * @ngdoc method
     * @name dashboardGetGames
     * @methodOf vbet5.controller:dashboardCtrl
     * @description Get games for dashboard
     * @param {Number} Game type 0, 1 or 2
     * @param {Number} Retreived games limit
     * @param {String} favorite or promoted
     */
    function dashboardGetGames(type, limit, promoted) {

        var request = {
            'source': 'betting',
            'what': {
                'game': ['id','type']
            },
            'where': {
                'game': {
                    '@limit': limit
                }
            }
        };

        if (promoted) {
            request.where.game[promoted] = true;
        } else {
            request.where.game.type = type;
        }
        Utils.setCustomSportAliasesFilter(request);
        Zergling.get(request).then(function (result) {
            if (result.data && result.data.game) {
                angular.forEach(result.data.game, function (game) {
                    $scope.showGames[type].push(game.id);
                });

                if (promoted && $scope.showGames[type].length === 0) {
                    dashboardGetGames(type, Config.main.dashboard.v2WidgetGamesCount);
                }

            }
        })['catch'](function (reason) {
            console.log('Error:');
            console.log(reason);
        });
    }

    if ($rootScope.conf.dashboard.version === 2 || $rootScope.conf.dashboard.version === 3) {
        $scope.showGames = [[], []]; // initial
        dashboardGetGames(1, Config.main.dashboard.v2WidgetGamesCount, 'favorite');
        dashboardGetGames(0, Config.main.dashboard.v2WidgetGamesCount, 'promoted');
    }
}]);

/* global VBET5 */
/**
 * @ngdoc directive
 * @name vbet5.directive:vbetBigSlider
 * @description Big slider widget
 */
VBET5.directive('upcomingRaces', ['$rootScope', 'ConnectionService', 'Utils', 'Moment', function ($rootScope, ConnectionService, Utils, Moment) {
    'use strict';
    return {
        restrict: 'E',
        replace: false,
        templateUrl: 'templates/directive/upcoming-races.html',
        scope: {
            sportId: '=',
            navigation: '=',
            streamConfig: '='
        },
        link: function (scope) {
            var connectionService = new ConnectionService(scope);

            function init() {
                var request = {
                    source:'betting',
                    what: {
                        region: ['alias', 'name'],
                        game: ['start_ts', 'team1_name', 'id']
                    },
                    where: {
                        sport: {id: scope.sportId}
                    }
                };

                function handleUpdate(data) {
                    var games = [];
                    angular.forEach(data.region, function (region) {
                        angular.forEach(region.game, function (game) {
                            games.push({
                                start_ts: game.start_ts,
                                team1_name: game.team1_name,
                                id: game.id,
                                regionAlias: region.alias,
                                regionName: region.name
                            });
                        });
                    });
                    games.sort(function compare(item1, item2) {
                        return item1.start_ts - item2.start_ts;
                    });
                    var showingGames = games.slice(0, 6);

                    scope.games = showingGames.map(function (game) {
                        return  {
                            start_ts: game.start_ts,
                            name: game.team1_name,
                            id: game.id,
                            from: Moment.convertUnixToMoment(game.start_ts).startOf('day').unix(),
                            to: Moment.convertUnixToMoment(game.start_ts).endOf('day').unix(),
                            regionAlias: game.regionAlias,
                            regionName: game.regionName
                        };
                    });

                }
                connectionService.subscribe(request, handleUpdate);
            }

            scope.$watch("sportId", function () {
                init();
            });


        }
    };
}
]);

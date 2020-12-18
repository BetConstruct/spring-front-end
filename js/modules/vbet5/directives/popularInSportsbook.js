/**
 * @ngdoc controller
 * @name vbet5.directive:popularInSportsbook
 * @description
 * Popular matches controller
 */
VBET5.directive('popularInSportsbook', ['$rootScope', '$location', 'Config', 'ConnectionService', 'Utils', '$filter', 'analytics', function ($rootScope, $location, Config, ConnectionService, Utils, $filter, analytics) {
    'use strict';
    var connectionService, subId;

    return {
        restrict: 'E',
        templateUrl: 'templates/directive/popular-in-sportsbook.html',
        scope: {
            type: '@',
            title: '@',
            leftMenu: '=?',
            searchField: '@',
            startDate: '@',
            endDate: '@',
            gameType: '@'
        },
        link: function (scope, elem, attrs) {
            connectionService = new ConnectionService(scope);

            scope.popular = {
                icon: attrs.icon || 'favoritecompetitions',
                color: attrs.color || attrs.icon || 'favoritecompetitions',
                expanded: !Config.main.collapsePopularCompetitions
            };

            /**
             * @ngdoc method
             * @name loadPopularMatches
             * @methodOf vbet5.directive:popularMatches
             * @description gets data of popular matches
             */
            function loadPopulars() {
                var request = {
                    'source': 'betting',
                    'what': {
                        'sport': ['id', 'name', 'alias', 'order'],
                        'competition': ['id', 'order', 'name'],
                        'region': ['id', 'name', 'alias', 'order']
                    },
                    'where': {
                        'game': { 'type': {'@in': [0, 2]}}
                    }
                };

                switch (scope.type) {
                    case 'game':
                        request.what.game = ['id', 'team1_name', 'team2_name', 'type', 'order','start_ts', 'favorite_order', 'is_live'];
                        request.where.game.promoted = true;
                        break;
                    case 'competition':
                        request.what.competition.push('favorite_order');
                        request.what.game = '@count';
                        request.where.competition = { 'favorite': true };
                        break;
                    default:
                        return;
                }

                if (scope.startDate || scope.endDate) {
                    request.where.game = request.where.game || {};
                    var start_ts = {};
                    if (scope.startDate) {
                        start_ts['@gte'] = Number(scope.startDate);
                    }
                    if (scope.endDate) {
                        start_ts['@lt'] = Number(scope.endDate);
                    }

                    request.where.game = {
                        'start_ts': start_ts,
                        'type': {'@in': [0, 2]}
                    };
                }else if (scope.gameType) {
                    request.where.game = {
                        type: +scope.gameType
                    };
                }
                Utils.setCustomSportAliasesFilter(request);

                connectionService
                    .subscribe(request, updatePopulars, {
                        'thenCallback': function (response) {
                            subId = response.subid;
                        }
                    });
            }

            function updatePopulars(result) {
                var data = [];
                if (result.sport) {
                    angular.forEach(result.sport, function (sport) {
                        angular.forEach(sport.region, function (region) {
                            angular.forEach(region.competition, function (competition) {
                                switch (scope.type) {
                                    case 'game':
                                        angular.forEach(competition.game, function (game) {
                                            game.region = region;
                                            game.competition = competition;
                                            game.sport = sport;
                                            data.push(game);
                                        });
                                        break;
                                    case 'competition':
                                        if (competition.game) {
                                            competition.sport = sport;
                                            competition.region = region;
                                            data.push(competition);
                                        }
                                        break;
                                }
                            });
                        });
                    });

                    scope.popular.data = Utils.twoParamsSorting(data, ["favorite_order", "order"]);
                }
            }

            /**
             * @ngdoc method
             * @name toggle
             * @methodOf vbet5.directive:popularMatches
             * @description expand or collapse popular matches
             */
            scope.toggle = function toggle() {
                scope.popular.expanded = !scope.popular.expanded;
                scope.popular.expanded ? loadPopulars() : connectionService.unsubscribe(subId);

                if (scope.leftMenu &&scope.leftMenu.closed) {
                    scope.leftMenu.toggle();
                }
            };

            scope.selectPopular = function selectPopular(type, item) {
                var name = ($rootScope.env.live ? 'Live' : 'Prematch') + ' ' + type + ' ' + item.id + ' ' + item.name;
                analytics.gaSend('send', 'event', 'explorer', 'show popular game markets',  {'page': $location.path(), 'eventLabel': name});
                $rootScope.$broadcast('sportsbook.selectData', {type: 'popular.' + type, data: item});
            };

            scope.getCompetitionTitle = function getCompetitionTitle(popularItem) {
                if(popularItem.team1_name) {
                    return popularItem.team1_name + (popularItem.team2_name? ( ' - ' + popularItem.team2_name): '');
                } else {
                    return popularItem.region.name;
                }
            };

            //initial
            loadPopulars();
        }
    };
}]);


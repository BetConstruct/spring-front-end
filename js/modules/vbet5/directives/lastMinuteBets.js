/* global VBET5 */
/**
 * @ngdoc directive
 * @name vbet5.directive:vbetLastMinuteBets
 *
 * @description displays last minute bets
 *
 */
VBET5.directive('vbetLastMinuteBets', ['Utils', 'Config', 'ConnectionService', 'GameInfo', '$rootScope', '$location', '$route', function (Utils, Config, ConnectionService, GameInfo, $rootScope, $location, $route) {
    'use strict';
    var gamesSubscription;
    return {
        restrict: 'E',
        replace: false,
        templateUrl: $rootScope.getTemplate('templates/directive/last-minute-bets.html'),
        scope: {
            sportTabsQuantity: '='
        },
        link: function (scope) {
            var connectionService = new ConnectionService(scope);

            scope.conf = Config.main.homePageLastMinuteBets;
            scope.minutesFilter = 0;
            scope.selectedSport = {};
            scope.loadCompleted = false;
            scope.liveGameViewData = [];

            /**
             * @ngdoc method
             * @name init
             * @methodOf CMS.directive:vbetLastMinuteBets
             * @description Initialization
             */
            function init() {
                scope.setMinutes(scope.conf.timeOptions[2]);
            }


            /**
             * @ngdoc method
             * @name updateGames
             * @methodOf CMS.directive:vbetLastMinuteBets
             * @description update games
             *
             * @param {object} data games object
             */
            function updateGames(data) {
                scope.loadCompleted = true;
                scope.liveGameViewData = [];

                var sportList = [], sportData = Utils.objectToArray(data), markets = [], choosenMarket;

                angular.forEach(sportData[0], function (sport) {
                    sportList.push(sport);
                });

                sportList = sportList.slice(0, scope.sportTabsQuantity);

                angular.forEach(sportList, function (sport, k1) {
                    sportList[k1].game = [];
                    angular.forEach(sport.region, function (region) {
                        angular.forEach(region.competition, function (competition) {
                            angular.forEach(competition.game, function (game) {
                                game.sport_id = sport.id;
                                game.region_id = region.id;
                                game.competition_id = competition.id;
                                game.events = {};
                                markets = Utils.groupByItemProperty(game.market, 'type');
                                choosenMarket = null;
                                if (markets) {
                                    if (markets.P1XP2) {
                                        choosenMarket = markets.P1XP2[0];
                                    } else if (markets.P1P2) {
                                        choosenMarket = markets.P1P2[0];
                                    }
                                }
                                if (choosenMarket && choosenMarket.event) {
                                    angular.forEach(choosenMarket.event, function (event) {
                                        game.events[event.type] = event;
                                    });
                                    sportList[k1].game.push(game);
                                }
                            });
                        });
                    });

                    if (sportList[k1].game.length > 0) {
                        scope.liveGameViewData.push(sportList[k1]);
                    }
                });

                if (scope.liveGameViewData.length > 0) {
                    GameInfo.updateSelectedSportByLiveGameViewData(scope);
                } else {
                    scope.selectedSport = null;
                }
            }

            /**
             * @ngdoc method
             * @name subscribeForGames
             * @methodOf CMS.directive:vbetLastMinuteBets
             * @description
             */
            function subscribeForGames() {
                if (gamesSubscription) {
                    connectionService.unsubscribe(gamesSubscription);
                }

                var request = {
                    'source': 'betting',
                    'what': {
                        'sport': ['id', 'name', 'alias'],
                        'competition': ['id', 'order', 'name'],
                        'region': ['id', 'name', 'alias'],
                        'game': [['id', 'start_ts', 'team1_name', 'team2_name', 'type', 'info', 'markets_count', 'is_blocked']],
                        'event': ['id', 'price', 'type', 'name'],
                        'market': ['type', 'express_id', 'name']
                    },
                    'where': {
                        'game': {type: {'@in': [0, 1]}},
                        'event': {type: {'@in': ['P1', 'X', 'P2']}}
                    }
                };
                if (!Config.main.GmsPlatform) {
                    request.where.sport = {'id': {'@nin': Config.main.virtualSportIds}};
                }

                request.where.game.start_ts = {'@now': {'@gte': 0, '@lt': scope.minutesFilter * 60}};

                connectionService.subscribe(
                    request,
                    updateGames,
                    {
                        'thenCallback': function (result) {
                            if (result.subid) {
                                gamesSubscription = result.subid;
                            }
                        }
                    }
                );
            }

            /**
             * @ngdoc method
             * @name selectSport
             * @methodOf CMS.directive:vbetLastMinuteBets
             * @description set minutes filter
             *
             * @param sport sport object
             */
            scope.selectSport = function selectSport(sport) {
                scope.selectedSport = sport;
            };

            /**
             * @ngdoc method
             * @name setMinutes
             * @methodOf CMS.directive:vbetLastMinuteBets
             * @description set minutes filter
             *
             * @param {number} minutes
             */
            scope.setMinutes = function setMinutes(minutes) {
                if (minutes === scope.minutesFilter) {
                    return;
                }
                scope.minutesFilter = minutes;
                scope.loadCompleted = false;
                scope.selectedSport = null;
                subscribeForGames();
            };

            /**
             * @ngdoc method
             * @name goToUrl
             * @methodOf CMS.directive:vbetLastMinuteBets
             * @description set minutes filter
             *
             * @param {object} game
             */
            scope.goToUrl = function goToUrl(game) {
                $location.path('/sport');
                $location.search({
                    'type': game.type,
                    'sport': game.sport_id,
                    'region': game.region_id,
                    'competition': game.competition_id,
                    'game': game.id
                });
                $route.reload();
            };

            init();
        }
    };
}]);

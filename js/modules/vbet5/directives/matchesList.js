/* global VBET5 */
/**
 * @ngdoc directive
 * @name vbet5.directive:matchesList
 *
 * @description displays matches list
 *
 */
VBET5.directive('matchesList', ['$timeout', '$q', 'ConnectionService', '$filter', '$rootScope', 'Utils', 'GameInfo', '$location', '$route', '$window', 'Moment', 'Zergling', 'Config', 'LanguageCodes','analytics', function ($timeout, $q, ConnectionService, $filter, $rootScope, Utils, GameInfo, $location, $route, $window, Moment, Zergling, Config, LanguageCodes, analytics) {
    'use strict';
    return {
        restrict: 'E',replace: false,
        templateUrl: 'templates/directive/matchesList.html',
        scope: {
            seasonId: '=',
            competitionId: '=',
            teamId: '=',
            fromDate: '=',
            toDate: '=',
            stadiumData: '=',
            sportId: '=',
            showDates: "=",
            showTime: '='
        },
        link: function (scope) {
            var connectionService = new ConnectionService(scope);
            var dataHash, dataDictionary = {};
            var gettingWatcherPromise;
            var oneDay = 86399;
            var matchSubscription;

            var results, matches;

            scope.isEventInBetSlip = GameInfo.isEventInBetSlip;
            scope.today = Date.parse(Moment.get().lang("en").format("YYYY-MM-DD")) / 1000;

            function getDay(timestamp) {
                return Moment.moment.utc(Moment.moment.unix(timestamp)).locale('en').format('DD');
            }

            function getMonth(timestamp) {
                return Moment.moment.utc(Moment.moment.unix(timestamp)).locale(LanguageCodes[Config.env.lang] || 'en').format('MMMM');
            }

            function fillDatesList(dates, list, name) {
                for (var i = 0, length = list.length; i < length; ++i) {
                    var matchKey = Date.parse((moment(list[i].start_ts*1000).utcOffset(Config.env.selectedTimeZone || 0).lang("en").format("YYYY-MM-DD")))/1000;
                    if (!dates[matchKey]) {
                        dates[matchKey] = {};
                        dates[matchKey].day = getDay(matchKey);
                        dates[matchKey].month = getMonth(matchKey);
                    }

                    if (!dates[matchKey][name]) {
                        dates[matchKey][name] = [list[i]];
                    } else {
                        dates[matchKey][name].push(list[i]);
                    }
                }
            }

            function fetchCompleted() {

                var dates = {};
                fillDatesList(dates, matches, 'matches');
                fillDatesList(dates, results, 'results');

                scope.dates = Utils.objectToArray(dates, 'start_ts');
                scope.dates.sort(Utils.orderByStartTs);

                for (var i = 0, length = scope.dates.length; i < length; ++i) {
                    scope.dates[i].results && scope.dates[i].results.sort(Utils.orderByStartTs);
                    scope.dates[i].matches && scope.dates[i].matches.sort(Utils.orderByStartTs);
                }

                scope.loadingProcess = false;
            }

            function getResults(cache) {
                var resultPromise = $q.defer();
                var hash = '' + scope.fromDate + '-' + scope.toDate;
                if (dataDictionary[hash]) {
                    results = dataDictionary[hash];
                    resultPromise.resolve();
                    return resultPromise.promise;
                }
                var request = {
                    is_date_ts: 1,
                    competition_id: scope.competitionId,
                    live: 0,
                    from_date: scope.fromDate,
                    to_date: scope.toDate || scope.fromDate + oneDay
                };

                if (scope.sportId) {
                    request.sport_id = scope.sportId;
                }
                if (scope.seasonId) {
                    request.season_id = scope.seasonId;
                }

                scope.loadingProcess = true;

                Zergling.get(request, "get_result_games")
                    .then(function success(response) {
                        if (response.games && response.games.game) {
                            var result;
                            angular.forEach(response.games.game, function(game) {
                                result = {
                                    id: game.game_id,
                                    start_ts: game.date,
                                    name: game.game_name,
                                    scores: game.scores,
                                    interrupted: game.interrupted,
                                    team1_id: game.team1_id,
                                    team1_name: game.team1_name,
                                    team1_logo: 'url(' + $rootScope.conf.teamLogosPath + 'e/m/' + Math.floor(game.team1_id / 2000) + '/' + game.team1_id + '.png)',
                                    team2_id: game.team2_id,
                                    team2_name: game.team2_name,
                                    team2_logo: 'url(' + $rootScope.conf.teamLogosPath + 'e/m/' + Math.floor(game.team2_id / 2000) + '/' + game.team2_id + '.png)'
                                };

                                results.push(result);

                            });


                            if (cache) {
                                dataDictionary[hash] = results;
                            }
                        }
                    })['finally'](function () {
                    resultPromise.resolve();
                });

                return resultPromise.promise;
            }

            function updateMatches(data) {
                var gamesList = [],
                    gameData = {};

                angular.forEach(data.sport, function (sport) {
                    angular.forEach(sport.region, function (region) {
                        angular.forEach(region.competition, function (competition) {
                            angular.forEach(competition.game, function (game) {
                                gameData = {
                                    id: game.id,
                                    team1_id: game.team1_id,
                                    team1_name: game.team1_name,
                                    team1_logo: 'url(' + $rootScope.conf.teamLogosPath + 'e/m/' + Math.floor(game.team1_id / 2000) + '/' + game.team1_id + '.png)',
                                    team2_id: game.team2_id,
                                    team2_name: game.team2_name,
                                    team2_logo: 'url(' + $rootScope.conf.teamLogosPath + 'e/m/' + Math.floor(game.team2_id / 2000) + '/' + game.team2_id + '.png)',
                                    type: game.type,
                                    is_blocked: game.is_blocked,
                                    start_ts: game.start_ts,
                                    markets_count: game.markets_count,
                                    is_stat_available: game.is_stat_available
                                };
                                gameData.sport = {id: sport.id, alias: sport.alias, name: sport.name};
                                gameData.region = {id: region.id, alias: region.alias, name: region.name};
                                gameData.competition = {id: competition.id, name: competition.name};
                                angular.forEach(game.market, function (market) {
                                    gameData.market = market;
                                    gameData.market.events = [];
                                    angular.forEach(market.event, function (event) {
                                        event.name = $filter('removeParts')(event.name, [market.name]);
                                        gameData.market.events.push(event);
                                    });
                                });

                                gamesList.push(gameData);
                            });
                        });
                    });
                });
                dataDictionary[dataHash] = gamesList;
                var lengthBeforeUpdate = matches.length;
                matches = gamesList;


                if (matches.length < lengthBeforeUpdate) { // A subscribed game has finished
                    $timeout(function() {
                        getResults(false).then(fetchCompleted);
                    }, 6000);
                } else if (!matches.length) { // if there were some matches but not any more
                    $timeout(function() {
                        connectionService.unsubscribe(matchSubscription);
                        getResults(true).then(fetchCompleted);
                    }, 6000);
                }
                fetchCompleted();
            }

            function loadMatches(useCache) {
                var matchesPromise = $q.defer();
                var request = {
                    'source': 'betting',
                    'what': {
                        'sport': ['id', 'name', 'alias'],
                        'region': ['id', 'name', 'alias'],
                        'competition': ['id', 'name'],
                        'game': [['id', 'start_ts', 'team1_name', 'team2_name', 'team1_id', 'team2_id', 'type', 'markets_count', 'is_blocked', 'is_stat_available']],
                        'market': ['type', 'express_id', 'name', 'base', 'display_key', 'display_sub_key', 'main_order'],
                        'event': ["order", "id", "type_1", "type", "type_id", "original_order", "name", "price", "nonrunner", "ew_allowed", "sp_enabled", "extra_info", "base", "home_value", "away_value", "display_column"]
                    },
                    'where': {
                        'market': {'type': 'P1XP2'}
                    }
                };
                Utils.addPrematchExpressId(request);

                if (scope.competitionId) {
                    request.where.competition = {'id': scope.competitionId};
                }
                if (scope.seasonId) {
                    request.where.game = {'season_id': scope.seasonId};
                }
                if (scope.sportId) {
                    request.where.sport = {'id': scope.sportId };
                }
                if (scope.teamId) {
                    request.where.game = request.where.game || {};
                    request.where.game['@or'] = [
                        {'team1_id': scope.teamId},
                        {'team2_id': scope.teamId}
                    ];
                }
                if (scope.fromDate) {
                    request.where.game = request.where.game || {};
                    request.where.game.start_ts = {
                        '@gte': scope.fromDate - 1,
                        '@lt': scope.toDate + 1 || scope.fromDate + oneDay // if toDate not defined
                    };
                }

                scope.loadingProcess = true;

                dataHash = JSON.stringify(request.where);
                if (useCache && dataDictionary[dataHash]) {
                    matches = dataDictionary[dataHash];
                    fetchCompleted();
                }
                connectionService.subscribe(request, updateMatches, {
                    'thenCallback': function (result) {
                        matchesPromise.resolve();
                        if (result.subid) {
                            matchSubscription = result.subid;
                        }
                    },
                    'failureCallback': function () {
                        matchesPromise.resolve();
                    }
                });

                return matchesPromise.promise;
            }

            scope.bet = function bet(event, market, openGame) {
                var game = Utils.clone(openGame);
                $rootScope.$broadcast('bet', {event: event, market: market, game: game, oddType: 'odd'});
            };


            scope.toggleGameFavorite = function toggleGameFavorite(game) {
                if (!$rootScope.myGames || $rootScope.myGames.indexOf(game.id) === -1) {
                    scope.$emit('game.addToMyGames', game);
                } else {
                    scope.$emit('game.removeGameFromMyGames', game);
                }
            };


            scope.goToGame = function goToGame(game) {
                $location.path('/sport');
                $location.search({
                    'game' : game.id,
                    'sport': game.sport.id,
                    'competition': game.competition.id,
                    'type': game.type === 1 ? 1 : 0,
                    'region': game.region.id
                });
                $route.reload();
            };


            scope.openStatistics = function openStatistics(game) {
                analytics.gaSend('send', 'event', 'explorer', 'H2H-on-click', {'page': $location.path(), 'eventLabel': ($rootScope.env.live ? 'Live' : 'Prematch')});
                $window.open(GameInfo.getStatsLink(game), game.id, "width=940,height=600,resizable=yes,scrollbars=yes");
            };

            function matchesLoaded() {
                fetchCompleted();
                scope.$emit('matchesLoaded');
            }

            scope.$watchGroup(['seasonId', 'fromDate', 'toDate'], function() {
                if (gettingWatcherPromise) {
                    $timeout.cancel(gettingWatcherPromise);
                }

                gettingWatcherPromise = $timeout(function() {
                    scope.dates = [];
                    results = [];
                    matches = [];
                    if (scope.fromDate && scope.toDate) {
                        var currentTime = Math.floor(Date.now()/1000);
                        var correction = 14400; // 4 hours
                        if (currentTime > scope.fromDate && currentTime < scope.toDate + correction) {
                            $q.all([loadMatches(), getResults(false)]).then(matchesLoaded);
                        } else if (currentTime >= scope.toDate + correction) {
                            getResults(true).then(matchesLoaded);
                        } else {
                            loadMatches(true).then(matchesLoaded);
                        }
                    } else {
                        loadMatches(true).then(matchesLoaded);
                    }
                }, 300);
            });
        }
    };
}]);

//examples
// <matches-list season-id="groups[groupStats.selectedIndex].id" sport-id="1" from-date="groups[groupStats.selectedIndex].fromDate" to-date="groups[groupStats.selectedIndex].toDate" competition-id="2969" stadium-data="stadiumData"></matches-list>
// <matches-list competition-id="2969" ng-if="calendarData.selected" sport-id="1" show-dates="true" show-time="true" from-date="calendarData.fromDate" to-date="calendarData.toDate" stadium-data="stadiumData"></matches-list>
// <matches-list competition-id="2969" team-id="teamData.selectedTeamId" sport-id="1" stadium-data="stadiumData"></matches-list>

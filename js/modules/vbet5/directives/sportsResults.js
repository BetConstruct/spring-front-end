/* global VBET5 */
/**
 * @ngdoc directive
 * @name vbet5.directive:sportsResults
 *
 * @description displays provided/or all sports results
 *
 */
VBET5.directive('sportsResults', ['Utils', 'Config', 'GameInfo', 'Moment', 'Zergling', 'Translator', '$location', '$q', '$filter', function (Utils, Config, GameInfo, Moment, Zergling, Translator, $location, $q, $filter) {
    'use strict';
    return {
        restrict: 'E',
        replace: false,
        templateUrl: $filter('fixPath')('templates/directive/sports-results.html'),
        scope: {
            sportList: '=?sportList',
            competitionsList: '=?competitionsList',
            selectedSport: "=selectedSport",
            selectedCompetition: "=selectedCompetition"
        },
        link: function (scope) {
            scope.today = Moment.get().format("YYYY-MM-DD");
            scope.requestData = {
                dateFrom: scope.today,
                dateTo: scope.today
            };
            var timeZone = Config.env.selectedTimeZone || '';

            /**
             * @ngdoc method
             * @name openFrom
             * @description hide 'date to' picker and show or hide 'date from' picker
             * @methodOf vbet5.directive:sportsResults
             */
            scope.openFrom = function openFrom($event) {
                $event.preventDefault();
                $event.stopPropagation();
                scope.openedTo = false;
                scope.openedFrom = !scope.openedFrom;
            };

            /**
             * @ngdoc method
             * @name openTo
             * @description hide 'date from' picker and show or hide 'date to' picker
             * @methodOf vbet5.directive:sportsResults
             */
            scope.openTo = function openTo($event) {
                $event.preventDefault();
                $event.stopPropagation();
                scope.openedFrom = false;
                scope.openedTo = !scope.openedTo;
            };

            /**
             * @ngdoc method
             * @name adjustDate
             * @description adjusted 'FromDate' dataPicker if FromDate is higher than ToDate and vice versa
             * @methodOf vbet5.directive:sportsResults
             */
            scope.adjustDate = function adjustDate(type) {
                switch (type) {
                    case 'from':
                        if (Moment.get(scope.requestData.dateFrom).unix() > Moment.get(scope.requestData.dateTo).unix() || (Config.main.edition && Config.main.edition.enabled)) {
                            scope.requestData.dateTo = Moment.moment(scope.requestData.dateFrom).format("YYYY-MM-DD");
                            adjustEditionFromDate();
                        }
                        if(Moment.get(scope.requestData.dateFrom).unix() < Moment.get(scope.requestData.dateTo).add((-1 * (Config.main.showResultsMaxDays)), 'days').unix()) {
                            scope.requestData.dateTo  = Moment.moment(scope.requestData.dateFrom).add((Config.main.showResultsMaxDays), 'days').format("YYYY-MM-DD");
                        }
                        scope.minFromDate = Moment.moment(scope.requestData.dateTo).add((-1 * (Config.main.showResultsMaxDays)), 'days');
                        return;
                    case 'to':
                        if (Moment.get(scope.requestData.dateFrom).unix() > Moment.get(scope.requestData.dateTo).unix()) {
                            scope.requestData.dateFrom = Moment.moment(scope.requestData.dateTo).format("YYYY-MM-DD");
                        }
                        if(Moment.get(scope.requestData.dateFrom).unix() < Moment.get(scope.requestData.dateTo).add((-1 * (Config.main.showResultsMaxDays)), 'days').unix()){
                            scope.requestData.dateFrom = Moment.moment(scope.requestData.dateTo).add((-1 * (Config.main.showResultsMaxDays)), 'days').format("YYYY-MM-DD");
                        }
                        scope.minFromDate = Moment.moment(scope.requestData.dateTo).add((-1 * (Config.main.showResultsMaxDays)), 'days');
                        return;
                }
            };

            /**
             * @ngdoc method
             * @name adjustEditionFromDate
             * @description adjust edition date based on edition number
             * @methodOf vbet5.directive:sportsResults
             */
            function adjustEditionFromDate() {
                if (Config.main.edition && Config.main.edition.enabled) {
                    var fromInt = scope.requestData.dateFrom && scope.requestData.dateFrom.getTime ? scope.requestData.dateFrom.getTime() : scope.today;
                    var edition = Moment.get(fromInt).locale('en');
                    scope.editionNumber = parseInt(edition.format('DDD'), 10) + ((Config.main.edition && Config.main.edition.offset) || 0);
                }
            }

            /**
             * @ngdoc method
             * @name adjustEditionDate
             * @description adjust edition date based on edition number
             * @methodOf vbet5.directive:sportsResults
             */
            function adjustEditionDate() {
                if (Config.main.edition && Config.main.edition.enabled) {
                    var currentYear = parseInt(new Date().getFullYear(), 10),
                        currentYearTimestamp = new Date(currentYear, 0, 1, 0, 0, 0, 0).getTime(),
                        daySeconds = 60 * 60 * 24 * 1000,
                        editionInt = parseInt(scope.editionNumber || 0, 10) - parseInt(Config.main.edition.offset || 0, 10) - 1,
                        processedTime = currentYearTimestamp + editionInt * daySeconds,
                        getEditionDay = Moment.moment(processedTime).format('YYYY-MM-DD');
                    scope.requestData.dateFrom = getEditionDay;
                    scope.requestData.dateTo = getEditionDay;
                }
            }

            /**
             * @ngdoc method
             * @name loadSportsList
             * @description load list of sports
             * @methodOf vbet5.directive:sportsResults
             */
            function loadSportsList() {
                var deferred = $q.defer();

                var requestSportList = {
                    'source': 'betting',
                    'what': {'sport': ['id', 'name']}
                };

                Utils.setCustomSportAliasesFilter(requestSportList);

                Zergling.get(requestSportList, 'get').then(function (result) {
                    if (result.data.sport) {
                        scope.sportList = Utils.objectToArray(result.data.sport);
                        scope.requestData.sport = scope.selectedSport || scope.sportList[0];
                    }
                })['finally'](function() {
                    deferred.resolve([]);
                });

                return deferred.promise;
            }

            /**
             * @ngdoc method
             * @name loadCompetitionsList
             * @description load competition list depending seleced sport
             * @methodOf vbet5.directive:sportsResults
             */
            scope.loadCompetitionsList = function loadCompetitionsList() {
                var deferred = $q.defer();
                scope.loadingProcess = true;
                Zergling.get(
                    {
                        'source': 'betting',
                        'what': {
                            'region': ['id', 'name'],
                            'competition': ['id', 'name']

                        },
                        'where': {
                            'sport': {'id': scope.requestData.sport.id}
                        }
                    },
                    'get'
                ).then(function (result) {
                    scope.competitionsList = [];
                    angular.forEach(result.data.region, function (region) {
                        angular.forEach(region.competition, function (competition) {
                            competition.region = {
                                id: region.id,
                                name: region.name
                            };
                            scope.competitionsList.push(competition);
                        });
                    });

                    if (scope.competitionsList.length > 1) {
                        scope.competitionsList.sort(function(a, b) {
                            return (a.region.name + ' - ' + a.name).localeCompare(b.region.name + ' - ' + b.name);
                        });
                    }
                    scope.requestData.competition = scope.competitionsList[0];
                    scope.loadGames();
                })['finally'](function () {
                    deferred.resolve(null);
                });

                return deferred.promise;
            };

            /**
             * @ngdoc method
             * @name loadGames
             * @description load  result of game data
             * @methodOf vbet5.directive:sportsResults
             */
            scope.loadGames = function loadGames() {
                adjustEditionDate();
                scope.loadingProcess = true;
                scope.expandedGames = [];

                var request = {};
                request.is_date_ts = 1;
                request.sport_id = scope.requestData.sport.id;
                request.competition_id = scope.requestData.competition.id;
                //request.live = Number(scope.requestData.live);
                request.from_date = Moment.get(Moment.moment(scope.requestData.dateFrom).format().split('T')[0] + 'T00:00:00'+ timeZone).unix();

                var toUnixDate = Moment.get(Moment.moment(scope.requestData.dateTo).format().split('T')[0] + 'T23:59:59'+ timeZone).unix();

                request.to_date = toUnixDate < Moment.get().unix() ? toUnixDate :  Moment.get().unix();

                Zergling.get(request, 'get_result_games').then(function (result) {
                    scope.sortByDate = true;
                    scope.gamesResult = [];
                    if (result.games && result.games.game) {
                        var games = [];
                        if (result.games.game[0]) { // checking if game is array (if one game, then game is object)
                            angular.forEach(result.games.game, function (game) {
                                if (game.date <= Moment.get().unix()) {
                                    games.push(game);
                                }
                            });
                        } else if (result.games.game.date <= Moment.get()) {
                            games[0] = result.games.game;
                        }
                        scope.gamesResult = games;
                    }
                })['finally'](function () {
                    scope.loadingProcess = false;
                });
            };

            /**
             * @ngdoc method
             * @name getResultDetails
             * @description load game result details
             * @methodOf vbet5.directive:sportsResults
             */
            function getResultDetails(game) {
                var gameId = parseInt(game.game_id);
                if (scope.expandedGames.indexOf(game.game_id) === -1) {
                    return;
                }

                if (!game.details || !(game.details.length > 0)) {
                    game.additionalDetailsAreLoading = true;
                    game.details = [];
                    Zergling.get({'game_id': gameId}, 'get_results').then(function (result) {
                        if (result.lines && result.lines.line) {
                            if (result.lines.line[0]) {
                                angular.forEach(result.lines.line, function (line) {
                                    game.details.push(composeResultDetailItem(line));
                                });
                            } else {
                                if(result.lines.line.events !== undefined){
                                    game.details.push(composeResultDetailItem(result.lines.line));
                                }
                            }
                        }
                    })['finally'](function (reason) {
                        game.additionalDetailsAreLoading = false;
                    });
                }
            }

            /**
             * @ngdoc method
             * @name toggleGameDetails
             * @description expands/collapses game details
             * @param {Object} game
             * @methodOf vbet5.directive:sportsResults
             */
            scope.toggleGameDetails = function toggleGameDetails(game) {
                if(scope.expandedGames.indexOf(game.game_id) != -1) {
                    Utils.removeElementFromArray(scope.expandedGames, game.game_id);
                } else {
                    scope.expandedGames.push(game.game_id);
                }
                getResultDetails(game);
            };

            /**
             * @ngdoc method
             * @name composeResultDetailItem
             * @methodOf vbet5.directive:sportsResults
             * @description Prepare game details for the template
             * @param {Object} game data
             */
            function composeResultDetailItem(item) {
                var detail = {};
                detail.line_name = item.line_name;
                detail.event_name = [];
                if(angular.isArray(item.events.event_name)) {
                    detail.event_name = item.events.event_name;
                } else {
                    detail.event_name[0] = item.events.event_name;
                }
                return detail;
            }

            (function init() {
                adjustEditionFromDate();
                scope.loadingProcess = true;

                var handleCompetitions = function () {
                    if (!scope.competitionsList) {
                        scope.loadCompetitionsList().then(function() {
                            scope.selectedCompetition && (scope.requestData.competition = scope.selectedCompetition);
                            scope.loadGames();
                        });
                    } else {
                        scope.requestData.competition = scope.selectedCompetition || scope.competitionsList[0];
                        scope.loadGames();
                    }
                };

                if (!scope.sportList) {
                    loadSportsList().then(handleCompetitions);
                } else {
                    scope.requestData.sport = scope.selectedSport || scope.sportList[0];
                    handleCompetitions();
                }
            })();
        }
    };
}]);

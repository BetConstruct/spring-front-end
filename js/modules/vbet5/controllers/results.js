/**
 * @ngdoc controller
 * @name vbet5.controller:ResultsController
 * @description
 * ResultsController controller
 */
angular.module('vbet5.betting').controller('ResultsController', ['$rootScope', '$scope', '$q', 'Zergling', 'Config', 'Moment', 'Translator', 'Utils', 'GameInfo',
    function ($rootScope, $scope, $q, Zergling, Config, Moment, Translator, Utils, GameInfo) {
        'use strict';

        var timeZone = Config.env.selectedTimeZone || '';
        var request = {}, defaultGameList = true;
        var sportListPromise;

        Moment.setLang(Config.env.lang);
        Moment.updateMonthLocale();
        Moment.updateWeekDaysLocale();

        $rootScope.footerMovable = true; // make footer movable
        $scope.today = Moment.get().format("YYYY-MM-DD");
        $scope.requestData = {
            dateFrom: $scope.today,
            dateTo: $scope.today,
            live: false
        };
        $scope.minFromDate = Moment.moment($scope.requestData.dateTo).add((-1 * (Config.main.showResultsMaxDays)), 'days');
        $scope.minToDate = Moment.moment().add(-730, 'days');
        $scope.sortByDate = true;
        $scope.todayResult = false;
        $scope.todayGameList = null;
        $scope.todayGameListLoaded = false;
        $scope.gamesResult = null;
        $scope.gameListLoaded = false;
        $scope.dateOptions = { showWeeks: 'false' };
        $scope.expandedGames = [];

        $scope.requestData = {
            dateFrom: $scope.today,
            dateTo: $scope.today,
            live: false
        };

        $scope.virtualSportsIds = {
            horse_racing_id: 1124636817,
            greyhounds_id: 1124639301
        };

        /**
         * @ngdoc method
         * @name openFrom
         * @description hide 'date to' picker and show or hide 'date from' picker
         * @methodOf vbet5.controller:ResultsController
         */
        $scope.openFrom = function openFrom($event) {
            $event.preventDefault();
            $event.stopPropagation();
            $scope.openedTo = false;
            $scope.openedFrom = !$scope.openedFrom;
        };

        /**
         * @ngdoc method
         * @name openTo
         * @description load game list
         * @methodOf hide 'date from' picker and show or hide 'date to' picker
         */
        $scope.openTo = function openTo($event) {
            $event.preventDefault();
            $event.stopPropagation();
            $scope.openedFrom = false;
            $scope.openedTo = !$scope.openedTo;
        };

        /**
         * @ngdoc method
         * @name loadSports
         * @description load game list
         * @methodOf vbet5.controller:ResultsController
         */
        function loadSports() {
            var deferred = $q.defer();
            sportListPromise = deferred.promise;

            var requestSportList = {
                'source': 'betting',
                'what': {'sport': ['id', 'name']}
            };
            if (Config.main.disableVirtualSportsInResults && !Config.main.GmsPlatform) {
                requestSportList.where = {'sport': {'id': {'@nin': Config.main.virtualSportIds}}}
            }
            Utils.setCustomSportAliasesFilter(requestSportList);

            Zergling.get(requestSportList, 'get').then(function (result) {
                if (result.data.sport) {
                    $scope.sportList = Utils.objectToArray(result.data.sport);
                    deferred.resolve($scope.sportList);
                    $scope.requestData.sport = $scope.sportList[0];
                }

                $scope.updateCompetition();

            })['catch'](function (reason) {
                deferred.resolve([]);
                console.log('Error:', reason);
            });
        }

        loadSports();

        /**
         * @ngdoc method
         * @name updateCompetition
         * @description update competition list depending region
         * @methodOf vbet5.controller:ResultsController
         */
        $scope.updateCompetition = function updateCompetition() {
            Zergling.get(
                {
                    'source': 'betting',
                    'what': {
                        'region': ['id', 'name'],
                        'competition': ['id', 'name']

                    },
                    'where': {
                        'sport': {'id': $scope.requestData.sport.id}
                    }
                },
                'get'
            ).then(function (result) {

                $scope.competitionList = [];
                angular.forEach(result.data.region, function (region) {
                    angular.forEach(region.competition, function (competition) {
                        competition.region = {
                            id: region.id,
                            name: region.name
                        };
                        $scope.competitionList.push(competition);
                    });
                });

                $scope.competitionList = $scope.competitionList.sort(function(a, b) {
                    return (a.region.name + ' - ' + a.name).localeCompare(b.region.name + ' - ' + b.name);
                });
                $scope.competitionList.unshift({id: '-1', name: Translator.get('All')}); //The value of id need for correct displaying of ng-options



                $scope.requestData.competition = $scope.competitionList[0];

                if (defaultGameList) {
                    $scope.searchGames();
                    defaultGameList = false;
                }
            })['catch'](function (reason) {
                console.log('Error:', reason);
            });
        };

        /**
         * @ngdoc method
         * @name adjustEditionFromDate
         * @description adjust edition date based on edition number
         * @methodOf vbet5.controller:ResultsController
         */
        function adjustEditionFromDate() {
            if (Config.main.edition && Config.main.edition.enabled) {
                var fromInt = $scope.requestData.dateFrom && $scope.requestData.dateFrom.getTime ? $scope.requestData.dateFrom.getTime() : $scope.today;
                var edition = Moment.get(fromInt).locale('en');
                $scope.editionNumber = parseInt(edition.format('DDD'), 10) + ((Config.main.edition && Config.main.edition.offset) || 0);
            }
        }

        adjustEditionFromDate();

        /**
         * @ngdoc method
         * @name adjustEditionDate
         * @description adjust edition date based on edition number
         * @methodOf vbet5.controller:ResultsController
         */
        function adjustEditionDate() {
            if (Config.main.edition && Config.main.edition.enabled) {
                var currentYear = parseInt(new Date().getFullYear(), 10),
                    currentYearTimestamp = new Date(currentYear, 0, 1, 0, 0, 0, 0).getTime(),
                    daySeconds = 60 * 60 * 24 * 1000,
                    editionInt = parseInt($scope.editionNumber || 0, 10) - parseInt(Config.main.edition.offset || 0, 10) - 1,
                    processedTime = currentYearTimestamp + editionInt * daySeconds,
                    getEditionDay = Moment.moment(processedTime).format('YYYY-MM-DD');
                $scope.requestData.dateFrom = getEditionDay;
                $scope.requestData.dateTo = getEditionDay;
            }
        }

        /**
         * @ngdoc method
         * @name searchGames
         * @description load search result of game data
         * @methodOf vbet5.controller:ResultsController
         */
        $scope.searchGames = function searchGames() {
            adjustEditionDate();
            $scope.expandedGames = [];
            $scope.gameListLoaded = true;
            $scope.todayResult = false;
            request.is_date_ts = 1;
            request.sport_id = $scope.requestData.sport.id;
            request.competition_id = $scope.requestData.competition.id >= 0 ? $scope.requestData.competition.id : '';
            request.live = Number($scope.requestData.live);
            request.from_date = Moment.get(Moment.moment($scope.requestData.dateFrom).format().split('T')[0] + 'T00:00:00'+ timeZone).unix();

            var toUnixDate = Moment.get(Moment.moment($scope.requestData.dateTo).format().split('T')[0] + 'T23:59:59'+ timeZone).unix();

            request.to_date = toUnixDate < Moment.get().unix() ? toUnixDate :  Moment.get().unix();

            $scope.gameListLoaded = true;

            Zergling.get(request, 'get_result_games').then(function (result) {
                $scope.gameListLoaded = false;
                $scope.sortByDate = true;
                $scope.gamesResult = [];
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
                    $scope.gamesResult = adjustGames(games);
                }
            })['catch'](function (reason) {
                console.log('Error:', reason);
                $scope.gameListLoaded = false;
            });
        };

        /**
         * adjust competition's name
         */
        function adjustGames(games) {
            if (!$scope.requestData.live) {
                if(!Config.main.GmsPlatform) {
                    for (var i = 0, length = games.length; i < length; i += 1) {
                        games[i].competition_name = games[i].competition_name.split(".").splice(1, 10).join();
                    }
                }
            }

            return games;
        }

        /**
         * @ngdoc method
         * @name adjustDate
         * @description adjusted 'FromDate' dataPicker if FromDate is higher than ToDate and vice versa
         * @methodOf vbet5.controller:ResultsController
         */
        $scope.adjustDate = function adjustDate(type) {
            switch (type) {
                case 'from':
                    if (Moment.get($scope.requestData.dateFrom).unix() > Moment.get($scope.requestData.dateTo).unix() || (Config.main.edition && Config.main.edition.enabled)) {
                        $scope.requestData.dateTo = Moment.moment($scope.requestData.dateFrom).format("YYYY-MM-DD");
                        adjustEditionFromDate();
                    }
                    if(Moment.get($scope.requestData.dateFrom).unix() < Moment.get($scope.requestData.dateTo).add((-1 * (Config.main.showResultsMaxDays)), 'days').unix()) {
                        $scope.requestData.dateTo  = Moment.moment($scope.requestData.dateFrom).add((Config.main.showResultsMaxDays), 'days').format("YYYY-MM-DD");
                    }
                    $scope.minFromDate = Moment.moment($scope.requestData.dateTo).add((-1 * (Config.main.showResultsMaxDays)), 'days');
                    return;
                case 'to':
                    if (Moment.get($scope.requestData.dateFrom).unix() > Moment.get($scope.requestData.dateTo).unix()) {
                        $scope.requestData.dateFrom = Moment.moment($scope.requestData.dateTo).format("YYYY-MM-DD");
                    }
                    if(Moment.get($scope.requestData.dateFrom).unix() < Moment.get($scope.requestData.dateTo).add((-1 * (Config.main.showResultsMaxDays)), 'days').unix()){
                        $scope.requestData.dateFrom = Moment.moment($scope.requestData.dateTo).add((-1 * (Config.main.showResultsMaxDays)), 'days').format("YYYY-MM-DD");
                    }
                    $scope.minFromDate = Moment.moment($scope.requestData.dateTo).add((-1 * (Config.main.showResultsMaxDays)), 'days');
                    return;
            }
        };

        /**
         * @ngdoc method
         * @name todayResults
         * @description load Today's Result data for all game type
         * @methodOf vbet5.controller:ResultsController
         */
        $scope.todayResults = function todayResults() {
            var requestTodayResults = {};
            requestTodayResults.is_date_ts = 1;
            requestTodayResults.from_date = Moment.get(Moment.moment().format().split('T')[0] + 'T00:00:00'+ timeZone).unix();
            requestTodayResults.to_date =  Moment.get().unix();
            $scope.todayGameListLoaded = true;
            Zergling.get(requestTodayResults, 'get_result_games').then(function (result) {
                if (result.games.game) {
                    var todayGameList = {};
                    sportListPromise.then(function (sportList) {
                        angular.forEach(sportList, function (sport) {
                            angular.forEach(result.games.game, function (game) {
                                if(game.sport_id && game.competition_name && sport.id == game.sport_id){
                                    game.name = game.sport_name || game.competition_name.split('.').slice(0, 1)[0];
                                    if (game.date <= Moment.get().unix()) {
                                        if (!todayGameList[game.sport_id]) {
                                            if (!Config.main.disableVirtualSportsInResults || Config.main.virtualSportIds.indexOf(parseInt(game.sport_id))  === -1) {
                                                todayGameList[game.sport_id] = {};
                                                todayGameList[game.sport_id].sport = [];
                                            }
                                        }
                                        if (todayGameList[game.sport_id]) {
                                            todayGameList[game.sport_id].sport.push(game);
                                        }
                                    }
                                }
                            });
                        });
                        $scope.todayGameListLoaded = false;
                        $scope.todayGameList = Utils.objectToArray(todayGameList);
                        if (Config.main.resultMenuOrdering) {
                            var index;
                            angular.forEach($scope.todayGameList, function (sport) {
                                index = Config.main.resultMenuOrdering.indexOf(parseFloat(sport.sport[0].sport_id));
                                sport.order = index !== -1 ? index : sport.sport[0].sport_id;
                            });
                            $scope.todayGameList.sort(Utils.orderSorting);
                        }
                    });
                }
            })['catch'](function (reason) {
                console.log('Error:', reason);
                $scope.todayGameListLoaded = false;
            });
        };

        /**
         * @ngdoc method
         * @name resultsBySport
         * @description load Today's Result of game data depend game type
         * @methodOf vbet5.controller:ResultsController
         */
        $scope.resultsBySport = function resultsBySport(game) {
            $scope.expandedGames = [];
            $scope.todayResult = true;
            $scope.sortByDate = true;
            $scope.gamesResult = game.sport;
            var sport_id = game.sport[0].sport_id;
            if($scope.requestData.sport.id == sport_id) {
                return;
            }
            if ($scope.sportList) {
                angular.forEach($scope.sportList, function (sport) {
                    if (sport.id == sport_id) {
                        $scope.requestData.sport = sport;
                        $scope.updateCompetition();
                    }
                });
            }
        };

        /**
         * @ngdoc method
         * @name composeResultDetailItem
         * @methodOf vbet5.controller:ResultsController
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

        /**
         * @ngdoc method
         * @name getResultDetails
         * @description load game result details
         * @methodOf vbet5.controller:ResultsController
         */
        function getResultDetails(game) {
            var command;
            var gameId = parseInt(game.game_id);
            if ($scope.expandedGames.indexOf(game.game_id) === -1) {
                return;
            }

            command =[1124636817, 1124639301, 1682284039].indexOf(parseInt(game.sport_id))  === -1 ? 'get_results' : 'get_score_results'; // Virtual Sports without football and tennis
            if (!game.details || !(game.details.length > 0)) {
                game.additionalDetailsAreLoading = true;
                game.details = [];
                Zergling.get({'game_id': gameId}, command).then(function (result) {
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
                    game.additionalDetailsAreLoading = false;
                })['catch'](function (reason) {
                    game.additionalDetailsAreLoading = false;
                    console.log('Error:', reason);
                });
            }
        }

        /**
         * @ngdoc method
         * @name toggleGameDetails
         * @description expands/collapses game details
         * @param {Object} game
         */
        $scope.toggleGameDetails = function toggleGameDetails(game) {
            if($scope.expandedGames.indexOf(game.game_id) != -1) {
                Utils.removeElementFromArray($scope.expandedGames, game.game_id);
            } else {
                $scope.expandedGames.push(game.game_id);
            }
            getResultDetails(game);
        };
    }]);
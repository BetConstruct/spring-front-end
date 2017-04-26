/**
 * @ngdoc controller
 * @name vbet5.controller:ResultsV2Controller
 * @description
 * Results version 2 controller
 */
angular.module('vbet5.betting').controller('ResultsV2Controller', ['$rootScope', '$scope', '$q', '$filter', 'Zergling', 'Config', 'Moment', 'Translator', 'Utils', 'GameInfo', 'Storage',
    function ($rootScope, $scope, $q, $filter, Zergling, Config, Moment, Translator, Utils, GameInfo, Storage) {
        'use strict';

        var timeZone = Config.env.selectedTimeZone || '';
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
        $scope.datePicker = {
            openedFrom: false,
            openedTo: false
        };
        $scope.minFromDate = Moment.moment($scope.requestData.dateTo).add((-1 * (Config.main.showResultsMaxDays)), 'days');
        $scope.minToDate = Moment.moment().add(-730, 'days');
        $scope.sortByDate = true;
        $scope.todayResult = false;
        $scope.todayGameList = null;
        $scope.todayGameListLoaded = false;
        $scope.gamesResult = null;
        $scope.gameListLoaded = false;
        $scope.dateOptions = {showWeeks: 'false'};
        $scope.expandedGames = [];
        $scope.hoursList = [1, 2, 3, 6, 12, 24, 48, 72];

        $scope.requestData = {
            dateFrom: $scope.today,
            dateTo: $scope.today,
            live: 0
        };

        $scope.virtualSportsIds = {
            horse_racing_id: 1124636817,
            greyhounds_id: 1124639301
        };

        $scope.openGame = false;

        // Results version 2

        // V2 results we are going to declare them only if V2 is enabled
        $scope.selectedCompetitions = Storage.get('resultsV2selectedCompetitions') || {};
        $scope.competitionClosed = {};
        $scope.competitionInfo = {};
        $scope.games = {};

        /**
         * @ngdoc method
         * @name updateLeftMenu
         * @description Load left menu and update it based on filters
         * @methodOf vbet5.controller:ResultsV2Controller
         * @param {Boolean} Clear games from scope if true
         */
        $scope.updateLeftMenu = function updateLeftMenu(clearGames) {
            console.log('---------------------');
            console.log($scope.selectedCompetitions);

            if (clearGames) {
                $scope.games = {};
            }

            Storage.set('resultsV2selectedCompetitions', $scope.selectedCompetitions);
            angular.forEach($scope.games, function (game, competitionId) {
                if (!$scope.selectedCompetitions[competitionId]) {
                    delete $scope.games[competitionId];
                }
            });

            angular.forEach($scope.selectedCompetitions, function (competitionState, competitionId) {
                if (competitionState && !$scope.games[competitionId]) {
                    $scope.loadGames(competitionId);
                }
            });

            $scope.requestData.gamesCount = countGames();

        };

        /**
         * @ngdoc method
         * @name updateLeftMenu
         * @description Load games for selected menu item
         * @methodOf vbet5.controller:ResultsV2Controller
         * @param {Number} Competition ID
         */
        $scope.loadGames = function loadGames(competitionId) {
            console.log('--------------------------');
            console.log($scope.games);
            console.log(competitionId);
            console.log($scope.competitionInfo);

            $scope.loading = true;
            var request = {}, toUnixDate;
            request.is_date_ts = 1;
            //request.sport_id = $scope.competitionInfo[competitionId] && $scope.competitionInfo[competitionId].sport.id;
            request.competition_id = parseInt(competitionId, 10);
            request.live = $scope.requestData.live;
            if (!$scope.requestData.selectHours) {
                request.from_date = Moment.get(Moment.moment($scope.requestData.dateFrom).format().split('T')[0] + 'T00:00:00' + timeZone).unix();
                toUnixDate = Moment.get(Moment.moment($scope.requestData.dateTo).format().split('T')[0] + 'T23:59:59' + timeZone).unix();
                request.to_date = toUnixDate < Moment.get().unix() ? toUnixDate : Moment.get().unix();
            } else {
                request.to_date = Moment.get().unix();
                request.from_date = request.to_date - ($scope.requestData.selectHours * 24 * 60);
            }
            $scope.gameListLoaded = true;

            console.log('----------------------------------');
            console.log(request);

            Zergling.get(request, 'get_result_games').then(function (result) {
                $scope.loading = false;
                $scope.games[competitionId] = [];
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
                    var gamesGrouped = {};
                    angular.forEach(games, function (game) {
                        var gameDate = $filter('formatDate')(game.date, 'MMMM DD, YYYY'),
                            gameDateIndex = parseInt($filter('formatDate')(game.date, 'YYYYMMDD'), 10);
                            gamesGrouped[gameDateIndex] = gamesGrouped[gameDateIndex] || {
                                    date: gameDate,
                                    dateIndex: gameDateIndex,
                                    games: []
                                };

                        gamesGrouped[gameDateIndex].games.push(game);

                    });

                    gamesGrouped = Utils.objectToArray(gamesGrouped).sort(function orderSorting(a, b) {
                        return a.dateIndex - b.dateIndex;
                    });
                    $scope.games[competitionId] = gamesGrouped;
                    $scope.requestData.gamesCount = countGames();
                }
            })['catch'](function (reason) {
                console.log('Error:', reason);
                $scope.loading = false;
            });

        };

        /**
         * @ngdoc method
         * @name countGames
         * @description Count total games
         * @methodOf vbet5.controller:ResultsV2Controller
         */
        function countGames () {
            var total = 0;
            angular.forEach($scope.games, function (gameDates) {
                angular.forEach(gameDates, function (game) {
                    total++;
                });
            });
            return total;
        }

        /**
         * @ngdoc method
         * @name openFrom
         * @description hide 'date to' picker and show or hide 'date from' picker
         * @methodOf vbet5.controller:ResultsV2Controller
         */
        $scope.openFrom = function openFrom($event) {
            $event.preventDefault();
            $event.stopPropagation();
            $scope.datePicker.openedTo = false;
            $scope.datePicker.openedFrom = !$scope.datePicker.openedFrom;
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
            $scope.datePicker.openedFrom = false;
            $scope.datePicker.openedTo = !$scope.datePicker.openedTo;
        };

        /**
         * @ngdoc method
         * @name loadSports
         * @description load game list
         * @methodOf vbet5.controller:ResultsV2Controller
         */
        function loadSports() {
            var deferred = $q.defer();
            sportListPromise = deferred.promise;

            var requestSportList = {
                'source': 'betting',
                'what': {
                    'sport': ['id', 'name', 'alias', 'order']
                }
            };
            if (Config.main.disableVirtualSportsInResults && !Config.main.GmsPlatform) {
                requestSportList.where = {'sport': {'id': {'@nin': Config.main.virtualSportIds}}}
            }
            if (Config.main.results.version === 2) {
                requestSportList.what.region = ['id', 'name', 'alias', 'order'];
                requestSportList.what.competition = ['id', 'name', 'order'];
            }
            Utils.setCustomSportAliasesFilter(requestSportList);

            Zergling.get(requestSportList, 'get').then(function (result) {
                if (result.data.sport) {
                    $scope.sportList = Utils.objectToArray(result.data.sport).sort(Utils.orderSorting);
                    deferred.resolve($scope.sportList);
                    $scope.requestData.sport = $scope.sportList[0];

                    if (Config.main.results.version === 2) {
                        angular.forEach($scope.sportList, function (sport) {
                            sport.region = Utils.objectToArray(sport.region).sort(Utils.orderSorting);
                            angular.forEach(sport.region, function (region) {
                                angular.forEach(region.competition, function (competition) {
                                    if ($scope.selectedCompetitions[competition.id]) {
                                        sport.expanded = true;
                                        region.expanded = true;
                                    }
                                    competition.sport = {id: sport.id};
                                    $scope.competitionInfo[competition.id] = competition;
                                });
                                region.competition = Utils.objectToArray(region.competition).sort(Utils.orderSorting);

                            });
                        });
                    }

                }

                $scope.updateLeftMenu();


            })['catch'](function (reason) {
                deferred.resolve([]);
                console.log('Error:', reason);
            });
        }

        loadSports();

        /**
         * @ngdoc method
         * @name adjustEditionFromDate
         * @description adjust edition date based on edition number
         * @methodOf vbet5.controller:ResultsV2Controller
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
         * @name adjustDate
         * @description adjusted 'FromDate' dataPicker if FromDate is higher than ToDate and vice versa
         * @methodOf vbet5.controller:ResultsV2Controller
         */
        $scope.adjustDate = function adjustDate(type, hours) {
            $scope.requestData.selectHours = null;
            switch (type) {
                case 'from':
                    if (Moment.get($scope.requestData.dateFrom).unix() > Moment.get($scope.requestData.dateTo).unix() || (Config.main.edition && Config.main.edition.enabled)) {
                        $scope.requestData.dateTo = Moment.moment($scope.requestData.dateFrom).format("YYYY-MM-DD");
                        adjustEditionFromDate();
                    }
                    if (Moment.get($scope.requestData.dateFrom).unix() < Moment.get($scope.requestData.dateTo).add((-1 * (Config.main.showResultsMaxDays)), 'days').unix()) {
                        $scope.requestData.dateTo = Moment.moment($scope.requestData.dateFrom).add((Config.main.showResultsMaxDays), 'days').format("YYYY-MM-DD");
                    }
                    $scope.minFromDate = Moment.moment($scope.requestData.dateTo).add((-1 * (Config.main.showResultsMaxDays)), 'days');
                    break;
                case 'to':
                    if (Moment.get($scope.requestData.dateFrom).unix() > Moment.get($scope.requestData.dateTo).unix()) {
                        $scope.requestData.dateFrom = Moment.moment($scope.requestData.dateTo).format("YYYY-MM-DD");
                    }
                    if (Moment.get($scope.requestData.dateFrom).unix() < Moment.get($scope.requestData.dateTo).add((-1 * (Config.main.showResultsMaxDays)), 'days').unix()) {
                        $scope.requestData.dateFrom = Moment.moment($scope.requestData.dateTo).add((-1 * (Config.main.showResultsMaxDays)), 'days').format("YYYY-MM-DD");
                    }
                    $scope.minFromDate = Moment.moment($scope.requestData.dateTo).add((-1 * (Config.main.showResultsMaxDays)), 'days');
                    break;
                case 'hours':
                    $scope.requestData.selectHours = hours;
                    $scope.requestData.showDropDown = false;
                    $scope.requestData.dateFrom = $scope.today;
                    $scope.requestData.dateTo = $scope.today;
            }
            $scope.updateLeftMenu(true);

        };

        /**
         * @ngdoc method
         * @name closeCompetition
         * @description Close competition block
         * @methodOf vbet5.controller:ResultsV2Controller
         */
        $scope.closeCompetition = function closeCompetition (competitionId){
            delete $scope.games[competitionId];
            $scope.selectedCompetitions[competitionId] = false;
        };

        /**
         * @ngdoc method
         * @name getResultDetails
         * @description load game result details
         * @methodOf vbet5.controller:ResultsV2Controller
         */
        $scope.getResultDetails = function getResultDetails(game) {
            var command;
            var gameId = parseInt(game.game_id);

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
                    $scope.openGame = game;
                })['catch'](function (reason) {
                    game.additionalDetailsAreLoading = false;
                });
            }
        };

        /**
         * @ngdoc method
         * @name composeResultDetailItem
         * @description Prepare game info fot template
         * @methodOf vbet5.controller:ResultsV2Controller
         * @param {Object} Game info object
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
    }]);
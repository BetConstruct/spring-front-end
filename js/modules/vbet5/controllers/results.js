/**
 * @ngdoc controller
 * @name vbet5.controller:ResultsController
 * @description
 * ResultsController controller
 */
angular.module('vbet5.betting').controller('ResultsController', ['$rootScope', '$scope', '$q', 'Zergling', 'Config', 'Moment', 'Translator', 'Utils','$location',
    function ($rootScope, $scope, $q, Zergling, Config, Moment, Translator, Utils, $location) {
        'use strict';

        var timeZone = Config.env.selectedTimeZone || '';
        var defaultGameList = true;
        var showResultsMaxDays = 2; // Max days is currently hardcoded as "get_active_competitions" request can't show results for more than two days. May change in the future.

        Moment.setLang(Config.env.lang);
        Moment.updateMonthLocale();
        Moment.updateWeekDaysLocale();

        $rootScope.footerMovable = true; // make footer movable
        $scope.today = Moment.get().lang("en").format("YYYY-MM-DD");
        $scope.maxDay = new Date(Moment.moment($scope.today).lang("en").format()); // This adjusts max day if a there is a timezone config
        $scope.requestData = {
            dateFrom: $scope.maxDay,
            dateTo: $scope.maxDay,
            live: false
        };
        $scope.minFromDate = Moment.moment($scope.requestData.dateTo).add((-1 * (showResultsMaxDays)), 'days');
        $scope.minToDate = Moment.moment().add(-730, 'days');
        $scope.sortByDate = true;
        $scope.todayResult = true;
        $scope.todayGameList = null;
        $scope.todayGameListLoaded = false;
        $scope.gamesResult = null;
        $scope.gameListLoaded = false;
        $scope.dateOptions = { showWeeks: 'false' };
        $scope.expandedGames = [];

        $scope.virtualSportsIds = {
            horse_racing_id: 1124636817,
            greyhounds_id: 1124639301
        };

        var previousDate = Moment.moment($scope.requestData.dateFrom).lang("en").format("YYYY-MM-DD");

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
         * @name loadSportsAndCompetitions
         * @methodOf vbet5.controller:ResultsController
         * @description Loads data of active sports and their respective competitions for the chosen date
         * @param {Boolean} initialLoad - if true loads data for the initial load of the page
         * @param {Boolean} loadSports - loads active sports and competitions for the selected date
         */
        $scope.loadSportsAndCompetitions = function loadSportsAndCompetitions(initialLoad, loadSports) {
            $scope.updatingCompetitions = true;

            var request = {};
            formatRequestDate(request, initialLoad);

            Zergling.get(request, "get_active_competitions").then(function (result) {
                if (result.details) {
                    var sportToProcess;
                    var todayGameList = [];
                    angular.forEach(result.details, function(sport) {
                        if (loadSports && $scope.requestData.sport.id === sport.Id) {
                            // Checking if a sport was active on a changed date
                            sportToProcess = true;
                        }
                        todayGameList.push({id: sport.Id, name: sport.Name, Regions: sport.Regions});
                    });

                    if (!Config.main.resultMenuOrdering) {
                        $scope.sportList = Utils.orderByField(todayGameList, 'id');
                    } else {
                        var index;
                        angular.forEach(todayGameList, function (sport) {
                            index = Config.main.resultMenuOrdering.indexOf(parseFloat(sport.id));
                            sport.order = index !== -1 ? index : sport.id;
                        });
                        $scope.sportList = todayGameList.sort(Utils.orderSorting);
                    }

                    if (initialLoad) {
                        $scope.todayGameList = todayGameList;
                        $scope.requestData.sport = $scope.sportList[0];
                        $scope.processCompetitionData($scope.requestData.sport);
                        $scope.todayGameListLoaded = true;
                    } else if (loadSports) {
                        if (!sportToProcess) {
                            $scope.requestData.sport = $scope.sportList[0];
                        }
                        $scope.updatingCompetitions = false;
                    }
                }
            })['catch'](function (reason) {
                console.log('Error:', reason);
                if (initialLoad) {
                    $scope.todayGameListLoaded = false;
                }
            });
        };

        /**
         * @ngdoc method
         * @name processCompetitionData
         * @methodOf vbet5.controller:ResultsController
         * @description Processes data of competitions
         * @param {Object} data - data received from "get_active_competitions" call
         */
        $scope.processCompetitionData = function processCompetitionData(data) {
            if (!data) {return;}
            $scope.updatingCompetitions = true;
            $scope.competitionList = [];
            angular.forEach(data.Regions, function(region) {
                angular.forEach(region.Competitions, function(competition) {
                    competition.region = {
                        id: region.Id,
                        name: region.Name
                    };
                    $scope.competitionList.push(competition);
                });
            });

            $scope.competitionList = $scope.competitionList.sort(function(a, b) {
                return (a.region.name + ' - ' + a.Name).localeCompare(b.region.name + ' - ' + b.Name);
            });
            $scope.competitionList.unshift({Id: '-1', Name: Translator.get('All')}); //The value of id need for correct displaying of ng-options

            $scope.requestData.competition = $scope.competitionList[0];

            if (defaultGameList) {
                $scope.searchGames();
                defaultGameList = false;
            }
            $scope.updatingCompetitions = false;
        };

        $scope.loadSportsAndCompetitions(true, false);

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
                    getEditionDay = Moment.moment(processedTime).lang("en").format('YYYY-MM-DD');
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
        $scope.searchGames = function searchGames(sportId) {
            adjustEditionDate();
            $scope.expandedGames = [];
            $scope.gameListLoaded = true;
            $scope.gamesScorePresent = null;

            // Forming request
            var request = {};
            request.is_date_ts = 1;

            var params = $location.search();

            if(params.sport_type){
              request.sport_type = params.sport_type;
            }

            if (!sportId) {
                request.sport_id = $scope.requestData.sport.id;
                request.competition_id = $scope.requestData.competition.Id >= 0 ? $scope.requestData.competition.Id : "";
                request.live = Number($scope.requestData.live);
                formatRequestDate(request, false);
            } else {
                request.competition_id = "";
                request.sport_id = sportId;
                $scope.requestData.live = 0;
                formatRequestDate(request, true);
            }

            if ($scope.requestData.team_id) {
                request.team_id = $scope.requestData.team_id;
            }

            Zergling.get(request, "get_result_games").then(function (result) {
                $scope.gameListLoaded = false;
                $scope.sortByDate = true;
                $scope.gamesResult = [];
                if (result.games && result.games.game) {
                    var games = [];
                    if (result.games.game[0]) { // checking if game is array (if one game, then game is object)
                        angular.forEach(result.games.game, function (game) {
                            if (game.scores !== '' && $scope.gamesScorePresent !== true ) {
                                $scope.gamesScorePresent = true
                            }
                            if (game.date <= Moment.get().unix()) {
                                games.push(game);
                            }
                        });
                    } else if (result.games.game.date <= Moment.get()) {
                        games[0] = result.games.game;
                    }
                    $scope.gamesResult = games;
                }
            })['catch'](function (reason) {
                console.log('Error:', reason);
                $scope.gameListLoaded = false;
            });
        };

        /**
         * @ngdoc method
         * @name adjustDate
         * @description adjusted 'FromDate' dataPicker if FromDate is higher than ToDate and vice versa
         * @methodOf vbet5.controller:ResultsController
         */
        $scope.adjustDate = function adjustDate(type) {
            previousDate = Moment.moment($scope.requestData.dateFrom).lang("en").format("YYYY-MM-DD");
            switch (type) {
                case 'from':
                    if (Moment.get($scope.requestData.dateFrom).unix() > Moment.get($scope.requestData.dateTo).unix() || (Config.main.edition && Config.main.edition.enabled)) {
                        $scope.requestData.dateTo = Moment.moment($scope.requestData.dateFrom).lang("en").format();
                        adjustEditionFromDate();
                    }
                    if(Moment.get($scope.requestData.dateFrom).unix() < Moment.get($scope.requestData.dateTo).add((-1 * (showResultsMaxDays)), 'days').unix()) {
                        $scope.requestData.dateTo  = Moment.moment($scope.requestData.dateFrom).add((showResultsMaxDays), 'days').lang("en").format();
                    }
                    $scope.minFromDate = Moment.moment($scope.requestData.dateTo).add((-1 * (showResultsMaxDays)), 'days');
                    break;
                case 'to':
                    if (Moment.get($scope.requestData.dateFrom).unix() > Moment.get($scope.requestData.dateTo).unix()) {
                        $scope.requestData.dateFrom = Moment.moment($scope.requestData.dateTo).lang("en").format();
                    }
                    if(Moment.get($scope.requestData.dateFrom).unix() < Moment.get($scope.requestData.dateTo).add((-1 * (showResultsMaxDays)), 'days').unix()){
                        $scope.requestData.dateFrom = Moment.moment($scope.requestData.dateTo).add((-1 * (showResultsMaxDays)), 'days').lang("en").format();
                    }
                    $scope.minFromDate = Moment.moment($scope.requestData.dateTo).add((-1 * (showResultsMaxDays)), 'days');
                    break;
            }
            $scope.loadSportsAndCompetitions(false, true);
        };


        /**
         * @ngdoc method
         * @name resultsBySport
         * @description load Today's Result of game data depend game type
         * @methodOf vbet5.controller:ResultsController
         */
        $scope.resultsBySport = function resultsBySport(sport) {
            $scope.expandedGames = [];
            $scope.sortByDate = true;
            var sport_id = sport.id;
            if($scope.requestData.sport.id == sport_id && $scope.todayResult) {
                return;
            }
            $scope.requestData.sport = sport;
            $scope.searchGames(sport_id);
            // If the previous date we received info on is different from today we request active competitions, if not - we just process its competitions data
            Moment.get($scope.today).unix() !== Moment.get(previousDate).unix() ? $scope.loadSportsAndCompetitions(false, true) : $scope.processCompetitionData(sport);
            $scope.todayResult = true;
            previousDate = Moment.moment($scope.requestData.dateFrom).lang("en").format("YYYY-MM-DD");
        };

        /**
         * @ngdoc method
         * @name composeResultDetailItem
         * @methodOf vbet5.controller:ResultsController
         * @description Prepare game details for the template
         * @param {Object} item
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
         * @name formatRequestDate
         * @description Formats date
         * @param {Object} request - request object
         * @param {Boolean} currentTime - if true, sets current day as the from_date
         */
        function formatRequestDate(request, currentTime) {
            if (!currentTime) {
                request.from_date = Moment.get(Moment.moment($scope.requestData.dateFrom).format().split("T")[0] + "T00:00:00" + timeZone).unix();
                var toUnixDate = Moment.get(Moment.moment($scope.requestData.dateTo).format().split("T")[0] + "T23:59:59" + timeZone).unix();
                request.to_date = toUnixDate < Moment.get().unix() ? toUnixDate : Moment.get().unix();
            } else {
                if (timeZone) {
                    request.from_date = Moment.get(Moment.moment($scope.today).format().split("T")[0] + "T00:00:00"+ timeZone).unix();
                } else {
                    request.from_date = Moment.get(Moment.moment().format().split("T")[0] + "T00:00:00"+ timeZone).unix();
                }
                request.to_date =  Moment.get().unix();
            }

            var params = $location.search();
            if(params.sport_type) {
                request.sport_type = params.sport_type;
            }
        }

        /**
         * @ngdoc method
         * @name toggleGameDetails
         * @description expands/collapses game details
         * @param {Object} game
         */
        $scope.toggleGameDetails = function toggleGameDetails(game) {
            if($scope.expandedGames.indexOf(game.game_id) !== -1) {
                Utils.removeElementFromArray($scope.expandedGames, game.game_id);
            } else {
                $scope.expandedGames.push(game.game_id);
            }
            getResultDetails(game);
        };
    }]);

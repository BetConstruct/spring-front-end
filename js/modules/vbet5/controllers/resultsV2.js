/**
 * @ngdoc controller
 * @name vbet5.controller:ResultsV2Controller
 * @description
 * Results version 2 controller
 */
angular.module('vbet5.betting').controller('ResultsV2Controller', ['$rootScope', '$scope', '$q', '$filter', 'Zergling', 'Config', 'Moment', 'Translator', 'Utils', 'GameInfo', 'Storage', 'ConnectionService',
    function ($rootScope, $scope, $q, $filter, Zergling, Config, Moment, Translator, Utils, GameInfo, Storage, ConnectionService) {
        'use strict';

        var timeZone = Config.env.selectedTimeZone || '';
        var sportListPromise;

        Moment.setLang(Config.env.lang);
        Moment.updateMonthLocale();
        Moment.updateWeekDaysLocale();

        var connectionService = new ConnectionService($scope);
        var liveGamesAnimationSubId;

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
        $scope.hoursList = [0, 1, 2, 3, 6, 12, 24, 48, 72];

        $scope.requestData = {
            dateFrom: $scope.today,
            dateTo: $scope.today,
            live: 0
        };

        $scope.virtualSportsIds = {
            horse_racing_id: 1124636817,
            greyhounds_id: 1124639301
        };

        $scope.openGameDetails = false;

        // Results version 2

        // V2 results we are going to declare them only if V2 is enabled
        $scope.selectedCompetitions = Storage.get('resultsV2selectedCompetitions') || {};
        $scope.selectedCompetitions[0] = $scope.selectedCompetitions[0] || {};
        $scope.selectedCompetitions[1] = $scope.selectedCompetitions[1] || {};

        $scope.competitionClosed = {};
        $scope.competitionInfo = {};
        $scope.games = {};

        $scope.switchResultsTab = function switchResultsTab(isLive) {

            if ($scope.sportsAreLoading) {
                return;
            }

            $scope.openGameDetails = null;

            unsubscribeFromAnimation();

            $scope.requestData.live = isLive ? 1 : 0;
            $scope.loadSports();
            $scope.updateLeftMenu(true);
        };

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

                unsubscribeFromAnimation();

            }

            Storage.set('resultsV2selectedCompetitions', $scope.selectedCompetitions);
            angular.forEach($scope.games, function (game, competitionId) {
                if (!$scope.selectedCompetitions[$scope.requestData.live ? 1 : 0][competitionId]) {
                    delete $scope.games[competitionId];
                    if ($scope.openGameDetails && $scope.openGameDetails.competition_id === +competitionId) {
                        $scope.openGameDetails = false;
                    }
                }
            });

            angular.forEach($scope.selectedCompetitions[$scope.requestData.live ? 1 : 0], function (competitionState, competitionId) {
                if (competitionState && !$scope.games[competitionId]) {
                    $scope.loadGames(competitionId);
                }
            });
            $scope.requestData.gamesCount = countGames();

        };

        /**
         * @ngdoc method
         * @name filterRequestDate
         * @description Load games for selected menu item
         * @methodOf vbet5.controller:ResultsV2Controller
         * @param {Number} Competition ID
         */
        function filterRequestDate(request) {
            var toUnixDate;
            if (!$scope.requestData.selectHours) {
                request.from_date = Moment.get(Moment.moment($scope.requestData.dateFrom).format().split('T')[0] + 'T00:00:00' + timeZone).unix();
                toUnixDate = Moment.get(Moment.moment($scope.requestData.dateTo).format().split('T')[0] + 'T23:59:59' + timeZone).unix();
                request.to_date = toUnixDate < Moment.get().unix() ? toUnixDate : Moment.get().unix();
            } else {
                request.to_date = Moment.get().unix();
                request.from_date = request.to_date - ($scope.requestData.selectHours * 3600);
            }
        }

        /**
         * @ngdoc method
         * @name loadGames
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
            var request = {};
            request.is_date_ts = $scope.requestData.live ? 0 : 1;
            //request.sport_id = $scope.competitionInfo[competitionId] && $scope.competitionInfo[competitionId].sport.id;
            request.competition_id = parseInt(competitionId, 10);
            request.live = $scope.requestData.live;
            if (!$scope.requestData.live) {
                filterRequestDate(request);
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
                                game.scoresShort = renderResultScore(game);
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
        function countGames() {
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
        $scope.loadSports = function loadSports() {
            var deferred = $q.defer();
            sportListPromise = deferred.promise;
            var requestSportList = {};

            $scope.sportsAreLoading = true;

            if ($scope.requestData.live) {
                requestSportList = {
                    'source': 'betting',
                    'what': {
                        'sport': ['id', 'name', 'alias', 'order'],
                        'region': ['id', 'name', 'alias', 'order'],
                        'competition': ['id', 'name', 'order']
                    },
                    'where': {
                        'game': {'type': 1}
                    }
                };
                if (Config.main.disableVirtualSportsInResults) {
                    requestSportList.where = {'sport': {'type': {'@ne': 1}}};
                }

                Utils.setCustomSportAliasesFilter(requestSportList);
            } else {
                filterRequestDate(requestSportList);
            }

            $scope.sportList = false;


            Zergling.get(requestSportList, $scope.requestData.live ? null : 'get_active_competitions').then(function (result) {

                result = convertSportsBookFormatToResults(result);
                $scope.sportsAreLoading = false;

                if (result.details) {
                    $scope.sportList = result.details;
                    deferred.resolve($scope.sportList);

                    angular.forEach(result.details, function (sport) {
                        angular.forEach(sport.Regions, function (region) {
                            angular.forEach(region.Competitions, function (competition) {
                                if ($scope.selectedCompetitions[$scope.requestData.live ? 1 : 0][competition.Id]) {
                                    sport.expanded = true;
                                    region.expanded = true;
                                }
                                competition.sport = {Id: sport.Id};
                                $scope.competitionInfo[competition.Id] = competition;
                            });
                        });
                    });
                    $scope.requestData.sport = ($scope.sportList.length && $scope.sportList[0]) || null;
                    $scope.updateLeftMenu();
                }


            })['catch'](function (reason) {
                deferred.resolve([]);
                $scope.sportsAreLoading = false;
                console.log('Error:', reason);
            });
        }

        $scope.loadSports();

        /**
         * @ngdoc method
         * @name convertSportsBookFormatToResults
         * @description live and results calls have different formats so we need a convertor like this one, let the force be with us.
         * @methodOf vbet5.controller:ResultsV2Controller
         */
        function convertSportsBookFormatToResults(data) {
            var result = {};

            if (data.data && data.data.sport) {
                result.details = [];

                angular.forEach(data.data.sport, function (sport) {
                    var sportConverted, regionConverted, competitionConverted;

                    sportConverted = {
                        Id: sport.id,
                        Name: sport.name,
                        Alias: sport.alias,
                        Regions: []
                    };

                    angular.forEach(sport.region, function (region) {

                        regionConverted = {
                            Id: region.id,
                            Name: region.name,
                            Alias: region.alias,
                            Competitions: []
                        };

                        sportConverted.Regions.push(regionConverted);

                        angular.forEach(region.competition, function (competition) {

                            competitionConverted = {
                                Id: competition.id,
                                Name: competition.name
                            };

                            regionConverted.Competitions.push(competitionConverted);

                        });
                    });

                    result.details.push(sportConverted);


                });

            } else {
                return data;
            }

            return result;
        }

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
                    break;
            }
            $scope.loadSports();

        };

        /**
         * @ngdoc method
         * @name closeCompetition
         * @description Close competition block
         * @methodOf vbet5.controller:ResultsV2Controller
         */
        $scope.closeCompetition = function closeCompetition(competitionId) {
            delete $scope.games[competitionId];
            $scope.selectedCompetitions[$scope.requestData.live ? 1 : 0][competitionId] = false;
            $scope.requestData.gamesCount = countGames();
            if ($scope.openGameDetails && +competitionId === $scope.openGameDetails.competition_id) {
                $scope.openGameDetails = false;
            }
        };

        /**
         * @ngdoc method
         * @name groupResultDetails
         * @description group details into groups
         * @methodOf vbet5.controller:ResultsV2Controller
         */
        function groupResultDetails(details) {
            var detailsGrouped = {};
            angular.forEach(details, function (detail) {
                detailsGrouped[detail.line_name] = detailsGrouped[detail.line_name] || {line_name: detail.line_name};
                detailsGrouped[detail.line_name].event_name = detailsGrouped[detail.line_name].event_name || [];
                angular.forEach(detail.event_name, function (event) {
                    detailsGrouped[detail.line_name].event_name.push(event);
                });
            });
            return Utils.objectToArray(detailsGrouped);
        }

        /**
         * @ngdoc method
         * @name getResultDetails
         * @description load game result details
         * @methodOf vbet5.controller:ResultsV2Controller
         */
        $scope.getResultDetails = function getResultDetails(game) {

            var command;
            var gameId = parseInt(game.game_id);

            if (parseInt($scope.openGameDetails && $scope.openGameDetails.game_id, 10) === gameId || $scope.additionalDetailsAreLoading) {
                return;
            }

            $scope.openGameDetails = false;

            if (game && game.scores === 'Void') {
                $scope.openGameDetails = game;
                return;
            }

            command = [1124636817, 1124639301, 1682284039].indexOf(parseInt(game.sport_id, 10)) === -1 ? 'get_results' : 'get_score_results'; // Virtual Sports without football and tennis

            $scope.additionalDetailsAreLoading = true;
            game.details = [];
            Zergling.get({'game_id': gameId}, command).then(function (result) {
                var detailsGrouped = [];
                if (result.lines && result.lines.line) {
                    if (result.lines.line[0]) {
                        angular.forEach(result.lines.line, function (line) {
                            game.details.push(composeResultDetailItem(line));
                        });
                    } else {
                        if (result.lines.line.events !== undefined) {
                            game.details.push(composeResultDetailItem(result.lines.line));
                        }
                    }
                }
                $scope.additionalDetailsAreLoading = false;
                $scope.openGameDetails = game;

                game.details = groupResultDetails(game.details);
                game.details2Columns = Utils.splitArrayChunks(game.details, 2);

            })['finally'](function () {
                $scope.additionalDetailsAreLoading = false;
            });

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
            if (angular.isArray(item.events.event_name)) {
                detail.event_name = item.events.event_name;
            } else {
                detail.event_name[0] = item.events.event_name;
            }
            return detail;
        }


        /**
         * @ngdoc method
         * @name openGameById
         * @methodOf vbet5.controller:widgetCtrl
         * @description Load game animation
         * @param {String} game id as string or number
         */
        $scope.openGameAnimation = function openGame (gameId) {

            unsubscribeFromAnimation();

            gameId = parseInt(gameId, 10);
            if (!gameId) {
                return;
            }

            var request = {
                'source': 'betting',
                'what': {
                    'sport': ['alias'],
                    'game': ['id', 'start_ts', 'team1_name', 'team2_name', 'info', 'events_count', 'markets_count', 'type', 'team1_id', 'team2_id', 'team1_external_id', 'team2_external_id', 'is_live', 'last_event', 'stats']
                },
                'where': {
                    'game': {'id': gameId}
                }
            };

            function updateWidgetGame (response) {
                if (response && response.sport) {
                    angular.forEach(response.sport, function (sport) {
                        angular.forEach(sport.game, function (game) {

                            console.log('game info', game);

                            game.sport = sport;
                            $scope.openGame = game;
                            GameInfo.extendLiveGame($scope.openGame);
                            $scope.openGame.scores = renderLiveScore($scope.openGame);
                        });
                    });
                }
            }

            connectionService.subscribe(
                request,
                updateWidgetGame,
                {
                    'thenCallback': function (result) {
                        if(result.subid) {
                            liveGamesAnimationSubId = result.subid;
                        }
                    }
                }
            );
        };

        /**
         * @ngdoc method
         * @name clearAllResultGames
         * @methodOf vbet5.controller:widgetCtrl
         */
        $scope.clearAllResultGames = function clearAllResultGames () {
            $scope.games = {};
            $scope.requestData.gamesCount = 0;
            $scope.openGameDetails = false;
            $scope.selectedCompetitions = {
                '0': {},
                '1': {}
            };

            Storage.set('resultsV2selectedCompetitions', $scope.selectedCompetitions);

            unsubscribeFromAnimation();
        };

        /**
         * @ngdoc method
         * @name renderResultScore
         * @methodOf vbet5.controller:widgetCtrl
         */
        function renderResultScore (game) {
            var scores = ((game && game.scores) || '').trim(), index;

            index = scores.indexOf('(');
            if (index > -1) {
                scores =  scores.substr(0, index).trim();
            } else {
                index = scores.indexOf(' ');
                if (index > -1) {
                    scores = scores.substr(0, index).trim();
                }
            }

            scores = scores.replace(/\s+/g, '');

            if (scores.length > 7) {
                return scores.substr(0, 4) + '...';
            }

            return scores;
        }

        /**
         * @ngdoc method
         * @name renderLiveScore
         * @methodOf vbet5.controller:widgetCtrl
         */
        function renderLiveScore (game) {
            var output = '';

            if (game && game.info && game.info.score1 !== undefined && game.info.score1 !== undefined) {
                output = game.info.score1 + ':' + game.info.score2;
            }

            if (game && game.stats) {
                var scores = [], i;
                for (i = 1; i <= 6; i++) {
                    if (game.stats['score_set' + i]) {
                        if (i === 6) {
                            scores.push('...');
                            break;
                        } else {
                            scores.push(game.stats['score_set' + i].team1_value + ':' + game.stats['score_set' + i].team2_value);
                        }
                    } else {
                        break;
                    }
                }
                output += scores.length > 0 ? ' ( ' + scores.join(' ') + ' )' : '';
            }

            return output;
        }

        /**
         * @ngdoc method
         * @name unsubscribeFromAnimation
         * @methodOf vbet5.controller:widgetCtrl
         */
        function unsubscribeFromAnimation () {
            if(liveGamesAnimationSubId) {
                Zergling.unsubscribe(liveGamesAnimationSubId);
                liveGamesAnimationSubId = false;
            }
            $scope.openGame = false;
        }

        $scope.$on('$destroy', unsubscribeFromAnimation);
    }]);

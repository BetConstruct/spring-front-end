/**
 * @ngdoc controller
 * @name vbet5.controller:classicViewRacingGameCtrl
 * @description
 * Classic view racing game controller
 */
angular.module('vbet5.betting').controller('classicViewRacingGameCtrl', ['$rootScope', '$scope', 'ConnectionService', 'Zergling', 'Moment',
    function ($rootScope, $scope, ConnectionService, Zergling, Moment) {
        'use strict';
        var connectionService = new ConnectionService($scope);


        function loadCompetitionAndGames() {
            var request = {
                source: 'betting',
                what: {
                    competition: ['id', 'name'],
                    game: ['id', 'team1_name', 'start_ts', 'info']
                },
                where: {
                    sport: {id: $scope.data.sportId},
                    region: {id: $scope.selectedRegion.id},
                    game: {
                        'start_ts': {
                            '@gte': $scope.data.state.fromDate,
                            '@lt': $scope.data.state.toDate
                        }
                    }
                }
            };
            $scope.expandedGames = {};
            if ($scope.data.state.gameId) {
                $scope.expandedGames[$scope.data.state.gameId] = true;
            }
            function handleCompetitionGames(data) {
                var competitions = [];
                var competitionGamesMap = {};
                angular.forEach(data.competition, function (competition) {
                    var games = [];
                    angular.forEach(competition.game, function (game) {
                        games.push({
                            id: game.id,
                            name: game.team1_name,
                            start_ts: game.start_ts,
                            game_info: {
                                status: game.info.horse_xml.Status
                            }
                        });
                    });
                    games.sort(function (item1, item2) {
                        return item1.start_ts - item2.start_ts;
                    });
                    competitionGamesMap[competition.id] = games;
                    competitions.push({
                        id: competition.id,
                        name: competition.name
                    });

                });
                $scope.competitionFilter = competitions;
                $scope.competitionGamesMap = competitionGamesMap;
            }
            connectionService.subscribe(request, handleCompetitionGames, {
                'thenCallback': function () {
                    $scope.loading = false;
                }
            });
        }

        function loadCompetitionDetails(loadGames) {
            $scope.loading = true;
            var request = {
                source: 'betting',
                what: {
                    region: ['id', 'name', 'alias'],
                    competition: ['id', 'name']
                },
                where: {sport: {'id': $scope.data.sportId}}
            };
            if ($scope.data.state.gameId) {
               request.where.game = {id: $scope.data.state.gameId};
               request.what.game = ['start_ts'];
            } else {
                request.where.competition = {id: $scope.data.state.competitionId};
            }

            function handleCompetitionDetailsData(data) {
                if (data.data && data.data.region ) {
                    var keys = Object.keys(data.data.region);
                    if (keys.length > 0) {
                        var key = keys[0];
                        var region = data.data.region[key];
                        var competition = region.competition[Object.keys(region.competition)[0]];
                        if ($scope.competitionGamesMap && !$scope.competitionGamesMap[competition.id]) { //handle fast switch
                            $scope.loading = false;
                            return;
                        }
                        $scope.selectedRegion = region;
                        $scope.selectedCompetition = competition;
                        if ($scope.selectedCompetition.game) {
                            var game = $scope.selectedCompetition.game[Object.keys($scope.selectedCompetition.game)[0]];
                            $scope.navigation.selectRacingDate({
                                start: Moment.convertUnixToMoment(game.start_ts).startOf('day').unix(),
                                end:  Moment.convertUnixToMoment(game.start_ts).endOf('day').unix(),
                            });
                        }
                        if (loadGames) {
                            loadCompetitionAndGames();
                            return;
                        }

                        if ($scope.data.state.competitionId) {
                            $scope.expandedGames = {};
                        }
                        if ($scope.data.state.gameId) {
                            $scope.expandedGames = {};
                            $scope.expandedGames[$scope.data.state.gameId] = true;
                        }

                        $scope.loading = false;

                        return;
                    }
                    $scope.navigation.goTo('home');

                }
            }
            Zergling.get(request).then(handleCompetitionDetailsData);
        }

        (function init() {
            loadCompetitionDetails(true);
        })();


        $scope.$on('racingNavigatedToGame', function () {
          loadCompetitionDetails(false);
        });

        $scope.expandGame = function (game) {
            $scope.expandedGames[game.id] = !$scope.expandedGames[game.id];
        };

        $scope.toggleFilter = function toggleFilter(isToggle) {
            if (isToggle) {
                $scope.showFilter = !$scope.showFilter;
            }
        };
    }
]);

/* global VBET5 */
/* jshint -W024 */
VBET5.directive('marketStats', ['$http', 'Config', 'Utils', function ($http, Config, Utils) {
    'use strict';

    return {
        restrict: 'E',
        replace: false,
        scope: {
            marketType: '=',
            openGame: '=',
            openStatistics: '='
        },
        template: '<div class="md-progress-circular" ng-if="loading"></div><ng-include ng-if="!loading" src="::templateUrl"></ng-include>',
        link: function ($scope) {
            var prefix = "https://krosstats.betcoapps.com/api/en/900/93f428d0-6591-48da-859d-b6c326db2448/Entity/";
            function groupData(data) {
                var result = {};
                for (var i = data.length; i--;) {
                    var group = data[i];
                    var key = group.IsH2H? 'h2h': 'individual';
                    result[key] = {};
                    for (var j = group.ScoredGoals.length; j--;) {
                        var teamData = group.ScoredGoals[j];
                        if (teamData.EntityId === $scope.openGame.team1_id) {
                            result[key].team1 = teamData;
                        } else {
                            result[key].team2 = teamData;

                        }
                    }
                }
                if (Object.keys(result).length === 0) {
                  return null;
                }
                return result;
            }
            $scope.widgetMapping = {
                'HalfTimeFullTime': {
                    title: 'HT/FT Performance',
                    templateUrl: 'half-time-full-time.html'
                },
                'HalfTimeResult': {
                    title: 'Result (Half Time)',
                    templateUrl: 'full-time-result.html'
                },
                'P1XP2': {
                    title: 'Result (HT/FT)',
                    templateUrl: 'full-time-result.html'
                },
                'CorrectScore': {
                    title: 'Result (Full Time)',
                    templateUrl: 'full-time-result.html'
                },
                'To Qualify': {
                    title: 'League matches',
                    templateUrl: 'to-qualify.html'
                },
                'ToQualify': {
                    title : 'League matches',
                    templateUrl: 'to-qualify.html'
                },
                '1stHalfBothTeamsToScore': {
                    title: 'First Half',
                    templateUrl: 'both-team-to-score.html',
                    individual: 'FirstHalfGoals',
                    h2h: 'BothTeamsFirstHalfGoals',
                    group: groupData
                },
                '2ndHalfBothTeamsToScore': {
                    title: 'Second Half',
                    templateUrl: 'both-team-to-score.html',
                    individual: 'SecondHalfGoals',
                    h2h: 'BothTeamsSecondHalfGoals',
                    group: groupData
                },
                '1stHalf-2ndHalfBothToScore': {
                    title: 'match',
                    templateUrl: 'both-team-to-score.html',
                    individual: 'FullTimeGoals',
                    h2h: 'BothTeamsFullTimeGoals',
                    group: groupData
                },
                'BothTeamsToScore': {
                    title: 'Full Time',
                    templateUrl: 'both-team-to-score.html',
                    individual: 'BothTeamsFullTimeGoals',
                    group: groupData
                },
                'Team1ScoreYes/no': {
                    title: 'match',
                    templateUrl: 'both-team-to-score.html',
                    h2h: 'FullTimeGoals',
                    group: groupData
                },
                'Team2ScoreYes/No': {
                    title: 'match',
                    templateUrl: 'both-team-to-score.html',
                    h2h: 'FullTimeGoals',
                    group: groupData
                },
                'Team1TotalGoalsExact': {
                    title: 'Full Time Goals',
                    templateUrl: 'average-goals.html',
                    individual: 'FullTimeGoalsAvg',
                    h2h: 'FullTimeScoredGoalsAvg',
                    group: groupData
                },
                'Team2TotalGoalsExact': {
                    title: 'Full Time Goals',
                    templateUrl: 'average-goals.html',
                    individual: 'FullTimeGoalsAvg',
                    h2h: 'FullTimeScoredGoalsAvg',
                    group: groupData
                },
                'Team1TotalGoals': {
                    title: 'Full Time Goals',
                    templateUrl: 'average-goals.html',
                    individual: 'FullTimeGoalsAvg',
                    h2h: 'FullTimeScoredGoalsAvg',
                    group: groupData
                },
                'Team2TotalGoals': {
                    title: 'Full Time Goals',
                    templateUrl: 'average-goals.html',
                    individual: 'FullTimeGoalsAvg',
                    h2h: 'FullTimeScoredGoalsAvg',
                    group: groupData
                },
                'HomeTeamGoals': {
                    title: 'Full Time Goals',
                    templateUrl: 'average-goals.html',
                    individual: 'FullTimeGoalsAvg',
                    h2h: 'FullTimeScoredGoalsAvg',
                    group: groupData
                },
                'AwayTeamGoals': {
                    title: 'Full Time Goals',
                    templateUrl: 'average-goals.html',
                    individual: 'FullTimeGoalsAvg',
                    h2h: 'FullTimeScoredGoalsAvg',
                    group: groupData
                },
                'Team1OverUnder': {
                    title: 'Full Time Goals',
                    templateUrl: 'average-goals.html',
                    individual: 'FullTimeGoalsAvg',
                    group: groupData
                },
                'Team2OverUnder': {
                    title: 'Full Time Goals',
                    templateUrl: 'average-goals.html',
                    individual: 'FullTimeGoalsAvg',
                    group: groupData
                },
                'Team1TotalOverUnderAsian': {
                    title: 'Full Time Goals',
                    templateUrl: 'average-goals.html',
                    individual: 'FullTimeGoalsAvg',
                    group: groupData
                },
                'Team2TotalOverUnderAsian': {
                    title: 'Full Time Goals',
                    templateUrl: 'average-goals.html',
                    individual: 'FullTimeGoalsAvg',
                    group: groupData
                },
                'SecondHalfHomeTeamTotalGoalsOverUnder': {
                    title: 'Second Half Goals',
                    templateUrl: 'average-goals.html',
                    individual: 'SecondHalfGoalsAvg',
                    group: groupData
                },
                'SecondHalfAwayTeamTotalGoalsOverUnder': {
                    title: 'Second Half Goals',
                    templateUrl: 'average-goals.html',
                    individual: 'SecondHalfGoalsAvg',
                    group: groupData
                },
                'OverUnder': {
                    title: 'Full Time Goals',
                    templateUrl: 'average-goals.html',
                    h2h: 'FullTimeGoalsAvg',
                    group: groupData
                },
                'TotalGoals': {
                    title: 'Full Time Goals',
                    templateUrl: 'average-goals.html',
                    h2h: 'FullTimeGoalsAvg',
                    group: groupData
                },
                'EvenOddTotal': {
                    title: 'Full Time Goals',
                    templateUrl: 'average-goals.html',
                    h2h: 'FullTimeGoalsAvg',
                    group: groupData
                },
                '2ndHalfTotalOver/Under': {
                    title: 'Second Half Goals',
                    templateUrl: 'average-goals.html',
                    h2h: 'SecondHalfGoalsAvg',
                    group: groupData
                },
                'HalfTimeOverUnder': {
                    title: 'First Half Goals (Scored)',
                    templateUrl: 'average-goals.html',
                    h2h: 'FirstHalfScoredGoalsAvg',
                    group: groupData
                },
                'HalfTimeOverUnderAsian': {
                    title: 'First Half Goals (Scored)',
                    templateUrl: 'average-goals.html',
                    h2h: 'FirstHalfScoredGoalsAvg',
                    group: groupData
                },
                'SecondHalfAwayTeamTotalGoalsInterval': {
                    title: 'Second Half Goals (Scored)',
                    templateUrl: 'average-goals.html',
                    h2h: 'SecondHalfScoredGoalsAvg',
                    group: groupData
                },
                'SecondHalfTotalGoalsExact': {
                    title: 'Second Half Goals (Scored)',
                    templateUrl: 'average-goals.html',
                    h2h: 'SecondHalfScoredGoalsAvg',
                    group: groupData
                },
                'SecondHalfHomeTeamTotalGoalsExact': {
                    title: 'Second Half Goals (Scored)',
                    templateUrl: 'average-goals.html',
                    h2h: 'SecondHalfScoredGoalsAvg',
                    group: groupData
                },
                'SecondHalfAwayTeamTotalGoalsExact': {
                    title: 'Second Half Goals (Scored)',
                    templateUrl: 'average-goals.html',
                    h2h: 'SecondHalfScoredGoalsAvg',
                    group: groupData
                },
                'SecondHalfEvenOddTotal': {
                    title: 'Second Half Goals (Scored)',
                    templateUrl: 'average-goals.html',
                    h2h: 'SecondHalfScoredGoalsAvg',
                    group: groupData
                }


            };
            $scope.templateUrl = "templates/sport/classic/center/marketStats/" + $scope.widgetMapping[$scope.marketType].templateUrl;

            function getData() {
                $scope.loading = true;

                $http({
                    method: 'GET',
                    url: prefix + Config.main.marketStats[$scope.marketType] + $scope.openGame.id,
                    timeout: 5000
                }).then(function (response) {
                        if (angular.isArray(response.data) && $scope.widgetMapping[$scope.marketType].group) {
                            $scope.templateData = $scope.widgetMapping[$scope.marketType].group(response.data);
                        }else if (Utils.isObject(response.data) && !Utils.isObjectEmpty(response.data)) {
                            $scope.templateData = response.data;
                        }
                    }
                ).finally(function () {
                    $scope.loading = false;
                });
            }

            (function init() {
                getData();
            })();
        }
    }
}]);

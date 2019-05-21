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
        template: '<vbet-loader ng-if="loading"></vbet-loader><ng-include ng-if="!loading" src="::templateUrl"></ng-include>',
        link: function ($scope) {
            $scope.widgetMapping = {
                'HalfTimeFullTime': {
                    title: 'HT/FT Performance',
                    templateUrl: 'half-time-full-time.html'
                },
                'HalfTimeResult': {
                    title: 'Result (Half Time)',
                    templateUrl: 'full-time-result.html'
                },
                'MatchResult': {
                    title: 'Result (HT/FT)',
                    templateUrl: 'full-time-result.html'
                },
                'CorrectScore': {
                    title: 'Result (Full Time)',
                    templateUrl: 'full-time-result.html'
                },
                'Qualify': {
                    title: 'League matches',
                    templateUrl: 'to-qualify.html'
                },
                'ToQualify': {
                    title : 'League matches',
                    templateUrl: 'to-qualify.html'
                }

            };
            $scope.templateUrl = "templates/sport/classic/center/marketStats/" + $scope.widgetMapping[$scope.marketType].templateUrl;

            function getData() {
                $scope.loading = true;

                $http({
                    method: 'GET',
                    url: Config.main.marketStats[$scope.marketType] + $scope.openGame.id,
                    timeout: 5000
                }).then(function (response) {
                        if (Utils.isObject(response.data) && !Utils.isObjectEmpty(response.data)) {
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

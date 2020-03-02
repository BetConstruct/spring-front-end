/* global VBET5 */
/**
 * @ngdoc directive
 * @name vbet5.directive:soccerLineUp
 *
 * @description displays provided/or all sports results
 *
 */
VBET5.directive('soccerLineUp', ['Config', '$filter', '$timeout', '$http', 'LanguageCodes', function (Config, $filter, $timeout, $http, LanguageCodes) {
    'use strict';
    return {
        restrict: 'E',
        replace: false,
        templateUrl: $filter('fixPath')('templates/directive/soccer-line-up.html'),
        scope: {
            gameId: '=?'
        },
        link: function (scope) {
            scope.matchLineupsData = null;
            scope.lineupLoading = false;
            var matchId = scope.gameId;

            // matchId = 15865547; // todo
            var apiUrl = (Config.main.matchLineupStatistics.prefixUrl + matchId + '&timeZone=' + Config.env.selectedTimeZone).replace('{lang}',LanguageCodes[Config.env.lang]);

            function getLineupData() {
                scope.lineupLoading = true;
                $http.get(apiUrl).then(function (response) {
                    if (response.data && response.data.GroupByHomeAway && response.data.GroupByHomeAway.length > 1) {
                        scope.matchLineupsData = response.data;
                    }
                })['finally'](function () {
                    scope.lineupLoading = false;
                });
            }

            scope.lineUpPopup = {
                opened: false,
                selectedTeamHome: true
            };
            scope.openLineUp = function openLineUp() {
                if(scope.lineupLoading){
                    return;
                }
                scope.lineUpPopup.opened = !scope.lineUpPopup.opened;
                if (scope.lineUpPopup.opened) {
                    getLineupData();
                }
            };

        }
    };
}]);

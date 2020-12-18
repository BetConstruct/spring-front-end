/* global VBET5 */
/**
 * @ngdoc directive
 * @name vbet5.directive:mixedMatchesTeams
 *
 * @description displays provided/or all sports results
 *
 */

VBET5.directive('mixedMatchesTeams', ['Zergling', 'Storage', function (Zergling, Storage) {
    'use strict';
    return {
        restrict: 'E',
        replace: true,
        templateUrl: 'templates/directive/mixedMatchesTeams.html',
        scope: {
            virtualGamesIds: '='
        },
        link: function (scope) {
            scope.mixedMatchesClosed = Storage.get('mixedMatchesClosed');

            scope.toggleMixedMatches = function toggleMixedMatches() {
                scope.mixedMatchesClosed = !scope.mixedMatchesClosed;
                Storage.set('mixedMatchesClosed', scope.mixedMatchesClosed);
            };

            scope.virtualGamesLoading = true;
            Zergling.get({
                'source': 'betting',
                'what': {
                    'game': ["team1_name", "team2_name", "team1_id", "team2_id"]
                },
                'where': {
                    'game': {'id': {'@in': scope.virtualGamesIds}}
                }
            }).then(
                function (response) {
                    if (response && response.data && response.data.game) {
                        scope.virtualGames = response.data.game;
                    }
                }
            )['finally'](function () {
                scope.virtualGamesLoading = false;
            });
        }
    };
}]);

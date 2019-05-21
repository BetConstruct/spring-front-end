/* global VBET5 */
/**
 * @ngdoc directive
 * @name vbet5.directive:row
 *
 * @description directive for displaying game, market information in 'comboView'
 *
 */
 VBET5.directive('comboViewRow', ['$filter', function ($filter) {
     return {
        templateUrl: function templateUrl (el, attr) {
            return $filter('fixPath')(attr.templatePath);
        },

        link: function (scope, element, attr) {
            scope.getGame = function getGame () {
                if (!scope.game.additionalEvents && scope.pointerGames && scope.pointerGames[scope.region.id]
                    && scope.pointerGames[scope.region.id][scope.game.exclude_ids] ) {
                    return scope.pointerGames[scope.region.id][scope.game.exclude_ids];
                } else {
                    return scope.game;
                }
            };

            scope.getCompetitoin = function getCompetitoin () {
                if (!scope.game.additionalEvents && scope.pointerGamesCompetition && scope.pointerGamesCompetition[scope.region.id]
                    && scope.pointerGamesCompetition[scope.region.id][scope.game.exclude_ids] ) {
                    return scope.pointerGamesCompetition[scope.region.id][scope.game.exclude_ids];
                } else {
                    return scope.competition;
                }
            };
        }
     };
 }]);
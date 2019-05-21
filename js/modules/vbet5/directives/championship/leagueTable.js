/* global VBET5 */
/**
 * @ngdoc directive
 * @name vbet5.directive:vbetLastMinuteBets
 *
 * @description displays last minute bets
 *
 */
VBET5.directive('leagueTable', ['$filter', function ($filter) {
    'use strict';
    return {
        restrict: 'E',
        replace: false,
        templateUrl: $filter('fixPath')('templates/sport/championship/classic/leagueTable.html'),
        scope: {
            items: '=',
            blockTitle: '=',
            matches: '=',
            expandTeam: '='
        },
        link: function (scope) {
            /**
             * 3 modes
             * 0 - All
             * 1 - Home
             * 2 - Away
             * */
            var getModeStr = function () {
                if (mode == 0) {
                    return 'Total';
                } else if (mode == 1) {
                    return 'Home';
                } else if (mode == 2) {
                    return 'Away';
                }
            };
            scope.expand = function(id,name){
                scope.expandTeam(id,name);
            };
            var setMode = function (newMode) {
                mode = newMode;
                scope.mode = mode;
                scope.items_ordered = scope.items.sort(function (a, b) {
                    return a['Position' + getModeStr()] - b['Position' + getModeStr()];
                });
            };
            scope.getField = function (item, field) {
                if (item[getFieldName(field)] != null) {
                    return item[field + getModeStr()];
                } else {
                    return 0;
                }
            };
            var getFieldName = function (field) {
                return field + getModeStr();
            };
            var mode = 0;
            setMode(mode);
        }
    };
}]);

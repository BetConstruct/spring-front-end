/* global CASINO */
/**
 * @ngdoc service
 * @name CASINO.service:casinoMultiviewValues
 * @description
 * Utility functions
 */

CASINO.service('casinoMultiviewValues', function () {
    'use strict';
    var casinoMultiviewValues = {};

    function hasTournamentsInMenu(menu) {
        if (menu.hasOwnProperty('tournaments')) {
            return true;
        }
        if (menu.hasOwnProperty('casino') && menu.casino.hasOwnProperty('subMenu')) {
            for (var i = menu.casino.subMenu.length; i--;) {
                if (menu.casino.subMenu[i].href.indexOf("#/tournaments") > -1) {
                    return true;
                }
            }
        }
        return false;
    }

    casinoMultiviewValues.init = function (scope) {
        var iframeGames = [];
        scope.hasIframeJackpot = {empty: true};
        scope.hasIframeTournamentInfo = {empty: true};
        scope.iframeTab = {};
        scope.jackpotWinner = {};

        scope.hasTournaments = scope.hasTournaments || hasTournamentsInMenu(scope.conf.multiLevelMenu);

        /**
         * @ngdoc method
         * @name initIframeInfo
         * @methodOf CASINO.controller:casinoMultiviewValues
         * @description
         */
        scope.initIframeInfo = function (gameInfo) {
            if (gameInfo && gameInfo.game && gameInfo.game.id && iframeGames.indexOf(gameInfo.id) === -1) {
                scope.iframeTab[gameInfo.id] = {selected: null, show: true};
                iframeGames.push(gameInfo.id);
            }
        };

        scope.allRatio = "16:9";

        scope.$watch('gamesInfo', function (gamesInfo) {
            if (gamesInfo && gamesInfo.length > 0) {
                scope.allRatio = gamesInfo.every(function (val, i, arr) {
                    return (!val.game) || (arr[0].game && val.game.ratio === arr[0].game.ratio);
                }) && gamesInfo[0] && gamesInfo[0].game && gamesInfo[0].game.ratio && gamesInfo[0].game.ratio !== "0" ? gamesInfo[0].game.ratio : "16:9";
            }
        }, true);
    };

    return casinoMultiviewValues;
});

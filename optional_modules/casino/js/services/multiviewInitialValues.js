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
    casinoMultiviewValues.init = function (scope) {
        var iframeGames = [];
        scope.hasIframeJackpot = {empty: true};
        scope.hasIframeTournamentInfo = {empty: true};
        scope.iframeTab = {};
        scope.jackpotWinner = {};
        scope.hasTournaments = scope.conf.multiLevelMenu.hasOwnProperty('tournaments');

        /**
         * @ngdoc method
         * @name initIframeInfo
         * @methodOf CASINO.controller:casinoMultiviewValues
         * @description
         */
        scope.initIframeInfo = function (gameInfo) {
            if (gameInfo && gameInfo.game && gameInfo.game.id && iframeGames.indexOf(gameInfo.game.id) === -1) {
                scope.iframeTab[gameInfo.game.id] = {selected: null, show: true};
                iframeGames.push(gameInfo.game.id);
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
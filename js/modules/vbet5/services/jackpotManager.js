/* global VBET5 */
/**
 * @ngdoc service
 * @name VBET5.service:jackpotManager
 * @description
 * Utility functions
 */

VBET5.service('jackpotManager', ['$rootScope', 'Config', 'jackpotSocket', function ($rootScope, Config, jackpotSocket) {
    'use strict';

    var jackpotManager = {
        casinoGameOpenedData: false
    }, jackpotData = {
        games: {}
    }, jackpotDataSubscriptions = {};
    var openedGameIds = [];
    var callbacks = {};
    var lastGameId;


    var profileWatcher;

    function success(jackpotIds, callbacks, intensity) {
        var jackpotPoolMetaData = [];
        var currency = ($rootScope.profile && $rootScope.profile.currency_name) || Config.main.registration.defaultCurrency;
        if (jackpotIds && jackpotIds.length > 0) {
            for (var j = 0; j < jackpotIds.length; j++) {
                var jackpotId = jackpotIds[j];

                jackpotSocket.get("getjackpotpoolmetadata", {
                    "JackPotId": jackpotId,
                    "Currency": currency
                }, function (response) {
                    jackpotPoolMetaData = response;
                });


                if (!jackpotDataSubscriptions[jackpotId]) {
                    var sid = jackpotSocket.subscribe({
                        Currency: currency,
                        JackPotId: jackpotId,
                        Intensity: intensity || 0
                    }, function (jackpot) {
                        if (jackpot && jackpot.Id) {
                            jackpot.CollectedAmountTotal = 0;
                            angular.forEach(jackpot.PoolGroup.PoolList, function (pool) {
                                jackpot.CollectedAmountTotal += pool.CollectedAmount;
                                jackpotPoolMetaData.forEach(function (metaData) {
                                    if (pool.Id === metaData.Id) {
                                        pool.MinBetAmount = metaData.MinBetAmount;
                                    }
                                });
                            });
                            jackpotData[jackpot.Id] = jackpot;
                            for (var i = 0; i < openedGameIds.length; i++) {
                                var gameId = openedGameIds[i];
                                if (!jackpotData.games[gameId]) {
                                    jackpotData.games[gameId] = {};
                                }
                                if (jackpotDataSubscriptions[jackpot.Id] && jackpotDataSubscriptions[jackpot.Id].gameIds && jackpotDataSubscriptions[jackpot.Id].gameIds.indexOf(gameId) !== -1) {
                                    jackpotData.games[gameId][jackpot.Id] = jackpotData[jackpot.Id];

                                    callbacks[gameId].forEach(function (callback) {
                                        callback(jackpotData.games[gameId]);
                                    });
                                }
                            }
                        }
                    });
                    jackpotDataSubscriptions[jackpotId] = {sid: sid, gameIds: []};
                }
                if (jackpotDataSubscriptions[jackpotId].gameIds.indexOf(lastGameId) === -1) {
                    jackpotDataSubscriptions[jackpotId].gameIds.push(lastGameId);
                }
            }
        }

        jackpotManager.unsubscribeFromJackpotData();
    }



    // JACKPOT SOCKET DATA PART
    jackpotManager.subscribeForJackpotData = function subscribeForJackpotData(game_id, callback, command, source) {
        var config = Config.main.jackpot[source];
        if(!(config && config.enabled)){
            return;
        }
        lastGameId = game_id;

        var source_id = config.sourceId || 0;
        var intensity = config.intensity || 0;
        var params = {
            PartnerId: Config.main.site_id,
            SourceId: source_id
        };
        if (game_id && game_id !== -1) {
            params.GameId = game_id;
        }
        openedGameIds = getGamesIds();

        command = command || (params.GameId ? 'jackpotbygame' : 'getjackpots');

        jackpotSocket.get(command, params, function (jackpotIds) {
            if(jackpotIds){
                if(!callbacks[game_id]){
                    callbacks[game_id] = [];
                }
                callbacks[game_id].push(callback);
            }
            success(jackpotIds, callbacks, intensity);

            if (profileWatcher) {
                profileWatcher();
            }

            profileWatcher = $rootScope.$watch('profile', function (newState, oldState) {
                if ((newState && !oldState) || (!newState && oldState)) {
                    if ((newState && newState.currency_name !== Config.main.registration.defaultCurrency) || (oldState && oldState.currency_name !== Config.main.registration.defaultCurrency)) {
                        jackpotManager.unsubscribeFromAllJackpotData();
                        success(jackpotIds, callbacks,  intensity);
                    }
                }
            });

        });
    };

    function getGamesIds() {
        var ids = [];
        if ($rootScope.casinoGameOpened > 0) {
            for (var i = 0; i < jackpotManager.casinoGameOpenedData.length; i++) {
                var gameInfo = jackpotManager.casinoGameOpenedData[i];
                if (gameInfo && gameInfo.game && gameInfo.game.extearnal_game_id) {
                    ids.push(gameInfo.game.extearnal_game_id);
                }
            }
        }
        return ids.length > 0 ? ids : [-1];
    }

    jackpotManager.unsubscribeFromAllJackpotData = function unsubscribeFromAllJackpotData() {
        angular.forEach(jackpotDataSubscriptions, function (value, jackpotId) {
            jackpotSocket.unsubscribe(value.sid, {JackPotId: jackpotId});
        });

        jackpotDataSubscriptions = {};
    };
    jackpotManager.unsubscribeFromJackpotData = function unsubscribeFromJackpotData(all) {
        openedGameIds = [];
        if (all) {
            jackpotData = {games: {}};
            callbacks = {};
        } else {
            openedGameIds = getGamesIds();
        }

        angular.forEach(jackpotDataSubscriptions, function (subscription, jackpotId) {
            var count = 0;
            if (subscription && subscription.gameIds && subscription.gameIds.length) {
                for (var j = 0; j < subscription.gameIds.length; j++) {
                    var subscriptionGameId = subscription.gameIds[j];
                    if (openedGameIds && openedGameIds.length) {
                        for (var i = 0; i < openedGameIds.length; i++) {
                            var openedGameId = openedGameIds[i];
                            if (openedGameId === subscriptionGameId) {
                                count++;
                            }
                        }
                    }
                }
            }

            if (count === 0) {
                jackpotSocket.unsubscribe(subscription.sid, {JackPotId: jackpotId});
                console.log('unsubscribe', jackpotId, 'sid', subscription.sid);
               angular.forEach(subscription.gameIds,function (id) {
                   delete callbacks[id];
               });

                delete jackpotDataSubscriptions[jackpotId];
            }
        });
    };


    //external jackpots

    // JACKPOT SOCKET DATA PART

    var externalJackpotsProfileWatcher;
    var externalJackpotData = {};
    var externalJackpotCallback = null;
    var externalJackpotDataSubscriptions = {};

    jackpotManager.subscribeForExternalJackpotData = function subscribeForExternalJackpotData(callback) {
        var config = Config.main.jackpot.casino;
        if (!(config && config.enabled)) {
            return;
        }
        var intensity = config.intensity || 0;
        var params = {
            PartnerId: Config.main.site_id,
            Currency: ($rootScope.profile && $rootScope.profile.currency_name) || Config.main.registration.defaultCurrency
        };



        var command = 'externaljackpotlist';

        jackpotSocket.get(command, params, function (jackpotIds) {
            if (jackpotIds) {
                externalJackpotCallback = callback;
            }
            success(jackpotIds, externalJackpotCallback, intensity);

            if (externalJackpotsProfileWatcher) {
                externalJackpotsProfileWatcher();
            }

            externalJackpotsProfileWatcher = $rootScope.$watch('profile', function (newState, oldState) {
                if ((newState && !oldState) || (!newState && oldState)) {
                    if ((newState && newState.currency_name !== Config.main.registration.defaultCurrency) || (oldState && oldState.currency_name !== Config.main.registration.defaultCurrency)) {
                        jackpotManager.unsubscribeFromAllExternalJackpotData();
                        success(jackpotIds, externalJackpotCallback, intensity);
                    }
                }
            });

        });


        function success(jackpotIds, externalJackpotCallback, intensity) {
            jackpotManager.unsubscribeFromJackpotData();
            var currency = ($rootScope.profile && $rootScope.profile.currency_name) || Config.main.registration.defaultCurrency;
            if (jackpotIds && jackpotIds.length > 0) {
                for (var j = 0; j < jackpotIds.length; j++) {
                    var jackpotId = jackpotIds[j].JackPotId;
                    externalJackpotData[jackpotId] = null;
                    if (!externalJackpotDataSubscriptions[jackpotId]) {
                        var sid = jackpotSocket.msg('subscribetoexternaljackpot', {
                            Currency: currency,
                            JackPotId: [jackpotId],
                            Intensity: intensity || 0
                        }, function (jackpot) {
                            if (jackpot && jackpot.UuuId) {
                                jackpot.CollectedAmountTotal = 0;
                                angular.forEach(jackpot.PoolGroup.PoolList, function (pool) {
                                    jackpot.CollectedAmountTotal += pool.CollectedAmount;
                                });


                                var provider = jackpotIds.filter(function (j) {
                                    return j.JackPotId === jackpot.UuuId;
                                });

                                if (provider.length > 0) {
                                    jackpot.Provider = provider[0].Kind;
                                }

                                externalJackpotData[jackpot.UuuId] = jackpot;

                                externalJackpotCallback(externalJackpotData);
                            }
                        });
                        externalJackpotDataSubscriptions[jackpotId] = {sid: sid};
                    }

                }
            }

        }
    };
    jackpotManager.unsubscribeFromAllExternalJackpotData = function unsubscribeFromAllExternalJackpotData() {
        angular.forEach(externalJackpotDataSubscriptions, function (value, jackpotId) {
            jackpotSocket.unsubscribe(value.sid, {JackPotId: jackpotId});
        });
        externalJackpotData = {};
        externalJackpotDataSubscriptions = {};
    };

    return jackpotManager;
}]);

/* global VBET5 */
/**
 * @ngdoc service
 * @name VBET5.service:jackpotManager
 * @description
 * Utility functions
 */

VBET5.service('jackpotManager', ['$rootScope', '$q', 'Config', 'jackpotSocket', function ($rootScope, $q, Config, jackpotSocket) {
    'use strict';

    var jackpotManager = {
        casinoGameOpenedData: false
    }, jackpotData = {
        all: {}
    }, jackpotDataSubscriptions = {};
    var openedGameIds = [];
    var callbacks = {};
    var lastGameId;


    var profileWatcher;
    var defaultCurrencyWatcherPromise;
    var deferreds = [];

    function getCurrency() {
        var deffer = $q.defer();
        var result = deffer.promise;

        var currency = ($rootScope.profile && $rootScope.profile.currency_name) || $rootScope.conf.registration.defaultCurrency;

        if (currency) {
            deffer.resolve(currency);
        } else {
            deferreds.push(deffer);
            if (!defaultCurrencyWatcherPromise) {
                defaultCurrencyWatcherPromise = $rootScope.$watch('conf.registration.defaultCurrency', function (newState) {
                    if (newState) {
                        defaultCurrencyWatcherPromise();
                        defaultCurrencyWatcherPromise = null;
                        currency = ($rootScope.profile && $rootScope.profile.currency_name) || $rootScope.conf.registration.defaultCurrency;

                        deferreds.forEach(function (deffer) {
                            deffer.resolve(currency);
                        });

                        deferreds = [];
                    }
                });
            }
        }

        return result;
    }
    /**
     * @ngdoc method
     * @name jackpotDataSuccess
     * @methodOf vbet5.service:jackpotManager
     * @description process jackpot data
     *
     * @param {Array} jackpotIds jackpot ids
     * @param {Object} callbacks
     * @param {number} intensity
     * @param {number} sourceId
     * @param {string} currency
     */
    function jackpotDataSuccess(jackpotIds, callbacks, intensity, sourceId, currency) {
        var jackpotPoolMetaData = [];

        if (jackpotIds && jackpotIds.length > 0) {
            for (var j = 0; j < jackpotIds.length; j++) {
                var jackpotId = jackpotIds[j];

                jackpotSocket.get("getjackpotpoolmetadata", {
                    "JackPotId": jackpotId,
                    "Currency": currency
                }, function (response) {
                    if (response && response.length > 0) {
                        jackpotPoolMetaData = response;
                    }
                });


                if (!jackpotDataSubscriptions[jackpotId] || jackpotDataSubscriptions[jackpotId].currency !== currency) {
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
                            jackpotData.all[jackpot.Id] = jackpot;

                            var jackpotDataForSource = jackpotData[sourceId];

                            for (var i = 0; i < openedGameIds.length; i++) {
                                var gameId = openedGameIds[i];
                                if (!jackpotDataForSource.games || !jackpotDataForSource.games[gameId]) {
                                    jackpotDataForSource.games[gameId] = {};
                                }
                                if (jackpotDataSubscriptions[jackpot.Id] && jackpotDataSubscriptions[jackpot.Id].gameIds && jackpotDataSubscriptions[jackpot.Id].gameIds.indexOf(gameId) !== -1) {
                                    jackpotDataForSource.games[gameId][jackpot.Id] = jackpotData.all[jackpot.Id];

                                    callbacks[gameId].forEach(function (callback) {
                                        callback(jackpotDataForSource.games[gameId]);
                                    });
                                }
                            }
                        }
                    });
                    if (jackpotDataSubscriptions[jackpotId]) {
                        jackpotDataSubscriptions[jackpotId].sid = sid;
                        jackpotDataSubscriptions[jackpotId].currency = currency;
                    } else {
                        jackpotDataSubscriptions[jackpotId] = {sid: sid, gameIds: [], currency: currency};
                    }

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
        if (!(config && config.enabled)) {
            return;
        }

        lastGameId = game_id;

        var source_id = config.sourceId || 0;
        var intensity = config.intensity || 0;
        var params = {
            PartnerId: Config.main.site_id,
            SourceId: source_id
        };

        if (!callbacks[source_id]) {
            callbacks[source_id] = {};
        }
        if (!jackpotData[source_id]) {
            jackpotData[source_id] = {games: {}}
        }


        if (game_id && game_id !== -1) {
            params.GameId = game_id;
        }
        openedGameIds = getGamesIds();

        command = command || (params.GameId ? 'jackpotbygame' : 'getjackpots');

        jackpotSocket.get(command, params, function (jackpotIds) {
            var callbacksBySourceId = callbacks[source_id];

            if (jackpotIds) {
                if (!callbacksBySourceId[game_id]) {
                    callbacksBySourceId[game_id] = [];
                }
                callbacksBySourceId[game_id].push(callback);
            }
            getCurrency().then(function (currency) {
                jackpotDataSuccess(jackpotIds, callbacksBySourceId, intensity, source_id, currency);

                if (profileWatcher) {
                    profileWatcher();
                }

                profileWatcher = $rootScope.$watch('profile.currency_name', function (newValue, oldValue) {
                    var newCurrency;
                    if (newValue && newValue !== $rootScope.conf.registration.defaultCurrency) {
                        newCurrency = newValue;
                    } else if (oldValue && oldValue !== $rootScope.conf.registration.defaultCurrency) {
                        newCurrency = $rootScope.conf.registration.defaultCurrency;
                    }
                    if (newCurrency) {
                        jackpotManager.unsubscribeFromAllJackpotData();
                        jackpotDataSuccess(jackpotIds, callbacksBySourceId, intensity, source_id, newCurrency);
                    }
                });
            })
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
    };
    jackpotManager.unsubscribeFromJackpotData = function unsubscribeFromJackpotData(all) {
        openedGameIds = [];
        if (all) {
            jackpotData = {all: {}};
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
                angular.forEach(subscription.gameIds, function (id) {
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
    var externalJackpotCallbacks = [];
    var externalJackpotDataSubscriptions = {};


    /**
     * @ngdoc method
     * @name externalJackpotSuccess
     * @methodOf vbet5.service:jackpotManager
     * @description process jackpot data
     *
     * @param {Array} jackpotIds jackpot ids
     * @param {Object} externalJackpotCallbacks
     * @param {number} intensity
     * @param {string} currency
     */
    function externalJackpotSuccess(jackpotIds, externalJackpotCallbacks, intensity, currency) {
        jackpotManager.unsubscribeFromJackpotData();
        if (jackpotIds && jackpotIds.length > 0) {
            for (var j = 0; j < jackpotIds.length; j++) {
                var jackpotId = jackpotIds[j].JackPotId;

                externalJackpotData[jackpotIds[j].Kind] = null;

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

                            externalJackpotData[jackpot.Provider] = jackpot;

                            externalJackpotCallbacks.forEach(function (externalJackpotCallback) {
                                externalJackpotCallback(externalJackpotData);
                            });

                        }
                    });
                    externalJackpotDataSubscriptions[jackpotId] = {sid: sid};
                }
            }
        }
    }

    jackpotManager.subscribeForExternalJackpotData = function subscribeForExternalJackpotData(callback, jackpotProviderKinds) {
        var config = Config.main.jackpot.casino;
        if (!(config && config.enabled)) {
            return;
        }
        var intensity = config.intensity || 0;

        getCurrency().then(function (currency) {
            var params = {
                PartnerId: Config.main.site_id,
                Currency: ($rootScope.profile && $rootScope.profile.currency_name) || Config.main.registration.defaultCurrency
            };


            var command = 'externaljackpotlist';

            jackpotSocket.get(command, params, function (jackpotIds) {
                if (jackpotIds) {
                    externalJackpotCallbacks.push(callback);
                }

                if (jackpotProviderKinds) {
                    jackpotIds = jackpotIds.filter(function (a) {
                        return jackpotProviderKinds.indexOf(a.Kind) !== -1;
                    });
                }

                externalJackpotSuccess(jackpotIds, externalJackpotCallbacks, intensity, currency);

                if (externalJackpotsProfileWatcher) {
                    externalJackpotsProfileWatcher();
                }

                externalJackpotsProfileWatcher = $rootScope.$watch('profile.currency_name', function (newValue, oldValue) {
                    var newCurrency;
                    if (newValue && newValue !== $rootScope.conf.registration.defaultCurrency) {
                        newCurrency = newValue;
                    } else if (oldValue && oldValue !== $rootScope.conf.registration.defaultCurrency) {
                        newCurrency = $rootScope.conf.registration.defaultCurrency;
                    }
                    if (newCurrency) {
                        jackpotManager.unsubscribeFromAllExternalJackpotData(externalJackpotCallbacks);
                        externalJackpotSuccess(jackpotIds, externalJackpotCallbacks, intensity, newCurrency);
                    }
                });
            })
        });
    };
    jackpotManager.unsubscribeFromAllExternalJackpotData = function unsubscribeFromAllExternalJackpotData(callback) {

        angular.forEach(externalJackpotDataSubscriptions, function (value, jackpotId) {
            jackpotSocket.unsubscribe(value.sid, {JackPotId: jackpotId});
        });

        var callbackIndex = externalJackpotCallbacks.indexOf(callback);

        if (callbackIndex !== -1) {
            externalJackpotCallbacks.splice(callbackIndex, 1);
        }
        externalJackpotData = {};
        externalJackpotDataSubscriptions = {};
    };


    // global jackpot

    var globalJackpotsProfileWatcher;
    var globalJackpotData = {};
    var globalJackpotCallbacks = [];
    var globalJackpotDataSubscriptionId = null;

    /**
     * @ngdoc method
     * @name globalJackpotDataSuccess
     * @methodOf vbet5.service:jackpotManager
     * @description process jackpot data
     *
     * @param {Object} globalJackpotCallbacks
     * @param {string} currency
     */
    function globalJackpotDataSuccess(globalJackpotCallbacks, currency) {
        var sId;
        globalJackpotData.currency = currency;
        if (!globalJackpotDataSubscriptionId) {
            sId = jackpotSocket.msg('subscribetopartnerjackpots', {
                Currency: currency
            }, function (jackpot) {
                if (jackpot) {
                    globalJackpotData = jackpot;
                    globalJackpotData.Currency = currency;
                    globalJackpotData.Name = 'Global Jackpot';
                    globalJackpotCallbacks.forEach(function (globalJackpotCallback) {
                        globalJackpotCallback(globalJackpotData);
                    });

                }
            });
            globalJackpotDataSubscriptionId = sId;
        }
    }


    jackpotManager.subscribeForGlobalJackpotData = function subscribeForGlobalJackpotData(callback) {
        globalJackpotCallbacks.push(callback);
        var config = Config.main.jackpot.casino;
        if (!(config && config.enabled)) {
            return;
        }

        getCurrency().then(function (currency) {
            globalJackpotDataSuccess(globalJackpotCallbacks, currency);

            if (globalJackpotsProfileWatcher) {
                globalJackpotsProfileWatcher();
            }

            globalJackpotsProfileWatcher = $rootScope.$watch('profile.currency_name', function (newValue, oldValue) {
                var newCurrency;
                if (newValue && newValue !== $rootScope.conf.registration.defaultCurrency) {
                    newCurrency = newValue;
                } else if (oldValue && oldValue !== $rootScope.conf.registration.defaultCurrency) {
                    newCurrency = $rootScope.conf.registration.defaultCurrency;
                }
                if (newCurrency) {
                    jackpotManager.unsubscribeFromGlobalJackpotData(globalJackpotCallbacks);
                    globalJackpotDataSuccess(globalJackpotCallbacks, newCurrency);
                }
            });
        });
    };

    jackpotManager.unsubscribeFromGlobalJackpotData = function unsubscribeFromGlobalJackpotData(callback) {
        jackpotSocket.unsubscribe(globalJackpotDataSubscriptionId);

        var callbackIndex = globalJackpotCallbacks.indexOf(callback);

        if (callbackIndex !== -1) {
            globalJackpotCallbacks.splice(callbackIndex, 1);
        }
        globalJackpotData = {};
        globalJackpotDataSubscriptionId = null;
    };


    // JACKPOT SOCKET DATA PART
    return jackpotManager;
}]);

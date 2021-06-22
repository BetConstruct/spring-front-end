/* global VBET5 */
/**
 * @ngdoc service
 * @name VBET5.service:jackpotManager
 * @description
 * Utility functions
 */

VBET5.service('jackpotManager', ['$rootScope', '$q', 'Config', 'jackpotSocket', function ($rootScope, $q, Config, jackpotSocket) {
    'use strict';

    var jackpotManager = {}, jackpotData = {}, jackpotDataSubscriptions = {};
    var callbacks = {};

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

    var jackpotPoolMetaData = {};

    function getJackpotMetaData(jackpotId, currency, sourceId) {
        if (!jackpotPoolMetaData[sourceId]) {
            jackpotPoolMetaData[sourceId] = {};
        }

        if (!jackpotPoolMetaData[sourceId][jackpotId]) {
            jackpotPoolMetaData[sourceId][jackpotId] = {};
        }

        jackpotSocket.get("getjackpotpoolmetadata", {
            "JackPotId": jackpotId,
            "Currency": currency
        }, function (response) {
            if (response && response.length > 0) {
                response.forEach(function (meta) {
                    jackpotPoolMetaData[sourceId][jackpotId][meta.Id] = meta;
                });

            }
        });
    }

    /**
     * @ngdoc method
     * @name jackpotDataSuccess
     * @methodOf vbet5.service:jackpotManager
     * @description process jackpot data
     *
     * @param {Array} jackpotIds jackpot ids
     * @param {Object} _callbacks
     * @param {number} intensity
     * @param {number} sourceId
     * @param {string} currency
     * @param {string} game_id
     */
    function jackpotDataSuccess(jackpotIds, _callbacks, intensity, sourceId, currency, game_id) {
        if (jackpotIds && jackpotIds.length > 0) {
            for (var j = 0; j < jackpotIds.length; j++) {
                var jackpotId = jackpotIds[j];

                if (!jackpotDataSubscriptions[jackpotId] || (jackpotDataSubscriptions[jackpotId].currency !== currency && !jackpotDataSubscriptions[jackpotId].unsubscribing)) {
                    getJackpotMetaData(jackpotId, currency, sourceId);
                    var sid = jackpotSocket.subscribe({
                        Currency: currency,
                        JackPotId: jackpotId,
                        Intensity: intensity || 0
                    }, function (jackpot) {
                        if (jackpot && jackpot.Id) {
                            jackpot.CollectedAmountTotal = 0;
                            angular.forEach(jackpot.PoolGroup.PoolList, function (pool) {
                                jackpot.CollectedAmountTotal += pool.CollectedAmount;
                                if (jackpotPoolMetaData[sourceId][jackpot.Id][pool.Id]) {
                                    pool.MinBetAmount = jackpotPoolMetaData[sourceId][jackpot.Id][pool.Id].MinBetAmount;
                                }
                            });

                            jackpot.PoolGroup.PoolList.sort(function (a, b) {
                                return b.CollectedAmount - a.CollectedAmount;
                            });

                            var jackpotDataForSource = jackpotData[sourceId];

                            if (jackpotDataForSource) {
                                angular.forEach(_callbacks, function (gameCallbacks, gameId) {
                                    gameId = parseInt(gameId);
                                    if (!jackpotDataForSource.games || !jackpotDataForSource.games[gameId]) {
                                        jackpotDataForSource.games[gameId] = {};
                                    }
                                    if (jackpotDataSubscriptions[jackpot.Id] && jackpotDataSubscriptions[jackpot.Id].sourceId === sourceId && jackpotDataSubscriptions[jackpot.Id].gameIds && jackpotDataSubscriptions[jackpot.Id].gameIds.indexOf(gameId) !== -1) {
                                        jackpotDataForSource.games[gameId][jackpot.Id] = jackpot;

                                        gameCallbacks.forEach(function (callback) {
                                            callback(jackpotDataForSource.games[gameId]);
                                        });
                                    }
                                })
                            }
                        }
                    });
                    if (jackpotDataSubscriptions[jackpotId]) {
                        jackpotDataSubscriptions[jackpotId].sid = sid;
                        jackpotDataSubscriptions[jackpotId].currency = currency;
                        jackpotDataSubscriptions[jackpotId].sourceId = sourceId;
                        jackpotDataSubscriptions[jackpotId].jackpotId = jackpotId;
                    } else {
                        jackpotDataSubscriptions[jackpotId] = {
                            sid: sid,
                            gameIds: [],
                            currency: currency,
                            sourceId: sourceId,
                            jackpotId: jackpotId
                        };
                    }

                }
                if (game_id && jackpotDataSubscriptions[jackpotId].sourceId === sourceId && jackpotDataSubscriptions[jackpotId].gameIds.indexOf(game_id) === -1) {
                    jackpotDataSubscriptions[jackpotId].gameIds.push(game_id);
                }
            }
        }
    }


    // JACKPOT SOCKET DATA PART
    jackpotManager.subscribeForJackpotData = function subscribeForJackpotData(game_id, callback, command, source, jackpotIds) {
        var config = Config.main.jackpot[source];
        if (!(config && config.enabled)) {
            return;
        }
        var source_id = config.sourceId || 0;

        game_id = parseInt(game_id);

        var intensity = config.intensity || 0;
        var params = {
            PartnerId: Config.main.site_id,
            SourceId: source_id
        };

        if (!callbacks[source_id]) {
            callbacks[source_id] = {};
        }

        if (!callbacks[source_id][game_id]) {
            callbacks[source_id][game_id] = [];
        }
        callbacks[source_id][game_id].push(callback);

        if (!jackpotData[source_id]) {
            jackpotData[source_id] = {games: {}}
        }


        if (game_id && game_id > 0) {
            params.GameId = game_id;
        }

        command = command || (params.GameId ? 'jackpotbygame' : 'getjackpots');

        var subscribeToJackpotByIds = function (jackpotIds) {
            var callbacksBySourceId = callbacks[source_id];

            getCurrency().then(function (currency) {
                jackpotDataSuccess(jackpotIds, callbacksBySourceId, intensity, source_id, currency, game_id);
                var lastSubscribeCurrency = currency;

                if (profileWatcher) {
                    profileWatcher();
                }

                profileWatcher = $rootScope.$watch('profile.currency_name', function (newValue) {
                    var newCurrency;
                    if (newValue && newValue !== lastSubscribeCurrency) {
                        newCurrency = newValue;
                    } else if (!newValue && lastSubscribeCurrency !== $rootScope.conf.registration.defaultCurrency) {
                        newCurrency = $rootScope.conf.registration.defaultCurrency;
                    }

                    if (newCurrency) {
                        resubscribeJackpots(newCurrency, intensity);
                        lastSubscribeCurrency = newCurrency;
                    }
                });
            })
        };

        if (!jackpotIds) {
            jackpotSocket.get(command, params, subscribeToJackpotByIds);
        } else {
            subscribeToJackpotByIds(jackpotIds);
        }

    };

    function resubscribeJackpots(currency, intensity) {
        angular.forEach(jackpotDataSubscriptions, function (jackpotDataSubscription) {
            var sourceId = parseInt(jackpotDataSubscription.sourceId);
            jackpotDataSubscription.gameIds.forEach(function (game_id) {
                jackpotDataSuccess([jackpotDataSubscription.jackpotId], callbacks[sourceId], intensity, sourceId, currency, game_id);
            })
        });
    }


    jackpotManager.unsubscribeFromJackpotData = function unsubscribeFromJackpotData(all, game_id, callback) {
        if (all) {
            angular.forEach(jackpotDataSubscriptions, function (jackpotDataSubscription) {
                unsubscribeJackpots(jackpotDataSubscription);
            });
            jackpotData = {};
            callbacks = {};
            jackpotDataSubscriptions = {};
        }

        var callbacksCount = 0;
        angular.forEach(callbacks, function (cb) {
            if (cb[game_id] && cb[game_id].length > 0) {
                var index = cb[game_id].indexOf(callback);
                if (index !== -1) {
                    cb[game_id].splice(index, 1);
                }
                callbacksCount += cb[game_id].length;
            }

        });

        if (callbacksCount === 0) {
            angular.forEach(jackpotDataSubscriptions, function (jackpotDataSubscription) {
                var index = jackpotDataSubscription.gameIds.indexOf(parseInt(game_id));
                if (jackpotDataSubscription.gameIds && index !== -1) {
                    if (jackpotDataSubscription.gameIds.length === 1) {
                        unsubscribeJackpots(jackpotDataSubscription);
                        delete jackpotDataSubscriptions[jackpotDataSubscription.jackpotId];
                    }
                    jackpotDataSubscription.gameIds.splice(index, 1);
                }
            });
        }

    };

    function unsubscribeJackpots(jackpotDataSubscription) {
        if (!jackpotDataSubscription.unsubscribing) {
            jackpotDataSubscription.unsubscribing = true;
            jackpotSocket.unsubscribe(jackpotDataSubscription.sid, {JackPotId: jackpotDataSubscription.jackpotId}, function (data) {
                if (!data) {
                    jackpotDataSubscription.unsubscribing = false;
                }
            });
        }
    }


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
        if (jackpotIds && jackpotIds.length > 0) {
            for (var j = 0; j < jackpotIds.length; j++) {
                var jackpotId = jackpotIds[j].JackPotId;
                var jackpotKind = jackpotIds[j].Kind;


                externalJackpotData[jackpotKind] = null;

                if (!externalJackpotDataSubscriptions[jackpotId] || externalJackpotDataSubscriptions[jackpotId].currency !== currency) {
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

                            jackpot.PoolGroup.PoolList.sort(function (a, b) {
                                return b.CollectedAmount - a.CollectedAmount;
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
                    if (externalJackpotDataSubscriptions[jackpotId]) {
                        externalJackpotDataSubscriptions[jackpotId].sid = sid;
                        externalJackpotDataSubscriptions[jackpotId].currency = currency;
                        externalJackpotDataSubscriptions[jackpotId].kind = jackpotKind;
                    } else {
                        externalJackpotDataSubscriptions[jackpotId] = {
                            sid: sid,
                            currency: currency,
                            kind: jackpotKind
                        };
                    }
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
                Currency: currency
            };
            var lastSubscribeCurrency = currency;

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

                externalJackpotsProfileWatcher = $rootScope.$watch('profile.currency_name', function (newValue) {
                    var newCurrency;
                    if (newValue && newValue !== lastSubscribeCurrency) {
                        newCurrency = newValue;
                    } else if (!newValue && lastSubscribeCurrency !== $rootScope.conf.registration.defaultCurrency) {
                        newCurrency = $rootScope.conf.registration.defaultCurrency;
                    }
                    if (newCurrency) {
                        resubscribeExternalJackpots(newCurrency, intensity);
                        lastSubscribeCurrency = newCurrency;
                    }
                });
            })
        });
    };

    function resubscribeExternalJackpots(currency, intensity) {
        angular.forEach(externalJackpotDataSubscriptions, function (externalJackpotDataSubscription, jackpot_id) {
            if (!externalJackpotDataSubscription.unsubscribing) {
                var jackpotId = {JackPotId: jackpot_id, Kind: externalJackpotDataSubscription.kind};
                externalJackpotSuccess([jackpotId], externalJackpotCallbacks, intensity, currency);
            }
        });
    }

    jackpotManager.unsubscribeFromAllExternalJackpotData = function unsubscribeFromAllExternalJackpotData(callback) {
        angular.forEach(externalJackpotDataSubscriptions, function (value, jackpotId) {
            if (!value.unsubscribing) {
                value.unsubscribing = true;
                jackpotSocket.unsubscribe(value.sid, {JackPotId: jackpotId}, function (data) {
                    if (!data) {
                        value.unsubscribing = false;
                    }
                });
            }
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
            var lastSubscribeCurrency = currency;

            if (globalJackpotsProfileWatcher) {
                globalJackpotsProfileWatcher();
            }

            globalJackpotsProfileWatcher = $rootScope.$watch('profile.currency_name', function (newValue) {
                var newCurrency;
                if (newValue && newValue !== lastSubscribeCurrency) {
                    newCurrency = newValue;
                } else if (!newValue && lastSubscribeCurrency !== $rootScope.conf.registration.defaultCurrency) {
                    newCurrency = $rootScope.conf.registration.defaultCurrency;
                }
                if (newCurrency) {
                    jackpotManager.unsubscribeFromGlobalJackpotData(globalJackpotCallbacks);
                    globalJackpotDataSuccess(globalJackpotCallbacks, newCurrency);
                    lastSubscribeCurrency = newCurrency;
                }
            });
        });
    };

    jackpotManager.unsubscribeFromGlobalJackpotData = function unsubscribeFromGlobalJackpotData(callback, removeWatcher) {
        if (removeWatcher && globalJackpotsProfileWatcher) {
            globalJackpotsProfileWatcher();
        }

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

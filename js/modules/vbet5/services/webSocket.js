/* global VBET5 */
/**
 * @ngdoc service
 * @name vbet5.service:Websocket
 * @description  Websocket service
 */
VBET5.factory('WS', ['$q', '$rootScope', '$timeout', '$window', 'Config', 'Utils', function ($q, $rootScope, $timeout, $window, Config, Utils) {
    'use strict';

    var statistics = {}, statisticsSubIdMap = {};

    var WS = {};

    var callbacks = {};

    var callbackIdCounter = 0;

    var connected = false;

    var connection;

    var onconnect = [];

    var subscriptionListeners = [];

    var socket = {};

    var result;

    var onClose = null, onNotAvailableCallback = null;

    var retryCount = 0;

    var selectedSwarmInstance;

    var reconnectionDisabled = false; // when true, the reconnection strategy is disabled
                                      //it would be better to use the codes for the socket close event,
                                      // and then process it with the provided code. but at the moment chrome has a problem

                                   // indicates that client was able to make websocket connection (will try to
    var wasAbleToConnect = false;  // use webSockets(reconnect) instead of switching to LP when disconnected)

    WS.isAvailable = (typeof WebSocket === 'function' || typeof WebSocket === 'object');

    /**
     * @ngdoc method
     * @name error
     * @methodOf vbet5.service:Websocket
     * @description Handles Websocket error
     */
    function error() {
        connected = false;
        //connection.reject('websocket error');
        socket.close();
        console.log('error');
    }

    /**
     * @ngdoc method
     * @name open
     * @methodOf vbet5.service:Websocket
     * @description Handles Websocket connection
     */
    function open() {
        connected = true;
        connection.resolve(true);
        selectedSwarmInstance.instanceRetryCount = 0;

        // network configuration isn't preventing client from using this instance, will try to reconnect if disconnected
        selectedSwarmInstance.wasAbleToConnectPreviously = true;

        wasAbleToConnect = true;
        retryCount = 0;
        console.log("Socket has been opened");

        angular.forEach(onconnect, function (callback) {
            callback();
        });
    }

    /**
     * @ngdoc method
     * @name receiveParseJSON
     * @methodOf vbet5.service:Websocket
     * @description Parses Websocket JSON response
     */
    function receiveParseJSON(message) {
        // cannot by optimized by JIT, keep in separate function
        try {
            //console.log('receive data', message.data.length);
            return JSON.parse(message.data);
        } catch (e) {
            console.warn('cannot parse websocket response:', message.data, e);
            return null;
        }
    }

    /**
     * @ngdoc method
     * @name sendToCallbacks
     * @methodOf vbet5.service:Websocket
     * @description Used ro reduce response data
     * @param {Object} Input data
     * @param {Function} Process callback
     */
    function sendToCallbacks(data, callback) {
        callback(data);
        return data;
    }

    function resolveAndReturn(data) {
        $timeout(function () {
            $rootScope.$apply(callbacks[data.rid].cb.resolve({data: data}));  // extra 'data' is used to make structure same as returned by $http.post
            delete callbacks[data.rid];
        });
    }

    function validateRecaptchaV2(data) {
        var promiseContainer = $q.defer();
        $rootScope.broadcast("recaptcha.showPopup", {
            'recaptchaKey': data.code === 27? data.data: data.data.v2_validation_required,
            'promise': promiseContainer
        });
        promiseContainer.promise.then(function (gRecaptchaResponse) {
            WS.sendRequest({command: "validate_recaptcha", params:{version: 'v2', g_recaptcha_response: gRecaptchaResponse}}).then(function (validateResponse) {
                if (validateResponse.data && validateResponse.data.data && validateResponse.data.data.result) {
                    resolveAndReturn(data);
                }
            }, function () {
                resolveAndReturn(data);
            });

        });
    }

    /**
     * @ngdoc method
     * @name open
     * @methodOf vbet5.service:Websocket
     * @description Handles Websocket received message
     */
    function receive(message) {
        var data = receiveParseJSON(message);
        if (data === null) {
            return;
        }

        if (data.rid && callbacks.hasOwnProperty(data.rid)) { //message response
            if (Config.swarm.debugging) {
                if (data && data.data && data.data.subid) {
                    statistics[data.rid].receiveTs = new Date().getTime();
                    statistics[data.rid].receive = message.data.length;
                    statisticsSubIdMap[data.data.subid] = data.rid;
                }
            }

            if (data.code === 27 || (data.code === 0 && data.data && data.data.v2_validation_required)) {
                validateRecaptchaV2(data);
            } else {
                $rootScope.$apply(callbacks[data.rid].cb.resolve({data: data}));  // extra 'data' is used to make structure same as returned by $http.post
                delete callbacks[data.rid];
            }
        } else if (data.data && parseInt(data.rid, 10) === 0) { //subscription update
            if (Config.swarm.debugging) {
                Object.keys(data.data).forEach(function (subId) {
                    var updateTextLength = JSON.stringify(data.data[subId]).length;
                    var rid = statisticsSubIdMap[subId];
                    statistics[rid].updates += updateTextLength;
                });
            }
            subscriptionListeners.reduce(sendToCallbacks, {data: data});
        } else if (data.rid) {
            console.warn('Got second response for request or invalid rid:', message.data);
        } else {
            console.warn('Got response without rid:', message.data);
        }
    }

    /**
     * @ngdoc method
     * @name get_connection
     * @methodOf vbet5.service:Websocket
     * @description Handles Websocket actual connection
     */
    function get_connection() {

        if (!connection) {

            connected = false;
            connection = $q.defer();
            result = connection.promise;

            var giveUp = function () {
                console.log("Giving up. Websockets are not available.");
                connection.reject('websocket error');
                WS.isAvailable = false;
                if (onNotAvailableCallback) {
                    console.log('WS calling onNotAvailableCallback callback');
                    onNotAvailableCallback();
                }
            };

            try {
                if (Config.swarm[$window.location.hostname]) {
                    selectedSwarmInstance = Utils.getWeightedRandom(Config.swarm[$window.location.hostname]);
                } else {
                    selectedSwarmInstance = Utils.getWeightedRandom(Config.swarm.websocket);
                }

                console.log('websocketUrl selected:', selectedSwarmInstance);
                socket = new WebSocket(selectedSwarmInstance.url);

                setTimeout(function () {
                    if (!connected) { socket.close(); }  //close 'pending' connection after timeout
                }, Config.swarm.webSocketTimeout);

                console.log('Socket created:', socket);
            } catch (e) {
                console.log('Error creating socket', e, selectedSwarmInstance);
                if (!selectedSwarmInstance) {
                    giveUp();
                }
            }

            socket.onclose = function (event) {

                connected = false;
                console.log('socket closed', event, callbacks, retryCount);

                //fix for FF bug #765738
                if (event.code === 1001) { //1001 means "The endpoint is going away, either because of a server failure or because the browser is navigating away from the page that opened the connection."
                    console.log("tab closed or refreshed, won't call onClose handlers", event);
                    socket.close();
                    return;
                }

                if (onClose) {
                    console.log('WS calling onClose callback');
                    onClose();
                }

                if (reconnectionDisabled) {
                    return;
                }

                if (retryCount < Config.swarm.maxWebsocketRetries || wasAbleToConnect) {
                    WS.isAvailable = true;
                    connection = null;
                    retryCount++;
                    selectedSwarmInstance.instanceRetryCount = selectedSwarmInstance.instanceRetryCount || 0;
                    if (selectedSwarmInstance.instanceRetryCount++ > 0 && !selectedSwarmInstance.wasAbleToConnectPreviously) {
                        selectedSwarmInstance.ignore = true; // will not select this swarm instance again
                    }
                    console.log('retry count', retryCount, 'retrying in ', Config.swarm.webSocketRetryInterval * retryCount, 'msec', selectedSwarmInstance);
                    return $timeout(get_connection, Config.swarm.webSocketRetryInterval * retryCount);

                } else {
                    giveUp();
                }
            };

            socket.onerror = error;

            socket.onmessage = receive;
            socket.onopen = open;
        } else {
            result = connection.promise;
        }
        return result;
    }

    /**
     * @ngdoc method
     * @name get_connection
     * @methodOf vbet5.service:Websocket
     * @description Get Websocket unique callback ID
     */
    function getCallbackId() {
        callbackIdCounter += 1;
        if (callbackIdCounter > 100000) {
            callbackIdCounter = 0;
        }
        return new Date().getTime() + callbackIdCounter.toString();
    }


    $window.dumpWSStatistics = function () {
        var nowTs = parseInt(new Date().getTime() / 1000, 10);
        angular.forEach(statistics, function (obj, key) {
            obj.requestRTT = parseInt(obj.receiveTs - obj.sentTs, 10);
            obj.updateTime = nowTs - parseInt(obj.receiveTs / 1000, 10);
            console.log('req %s sent %s received %s (rtt %s ms) updates %s (in %s sec, avg %d b/sec) %s', key, obj.sent, obj.receive, obj.requestRTT, obj.updates, obj.updateTime, obj.updates / obj.updateTime, obj.unsubscribed ? "ENDED" : "");
        });
        console.log(statistics);
    };



    /**
     * @ngdoc method
     * @name sendRequest
     * @methodOf vbet5.service:Websocket
     * @description Sends request to websocket
     * @param {Object} request request object
     * @returns {promise|*|Function} promise
     */
    WS.sendRequest = function sendRequest(request) {
//        console.log('WS.sendRequest', request);
        return get_connection()
            .then(
                function () {
                    var defer = $q.defer();
                    var callbackId = getCallbackId();
                    callbacks[callbackId] = {
                        time: new Date(),
                        cb: defer
                    };
                    request.rid = callbackId;
                    //                console.log('Sending to socket:', request, connected);
                    var sendingDataText = JSON.stringify(request);
                    if (Config.swarm.debugging) {
                        if (request.command === 'unsubscribe') {
                            var rid = statisticsSubIdMap[request.params.subid];
                            statistics[rid].unsubscribed = true;
                            statistics[rid].sent += sendingDataText.length;
                        } else {
                            statistics[callbackId] = {
                                request: sendingDataText,
                                sent: sendingDataText.length,
                                receive: 0,
                                subId: null,
                                updates: 0,
                                sentTs: new Date().getTime(),
                                unsubscribed: false
                            };
                        }
                    }
                    socket.send(sendingDataText);
                    return defer.promise;
                },
                function () {
                    return $q.reject('websocket connection not available');
                }
            )['catch'](function (reason) {
                console.warn(reason);
                return $q.reject(reason);
            });

    };

    /**
     * @ngdoc method
     * @name addSubscriptionListener
     * @methodOf vbet5.service:Websocket
     * @description Adds a func to be called when getting subscribed data
     * @param {function} callback function that will be called on getting subscription data
     */
    WS.addSubscriptionListener = function addSubscriptionListener(callback) {
        subscriptionListeners.push(callback);
    };

    /**
     * @ngdoc method
     * @name onConnect
     * @methodOf vbet5.service:Websocket
     * @description Adds a function to be called on (re)connection (after connection is established)
     *
     * @param {function} callback func. to be called
     */
    WS.onConnect = function onConnect(callback) {
        onconnect.push(callback);
    };

    /**
     * @ngdoc method
     * @name connect
     * @methodOf vbet5.service:Websocket
     * @description returns connection promise
     * @returns {promise} promise
     */
    WS.connect = function connect() {
        return get_connection();
    };

    /**
     * @ngdoc method
     * @name setOnCloseCallback
     * @methodOf vbet5.service:Websocket
     * @description sets callback function which will be called when websocket connection is closed (unexpectedly)
     */
    WS.setOnCloseCallback = function setOnCloseCallback(callback) {
        onClose = callback;
    };

    WS.onNotAvailable = function onNotAvailable(callback) {
        onNotAvailableCallback = callback;
    };

    WS.closeConnection = function closeConnection() {
        reconnectionDisabled = true;
        socket.close();
        connection = null;
    };

    WS.restoreConnection = function restoreConnection() {
        reconnectionDisabled = false;
        WS.isAvailable = true;
        selectedSwarmInstance.instanceRetryCount = selectedSwarmInstance.instanceRetryCount || 0;

        get_connection();
    };

    return WS;
}]);

/* global VBET5 */
/**
 * @ngdoc service
 * @name vbet5.service:Zergling
 * @description <img src=http://www.starcraft-replay.com/img/avatars/zergling8.png>
 *
 *
 *
 * A service used to get data from Swarm
 * uses {@link vbet5.service:Websocket Websocket} or {@link /documentation/angular/api/ng.$http ng.$http} for communication, depending on config and browser capabilities
 */
VBET5.factory('Zergling', ['Config', 'WS', '$http', '$q', '$timeout', '$rootScope', '$cookies', 'AuthData', 'Utils', 'RecaptchaService', 'Storage', 'BuildConfig', function (Config, WS, $http, $q, $timeout, $rootScope, $cookies, AuthData, Utils, RecaptchaService, Storage, BuildConfig) {
    'use strict';

    var Zergling = {};

    var session;

    var subscriptions = {};

    var inProgressUnsubs = {};

    var useWebSocket = false;

    var sessionRequestIsInProgress = false;

    var connectionAvailable;

    var isLoggedIn;

    var longPollUrl;

    /**
     * Swarm response codes
     */
    Zergling.codes = {
        OK: 0,
        SESSION_LOST: 5,
        NEED_TO_LOGIN: 12
    };


    /**
     * @ngdoc function
     * @name getLongPollUrl
     * @methodOf vbet5.service:Zergling
     * @description returns randomly selected(taking weight into consideration) long poll url
     * @returns {String} long polling URL
     */
    function getLongPollUrl() {
        if (!longPollUrl) {
            longPollUrl = Utils.getWeightedRandom(Config.swarm.url).url;
            console.log('long Polling URL selected:', longPollUrl);
        }
        return longPollUrl;
    }

    /**
     * @ngdoc function
     * @name destructivelyUpdateObject
     * @methodOf vbet5.service:Zergling
     * @description
     * Applies the diff on object
     * properties having null values in diff are removed from  object, others' values are replaced.
     *
     * Also checks the 'price' field for changes and adds new field 'price_change' as sibling
     * which indicates the change direction (1,2,3,.... - up, -1,-2,... down, null - unchanged)
     *
     * @param {Object} current current object
     * @param {Object} diff    received diff
     */
    function destructivelyUpdateObject(current, diff) {
        if (current === undefined || !(current instanceof  Object)) {
            throw new Error('wrong call');
        }

//        if (Object.keys(current).length === 0) {
//            throw new Error('wrong call, zero length');
//            return diff;
//        }

        angular.forEach(diff, function (val, key) {
            if (val === null) {
                delete current[key];
            } else if (!Utils.isObject(val)) {
                current[key] = val;
            } else { // diff[key] is Object
                if (!Utils.isObject(current[key]) || current[key] === null) {
                    current[key] = val;
                } else {
                    var hasPrice = (current[key].price !== undefined);
                    var oldPrice;
                    if (hasPrice) {
                        oldPrice = current[key].price;
                    }
                    destructivelyUpdateObject(current[key], val);
                    if (hasPrice) {
                        // this piece of code is commented out, as it was implemented only for ASIAN view (WEB-2769),
                        // but was creating significiant load on all views (SDC-7957).

//                         if (current[key].price_change && val.price !== oldPrice) {
//                             current[key].price_change = null;
//                             $timeout(function () {
//                                 if (current[key]) {
//                                     current[key].price_change = (val.price === oldPrice) ? null : (oldPrice < val.price) * 2 - 1;
//                                 }
//                             }, 300);
//                         } else {
                            if (!val.price) {
                                current[key].price_change = null;
                            }else if (!current[key].price_change) {
                                current[key].price_change = (val.price === oldPrice) ? null : (oldPrice < val.price) * 2 - 1;
                            } else {
                                if (val.price === oldPrice) {
                                    current[key].price_change = null;
                                } else if (current[key].price_change < 0 && val.price > oldPrice) {
                                    current[key].price_change = 1;
                                } else if(current[key].price_change > 0 && val.price < oldPrice) {
                                    current[key].price_change = -1;
                                } else {
                                    current[key].price_change += (oldPrice < val.price) * 2 - 1;
                                }
                            }
//                         }
                    }
                }
            }
        });
    }

    /**
     * @ngdoc function
     * @name resubscribe
     * @methodOf vbet5.service:Zergling
     * @description
     *  Restore subscriptions
     */
    function resubscribe() {
        console.log('resubscribing', useWebSocket, subscriptions);
        angular.forEach(subscriptions, function (subData, subId) {
            Zergling.subscribe(subData.request, subData.callback).then(function (response) {
                subData.callback(response.data);
            });
            //delete subscriptions[subId];   //clear previous data because we'll receive full data when resubscribing
        });
    }

    /**
     * wait for restoring login
     */
    var processPromise;
    function checkLoggedInState(sessionRestored) {
        if (Config.env.authorized && !$rootScope.inactiveMode) {
            var showDialog = function () {
                if (!$rootScope.inactiveMode) {
                    $rootScope.$broadcast("globalDialogs.addDialog", {
                        type: 'error',
                        title: 'Error',
                        tag: 'disconnected',
                        content: 'Your session has timed out. We apologize for the inconvenience.',
                        hideCloseButton: true,
                        buttons: [
                            {title: 'Ok', callback: function() {
                                    Config.env.authorized = false;
                                }}
                        ]
                    });
                }
            };
            if (!processPromise) {
                processPromise = $timeout(function () {
                    processPromise = null;
                    showDialog();
                }, 25000);
            }
            var logoutIfNeeded = function () {
                if ($rootScope.loginInProgress) {
                    $timeout(logoutIfNeeded, 1000);
                } else {
                    isLoggedIn ? $rootScope.$broadcast('globalDialogs.removeDialogsByTag', 'disconnected') : showDialog();

                    if (processPromise) {
                        $timeout.cancel(processPromise);
                        processPromise = null;
                    }
                }
            };

            if (sessionRestored) {
                logoutIfNeeded();
            }
        }
    }

    /**
     * @ngdoc method
     * @name updateSubscribers
     * @methodOf vbet5.service:Zergling
     * @description
     * Extracts diffs from data and applies to subscribers data
     * then passes updated data to callback func, specified by subscriber
     *
     * @param {Object} data received subscription data
     */
    function updateSubscribers(data) {

        angular.forEach(data.data, function (subDataDiff, subId) {
            var subscription = subscriptions[subId];
            if (undefined !== subscription && undefined !== subscription.callback) {
                destructivelyUpdateObject(subscription.data, {data: subDataDiff}); //
                subscription.callback(subscription.data.data);
            } else if (subscriptions[subId] === undefined) {
                console.log('got update for unknown subscription', subId, 'trying to unsubscribe');
                !inProgressUnsubs[subId] && Zergling.unsubscribe(subId);
            }
        });
    }
    /**
     * @ngdoc function
     * @name handleSubscriptionResponse
     * @methodOf vbet5.service:Zergling
     * @description
     * Handle subscription data
     *
     * @param {Object} response response
     */
    function handleSubscriptionResponse(response) {
        var code = response.data.code;
        code = code === undefined ? response.data.data.code : code;
        if (code === Zergling.codes.OK) {        //everything is ok
            updateSubscribers(response.data);
        } else if (code === Zergling.codes.SESSION_LOST && !sessionRequestIsInProgress) {
            //Config.env.authorized = false;
            session = null;
            resubscribe();

            checkLoggedInState();
        } else {                              // unknown error
            console.log(response);
        }
    }

    /**
     * @ngdoc function
     * @name resolve session
     * @methodOf vbet5.service:Zergling
     * @methodType private
     * @description
     * Used for checking recaptcha version and initialization appropriate functionality
     */
    function processSessionResponse (response) {
        var processResult;
        sessionRequestIsInProgress = false;
        var res = response.data.data;
        if (res && res.sid) {
            if (res.recaptcha_enabled) {
                RecaptchaService.init(res.site_key, res.recaptcha_version);
            }

            session.resolve(res.sid);

            $rootScope.$broadcast('zergling.sessionOpened', res.sid);

            if (isLoggedIn) {
                isLoggedIn = false;
                Zergling.login(null)['finally'](resubscribe);
            } else {
                resubscribe();
            }

            checkLoggedInState(true);

            processResult = session.promise;
        } else {
            session = null;
            console.warn('got invalid response to request_session , sid not present', JSON.stringify(response));
            processResult = $q.reject(response);
        }
        return processResult;
    }

    /**
     * @ngdoc function
     * @name getSession
     * @methodOf vbet5.service:Zergling
     * @description
     * Get or create session
     * @returns {Object} session promise
     */
    function getSession() {
        var result;
        if (!session) {
            session = $q.defer();
            result = session.promise;
            var sessionRequestCmd = { 'command': "request_session", 'params': { 'language': Utils.getLanguageCode(Config.env.lang), 'site_id': Config.main.site_id} };
            if (Config.main.enableTwoFactorAuthentication) {
                sessionRequestCmd.params.afec = Fingerprint2.authenticationCode;
            }else if (Config.everCookie.enabled && !Config.main.integrationMode) {
                var clId = $cookies.get("afec");
                if (clId && clId.length > 0) {
                    sessionRequestCmd.params.afec = clId;
                }
            }
            if (BuildConfig.releaseDate) {
                sessionRequestCmd.params.release_date = BuildConfig.releaseDate;
            }

            if (Config.swarm.sendSourceInRequestSession && Config.main.source !== undefined) {
                sessionRequestCmd.params.source = Config.main.source;
            }
            if (Config.swarm.sendTerminalIdlInRequestSession && Config.main.terminalId !== undefined) {
                sessionRequestCmd.params.terminal = Config.main.terminalId;
            }
            sessionRequestIsInProgress = true;

            if (useWebSocket) {
                console.log('requesting new session (WS)');
                result = WS.sendRequest(sessionRequestCmd).then(processSessionResponse);
            } else {
                console.log('requesting new session (LP)');
                $http.post(getLongPollUrl(), JSON.stringify(sessionRequestCmd))
                    .then(function (response) { // extra 'data' is used to make structure same as when using data returned by $http.post promise resolve
                        result = processSessionResponse({data: response.data});
                    })
                    .error(function (response) {
                        session = null;
                        result = $q.reject(response.data);
                    });
            }

            return result;
        } else {
            result = session.promise;
        }

        return result;
    }

    /**
     * @ngdoc function
     * @name whatsUp
     * @methodOf vbet5.service:Zergling
     * @description
     * Used only in long-polling mode to get subscription data
     */
    function whatsUp() {

        if (session) {
            getSession()
                .then(function (session_id) {
                    var data = { 'command': 'whats_up' };
                    var headers = { 'swarm-session': session_id };

                    return $http.post(getLongPollUrl(), JSON.stringify(data), { 'headers': headers });
                })
                .then(function (response) {
                    handleSubscriptionResponse(response);
                    $timeout(whatsUp, 500);
                })['catch'](function (reason) {
                    console.log(reason);
                    if (reason.status === 404) {
                        session = null;
                    }
                    $timeout(whatsUp, 5000);
                });
        } else {
            $timeout(whatsUp, 1000);
        }

    }
    /**
     * @ngdoc function
     * @name init
     * @methodOf vbet5.service:Zergling
     * @description
     * Initializes connection(determines if Zergling will use Websocket or long-polling)
     */
    Zergling.init = function init() {
        console.log("%c     .\"\".    .\"\",\n     |  |   /  / \n     |  |  /  /  \n     |  | /  /   \n     |  |/  ;-._ \n     }  ` _/  / ;\n     |  /` ) / /\n     | /  /_/\_/\\\n     |/  /      |\n     (  ' \\ '-  |\n      \\    `.  / \n       |      |  \n       |      |  \n       init", "color: red; font-weight: bold; font-family:monospace;", WS.isAvailable)
        if (Config.swarm.useWebSocket && WS.isAvailable) {
            console.log("Config.swarm.useWebSocket",Config.swarm.useWebSocket, Config);
            WS.addSubscriptionListener(handleSubscriptionResponse);
            WS.onNotAvailable(function () { // socket has gone away and won't reconnect (WS.isAvailable is already false)
                Zergling.init();
                resubscribe();
            });

            WS.setOnCloseCallback(function () { //connection lost, but there's still hope to reconnect
               // if (!sessionRequestIsInProgress) {
                    session = null;
                    $rootScope.$broadcast('zergling.lostWSConnection');
               // }
                WS.onConnect(getSession);
            });

            useWebSocket = true;
        } else {
            useWebSocket = false;
            whatsUp();
        }
    };

    /**
     * @ngdoc function
     * @name ensureWebsocketIsAvailable
     * @methodOf vbet5.service:Zergling
     * @description
     * Will check if Websocket connection is available, if not, will switch to long polling mode
     * @returns {promise|*|Function} promise
     */
    function ensureWebsocketIsAvailable() {
        connectionAvailable = $q.defer();
        var result = connectionAvailable.promise;
        if (!useWebSocket) {
            connectionAvailable.resolve(true);
        } else {
            result = WS.connect().then(
                function () {
//                    console.log('websocket available');
                    connectionAvailable.resolve(true);
                },
                function () {
                    useWebSocket = false;
                    console.log('Websocket not available', useWebSocket);
                    resubscribe();
                    connectionAvailable.reject(false);
                    return connectionAvailable.promise;
                }
            );
        }
        return result;

    }

    /**
     * @ngdoc function
     * @name sendRequest
     * @methodOf vbet5.service:Zergling
     * @description Sends request to swarm using websocket or long-polling
     * @param {Object} data request data
     * @returns {Object} promise
     */
    function sendRequest(data) {
        if (useWebSocket && WS.isAvailable) {

            return ensureWebsocketIsAvailable().then(
                function () {
                    return getSession().then(
                        function (session_id) {
                            //console.log('sending request (WS) ', session_id, JSON.stringify(data));
                            return WS.sendRequest(data);
                        },
                        function (reason) {
                            console.error("cannot get session and don't know what to do now :(", reason);
                            return $q.reject(reason);
                        }
                    );
                },
                function () {
                    //send request again if connection wasn't available (it'll be switched to long poll already)
                    return sendRequest(data);
                }
            );
        } else {
            console.log('sending request (LP)');
            if (useWebSocket) {
                Zergling.init();
            }
            return getSession()
                .then(function (session_id) {
                    var headers = { 'swarm-session': session_id };
                    return $http.post(getLongPollUrl(), JSON.stringify(data), { 'headers': headers });
                });
        }
    }

    /**
     * @ngdoc method
     * @name login
     * @methodOf vbet5.service:Zergling
     * @description
     * logs user in and stores received auth token in local storage or restores login using saved auth  token
     *
     * @param {Object|null} user user object or null.
     *                            If null login will be restored using saved auth session.
     *                            Otherwise user object must have 'username' and 'password' fields
     * @param {Boolean} remember whether to remember auth data for a long time(default is off)
     * @param {Object} additionalParams additional parameters to pass to command (key-value map), e.g. {foo: "bar"}
     * @returns {promise} promise
     */
    Zergling.login = function login(user, remember, additionalParams) {
        var data, loginAuthData;
        if (user === null) {
            loginAuthData = AuthData.get();
            if (!loginAuthData) {
                console.warn("cannot login, no saved credentials");
                return $q.reject(null);
            }
            if (loginAuthData.needToVerify) {
                AuthData.clear();
                return $q.reject(null);
            }
            if (loginAuthData.jwe_token) {
                data = {'command': 'login_encrypted', 'params':  {'jwe_token': loginAuthData.jwe_token, 'auth_token': loginAuthData.auth_token} };
            } else {
                data = {'command': 'restore_login', 'params':  {'user_id': loginAuthData.user_id, 'auth_token': loginAuthData.auth_token} };
            }
        } else if (user.facebook) {
            data = {'command': 'facebook_login', 'params': {'access_token': user.access_token}};
        } else if (user.odnoklassniki) {
            data = {'command': 'ok_login', 'params': {'access_token': user.accessToken, session_secret_key: user.sessionSecretKey }};
        } else if (user.nemIDAuthentication) {
            data = {
                'command': 'login_with_nem_id',
                'params': {
                    'result': user.result,
                    'signature': user.signature,
                    'challenge': user.challenge,
                    'remember_user_id_token': user.remember_user_id_token,
                    'login': user.login
                }
            };
        } else if (user.authZero) {
            data = {'command': 'social_network_login', 'params': {'code': user.token, 'social_network_domain': user.domain, 'social_network_type': 'auth0'}};
        } else {
            data = {'command': 'login', 'params': {'username': user.username, 'password': user.password, 'encrypted_token': true}};
        }

        $rootScope.loginInProgress = true;

        if (additionalParams) {
            angular.forEach(additionalParams, function (paramValue, paramName) {
                data.params[paramName] = paramValue;
            });
        }

        return sendRequest(data)
            .then(function (response) {
                if (response.data.code === Zergling.codes.OK && response.data.data.auth_token) {
                    console.log('zergling got login response', response);
                    isLoggedIn = true;
                    if (!response.data.data.qr_code_origin && response.data.data.authentication_status !== 4) {
                        Config.env.authorized = true;
                    }

                    if (user || data.command === 'login_encrypted') { //when restoring a login, if the login_encrypted command is used, then we get a new authData and should update the storage
                        var authData = {auth_token: response.data.data.auth_token, user_id: response.data.data.user_id, never_expires: remember || undefined, jwe_token: response.data.data.jwe_token || (loginAuthData && loginAuthData.jwe_token)};
                        if (response.data.data.qr_code_origin || response.data.data.authentication_status === 4) {
                            authData.needToVerify = true;
                        }
                        if (user) {
                            if (user.nemIDAuthentication) {
                                authData.nemIDToken = response.data.data.nem_id_token;
                            }
                            if (user.username) {
                                authData.login = user.username;
                            }
                        }

                        AuthData.set(authData);
                    }
                    return response.data;
                } else {
                    Config.env.authorized = false;
                    return $q.reject(response.data);
                }
            })['catch'](function (reason) {
                if (reason.code === Zergling.codes.SESSION_LOST) { //session lost
                    $rootScope.$broadcast('zergling.sessionLost');
                    if (!sessionRequestIsInProgress) {
                        session = null; // this will make next statement request new session
                    }
                    return Zergling.login(user);
                }

                Config.env.authorized = false;

                console.log('login fail, code:', reason);
                return $q.reject(reason);
            })['finally'](function() {
                $rootScope.loginInProgress = false;
            });
    };

    /**
     * @ngdoc method
     * @name logout
     * @methodOf vbet5.service:Zergling
     * @description logs out user
     *
     * @returns {promise} promise
     */
    Zergling.logout = function logout(source, fcmToken) {
        var data = {'command': 'logout', 'params': {}};
        if (source) {
            data.params.source = source;
        }
        if (fcmToken) {
            data.params.fcm_token = fcmToken;
            data.params.jwe_token = AuthData.get().jwe_token;
        }

        return sendRequest(data)
            .then(function (response) {
                AuthData.clear();
                if (response.data.code === Zergling.codes.OK) {
                    isLoggedIn = false;
                    return response.data;
                } else {
                    return $q.reject(response.data.code);
                }
            })['catch'](function (reason) {
                AuthData.clear();
                if (reason === Zergling.codes.SESSION_LOST) { //session lost
                    $rootScope.$broadcast('zergling.sessionLost');
                    if (!sessionRequestIsInProgress) {
                        session = null; // this will make next statement request new session
                    }
                    return Zergling.logout();
                }
                console.log('logout fail, code:', reason);
                return $q.reject(reason);
            });
    };

    /**
     * @ngdoc method
     * @name get
     * @methodOf vbet5.service:Zergling
     * @description
     * Just get data without subscribing
     * @param {Object} request request object
     * @param {String} [command] optional.  default is 'get'
     * @returns {promise} promise that will be resolved with data from swarm
     */
    Zergling.get = function get(request, command) {
        command = command || 'get';
        var data = { 'command': command, 'params': request };
        return sendRequest(data)
            .then(function (response) {
                if (response.data.code === Zergling.codes.OK) {
                    return response.data.data;
                } else {
                    return $q.reject(response.data);
                }
            })['catch'](function (reason) {
                if (reason.code === Zergling.codes.SESSION_LOST) { //session lost
                    //Config.env.authorized = false;
                    $rootScope.$broadcast('zergling.sessionLost');
                    if (!sessionRequestIsInProgress) {
                        session = null; // this will make next statement request new session
                    }
                    checkLoggedInState();

                    return Zergling.get(request, command);
                }
                if (reason === Zergling.codes.NEED_TO_LOGIN) {
                    //Config.env.authorized = false;
                    checkLoggedInState();

                    return Zergling.login(null).then(function () {
                        return Zergling.get(request, command);
                    });
                }
                console.log('get fail:', reason);
                return $q.reject(reason);
            });
    };

    /**
     * @ngdoc method
     * @name subscribe
     * @methodOf vbet5.service:Zergling
     * @description  Subscribes to request
     * @param {Object}   request  request to subscribe to
     * @param {function} onupdate callback function will receive full data(not the diff)
     * @returns {promise} promise that will be resolved with received data
     */
    Zergling.subscribe = function subscribe(request, onupdate) {
        request.subscribe = true;
        var data = {'command': 'get', 'params': request};

        return sendRequest(data)
            .then(function (response) {
                if (response.data.code === Zergling.codes.OK && response.data.data.subid) {
                    subscriptions[response.data.data.subid] = {
                        'request': request,
                        'callback': onupdate,
                        'data': response.data.data || {}
                    };
                } else {
                    return $q.reject(response.data.code);
                }

                return response.data.data;
            })['catch'](function (reason) {
                if (reason === Zergling.codes.SESSION_LOST) { //session lost
                    $rootScope.$broadcast('zergling.sessionLost');
                    if (!sessionRequestIsInProgress) {
                        session = null; // this will make next statement request new session
                    }
                    return Zergling.subscribe(request, onupdate);
                }
                if (reason === Zergling.codes.NEED_TO_LOGIN) {
                    //Config.env.authorized = false;
                    checkLoggedInState();

                    return Zergling.login(null).then(function () {
                        return Zergling.subscribe(request, onupdate);
                    });
                }
                console.log('subscribe fail, code:', reason);
                return $q.reject(reason);
            });
    };

    /**
     * @ngdoc method
     * @name unsubscribe
     * @methodOf vbet5.service:Zergling
     * @description Unsubscribe from subscription specified by subId
     * @param {string} subId to unsubscribe from subscription id
     * @returns {promise} promise
     */
    Zergling.unsubscribe = function unsubscribe(subId) {
        console.log('unsubscribing', subId);
        if (subId === undefined) {
            console.warn("zergling unsubscribe got undefined subscription id");
            return;
        }
        var data,
            successFn,
            errorFn,
            responses = [];

        successFn = function (response) {
            if (response.data.code === Zergling.codes.OK) {
                //delete subscriptions[subId];
                console.log(subId, ' unsubscribe ok');
            } else {
                return $q.reject(response.data.code);
            }

        };
        errorFn = function (reason) {
            if (reason === Zergling.codes.SESSION_LOST) { //session lost
                $rootScope.$broadcast('zergling.sessionLost');
                if (!sessionRequestIsInProgress) {
                    session = null; // this will make next statement request new session
                }
                return Zergling.unsubscribe(subId);
            }
            console.log('unsubscribe fail, code:', reason);
            delete subscriptions[subId]; //delete subscription array entry(incl. callback) anyway
            return $q.reject(reason);
        };

        if (angular.isArray(subId)) {
            angular.forEach(subId, function (id) {
                delete subscriptions[id];

                if (!inProgressUnsubs[id]) {
                    inProgressUnsubs[id] = true;
                    data = {'command': 'unsubscribe', 'params': {subid: id.toString()}};
                    responses.push(sendRequest(data).then(successFn)['catch'](errorFn)['finally'](function() { delete inProgressUnsubs[id]; }));
                }

            });
        } else {
            delete subscriptions[subId];
            if (!inProgressUnsubs[subId]) {
                data = {'command': 'unsubscribe', 'params': {subid: subId.toString()}};
                inProgressUnsubs[subId] = true;
                responses.push(sendRequest(data).then(successFn)['catch'](errorFn)['finally'](function() { delete inProgressUnsubs[subId]; }));
            }
        }
        if (responses.length) {
            return $q.all(responses);
        }

    };

    Zergling.closeConnection = function closeConnection() {
        WS.closeConnection();
    };

    Zergling.restoreConnection = function restoreConnection() {
        WS.restoreConnection();
    };

    return Zergling;

}]);

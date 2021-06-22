/**
 * @ngdoc controller
 * @name vbet5.controller:loginCtrl
 * @description
 * login controller
 */
angular.module('vbet5').controller('loginCtrl', ['$scope', '$rootScope', 'TimeoutWrapper', '$filter', '$q', '$location', '$window', '$sce', '$timeout', 'Script', 'Config', 'ConnectionService', 'Zergling', 'RecaptchaService', 'Tracking', 'Storage', 'Translator', 'partner', 'Utils', 'content', 'analytics', 'AuthData', 'LocalIp', function ($scope, $rootScope, TimeoutWrapper, $filter, $q, $location, $window, $sce, $timeout, Script, Config, ConnectionService, Zergling, RecaptchaService, Tracking, Storage, Translator, partner, Utils, content, analytics, AuthData, LocalIp) {
    'use strict';
    TimeoutWrapper = TimeoutWrapper($scope);

    var ERROR_SERVICE_UNAVAILABLE = 3;
    var refreshBalancePromise, keepAlivePromise;
    var connectionService = new ConnectionService($scope);
    var nemIDMsgListener;
    var isGettingBalanceInProgress = false;

    $scope.busy = false;


    function init() {
        if (RecaptchaService.version) {
            $scope.recaptcha = {
                version: RecaptchaService.version
            };
        } else {
            var recaptchaHandlingPromise = $scope.$on('recaptcha_version', function (event, data) {
                $scope.recaptcha = {
                    version: data.version
                };
                recaptchaHandlingPromise();
            });
        }
    }

    $scope.params = {
        userAge: 0,
        countryIsRestricted: false,
        needVerification: false,
        needVerificationCode: false,
        needUserAuthorization: false
    };

    // mail confirmation and mail password reset
    if ($location.search().action && $location.search().code) {
        if ($location.search().action === 'reset_password') {
            Config.env.showSlider = true;
            Config.env.sliderContent = 'reset_password';
        } else if ($location.search().action === 'verify') {
            Zergling.get({
                'verification_code': $location.search().code
            }, 'verify_user').then(function (response) {
                if (response.result === 0) {
                    $rootScope.$broadcast("globalDialogs.addDialog", {
                        type: 'info',
                        title: 'E-mail confirmation',
                        content: 'Your E-mail Has been confirmed'
                    });
                    analytics.gaSend('send', 'event', 'slider', 'email_confirmation',  {'page': $location.path(), 'eventLabel': 'Success'});
                    $scope.loginAction = 'mail_confirmed';
                } else if (response.result === -2408 || response.result === '-2408' || response.result === '-2462') {
                    $rootScope.$broadcast("globalDialogs.addDialog", {
                        type: 'info',
                        title: 'E-mail confirmation error',
                        content: 'Verification process failed. Please try again.'
                    });
                    analytics.gaSend('send', 'event', 'slider', 'email_confirmation',  {'page': $location.path(), 'eventLabel': 'Error'});
                }
            });
        }
    }


    /**
     * Broadcasts 'profile' message with profile data on rootScope
     *
     * @param {Object} data profile data
     */
    function updateProfile(data) {
        $rootScope.$broadcast('profile', data);
    }

    /**
     * @ngdoc method
     * @name keepAlive
     * @methodOf vbet5.controller:loginCtrl
     * @description keeps user session and data alive while browser window is open and user is logged in.
     * We don't have to do this when user is not logged in because data like betslip and favorite games will not expire
     */
    function keepAlive() {
        if ($rootScope.env.authorized) {
            var dataToProlong = ['myGames'];
            var authData = AuthData.get();
            if (authData && !authData.never_expires) {
                dataToProlong.push('auth_data');

                Utils.checkAndSetCookie("auth_data", authData, Config.main.authSessionLifetime);
            }
            angular.forEach(dataToProlong, function (key) {
                var val = Storage.get(key);
                if (val) {
                    Storage.set(key, val, Config.main.authSessionLifetime);
                }
            });
            $rootScope.blockingPopup = undefined;
            keepAlivePromise = TimeoutWrapper(keepAlive, parseInt(Config.main.authSessionLifetime / 2, 10)); //this has to run more often than session lifetime
        }
    }

    /**
     * @ngdoc method
     * @name refreshBalance
     * @methodOf vbet5.controller:loginCtrl
     * @description
     * sends command to refresh balance if corresponding Config.partner.balanceRefreshPeriod or Config.mainrfid.balanceRefreshPeriod is set
     * should get response of same format as 'profile' command
     */
    function refreshBalance() {
        if (!Config.partner.balanceRefreshPeriod && !Config.main.rfid.balanceRefreshPeriod || isGettingBalanceInProgress) {
            return;
        }

        TimeoutWrapper.cancel(refreshBalancePromise); // TimeoutWrapper checks the existence of promise by itself

        isGettingBalanceInProgress = true;

        Zergling.get({}, 'get_balance').then(function (response) {
            updateProfile(response.data);
            if (response.data) {
                partner.call('balance', $filter('firstElement')(response.data.profile));
            }
            if ((response.code && (response.code === 12 || response.code === '12')) || (response.result && response.result === '-1002')) {
                $rootScope.$broadcast('doLogOut');
            }
        })['finally'](function () {
            refreshBalancePromise = TimeoutWrapper(refreshBalance, Config.partner.balanceRefreshPeriod || Config.main.rfid.balanceRefreshPeriod);
            isGettingBalanceInProgress = false;
        })['catch'](function (reason) {
            partner.call('balance', reason);
        });
    }

    $scope.$on('refreshBalance', refreshBalance); // receiving this when need to refresh balance in integration skin
    $scope.$on('loggedIn', function () { //receiving this when restoring login
        keepAlive();
        refreshBalance();
        subscribeForMessages();
    });

    $scope.$on('login.loggedOut', function () {
        $scope.user = {};
        Storage.remove('lastLoggedInUsername');
        $scope.registrationComplete = false;
        partner.call('logout');

        TimeoutWrapper.cancel(refreshBalancePromise);
        TimeoutWrapper.cancel(keepAlivePromise);
    });

    /**
     * @ngdoc method
     * @name pushIncomingMessage
     * @methodOf vbet5.controller:pushIncomingMessage
     * @description broadcast new message to the messages
     *
     * @param {Object} message data
     */
    function pushIncomingMessage(result) {
        console.log('incoming (subscription) message', result);
        if (result.messages && Object.keys(result.messages).length > 0) {
            $rootScope.$broadcast('messages.updateMessages', result.messages);
            $rootScope.profile.unread_count++;
        }
    }

    function subscribeForMessages () {
        console.log('subscribe for messages');
        Zergling
            .subscribe({'source': 'messages', 'what': {'messages': []}, 'subscribe': true}, pushIncomingMessage)
            .then(function (result) {
                pushIncomingMessage(result);
            });
    }
    /**
     * @ngdoc method
     * @name showAuthenticationPopup
     * @methodOf vbet5.controller:login
     * @description show two factor authentication popup and after verification call callback function
     * @param {String} qrCodeOrigin
     * @param {Function} callback
     */
    function showAuthenticationPopup(qrCodeOrigin, callback) {
        $scope.showAuthenticationPopup = true;
        $scope.authenticationData = {
            period: "30",
            isDeviceTrusted: false,
            code: {}
        };
        for(var i = 1; i < 7; i++) {
            $scope.authenticationData.code["k" + i] = "";
        }
        if (qrCodeOrigin) {
            $scope.authenticationData.qrCodeURL = 'https://chart.googleapis.com/chart?chs=114x114&chld=L|0&cht=qr&chl='+ encodeURIComponent(qrCodeOrigin);
        }
        /**
         *   This method is handle autofocus for token inputs.
         *   Method is check if value is not empty string focus next sibling element
         *   and drive cursor to left and right by keybord arrows.
         *
         *   @param {object} $event - Inputted dom element.
         *   @param {string} value - Inputted value.
         */
        $scope.autofocusHandler = function($event, value) {
            if (value !== '' && value !== undefined && $event.keyCode !== 39 && $event.keyCode !== 37) {
                $event.target.nextElementSibling && $event.target.nextElementSibling.focus();
            }

            if ($event.keyCode === 39) {
                $event.target.nextElementSibling && $event.target.nextElementSibling.focus();
            } else if ($event.keyCode === 37 || $event.keyCode === 8) {
                $event.target.previousElementSibling && $event.target.previousElementSibling.focus();
            }
        };
        /**
         *   This method is handle focus event for token inputs.
         *   Method is select existing value from input element.
         *
         *   @param {object} $event - Inputted dom element.
         */
        $scope.focusHandler = function($event) {
            $event.target && $event.target.select();
        };

        $scope.checkAuthenticationCode = function (event) {
            event.preventDefault();
            var code = "";
            for(var i = 1; i < 7; i++) {
                code += $scope.authenticationData.code["k" + i];
            }
            var request = {
                code: code,
                is_device_trusted: $scope.authenticationData.isDeviceTrusted,
                device_fingerprint: Fingerprint2.authenticationCode
            };

            if ($scope.authenticationData.isDeviceTrusted) {
                request.trust_period = +$scope.authenticationData.period;
            }
            $scope.isLoading = true;
            Zergling.get(request, "apply_two_factor_authentication_code").then(function (data) {
                if (data.result === 0){
                    var authData = AuthData.get();
                    authData.needToVerify = false;
                    AuthData.set(authData);
                    callback();

                } else {
                    $rootScope.$broadcast("globalDialogs.addDialog", {
                        type: 'error',
                        title: 'Error',
                        content: 'Invalid code'
                    });
                    for(var i = 1; i < 7; i++) {
                        $scope.authenticationData.code["k" + i] = "";
                    }
                }
            })['finally'](function () {
                $scope.isLoading = false;
            });

        };

        $scope.onAuthenticationClose = function onAuthenticationClose() {
            $scope.showAuthenticationPopup = false;
            closeSignInForm();
            $rootScope.broadcast("doLogOut");
            $rootScope.broadcast("slider.close");
        };

        $scope.showBarcode = function showBarcode() {
            var match = RegExp('[?&]secret=([^&]*)').exec(qrCodeOrigin);
            $scope.authenticationData.barcode = match && match[1];
        };


        /**
         * @ngdoc method
         * @name verify
         * @methodOf vbet5.controller:loginCtrl
         * @description copy barcode to clipboard
         */
        $scope.copyToClipboard = function copyToClipboard() {
            Utils.copyToClipboard($scope.authenticationData.barcode);
        };

    }


    /**
     * @ngdoc function
     * @name doLoginRequest
     * @methodOf vbet5.controller:loginCtrl
     * @description do login request
     *
     * @param {Object} loginObj
     * @param {Boolean} remember
     * @param {Object} additionalParams
     * @param {String | null} action
     */

    function doLoginRequest(loginObj, remember, additionalParams, action) {
        $rootScope.loginInProgress = true;
        $scope.busy = true;
        var login = $q.defer();
        var promise = login.promise;

        Zergling
            .login(loginObj, remember, additionalParams)
            .then(
                function (data) {  // success
                    function onSuccesfulLogin() {
                        $rootScope.loginInProgress = false;

                        $rootScope.$broadcast('authentication.success',action); //todo  SDC-37579
                        analytics.gaSend('send', 'event', 'slider', 'login',  {'page': $location.path(), 'eventLabel': 'Success'});

                        $scope.env.authorized = true;
                        Storage.set('lastLoggedInUsername', loginObj.username);
                        if (!Config.partner.profileNotAvailable) { // for some skins profile is not available in swarm
                            subscribeToProfile(action);
                        }
                        login.resolve(data);
                    }
                    if (!data.data.qr_code_origin && data.data.authentication_status !== 4) {
                        onSuccesfulLogin();
                    }else {
                        showAuthenticationPopup(data.data.qr_code_origin, onSuccesfulLogin);
                    }

                },
                function (data) {
                    data.data = data.data || {};
                    console.log('login failed', data);
                    $rootScope.loginInProgress = false;
                    analytics.gaSend('send', 'event', 'slider', 'login',  {'page': $location.path(), 'eventLabel': 'Failed (' + data.data.status + ')'});
                    login.reject(data, {loginObj: loginObj, remember: remember, additionalParams: additionalParams, action: action});

                    if (data.data.status === 2457) {
                        if ($scope.params.displayRecaptcha) {
                            $scope.$broadcast('recaptcha.reload');
                        } else {
                            $scope.params.displayRecaptcha = true;

                            $scope.$on('recaptcha.response', function (event, response) {
                                if ($scope.user) {
                                    $scope.user.g_recaptcha_response = response;
                                }
                            });
                        }
                    } else if (data.data.status === 301 && data.data.details.message) {
                        var dialog = {
                            type: "warning",
                            title: "Warning",
                            content: data.data.details.message,
                        };
                        if (data.data.details.link) {
                            dialog.link = data.data.details.link;
                        }
                        $rootScope.$broadcast("globalDialogs.addDialog", dialog);
                    }
                }
            );
        return promise;
    }

    /**
     * @ngdoc method
     * @name loginWithUsernamePassword
     * @methodOf vbet5.controller:loginCtrl
     * @description logs user in, subscribes to profile
     *
     * @param {String} user username
     * @param {String} password password
     * @param {String} action action
     * @param {Boolean} remember whether to remember auth data for a long time(default is off)
     */
    function loginWithUsernamePassword(user, password, action, remember) {
        var loginObj = {username: user, password: password};
        var additionalParams = {};

        if ($scope.user) {
            addIovation(additionalParams);

            if ($scope.user.g_recaptcha_response) {
                additionalParams.g_recaptcha_response = $scope.user.g_recaptcha_response;
            }

            if ($scope.user.birth_date) {
                additionalParams.birth_date = $scope.user.birth_date;
            }
        }

        if ($scope.params.needVerificationCode) {
            additionalParams.login_code = $scope.user.login_code;
            $scope.params.needVerificationCode = false;
        }

        if (LocalIp.ip) {
            additionalParams.local_ip = LocalIp.ip;
        }

        if (Config.swarm.sendTerminalIdlInRequestSession && user.toString() === '1' && typeof jsobject !== 'undefined') {
            jsobject.loginAdmin('1', password);
        }

        if ($rootScope.partnerConfig.smsVerification && $rootScope.partnerConfig.smsVerification.login) {
            return Utils.getSMSCode(2, user).then(function(code) {
                additionalParams.confirmation_code = code;
                return doLoginRequest(loginObj, remember, additionalParams, action);
            })
        } else {
            return doLoginRequest(loginObj, remember, additionalParams, action);
        }
    }

    /**
     * @ngdoc function
     * @name subscribeToProfile
     * @methodOf vbet5.controller:loginCtrl
     * @description subscribes to user profile
     *
     * @param {String} [action]
     */
    function subscribeToProfile(action) {
        connectionService.subscribe(
            {'source': 'user', 'what': {'profile': []}, 'subscribe': true},
            updateProfile,
            {
                'thenCallback': function () {
                    $rootScope.$broadcast('loggedIn',action);
                    keepAlive();
                    action = $scope.loginAction || action || 'logged_in';
                    $scope.loginAction = null;
                    Tracking.event(action, {}, true);
                }
            }
        );
    }

    $scope.$on('login.withUsernamePassword', function (event, data) {
        ///skip autoLogin after registration if sms verification enabled for login
        if (!$rootScope.partnerConfig.smsVerification || !$rootScope.partnerConfig.smsVerification.login) {
            loginWithUsernamePassword(data.user, data.password, data.action, false);
        }

    });

    /**
     * @ngdoc method
     * @name login
     * @methodOf vbet5.controller:loginCtrl
     * @description handles the sing-in form, logs user in  and hides the login form
     */
    $scope.login = function login() {
        $scope.params.needVerification = false;
        $scope.params.needUserAuthorization = false;
        $scope.params.lockedUser = false;
        Storage.set("rememberMe", !!$scope.user.remember);
        if ($scope.forms.signinform.$valid) {
            if (Config.main.nemIDAuthentication && Config.main.nemIDAuthentication.enabled) {
                $scope.busy = true;
                loginWithNemID($scope.user.username)
                    .then(handleLoginSuccess, handleLoginFailure)['finally'](closeSignInForm);
            } else {
                loginWithUsernamePassword($scope.user.username, $scope.user.password, null, $scope.user.remember)
                    .then(handleLoginSuccess, handleLoginFailure)['finally'](closeSignInForm);
            }
        } else {
            $scope.busy = false;
        }
    };


    /**
     * @ngdoc function
     * @name handleLoginSuccess
     * @methodOf vbet5.controller:pushIncomingMessage
     * @description Handles login success, if the login promise resolves
     */
    function handleLoginSuccess() {
        $scope.user.password = '';
        var token = Config.main.firebaseToken;
        if(token) {
            Zergling.get({
                fcm_token: token,
                source: "web",
                app_type: "all"
            }, "store_fcm_token");
        }
        TimeoutWrapper(function () {
            if ($scope.env.sliderContent === 'login') {
                $scope.env.showSlider = false;
                $scope.env.sliderContent = '';
                $scope.showAuthenticationPopup = false;
                if (Config.main.enableTwoFactorAuthentication) {
                    Storage.remove('qrCodeOrigin');
                }
            }
        }, 500);
    }


    /**
     * @ngdoc function
     * @name handleLoginFailure
     * @methodOf vbet5.controller:pushIncomingMessage
     * @description Handles login failure, if the login promise doesn't resolve
     */
    function handleLoginFailure(data, loginParams) {
        // Recaptcha action not verified
        if (data.code === 29) {
            return RecaptchaService.execute('login', { debounce: false }).then(function() {
                $scope.login();
            });
        }

        data.data = data.data || {};
        $scope.busy = false;
        var placeholders = [];
        if (data.data.details.ErrorData) {
            placeholders.push(data.data.details.ErrorData.TimeToWait);
        }
        $scope.signInError = Translator.get((data.data.details && (Translator.translationExists(data.data.details.Key) ? data.data.details.Key : data.data.details.Message)) || data.msg || data.data || data.code || true, placeholders);
        if (data.code !== ERROR_SERVICE_UNAVAILABLE) {
            if ($scope.forms.signinform && $scope.forms.signinform.$setPristine) {
                $scope.forms.signinform.$setPristine();
            }
        } else {
            $rootScope.$broadcast("globalDialogs.addDialog", {
                type: "error",
                title: "Error",
                content: $scope.signInError,
                buttons: [
                    {title: 'Ok', callback: function() {
                        $rootScope.$broadcast('slider.close');
                    }}
                ]
            });
        }


        // Verify E-mail
        if (data.data === "login error (1023)" || data.data.status === "1023") {
            $scope.params.needVerification = true;
        }

        if (data.data === "login error (2009)" || data.data.status === 2009 ||  data.data.status === "2009") {
            $scope.params.lockedUser = true;
        }

        // Verification Email Code
        if (data.data === "login error (1028)" || data.data.status === "1028" || data.data === "login error (1029)" || data.data.status === "1029") {
            $scope.params.needVerificationCode = true;
        }

        // Account locked
        if (data.data === "login error (1022)" || data.data.status === "1022") {
            $rootScope.$broadcast("globalDialogs.addDialog", {
                type: 'info',
                title: 'Login',
                content: Translator.get('You account has been locked. Please try again later !')
            });
        }

        // NotAllowedLicenseSelfExcluded
        if (data.data === "login error (2467)" || data.data.status === "2467") {
            $rootScope.$broadcast("globalDialogs.addDialog", {
                type: 'info',
                title: 'Login',
                content: Translator.get('We cannot proceed with your request. Contact "Customer Support" for further information.')
            });
        }

        // Self Exclusion
        if (data.data.status === 2008 || data.data.status === "2008") {
            $rootScope.$broadcast("globalDialogs.addDialog", {
                type: 'error',
                title: 'Login',
                content: Translator.get(data.data.details.Message || 'Your account will only be re-opened if you contact us to request it after the Self-Exclusion period has expired.')
            });
            $scope.env.showSlider = false;
        }

        if (data.data.status === 2472 || data.data.status === 2474 || data.data.status === 2476 || data.data.status === 2481) {
            Utils.getSMSCode(2, loginParams.loginObj.username, loginParams.additionalParams.confirmation_code, data.data.details.Message).then(function(code) {
                loginParams.additionalParams.confirmation_code = code;
                doLoginRequest(loginParams.loginObj, loginParams.remember, loginParams.additionalParams, loginParams.action);
            })
        }
    }

    /**
     * @ngdoc function
     * @name closeSignInForm
     * @methodOf vbet5.controller:pushIncomingMessage
     * @description Closes sign in form
     */
    function closeSignInForm() {
        $scope.busy = false;
        $scope.env.showSignInForm = false;
    }


    /**
     * @ngdoc function
     * @name loginWithNemID
     * @methodOf vbet5.controller:loginCtrl
     * @description logs user in using NemID authentication (used for Danish skins), subscribes to profile
     *
     * @param {String} username
     * @returns {Promise} promise that will be resolved with swarm response data object
     */
    function loginWithNemID(username) {
        var login = $q.defer(),
            authData = AuthData.get() || {},
            nemIdParams, challenge, timeInTicks;
        $rootScope.loginInProgress = true;


        /**
         * @ngdoc function
         * @name getNemIDParams
         * @methodOf vbet5.controller:pushIncomingMessage
         * @description requests NemID certificate parameters and opens NemID iFrame
         */
        (function getNemIDParams() {
            var userParams = {
                'login': username,
                'remember_user_id_token': '',
                'remember_user_id_flag': '',
                'remember_user_initially': ''
            };
            if (authData.nemIDToken) {
                userParams.remember_user_id_flag = true;
                userParams.remember_user_id_token = authData.nemIDToken;
            }
            Zergling.get(userParams, 'get_nem_id_js_login_parameter')
                .then(
                    function success(response) {
                        if (response.details && response.details.Parameters) {
                            nemIdParams = response.details.Parameters;
                            challenge = JSON.parse(nemIdParams).SIGN_PROPERTIES.replace('challenge=', '').slice(0, -1);
                            timeInTicks = response.details.TimeInTicks;
                            startNemIDMsgListener();
                            openNemIDIframe();
                        } else {
                            login.reject({ msg: 'Certificate parameters not currently available' });
                        }
                    },
                    function error(response) {
                        login.reject(response);
                    }
                );
        }());


        /**
         * @ngdoc function
         * @name openNemIDIframe
         * @methodOf vbet5.controller:pushIncomingMessage
         * @description Opens NemID login iFrame
         */
        function openNemIDIframe() {
            var url = Config.main.nemIDAuthentication.source + '/launcher/';
            $scope.nemIDSrc = $sce.trustAsResourceUrl(url + timeInTicks);
        }


        /**
         * @ngdoc function
         * @name startNemIDMsgListener
         * @methodOf vbet5.controller:pushIncomingMessage
         * @description Launches a listener which responds to NemID Api messages
         */
        function startNemIDMsgListener() {
            nemIDMsgListener = $scope.$on('handleNemIDMessage', function handleNemIDMessage(event, msg) {
                if (!msg.data) { return; }
                var message = JSON.parse(msg.data);

                switch (message.command) {
                    case "SendParameters":
                        var win = document.getElementById("nemid_iframe").contentWindow,
                            postMessage = { command: "parameters", content: nemIdParams /* Params received from back end */};
                        win.postMessage(JSON.stringify(postMessage), $scope.nemIDSrc); // Sending parameters to NEM ID API
                        break;
                    case "changeResponseAndSubmit":
                        $scope.nemIDSrc = '';
                        var loginParams = {
                            'nemIDAuthentication': true, // Needed for internal purposes, not for actual logging in
                            'result': '',
                            'signature': '',
                            'challenge': challenge,
                            'remember_user_id_token': authData.nemIDToken || '',
                            'login': username
                        };
                        if (message.content.length > 20) {
                            loginParams.result = 'ok';
                            loginParams.signature = message.content;
                        } else {
                            loginParams.result = message.content;
                        }
                        nemIDMsgListener(); // remove listener;
                        Zergling.login(loginParams, !!loginParams.remember_user_id_token)
                            .then(
                                function success(response) {
                                    $rootScope.loginInProgress = false;
                                    analytics.gaSend('send', 'event', 'slider', 'login',  {'page': $location.path(), 'eventLabel': 'Success'});
                                    $scope.env.authorized = true;
                                    Storage.set('lastLoggedInUsername', username);
                                    subscribeToProfile();
                                    login.resolve(response);
                                },
                                function error(response) {
                                    response.data = response.data || {};
                                    $rootScope.loginInProgress = false;
                                    analytics.gaSend('send', 'event', 'slider', 'login',  {'page': $location.path(), 'eventLabel': 'Failed (' + response.data.status + ')'});
                                    login.reject(response);
                                }
                            );
                        break;
                }
            });
        }

        return login.promise;
    }


    /**
     * @ngdoc method
     * @name loginWithFbUserId
     * @methodOf vbet5.controller:loginCtrl
     * @description logs in with facebook user id
     */
    function loginWithFbUserId(event, fbAuthData) {
        console.log('got facebook.loggedIn', event, fbAuthData);
        $rootScope.loginRestored.then(function () {
            console.log('already logged in with access token, will not attempt facebook login');
        }, function () {
            console.log('trying to login with facebook');
            $rootScope.loginInProgress = true;
            Zergling
                .login({access_token: fbAuthData.accessToken, facebook: true}, true)
                .then(
                    function (data) {
                        console.log('facebook login ok', data);
                        $rootScope.loginInProgress = false;
                        Config.env.authorized = true;
                        Storage.set('loginFlow', 'FACEBOOK');
                        TimeoutWrapper(function () {
                            if ($scope.env.sliderContent === 'login' || $rootScope.env.sliderContent === 'register' || $rootScope.env.sliderContent === 'forgotPasswordForm') {
                                $scope.env.showSlider = false;
                                $scope.env.sliderContent = '';
                            }
                        }, 200);
                        subscribeToProfile();

                        Storage.set('lastLoggedInUsername', $scope.user.username);
                    },
                    function (data) {
                        console.log('cannot login with facebook user id', data);
                        $rootScope.loginInProgress = false;
                        $rootScope.$broadcast('facebook.loginWIthIdFailed');
                    }
                );
        });
    }

    $scope.$on('facebook.loggedIn', loginWithFbUserId);

    $scope.resetPasswordData = {
        email: '',
        phone: '',
        username: '',
        password: '',
        password1: '',
        password2: '',
        error: {}
    };

    $scope.resetPasswordState = {
        page: 'main'
    };

    /**
     * @ngdoc method
     * @name resetPassword
     * @methodOf vbet5.controller:loginCtrl
     * @description sends password reset command to swarm
     */
    $scope.resetPassword = function resetPassword() {
        // override call by config
        if (Config.main.passwordNewResetMode || Config.main.registration.simplified) {
            $scope.forgotPassword();
            return;
        }

        Zergling
            .get({email: $scope.resetPasswordData.email, username: $scope.resetPasswordData.username}, 'reset_user_password')
            .then(
                function (successResponse) {
                    if (successResponse.result === 0) {
                        $scope.passwordResetComplete = true;
                        $scope.message = Translator.get('Username or email invalid');
                    } else {

                        // Verify E-mail
                        if (successResponse.result === -1117 || successResponse.result === "-1117" || successResponse.result === "-1002") {
                            $scope.usernameOrEmailInvalid = true;
                        }
                    }
                },
                function (failResponse) {
                    $scope.passwordResetFailed = 'Password reset failed.';
                }
            );
    };

    /**
     * @ngdoc method
     * @name forgotPassword
     * @methodOf vbet5.controller:loginCtrl
     * @description sends forgot password command to swarm
     */
    $scope.forgotPassword = function forgotPassword() {
        if ($scope.sendingForgotPassword) {
            return;
        }

        $scope.sendingForgotPassword = true;

        Zergling
            .get({email: $scope.resetPasswordData.email}, 'forgot_password')
            .then(
                function (successResponse) {
                    console.log("forgot_password response", successResponse);
                    if (successResponse.result === 0) {
                        $scope.passwordResetComplete = true;
                        //$scope.message = Translator.get('Invalid email');
                    }
                    else if(successResponse.result == '-1002') {
                        $scope.passwordResetFailed = "Entered email address doesn't exist.";
                    }
                    else {
                        $scope.passwordResetFailed = 'Password reset failed.';
                    }
                    $scope.sendingForgotPassword = false;
                },
                function (failResponse) {
                    $scope.passwordResetFailed = 'Password reset failed.';
                    $scope.sendingForgotPassword = false;
                }
            );
    };

    /**
     * @ngdoc method
     * @name sendNewPassword
     * @methodOf vbet5.controller:loginCtrl
     * @description sends the new password command to swarm
     */
    $scope.sendNewPassword = function sendNewPassword() {
        if ($scope.sendingNewPassword) {
            return;
        }

        $scope.sendingNewPassword = true;

        console.log($scope.resetPasswordData);
        Zergling
            .get({new_password: $scope.resetPasswordData.password1, reset_code: $location.search().code}, 'reset_password')
            .then(
                function (successResponse) {
                    if (successResponse.result === 0) {
                        $scope.passwordResetComplete = true;
                        //$scope.message = Translator.get('Invalid email');
                    } else if (successResponse.result === -1028 || successResponse.result === '-1028') {
                        $scope.passwordResetFailed = 'Password reset failed. The link is expired for security reasons.';
                    } else {
                        $scope.passwordResetFailed = Translator.get('Password reset failed.') + ' ' + Translator.get(successResponse.result_text);
                    }
                    $scope.sendingNewPassword = false;
                },
                function (failResponse) {
                    $scope.passwordResetFailed = Translator.get('Password reset failed.') + ' ' + Translator.get(failResponse.result_text);
                    $scope.sendingNewPassword = false;
                }
            );
    };

    /**
     * @ngdoc method
     * @name resetPasswordResult
     * @methodOf vbet5.controller:loginCtrl
     * @description resets to initial state and  closes the "passsword reset done" message and slider if not skipped
     *
     * @param {Boolean} skipClosingSlider. In true case skips closing of slider
     * @param {String} page 'main' or 'phone' or 'email' or undefined
     */
    $scope.resetPasswordResult = function resetPasswordResult(skipClosingSlider, page) {
        $scope.passwordResetComplete = false;
        $scope.passwordResetCompleteViaSms = false;
        $scope.passwordResetFailed = '';
        $scope.usernameOrEmailInvalid = false;
        $scope.resetPasswordData.email = '';
        $scope.resetPasswordData.phone = '';
        $scope.resetPasswordData.g_recaptcha_response = '';
        $scope.resetPasswordState.page = page || 'main';

        if (!skipClosingSlider) {
            $rootScope.env.sliderContent = '';
            $rootScope.env.showSlider = false;
        }
    };

    /**
     * @ngdoc method
     * @name addIovation
     * @methodOf vbet5.controller:loginCtrl
     * @description starts iovation call
     */
    function addIovation(params) {
        if (Config.iovation.enabled && window.IGLOO && Config.iovation.actions.login) {
            var ioData = window.IGLOO.getBlackbox();
            params[Config.iovation.apiKey] = ioData.blackbox;
        }
    }

    /**
     * @ngdoc method
     * @name keyPress
     * @methodOf vbet5.controller:loginCtrl
     * @description Handles keyboard events on login form
     * @param {Object} keyboard event
     */
    $scope.keyPress = function keyPress(event) {
        if (event.which == 13 || event.keyCode == 13) {
            if(!($scope.busy || $scope.forms.signinform.$invalid || $scope.forms.signinform.$pristine)){
                $scope.login();
            }
            event.preventDefault();
        }
    };

    /**
     * @ngdoc method
     * @name passwordKeyPress
     * @methodOf vbet5.controller:loginCtrl
     * @description Handles password field keyboard events
     * @param {Object} event data
     */
    $scope.passwordKeyPress = function passwordKeyPress(event){
        if(Config.main.showCapsLockHint){
            var character = String.fromCharCode(event.which);
            $scope.capsLockIsOn = character.toUpperCase() === character && character.toLowerCase() !== character && !event.shiftKey;
        }
    };

    /**
     * @ngdoc method
     * @name loginFormInit
     * @methodOf vbet5.controller:loginCtrl
     * @description broadcast corresponding event in case when login form opens
     */
    $scope.loginFormInit = function loginFormInit() {
        $scope.busy = true;

        //initial values
        $scope.user = {username: $location.search().username || Storage.get('lastLoggedInUsername')} || {};
        $scope.user.remember = Config.main.rememberMeCheckbox.checked || false;
        $scope.forms = {};
        $scope.signInError = false;
        var timeoutId = $timeout(function () {
            $scope.busy = false;
        }, 6000);

        var handleRecaptchaResponse = function handleRecaptchaResponse () {
            $scope.busy = false;
            if (timeoutId) {
                $timeout.cancel(timeoutId);
                timeoutId = null;
            }
        };


        TimeoutWrapper(function () {
            $scope.$broadcast('login.formOpened');
            if (Storage.get('lastLoggedInUsername')) {
                $scope.$broadcast('login.formOpened.andUsernameIsAvailable');
            }
        }, 200);

        try {
            // Do not attempt to call 'finally' on execute, as grecaptcha.execute returns a 'thenable' rather than a promise
            RecaptchaService.execute('login', { debounce: false }).then(handleRecaptchaResponse);
        } catch (e) {
           handleRecaptchaResponse();
        }
    };

    $scope.$on('slider.close', function() {
        if ($scope.nemIDSrc) {
            nemIDMsgListener();
            nemIDMsgListener = null;
            $scope.nemIDSrc = '';
            $scope.busy = false;
        }
    });

    $scope.$on('afterCloseSlider', function () {
        if ($scope.showAuthenticationPopup) {
            $scope.showAuthenticationPopup = false;
            closeSignInForm();
            $rootScope.broadcast("doLogOut");
        }
    });

    function handleResetPasswordViaSMS () {
        if ($rootScope.partnerConfig.smsVerification.resetPassword)  {
            $scope.$on('recaptcha.response', function (event, response) {
                $scope.resetPasswordData.g_recaptcha_response = response;
            });

            /**
             * @ngdoc method
             * @name resetPasswordViaSms
             * @methodOf vbet5.controller:loginCtrl
             * @description reset password via sms
             * @param {Object} resetPasswordViaSmsForm form
             */
            $scope.resetPasswordViaSms = function resetPasswordViaSms(resetPasswordViaSmsForm) {
                if ($scope.sendingForgotPasswordViaSms) {
                    return;
                }

                $scope.sendingForgotPasswordViaSms = true;
                var request = {"key": $scope.resetPasswordData.phone };
                if ($scope.resetPasswordData.g_recaptcha_response) {
                    request.g_recaptcha_response = $scope.resetPasswordData.g_recaptcha_response;
                }

                Zergling
                    .get(request, 'reset_password_via_sms')
                    .then(
                        function (successResponse) {
                            console.log("forgot_password response", successResponse);
                            if (successResponse.result === 0) {
                                $scope.passwordResetCompleteViaSms = true;
                            } else if (successResponse.result == '-1001') {
                                resetPasswordViaSmsForm.phone.$setValidity('wrong', false);
                                $scope.resetPasswordData.phone = "";
                                $scope.$broadcast('recaptcha.reload');
                                $scope.resetPasswordData.g_recaptcha_response = "";
                            } else {
                                $scope.passwordResetFailed = 'Password reset failed.';
                            }
                            $scope.sendingForgotPasswordViaSms = false;
                        },
                        function (failResponse) {
                            $scope.passwordResetFailed = 'Password reset failed.';
                            $scope.sendingForgotPasswordViaSms = false;
                        }
                    );
            };
        }
    }

    if($rootScope.partnerConfig._not_loaded) {
        var partnerConfigUpdatedWatcher = $scope.$on('partnerConfig.updated',function () {
            handleResetPasswordViaSMS();
            partnerConfigUpdatedWatcher();
        });
    } else {
        handleResetPasswordViaSMS();
    }

    init();
}]);


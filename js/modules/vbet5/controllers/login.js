/**
 * @ngdoc controller
 * @name vbet5.controller:loginCtrl
 * @description
 * login controller
 */
angular.module('vbet5').controller('loginCtrl', ['$scope', '$rootScope', 'TimeoutWrapper', '$filter', '$q', '$location', '$window', '$cookies', 'Script', 'Config', 'ConnectionService', 'Zergling', 'Tracking', 'Storage', 'Translator', 'partner', 'Utils', 'content', 'analytics', 'AuthData', function ($scope, $rootScope, TimeoutWrapper, $filter, $q, $location, $window, $cookies, Script, Config, ConnectionService, Zergling, Tracking, Storage, Translator, partner, Utils, content, analytics, AuthData) {
    'use strict';
    TimeoutWrapper = TimeoutWrapper($scope);

    var ERROR_SERVICE_UNAVAILABLE = 3;
    var refreshBalancePromise, keepAlivePromise;
    var connectionService = new ConnectionService($scope);

    $scope.busy = false;

    $scope.params = {
        userAge: 0,
        countryIsRestricted: false,
        needVerification: false,
        needVerificationCode: false,
        needUserAuthorization: false,
        allowSMSResend: true,
        smsErrMsg: ''
    };

    // mail confirmation and mail password reset
    if ($location.search().action && $location.search().code) {
        if ($location.search().action === 'reset_password') {
            Config.env.showSlider = true;
            Config.env.sliderContent = 'resetPasswordForm';
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

                    $scope.loginAction = 'mail_confirmed';
                } else if (response.result === -2408 || response.result === '-2408') {
                    $rootScope.$broadcast("globalDialogs.addDialog", {
                        type: 'info',
                        title: 'E-mail confirmation error',
                        content: 'Verification process failed. Please try again.'
                    });
                }
            });
        }
    }

    /**
     * @ngdoc method
     * @name verifySmsCode
     * @methodOf vbet5.controller:loginCtrl
     * @description verify registration sms code
     */
    $scope.verifySmsCode = function verifySmsCode() {
        $scope.params.smsErrMsg = "";
        Zergling
            .get({
                'username': $scope.user.username,
                'code': $scope.user.smsCode
            }, 'verify_user_phone')
            .then(function (response) {
                if (response.result === 0) {
                    $scope.login();
                } else {
                    $scope.forms.signinform.$setPristine();
                    if (Math.abs(response.result) === 1012) {
                        $scope.params.smsErrMsg = Translator.get('Wrong phone number');
                    } else {
                        $scope.params.smsErrMsg = Translator.get('Invalid verification code');
                    }
                }
            })['catch'](function (response) {
            console.log(response);
            $scope.params.smsErrMsg = Translator.get('Invalid verification code');
        });
    };


    /**
     * @ngdoc method
     * @name resendSMS
     * @methodOf vbet5.controller:loginCtrl
     * @description resend verification sms
     */
    $scope.resendSMS = function resendSMS() {
        Utils.setJustForMoment($scope, 'allowSMSResend', false, 5000);
        Zergling
            .get({
                'username': $scope.user.username
            }, 'reverify_user_phone')
            .then(function () {
                $scope.smsErrMsg = Translator.get('Code has been sent, please check your mobile phone');
                $rootScope.$broadcast("globalDialogs.addDialog", {
                    type: "info",
                    title: "Info",
                    content: 'Code has been sent, please check your mobile phone'
                });

            })['catch'](function (response) {
            console.log(response);
        });
    };

    /**
     * @ngdoc method
     * @name loginFormInit
     * @methodOf vbet5.controller:loginCtrl
     * @description broadcast corresponding event in case when login form opens
     */
    $scope.loginFormInit = function loginFormInit() {
        //initial values
        $scope.user = {username: $location.search().username || Storage.get('lastLoggedInUsername')} || {};
        $scope.forms = {};
        $scope.signInError = false;

        TimeoutWrapper(function () {
            $scope.$broadcast('login.formOpened');
            if (Storage.get('lastLoggedInUsername')) {
                $scope.$broadcast('login.formOpened.andUsernameIsAvailable');
            }
        }, 200);
    };

    /**
     * Broadcasts 'profile' message with profile data on rootScope
     *
     * @param {Object} data profile data
     */
    var updateProfile = function updateProfile(data) {
        $rootScope.$broadcast('profile', data);
    };

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

                if (Config.main.useAuthCookies) {
                    var cookieOptions = {
                        domain: $window.location.hostname.split(/\./).slice(-2).join("."),
                        path: "/",
                        expires: new Date((new Date()).getTime() + Config.main.authSessionLifetime)
                    };

                    $cookies.putObject("auth_data", authData, cookieOptions);
                }
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
        if (!Config.partner.balanceRefreshPeriod && !Config.main.rfid.balanceRefreshPeriod) {
            return;
        }

        if (refreshBalancePromise) {
            TimeoutWrapper.cancel(refreshBalancePromise);
        }

        Zergling.get({}, 'get_balance').then(function (response) {
            var profile = response.data || {profile: {rfid: response}}; // this must be fixed from basalt side.
            updateProfile(profile);
            if (response.data) {
                partner.call('balance', $filter('firstElement')(response.data.profile));
            }
            if (response.code && (response.code === 12 || response.code === '12')) {
                $rootScope.$broadcast('doLogOut');
            }
        })['finally'](function () {
            refreshBalancePromise = TimeoutWrapper(refreshBalance, Config.partner.balanceRefreshPeriod || Config.main.rfid.balanceRefreshPeriod);
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

        if (refreshBalancePromise) {
            TimeoutWrapper.cancel(refreshBalancePromise);
        }

        if (keepAlivePromise) {
            TimeoutWrapper.cancel(keepAlivePromise);
        }
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
        if (result.messages) {
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
     * @name loginWithUsernamePassword
     * @methodOf vbet5.controller:loginCtrl
     * @description logs user in, subscribes to profile
     *
     * @param {String} user username
     * @param {String} password password
     * @param {String} action action
     * @param {Boolean} remember whether to remember auth data for a long time(default is off)
     * @returns {promise} promise that will be resolved with swarm response data object
     */
    function loginWithUsernamePassword(user, password, action, remember) {
        console.log('loginWithUsernamePassword', user, password, action, remember);
        var login = $q.defer();
        var promise = login.promise;
        var loginObj = {username: user, password: password};
        var additionalParams = {};

        if (Config.main.iovationLoginScripts && $scope.user && $scope.user.ioBlackBox) {
            additionalParams.io_black_box = $scope.user.ioBlackBox;
        }

        if ($scope.params.needVerificationCode) {
            additionalParams.login_code = $scope.user.login_code;
            $scope.params.needVerificationCode = false;
        }

        if ($scope.user && $scope.user.birth_date) {
            additionalParams.birth_date = $scope.user.birth_date;
        }

        if (Config.swarm.sendTerminalIdlInRequestSession && user.toString() === '1' && typeof jsobject !== 'undefined') {
            jsobject.loginAdmin('1', password);
        }

        $rootScope.loginInProgress = true;
        Zergling
            .login(loginObj, remember, additionalParams)
            .then(
                function (data) {
                    console.log('login ok', data);
                    $rootScope.loginInProgress = false;
                    analytics.gaSend('send', 'event', 'slider', 'login',  {'page': $location.path(), 'eventLabel': 'Success'});
                    $scope.env.authorized = true;
                    Storage.set('lastLoggedInUsername', loginObj.username);

                    if (!Config.partner.profileNotAvailable) { // for some skins profile is not available in swarm
                        connectionService.subscribe(
                            {'source': 'user', 'what': {'profile': []}, 'subscribe': true},
                            updateProfile,
                            {
                                'thenCallback': function (result) {
                                    $rootScope.profileSubId = result.subid;
                                    $rootScope.$broadcast('login.loggedIn');
                                    keepAlive();
                                    action = $scope.loginAction || action || 'logged_in';
                                    $scope.loginAction = null;
                                    Tracking.event(action, {}, true);
                                }
                            }
                        );
                    }

                    subscribeForMessages();

                    login.resolve(data);
                },
                function (data) {
                    data.data = data.data || {};
                    console.log('login failed', data);
                    $rootScope.loginInProgress = false;
                    analytics.gaSend('send', 'event', 'slider', 'login',  {'page': $location.path(), 'eventLabel': 'Failed (' + data.data.status + ')'});
                    login.reject(data);
                }
            );
        return promise;
    }

    $scope.$on('login.withUsernamePassword', function (event, data) {
        console.log('got event login.withUsernamePassword', event, data);
        loginWithUsernamePassword(data.user, data.password, data.action);
    });

    /**
     * @ngdoc method
     * @name login
     * @methodOf vbet5.controller:loginCtrl
     * @description handles the sing-in form, logs user in  and hides the login form
     */
    $scope.login = function login() {
        $scope.busy = true;
        $scope.params.needVerification = false;
        $scope.params.needUserAuthorization = false;
        Storage.set("rememberMe", !!$scope.user.remember);
        console.log("login()", $scope.forms.signinform, $scope.user);
        if ($scope.forms.signinform.$valid) {
            loginWithUsernamePassword($scope.user.username, $scope.user.password, null, $scope.user.remember)
                .then(
                    function () {
                        $scope.user.password = '';
                        TimeoutWrapper(function () {
                            if ($scope.env.sliderContent === 'signInForm') {
                                $scope.env.showSlider = false;
                                $scope.env.sliderContent = '';
                            }
                        }, 500);
                    },
                    function (data) {
                        data.data = data.data || {};
                        $scope.busy = false;
                        $scope.signInError = Translator.get(data.msg || data.data || data.code || true);
                        if (data.code !== ERROR_SERVICE_UNAVAILABLE) {
                            $scope.forms.signinform.$setPristine();
                        } else {
                            $rootScope.$broadcast("globalDialogs.addDialog", {
                                type: "error",
                                title: "Error",
                                content: $scope.signInError
                            });
                        }

                        // Verify SMS
                        if (data.data === "login error (1008)" || data.data.status === "1008") {
                            $scope.params.needVerification = true;
                        }

                        // Verify E-mail
                        if (data.data === "login error (1023)" || data.data.status === "1023") {
                            $scope.params.needVerification = true;
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

                        // Self Exclusion
                        if (data.data.status === 2008 || data.data.status === "2008") {
                            $rootScope.$broadcast("globalDialogs.addDialog", {
                                type: 'error',
                                title: 'Login',
                                content: Translator.get(data.data.details)
                            });
                            $scope.env.showSlider = false;
                        }

                        //Email verification
                        if (data.data.status === 99 || data.data.status === "99" || data.data.status === 2413 || data.data.status === "2413") {
                            //$scope.params.needUserAuthorization = true;
                            $rootScope.$broadcast("globalDialogs.addDialog", {
                                type: 'success',
                                title: '',
                                content: 'To the specified e-mail address we have sent the letter. Click on the link to continue registration. If you do not receive the email, contact support.'
                            });
                            $scope.env.showSlider = false;
                        }
                    }
                )['finally'](
                    function () {
                        $scope.busy = false;
                        $scope.env.showSignInForm = false;
                    }
                );

        } else {
            $scope.busy = false;
        }
    };

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
                            if ($scope.env.sliderContent === 'signInForm' || $rootScope.env.sliderContent === 'registrationForm' || $rootScope.env.sliderContent === 'forgotPasswordForm') {
                                $scope.env.showSlider = false;
                                $scope.env.sliderContent = '';
                            }
                        }, 200);

                        connectionService.subscribe(
                            {'source': 'user', 'what': {'profile': []}, 'subscribe': true},
                            updateProfile,
                            {
                                'thenCallback': function (result) {
                                    $rootScope.profileSubId = result.subid;
                                    $rootScope.$broadcast('login.loggedIn');
                                    keepAlive();
                                }
                            }
                        );

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
        username: '',
        password: '',
        password1: '',
        password2: '',
        error: {}
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
                        $scope.passwordResetFailed = 'Password reset failed.';
                    }
                    $scope.sendingNewPassword = false;
                },
                function (failResponse) {
                    $scope.passwordResetFailed = 'Password reset failed.';
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
     */
    $scope.resetPasswordResult = function resetPasswordResult(skipClosingSlider) {
        $scope.passwordResetComplete = false;
        $scope.passwordResetFailed = '';
        $scope.usernameOrEmailInvalid = false;
        $scope.resetPasswordData.email = '';

        if (!skipClosingSlider) {
            $rootScope.env.sliderContent = '';
            $rootScope.env.showSlider = false;
        }
    };

    /**
     * @ngdoc method
     * @name initIovation
     * @methodOf vbet5.controller:loginCtrl
     * @description starts iovation call
     */
    $scope.initIovation = function initIovation() {
        if (Config.main.iovationLoginScripts) {
            angular.forEach(Config.main.iovationLoginScripts, function(iovationScript) {
                Script(iovationScript + '?login&' + Date.now());
            });
        }
    };

    $scope.$on('$destroy', function () {
        if (refreshBalancePromise) {
            TimeoutWrapper.cancel(refreshBalancePromise);
        }

        if (keepAlivePromise) {
            TimeoutWrapper.cancel(keepAlivePromise);
        }
    });

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
                $scope.params.needVerification? $scope.verifySmsCode(): $scope.login();
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
            if (character.toUpperCase() === character && character.toLowerCase() !== character && !event.shiftKey ) {
                $scope.capsLockIsOn = true;
            }else{
                $scope.capsLockIsOn = false;
            }
        }
    };

    /**
     * @ngdoc method
     * @name checkResetPasswordData
     * @methodOf vbet5.controller:loginCtrl
     * @description Validates password
     */
    $scope.checkResetPasswordData = function checkResetPasswordData(){
        $scope.resetPasswordData.error = {};

        if (!$scope.resetPasswordData.password1 || $scope.resetPasswordData.password1.length < Config.main.passwordValidationLength) {
            $scope.resetPasswordData.error.password1 = true;
            return;
        }

        var passwordValidation = new RegExp(Config.main.passwordValidationPattern);

        if (!passwordValidation.test($scope.resetPasswordData.password1)) {
            $scope.resetPasswordData.error.password1 = true;
            return;
        }

        if ($scope.resetPasswordData.password1 !== $scope.resetPasswordData.password2) {
            $scope.resetPasswordData.error.password2 = true;
            return;
        }
    };
}]);


/* global VBET5,FB */
/**
 * @ngdoc controller
 * @name vbet5.controller:facebookCtrl
 * @description
 *  facebook controller
 */
VBET5.controller('facebookCtrl', ['$scope', '$rootScope', '$window', 'Config', 'Translator', 'Zergling', 'Storage', function ($scope, $rootScope, $window, Config, Translator, Zergling, Storage) {
    'use strict';

    if (!Config.main.facebookIntegration.enable) {
        return;
    }

    var fbScopeParams = {scope: 'public_profile,email'};
    $scope.regFlow = {
        FACEBOOK: 'FACEBOOK',
        ODNO: 'ODNO',
        currentRegFlow: ''
    };


    /**
     * @ngdoc method
     * @name statusChangeCallback
     * @methodOf vbet5.controller:facebookCtrl
     * @description callback function to be called when checking fb login status or logging in
     *
     * @param {Object} response facebook API response object
     */
    function statusChangeCallback(response) {
        console.log('login/getLoginStatus resposne', response);
        if (response.status === 'connected') { // Logged into your app and Facebook.
            if (Config.env.sliderContent === 'login') {
                $rootScope.fbLoggedIn = true;
            }
            $scope.fbLoginInProgress = false;
            $scope.regFlow.currentRegFlow = $scope.regFlow.FACEBOOK;
            console.log('logged in to FB, getting user details');
            if(!Config.env.authorized && Config.env.sliderContent === 'login'){
                $rootScope.$broadcast('facebook.loggedIn', response.authResponse); //login controller will get this and try to login user
            }
            FB.api('/me', function (response) {
                console.log('got FB user details', response);
                $rootScope.fbUserDetails = response;
            });
        } else if (response.status === 'not_authorized') {
            console.log('logged in to facebook. not the app');
            $rootScope.fbLoggedInOnlyToFb = true;
            $scope.fbLoginInProgress = false;
//            $scope.loginToFb();
        } else {
            console.log('not logged in to facebook');
            $scope.fbLoginInProgress = false;
//            $scope.loginToFb();
        }
    }

    /**
     * @ngdoc method
     * @name getFbLoginStatus
     * @methodOf vbet5.controller:facebookCtrl
     * @description checks fb user login status (result is passed to statusChangeCallback callback function)
     */
    function getFbLoginStatus() {
        FB.getLoginStatus(statusChangeCallback);
    }

//    $scope.$on('login.loggedOut', getFbLoginStatus);

    /**
     * @ngdoc method
     * @name fbAsyncInit
     * @methodOf vbet5.controller:facebookCtrl
     * @description initializes Facebook API
     */
    $window.fbAsyncInit = function () {
        console.log('fbAsyncInit');
        FB.init({
            appId: Config.main.facebookIntegration.appId,   //'679441398804517',  // 264345993766604
            cookie: true,  // enable cookies to allow the server to access the session
            xfbml: false,   //not using social plugins (yet)
            version: 'v2.12'
        });
        $rootScope.fbReady = true;
        getFbLoginStatus();
    };

    (function (d, s, id) {
        var js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) {
            return;
        }
        js = d.createElement(s);
        js.id = id;
        js.src = "//connect.facebook.net/en_US/sdk.js";
        fjs.parentNode.insertBefore(js, fjs);
    }($window.document, 'script', 'facebook-jssdk'));


    $scope.signinWithoutFb = 'no';
    $scope.user = {};


    $scope.$watch('fbUserDetails', function (fbUserDetails) {
        if (fbUserDetails) {
            console.log('----------------------------');
            console.log(fbUserDetails);

            var fbName = (fbUserDetails.name || '').split(' ');

            $scope.registrationData.facebook_id = fbUserDetails.id;
            $scope.registrationData.first_name = fbUserDetails.first_name || fbName[0];
            $scope.registrationData.last_name = fbUserDetails.last_name || fbName[1];
            $scope.registrationData.email = fbUserDetails.email;
            $scope.registrationData.gender = fbUserDetails.gender && fbUserDetails.gender.substr(0, 1).toUpperCase();
            if (Config.main.registration.askAboutSpecifyingLoginPass) {
                $scope.registrationData.username = fbUserDetails.email;
                $scope.registrationData.password2 = $scope.registrationData.password = Math.random().toString(30).slice(-10);
            }
            $scope.fbsignupform = $scope.fbsignupform || {};
            $scope.fbsignupform.$dirty = false;
        }

    });


    $scope.$watch('regFlow.currentRegFlow', function (newRegValue, oldRegValue) {
        if (newRegValue === oldRegValue) return;
        // set auto generated password in odnoklassniki flow
        if($scope.regFlow.currentRegFlow === $scope.regFlow.ODNO){
            if (Config.main.registration.askAboutSpecifyingLoginPass) {
                $scope.registrationData.password2 = $scope.registrationData.password = Math.random().toString(30).slice(-10);
            }
        }
        // automatically set email to username when flow is odnoklassniki
        $scope.$watch('registrationData.email', function (newVal, oldVal) {
            if (newVal === oldVal) return;
            if ($scope.signinWithoutFb === 'no') {
                $scope.registrationData.username = newVal;
            }
        });
    });


    var defaultRegistrationData = {
        facebook_id: '',
        first_name: '',
        last_name: '',
        gender: 'M',
        username: '',
        email: '',
        currency_name: Config.main.registration.defaultCurrency,
        password: '',
        password2: '',
        promo_code: '',
        agree: false
    };
    $scope.registrationData = defaultRegistrationData;
    $scope.registerWithFacebook = false;

    /**
     * @ngdoc method
     * @name register
     * @methodOf vbet5.controller:facebookCtrl
     * @description registers the user
     */
    $scope.register = function register() {
        $scope.busy = true;
        var fbRequestIds = Storage.get('fbRequestIds');
        fbRequestIds = fbRequestIds ? fbRequestIds.split(',') : undefined;
        var registrationInfo = {
            'username': $scope.registrationData.username,
            'currency_name': $scope.registrationData.currency_name,
            'password': $scope.registrationData.password,
            'first_name': $scope.registrationData.first_name,
            'last_name': $scope.registrationData.last_name,
            'gender': $scope.registrationData.gender,
            'email': $scope.registrationData.email,
            'site_id': Config.main.site_id,
            'country_code': Config.main.registration.defaultCountryCode,
            'doc_number': $scope.registrationData.doc_number,
            'phone': (Config.main.registration.replacePhoneNumberAreaCode ? $scope.registrationData.phone_number.replace(Config.main.registration.replacePhoneNumberAreaCode.from, Config.main.registration.replacePhoneNumberAreaCode.to) : $scope.registrationData.phone_number),
            'referral_user_id': Storage.get('ref')
        };
        if ($scope.regFlow.currentRegFlow === $scope.regFlow.ODNO) {
            registrationInfo.odnoklassniki_id = $scope.registrationData.odnoklassniki_id;
        }
        else  {
            registrationInfo.facebook_id = $scope.registrationData.facebook_id || undefined;
            registrationInfo.facebook_invites = fbRequestIds;
        }

        console.log($scope, registrationInfo);
        Zergling
            .get({user_info: registrationInfo}, 'register_user')
            .then(function (data) {
                if (data.result === 'OK') {
                    if (Config.main.registration.loginRightAfterRegistration) {
                        $rootScope.$broadcast('login.withUsernamePassword', {user: registrationInfo.username, password: registrationInfo.password});
                    }
                    $rootScope.$broadcast("openLoginForm");

                    $scope.registrationData = defaultRegistrationData;
                    if ($scope.regFlow.currentRegFlow === $scope.regFlow.ODNO) {
                        $rootScope.odnoModel.loggedIn = true;
                    }

                } else {
                    $scope.fbsignupform.$dirty = true;
                    if (data.result === '-1118') { //user exists
                        $scope.fbsignupform.username.$dirty = $scope.fbsignupform.username.$invalid = $scope.fbsignupform.username.$error.exists = true;
                    } else if (data.result === '-1119') { //email exists
                        $scope.fbsignupform.email.$dirty = $scope.fbsignupform.email.$invalid = $scope.fbsignupform.email.$error.exists = true;
                    } else if (data.result === '-1010') { // password same as login
                        $scope.fbsignupform.password.$dirty = $scope.fbsignupform.password.$invalid = $scope.fbsignupform.password.$error.sameAsLogin = true;
                    } else if (data.result === '-1127') {
                        $scope.fbsignupform.phone_number.$dirty = $scope.fbsignupform.phone_number.$invalid = $scope.fbsignupform.phone_number.$error.duplicate = true;
                    } else if (data.result === '-1700') {
                        $scope.registrationFailed = Translator.get('Your Facebook account is already linked to another existing user.');
                    } else {
                        $scope.registrationFailed = Translator.get('Unknown error');
                    }

                }
            }, function (response) {
                console.log('registration failed:', response);
                $scope.registrationFailed = response.data;
            }
                )['finally'](function () {$scope.busy = false; });
    };




    $scope.$watch('signinWithoutFb', function (newVal, oldVal) { //generates password for user
        if (newVal === 'no' && oldVal !== 'no') {
            $scope.registrationData.password2 = $scope.registrationData.password = Math.random().toString(30).slice(-10);
        }
        if (newVal === 'yes' && oldVal === 'no') {
            $scope.registrationData.password2 = $scope.registrationData.password = '';
        }
    });

    $scope.showEmailInvite = false;
    /**
     * @ngdoc method
     * @name inviteFbFriends
     * @methodOf vbet5.controller:facebookCtrl
     * @description opens Facebook invites dialog if logged in, if no, logs user in and then opens invites dialog
     */
    $scope.inviteFbFriends = function inviteFbFriends() {
        function sendFbInvites() {
            FB.ui({
                method: 'apprequests',
                message: Translator.get("Come play on ") + Config.main.site_name,
                filters: ['app_non_users']
            }, function (response) {
                Zergling.get({facebook_id: $rootScope.fbUserDetails.id}, 'user_link_facebook')['finally'](function (response) {
                    console.log('user_link_facebook response', response);
                });
                console.log('invite request result:', response);
            });
        }
        if ($rootScope.fbLoggedIn && $rootScope.fbUserDetails && $rootScope.fbUserDetails.id) {
            sendFbInvites();
        } else {
            FB.login(sendFbInvites, fbScopeParams);
        }
    };

    $scope.$on('facebook.loginWIthIdFailed', function () {
        $scope.cannotLoginWIthFbId = true;
        if ($scope.fbLoginInProgress) {
            $rootScope.env.sliderContent = 'register';
        }
        $scope.fbLoginInProgress = false;

    });



    /**
     * @ngdoc method
     * @name inviteByEmail
     * @methodOf vbet5.controller:facebookCtrl
     * @description parses text field with emails, extracts them and sends to swarm to send invitations
     */
    $scope.inviteByEmail = function inviteByEmail() {

        var emailRegex = new RegExp("[_a-zA-Z0-9-\"'\\/]+(\\.[_a-zA-Z0-9-\"'\\/]+)*@[a-zA-Z0-9-]+(\\.[a-zA-Z0-9-]+)*\\.(([0-9]{1,3})|([a-zA-Z]{2,3})|(aero|coop|info|museum|name))", 'gi');
        var foundEmails = [], match;
        var str = $scope.mailList;
        while (match = str.match(emailRegex)) {
            foundEmails.push(match[0]);
            str = str.replace(match[0], "");
        }
        if (foundEmails.length) {
            $scope.noMailsFound = false;
            $scope.sending = true;
            Zergling
                .get({emails: foundEmails}, 'send_invite_emails')
                .then(function (response) {
                    console.log('send_invite_emails', foundEmails, 'response:', response);
                    $scope.sent = response.sent;
                })['finally'](function () {
                    $scope.sending = false;
                });
        } else {
            $scope.noMailsFound = true;
        }

    };

    /**
     * @ngdoc method
     * @name loginToFb
     * @methodOf vbet5.controller:facebookCtrl
     * @description logs in to facebook
     */
    $scope.loginToFb = function loginToFb() {
        $scope.cannotLoginWIthFbId = false;
        $scope.fbLoginInProgress = true;
        FB.login(statusChangeCallback, fbScopeParams);
    };

    /**
     * @ngdoc method
     * @name logOutFromFB
     * @methodOf vbet5.controller:facebookCtrl
     * @description logs out of facebook
     */
    function logOutFromFB() {
        FB.logout(function (response) {
            console.log('facebook logged out', response);
        });
    }

    $scope.$on('facebook.logout', logOutFromFB);

    /**
     * @ngdoc method
     * @name registrationDone
     * @methodOf vbet5.controller:facebookCtrl
     * @description closes the "registration done" message and slider
     */
    $scope.closeRegistrationResult = function closeRegistrationResult() {
        $rootScope.env.sliderContent = 'login';
        $scope.registrationComplete = false;
        $scope.registrationFailed = false;
    };



}]);


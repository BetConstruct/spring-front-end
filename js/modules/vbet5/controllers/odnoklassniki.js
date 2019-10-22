/**
 * Created by narek.mamikonyan on 06/11/2014.
 */
VBET5.controller('OdnoklassnikiCtrl', ['$scope', '$window', '$rootScope', 'Config', 'Zergling', 'Storage', 'TimeoutWrapper', function ($scope, $window, $rootScope, Config, Zergling, Storage, TimeoutWrapper) {
    var data,
        width = 520,
        height = 400,
        ACTION_LOGIN = 'ACTION_LOGIN',
        ACTION_REGISTER = 'ACTION_REGISTER',
        currentAction = '',
        left = (screen.width / 2) - (width / 2),
        top = (screen.height / 2) - (height / 2),
        OdnoAuthSettings = Config.main.odnoklassnikiIntegration.settings,
        url = 'http://www.odnoklassniki.ru/oauth/authorize?client_id=' + OdnoAuthSettings.clientId + '&scope='
            + OdnoAuthSettings.scopeType + '&response_type=' + OdnoAuthSettings.responseType + '&redirect_uri=' + OdnoAuthSettings.redirectUri;
        $rootScope.odnoModel = {};
    TimeoutWrapper = TimeoutWrapper($scope);

    /**
     * @ngdoc method
     * @name login
     * @methodOf vbet5.service:OdnoklassnikiCtrl
     * @description Do login
     */
    $scope.login = function () {
        $rootScope.odnoModel.currentAction = ACTION_LOGIN;
        $window.open(url, "_blank", "toolbar=yes, scrollbars=yes, resizable=yes, top=" + top + ", left=" + left + ", width=" + width + ", height=" + height + "");
    };

    /**
     * @ngdoc method
     * @name register
     * @methodOf vbet5.service:OdnoklassnikiCtrl
     * @description Do register
     */
    $scope.register = function () {
        $rootScope.odnoModel.currentAction = ACTION_REGISTER;
        $window.open(url, "_blank", "toolbar=yes, scrollbars=yes, resizable=yes, top=" + top + ", left=" + left + ", width=" + width + ", height=" + height + "");
    };

    /**
     * @ngdoc method
     * @name onmessage
     * @methodOf vbet5.service:OdnoklassnikiCtrl
     * @description Odnoklassniki postmessage callback
     */
    $window.onmessage = function (e) {
        currentAction = $rootScope.odnoModel.currentAction;
        if (e.origin !== $window.location.origin) {
            return;
        }
        if (!e.data) {
            throw new Error('Message event contains no readable data.');
        }
        data = JSON.parse(e.data);
        data.odnoklassniki = true;


        Zergling.login(data)
            .then(function (resp) {
                subscribeToProfile(resp);
            },
            function (err) {
                if (currentAction === ACTION_REGISTER) {
                    $scope.regFlow.currentRegFlow = $scope.regFlow.ODNO;
                    doRegisterFlow();
                }
                if (currentAction === ACTION_LOGIN) {
                    $rootScope.odnoModel.cannotLoginWIthOdno = true;

                    $scope.regFlow.currentRegFlow = $scope.regFlow.ODNO;
                    doRegisterFlow();
                }
            }
        );
    };

    /**
     * @ngdoc method
     * @name doRegisterFlow
     * @methodOf vbet5.service:OdnoklassnikiCtrl
     * @description Odnoklassniki link with backend
     */
    function doRegisterFlow() {
        Zergling.get({'access_token': data.accessToken, session_secret_key: data.sessionSecretKey}, 'ok_profile').then(
            function (resp) {
                $scope.registrationData.odnoklassniki_id = resp.uid;
                $scope.registrationData.first_name = resp.first_name;
                $scope.registrationData.last_name = resp.last_name;
                $scope.registrationData.gender = resp.gender.substr(0, 1).toUpperCase();
                if (currentAction === ACTION_REGISTER) {
                    $rootScope.odnoModel.cannotLoginWIthOdno = false;
                }
            },
            function (err) {
            }
        );
    }

    /**
     * @ngdoc method
     * @name subscribeToProfile
     * @methodOf vbet5.service:OdnoklassnikiCtrl
     * @description Subscribe for profile
     */
    function subscribeToProfile() {
        Config.env.authorized = true;
        TimeoutWrapper(function () {
            if ($scope.env.sliderContent === 'login' || $rootScope.env.sliderContent === 'register' || $rootScope.env.sliderContent === 'forgotPasswordForm') {
                $scope.env.showSlider = false;
                $scope.env.sliderContent = '';
            }
        }, 200);
        Zergling
            .subscribe({'source': 'user', 'what': {'profile': []}, 'subscribe': true}, updateProfile)
            .then(function (result) {
                $rootScope.odnoModel.loggedIn = true;
                Storage.set('loginFlow', $scope.regFlow.ODNO);
                updateProfile(result.data);
                keepAlive();
                $rootScope.$broadcast('loggedIn');
            });
        Storage.set('lastLoggedInUsername', $scope.user.username);
    }

    /**
     * @ngdoc method
     * @name keepAlive
     * @methodOf vbet5.service:OdnoklassnikiCtrl
     * @description Odnoklassnik keep session alive
     */
    function keepAlive() {
        if ($rootScope.env.authorized) {
            angular.forEach(['auth_data', 'myGames'], function (key) {
                var val = Storage.get(key);
                if (val) {
                    Storage.set(key, val, Config.main.authSessionLifetime);
                }
            });
            $rootScope.blockingPopup = undefined;
            TimeoutWrapper(keepAlive, parseInt(Config.main.authSessionLifetime / 2, 10)); //this has to run more often than session lifetime
        }
    }

    /**
     * @ngdoc method
     * @name updateProfile
     * @methodOf vbet5.service:OdnoklassnikiCtrl
     * @description Update profile (received from main header)
     */
    function updateProfile(data) {
        $rootScope.$broadcast('profile', data);
    }
}]);

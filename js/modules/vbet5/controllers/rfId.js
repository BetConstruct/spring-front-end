/* global VBET5 */
/**
 * @ngdoc controller
 * @name vbet5.controller:rfidCtrl
 * @description rfid controller
 */
VBET5.controller('rfidCtrl', ['$scope', '$rootScope', '$window', 'Config', 'Zergling', 'Translator', 'Storage',  'AuthData', 'TimeoutWrapper', function ($scope, $rootScope, $window, Config, Zergling, Translator, Storage, AuthData, TimeoutWrapper) {
    'use strict';

    $scope.rfidCredentials = {};
    $scope.passwordPromptPopup = Config.main.rfid.promptRFIDPassword;
    $scope.signedInByRfid = false;
    TimeoutWrapper = TimeoutWrapper($scope);

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
     * @name rfidSigning
     * @methodOf vbet5.controller:rfidCtrl
     * @description Try to log in user
     */
    function rfidSigning() {

        if ($scope.rfidCredentials.rfid !== undefined) {

            var request = {
                'card_number': $scope.rfidCredentials.rfid
            };

            if (Config.main.rfid.promptRFIDPassword) {
                request.password = $scope.rfidPassword;
            }

            var processRfidResults = function (result) {
                console.log("processRfidResults", result);
                AuthData.set({user_id: result.user_id, auth_token: result.auth_token });
                Zergling.subscribe(
                    {'source': 'user', 'what': {'profile': []}, 'subscribe': true}, function (data) {
                        updateProfile(data);
                    })
                    .then(function (result) {
                        $rootScope.$broadcast('profile', result.data);

                        $scope.env.authorized = true;
                        $rootScope.$broadcast('loggedIn');

                        $scope.env.hideLogOut = true;
                        $rootScope.$broadcast('globalDialogs.removeDialogsByTag', 'rfid');
                        $scope.passwordPromptPopup = false;
                        $scope.signedInByRfid = true;
                    });
            };

            Zergling
                .get(request, 'rfid_login')
                .then(processRfidResults)['catch'](
                    function (reason) {
                        $rootScope.$broadcast('globalDialogs.removeDialogsByTag', 'rfid');
                        var errMsg;
                        switch (parseInt(reason.data.status)) {
                            case 1200:
                                Config.main.rfid.promptRFIDPassword && (errMsg = "Invalid Password");
                                break;
                            case 1002:
                                errMsg = "Invalid RFID card";
                                break;
                            default:
                                errMsg = "Invalid RFID card";
                        }

                        $rootScope.$broadcast("globalDialogs.addDialog", {
                            type: 'info',
                            tag: 'rfid',
                            title: 'Warning',
                            hideCloseButton: true,
                            hideButtons: true,
                            content: errMsg
                        });
                        TimeoutWrapper(function () {
                            if ($scope.env.authorized) {
                                $rootScope.$broadcast('globalDialogs.removeDialogsByTag', 'rfid');
                            }
                        }, 5000);
                        $scope.passwordPromptPopup = Config.main.rfid.promptRFIDPassword;
                    }
                );
        }
    }

    /**
     * @ngdoc method
     * @name SignInByRFID
     * @methodOf vbet5.controller:rfidCtrl
     * @description Get RFID for future terminal user sign in
     */

    function SignInByRFID(rfid, terminalId, partnerId) {

        $scope.rfidCredentials = {rfid: rfid, terminalId: terminalId, partnerId: partnerId};
        if (rfid !== undefined) {
            if (!Config.main.rfid.promptRFIDPassword) {
                rfidSigning();
            } else {
                $rootScope.$broadcast('globalDialogs.removeDialogsByTag', 'rfid');
                $scope.$broadcast('rfidPasswordFormOpened');
            }
        }
    }

    function showWarningPopup() {
        if(!Config.main.rfid.doNotShowWarningPopup) {
            $rootScope.$broadcast('globalDialogs.removeDialogsByTag', 'rfid');
            $rootScope.$broadcast("globalDialogs.addDialog", {
                type: 'info',
                tag: 'rfid',
                title: 'Warning',
                hideCloseButton: true,
                hideButtons: true,
                class: Config.main.rfid.allowAccessWithoutRfid ? "allow-header-access" : null,
                content: 'Please put your RFID card on card reader'
            });
        }
    }

    /**
     * @ngdoc method
     * @name SignOutRF
     * @methodOf vbet5.controller:rfidCtrl
     * @description Log out terminal user
     */
    function SignOutRF() {
        var logoutDone = false;
        var doLogoutStuff = function () {
            if (!logoutDone) {
                logoutDone = true;
                showWarningPopup();
                $scope.env.hideLogOut = false;
                $rootScope.currency_name = null;
                $rootScope.fbLoggedIn = false;
                Storage.remove('betslip');
                Storage.remove('myGames');
                $rootScope.$broadcast('login.loggedOut');
                $scope.signedInByRfid = false;
                console.log('Loged Out');
            }
        };
        Zergling.logout()['finally'](doLogoutStuff);
        TimeoutWrapper(doLogoutStuff, Config.main.logoutTimeout); //in case logout fails for some reason (no network, etc.)
        $scope.env.authorized = false;
        AuthData.clear();
    }

    /**
     * @ngdoc method
     * @name SignInByRFID
     * @methodOf vbet5.controller:rfidCtrl
     * @returns {Number} -1 if user signed in by "login/Pass" 0 if signed out and 1 if signed in by rfid card
     * @description check terminal user sign in status
     */
    function IsRfSignIn() {
        if ($scope.env.authorized) {
            if ($scope.signedInByRfid) {
                return 1;
            }
            return -1;
        }
        return 0;
    }

    if (Config.main.rfid.loginWIthRFID) {
        $window.SignInByRFID = SignInByRFID;
        $window.SignOutRF = SignOutRF;
        $window.IsRfSignIn = IsRfSignIn;
        if(!$scope.env.authorized) {
            showWarningPopup();
        }
        $scope.env.hideLogOut = false;
    } else {
        $scope.env.hideLogOut = false;
    }

    /**
     * @ngdoc method
     * @name verifyPassword
     * @methodOf vbet5.controller:rfidCtrl
     * @description check  password and try to login
     */

    $scope.verifyPassword = function verifyPassword() {
        if ($scope.rfidPassword !== undefined) {
            rfidSigning();
        }
    };

    /**
     * scope's destroying means that logged in  success.  so need to remove info popup
     */
    $scope.$on('$destroy', function () {
        $rootScope.$broadcast('globalDialogs.removeDialogsByTag', 'rfid');
    });
}]);

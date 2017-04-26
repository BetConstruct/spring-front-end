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
                        $rootScope.profileSubId = result.subid;
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
                        console.log('Error:', reason);
                        var errMsg = Translator.get("Invalid RFID card");
                        if (reason.data.status === "1200" && Config.main.rfid.promptRFIDPassword) {
                            $rootScope.$broadcast('globalDialogs.removeDialogsByTag', 'rfid');
                            errMsg = Translator.get("Invalid Password");
                        } else if (reason.data.status === "1002") {
                            errMsg = Translator.get("Invalid RFID card");
                        }
                        //Utils.setJustForMoment($rootScope, 'blockingPopup', errMsg, 5000);
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
                $scope.env.authorized = false;
                if(!Config.main.rfid.doNotShowWarningPopup) {
                    $rootScope.$broadcast("globalDialogs.addDialog", {
                        type: 'info',
                        tag: 'rfid',
                        title: 'Warning',
                        hideCloseButton: true,
                        hideButtons: true,
                        content: 'Please put your RFID card on card reader'
                    });
                }
                Zergling.unsubscribe($rootScope.profileSubId);
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
        if(!Config.main.rfid.doNotShowWarningPopup) {
            $rootScope.$broadcast("globalDialogs.addDialog", {
                type: 'info',
                tag: 'rfid',
                title: 'Warning',
                hideCloseButton: true,
                hideButtons: true,
                content: 'Please put your RFID card on card reader'
            });
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


}]);
/* global VBET5 */
/**
 * @ngdoc controller
 * @name vbet5.controller:mixedAuthenticationCtrl
 * @description
 * settings controller
 */
VBET5.controller('mixedAuthenticationCtrl', ['$scope', '$rootScope', 'Utils', 'Zergling', 'Storage', function ($scope, $rootScope, Utils, Zergling, Storage) {
    'use strict';

    var qrCodeOrigin;
    (function init() {
        $scope.data = {};
        $scope.data.isAuthenticate = !!$rootScope.profile.is_two_factor_authentication_enabled;
        if ($scope.data.isAuthenticate) {
            qrCodeOrigin = Storage.get("qrCodeOrigin");
            if (qrCodeOrigin) {
                $scope.data.qrCodeUrl = 'https://chart.googleapis.com/chart?chs=134x134&chld=L|0&cht=qr&chl='+ encodeURIComponent(qrCodeOrigin);
            }
        }

    })();

    function removeFromStorage() {
        Storage.remove('qrCodeOrigin');
    }


    /**
     * @ngdoc method
     * @name toggleAuthenticator
     * @methodOf vbet5.controller:mixedAuthenticationCtrl
     * @description toggle authenticator and make corresponding calls
     */
    $scope.toggleAuthenticator = function toggleAuthenticator() {
        $scope.data.isAuthenticate = !$scope.data.isAuthenticate;
        if ($scope.data.isAuthenticate) {
            $scope.isLoading = true;

            Zergling.get({}, "enable_two_factor_authentication").then(function (data) {
                if (data.result === 0) {
                    $rootScope.profile.is_two_factor_authentication_enabled = true;
                    qrCodeOrigin = data.details.QRCodeOrigin;
                    $scope.data.qrCodeUrl = 'https://chart.googleapis.com/chart?chs=134x134&chld=L|0&cht=qr&chl='+ encodeURIComponent(qrCodeOrigin);
                    Storage.set("qrCodeOrigin", qrCodeOrigin);
                } else {
                    $scope.data.isAuthenticate = false;
                    $rootScope.$broadcast("globalDialogs.addDialog", {
                        type: 'error',
                        title: 'Error',
                        content: "Can't activate two factor authentication"
                    });
                }
            })['finally'](function () {
                $scope.isLoading = false;
            });
        } else {
            $scope.showPasswordForm = true;
            $scope.resetPassword = false;
            $scope.data.qrCodeUrl = "";
            $scope.data.barcode = "";
            $scope.data.password = "";
            $scope.resetPasswordError = function () {
              $scope.data.password = "";
              $scope.resetPassword = true;
              $scope.forms.currentPasswordForm.oldpassword.$setUntouched();
            };
            $scope.onPasswordChange = function onPasswordChange() {
                $scope.forms.currentPasswordForm.oldpassword.$setValidity("incorrect", true);
            };
            $scope.confirmPassword = function () {
                var request = {
                    user_info: {
                        password: $scope.data.password,
                        is_two_factor_authentication_enabled: false
                    }
                };
                $scope.isLoading = true;
                Zergling.get(request, 'update_user').then(function (data) {
                    if(data.result === 0) {
                        $scope.showPasswordForm = false;
                        $rootScope.profile.is_two_factor_authentication_enabled = false;
                        removeFromStorage();

                    }else if(data.result === '-1005'){
                        $scope.forms.currentPasswordForm.oldpassword.$setValidity("incorrect", false);
                        $scope.forms.currentPasswordForm.oldpassword.$setPristine(true);
                    } else {
                        $rootScope.$broadcast("globalDialogs.addDialog", {
                            type: 'error',
                            title: 'Error',
                            content: data.details
                        });
                    }

                })["finally"](function () {
                    $scope.isLoading = false;
                });

            };


        }

    };

    /**
     * @ngdoc method
     * @name showBarcode
     * @methodOf vbet5.controller:showBarcode
     * @description show barcode
     */
    $scope.showBarcode = function showBarcode() {
        if ($scope.data.barcode) {
            return;
        }
        var match = RegExp('[?&]secret=([^&]*)').exec(qrCodeOrigin);
        $scope.data.barcode = match && match[1];
    };

    /**
     * @ngdoc method
     * @name verify
     * @methodOf vbet5.controller:mixedAuthenticationCtrl
     * @description verify code
     */
    $scope.verify = function verify() {
        var request = {
            code: $scope.data.code
        };

        request.device_fingerprint = Fingerprint2.authenticationCode;


        $scope.isLoading = true;
        Zergling.get(request, "apply_two_factor_authentication_code").then(function (data) {
            if (data.result === 0){
                $rootScope.$broadcast("globalDialogs.addDialog", {
                    type: 'info',
                    title: 'Info',
                    content: 'Two factor authentication successfully enabled'
                });
                $scope.data.qrCodeUrl = "";
                $scope.data.barcode = "";
                removeFromStorage();
            } else {
                $rootScope.$broadcast("globalDialogs.addDialog", {
                    type: 'error',
                    title: 'Error',
                    content: 'Invalid code'
                });
            }
        })['finally'](function () {
            $scope.isLoading = false;
            $scope.data.code = "";
        });
    };

    /**
     * @ngdoc method
     * @name verify
     * @methodOf vbet5.controller:mixedAuthenticationCtrl
     * @description copy barcode to clipboard
     */
    $scope.copyToClipboard = function copyToClipboard() {
       Utils.copyToClipboard($scope.data.barcode);
    };
}]);

/**
 * @ngdoc controller
 * @name vbet5.controller:idTokenCtrl
 * @description
 * login controller
 */
angular.module('vbet5').controller('idTokenCtrl', ['$scope', '$rootScope', '$http', '$timeout', 'Config', 'AuthData', function ($scope, $rootScope, $http, $timeout, Config, AuthData) {
    'use strict';


    var timeoutPromise;

    function closeTokenDialog() {
        $rootScope.env.sliderContent = '';
        $rootScope.env.showSlider = false;
    }

    function processToAuthData(id) {
        timeoutPromise = $timeout(function () {
            getAuthData(id);
        }, Config.main.idToken.refreshPeriod);
    }

    function getAuthData(id) {
        $http.get(Config.main.idToken.apiUrl + '/Hash/?Id=' + id).then(function (response) {
            if (!response || response.status !== 200) {
                closeTokenDialog();
                return;
            }
            if (response.data.Ready && response.data.UserId && response.data.Token) {
                AuthData.set({user_id: response.data.UserId, auth_token: response.data.Token});
                $scope.restoreLogin(); // call mainheader's function to login user
                closeTokenDialog();
                return;
            }
            processToAuthData(id);

        }, function () {
            closeTokenDialog();
        })
    }

    (function init() {
        $http.get(Config.main.idToken.apiUrl + '/QRCode/?partner=' + Config.main.site_id).then(function (response) {
            if (response && response.status === 200) {
                processToAuthData(response.data.Id);
                $scope.qrCode = response.data.QRCodePNG;
            } else {
                closeTokenDialog();
            }
        },function () {
            closeTokenDialog();
        })
    }());

    $scope.$on('$destroy', function () {
        if (timeoutPromise) {
            $timeout.cancel(timeoutPromise);
            timeoutPromise = undefined;
        }
    });
}]);


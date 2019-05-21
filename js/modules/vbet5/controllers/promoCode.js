/* global VBET5 */
/**
 * @ngdoc controller
 * @name vbet5.controller:promoCodeCtrl
 * @description
 * Promo code controller
 */
VBET5.controller('promoCodeCtrl', ['$scope', '$rootScope', '$http', 'Config', function ($scope, $rootScope, $http, Config) {
    'use strict';
    $scope.promoCode = {
        value: ''
    };

    $scope.submitPromoCode = function submitPromoCode() {
        console.log('Save promo code here');

        var data = {
            promo_code: $scope.promoCode.value.trim(),
            user_id: $rootScope.profile && $rootScope.profile.unique_id ? $rootScope.profile.unique_id : '',
            site_id: Config.main.site_id
        };
        //Config.main.profilePromoCodeUrl = 'http://10.25.79.115/test/promo/';
        $http({
            method: 'POST',
            url: Config.main.profilePromoCodeUrl,
            data: serialize(data),
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function (response) {
            if (response.data && response.data.result) {
                showAlert('Your promo code has been accepted', true);
            } else {
                showAlert('Not valid promo code (' + response.error_massage + ')');
            }
        }).catch(function () {
            showAlert('There was an error processing your request.');
        });
    };

    function showAlert(msg, success) {
        $rootScope.$broadcast("globalDialogs.addDialog", {
            type: success ? "success" : "error",
            title: success ? "Success" : "Error",
            content: msg,
            hideCloseButton: true,
            buttons: [
                {
                    title: 'Close',
                    callback: function () {
                        if (success) {
                            $rootScope.env.sliderContent = '';
                            $rootScope.env.showSlider = false;
                        }
                    }
                }
            ]
        });
    }

    function serialize(obj) {
        return Object.keys(obj).reduce(function (a, k) {
            a.push(k + '=' + encodeURIComponent(obj[k]));
            return a;
        }, []).join('&')
    }
}]);

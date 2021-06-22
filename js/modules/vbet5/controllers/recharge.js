angular.module('vbet5').controller("rechargeCtrl",['$scope', '$rootScope', 'Config', 'WPConfig', 'Utils',
    function ($scope, $rootScope, Config, WPConfig, Utils) {
    'use strict';

    function closeDialog() {
        $rootScope.$broadcast("globalDialogs.removeDialogsByTag", "low-balance");
    }

    $scope.openPage = function openPage(pageName) {
        if ($rootScope.env.sliderContent !== pageName) {
            $rootScope.broadcast("toggleSliderTab", pageName);
        }
        closeDialog();
    };

    $scope.openDepositWithPayment = function openDepositWithPayment(event, name) {
        $rootScope.$broadcast('openPayment.deposit', {event: event, name: name});
        $rootScope.env.selectedPayment = name;
        closeDialog();
    };

    (function init() {
        if (Config.payments && Config.payments.length) {
            $scope.paymentSystemNames = Utils.getPaymentIcons(Config.payments);
        }
        if (Config.main.footer.imageInsteadPayments) {
            $scope.spriteURL = Utils.getSpriteUrl(Config, WPConfig);
        }
    })();
}])

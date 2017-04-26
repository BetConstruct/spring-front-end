/* global VBET5 */
/**
 * @ngdoc controller
 * @name vbet5.controller:cashierCtrl
 * @description
 *  cashier controller
 */
VBET5.controller('cashierCtrl', ['$scope', '$rootScope', '$location', 'Translator', 'Zergling', 'Config', function ($scope, $rootScope, $location, Translator, Zergling, Config) {
    'use strict';

    $scope.cashierFormModel = {
        amount: 0,
        fromProduct: null,
        toProduct: null
    };

    // set  initial available values
    $scope.casinoBalance = $rootScope.env.casinoBalance;
    //$scope.pokerBalance = {pokerBalance: $rootScope.env.pokerBalance};
    $scope.transferMinLimit = 1 / Math.pow(10, $rootScope.conf.balanceFractionSize);

    /**
     * @ngdoc method
     * @name transfer
     * @methodOf vbet5.controller:cashierCtrl
     * @description sends transfer request
     */
    $scope.transfer = function transfer() {

        var request = {
            'from_product': $scope.cashierFormModel.fromProduct,
            'to_product': $scope.cashierFormModel.toProduct,
            'amount': parseFloat($scope.cashierFormModel.amount)
        };


        $scope.transferInProgress = true;
        var processResponse = function (response) {

            var code = Math.abs(response.result);

            $scope.initCashier(); //refresh balances

            console.log('cashier response', code);

            if (code === 0) {
                $scope.cashierFormModel.amount = '';
                $rootScope.$broadcast("globalDialogs.addDialog", {
                    type: "success",
                    title: "Success",
                    content: Translator.get('Your transfer is successfully completed')
                });
            } else {
                if (Translator.get('message_' + Math.abs(code)) !== ('message_' + code)) {
                    $scope.message = Translator.get('message_' + code);
                } else {
                    $scope.message = Translator.get("Your transfer can't be done now. Please try later.") + ' (' + code + ')';
                }
                $rootScope.$broadcast("globalDialogs.addDialog", {
                    type: "error",
                    title: "Error",
                    content: $scope.message
                });
            }

            $scope.transferInProgress = false;
        };

        Zergling.get(request, 'transfer')
            .then(processResponse)['catch'](function (reason) {
                console.log('Error:', reason);
                $rootScope.$broadcast("globalDialogs.addDialog", {
                    type: "error",
                    title: "Error",
                    content: Translator.get("Internal Error") + ' (' + reason.code + ')'
                });
                $scope.transferInProgress = false;
            });
    };

    /**
     * @ngdoc method
     * @name cancelBonus
     * @methodOf vbet5.controller:cashierCtrl
     * @param {String} type Sport|Casino|Poker
     * @description cancel bonus
     */
    $scope.cancelBonus = function cancelBonus(type) {

        var request = {
            'product': type
        };

        var processResponse = function (response) {
            console.log('cashier response', response);
            if (response.code === 'OK') {
                $scope.cashierFormModel.amount = '';
                $rootScope.$broadcast("globalDialogs.addDialog", {
                    type: "success",
                    title: "Success",
                    content: Translator.get('Your transfer is successfully completed')
                });
            } else {
                if (Translator.get('message_' + Math.abs(response.code)) !== ('message_' + response.code)) {
                    $scope.message = Translator.get('message_' + response.code);
                } else {
                    $scope.message = Translator.get("Bonus Canceling can't be done now. Please try later.") + ' (' + response.code + ')';
                }
                $rootScope.$broadcast("globalDialogs.addDialog", {
                    type: "error",
                    title: "Error",
                    content: $scope.message
                });
            }
        };

        Zergling.get(request, 'cancel_bonus')
            .then(processResponse)['catch'](function (reason) {
                console.log('Error:', reason);
                if (Translator.get('message_' + Math.abs(reason.code)) !== ('message_' + reason.code)) {
                    $scope.message = Translator.get('message_' + reason.code);
                } else {
                    $scope.message = Translator.get("Bonus Canceling can't be done now. Please try later.") + ' (' + reason.code + ')';
                }
                $rootScope.$broadcast("globalDialogs.addDialog", {
                    type: "error",
                    title: "Error",
                    content: $scope.message
                });
            });
    };

    /**
     * @ngdoc method
     * @name initCashier
     * @methodOf vbet5.controller:cashierCtrl
     * @description loads balance values by making http requests
     */
    $scope.initCashier = function initCashier() {

        if (!$scope.cashierFormModel.fromProduct && !$scope.cashierFormModel.toProduct) {
            switch ($location.path()) {
            case '/casino/':
                $scope.cashierFormModel.fromProduct = 'Sport';
                $scope.cashierFormModel.toProduct = 'Casino';
                break;
            case '/poker/':
                $scope.cashierFormModel.fromProduct = 'Sport';
                $scope.cashierFormModel.toProduct = 'Poker';
                break;
                //case '/sport/':
            default:
                $scope.cashierFormModel.fromProduct = 'Casino';
                $scope.cashierFormModel.toProduct = 'Sport';
            }
        }

        if (!Config.main.GmsPlatform) {
            Zergling.get({product: 'Casino'}, 'get_balance').then(function (response) {
                console.log('Casino balance(swarm)', response);
                $scope.casinoBalance = $rootScope.env.casinoBalance = response;
            });
        }
    };

    /**
     * @ngdoc method
     * @name changeCashierFormModelFromProduct
     * @methodOf vbet5.controller:cashierCtrl
     * @description Change cashier form model from product
     */
    $scope.changeCashierFormModelFromProduct = function changeCashierFormModelFromProduct(selectedProduct) {
        switch (selectedProduct) {
        case 'Casino':
            $scope.cashierFormModel.toProduct = 'Sport';
            break;
        default:
            $scope.cashierFormModel.toProduct = 'Casino';
            break;
        }
    };

    /**
     * @ngdoc method
     * @name getMaxTransferAmount
     * @methodOf vbet5.controller:cashierCtrl
     * @description return max possible transfer amount
     */
    $scope.getMaxTransferAmount = function getMaxTransferAmount() {
        switch ($scope.cashierFormModel.fromProduct) {
        case 'Sport':
            $scope.cashierFormModel.amount = $scope.profile.balance;
            break;
        case 'Casino':
        case 'Poker':
            $scope.cashierFormModel.amount = Config.main.GmsPlatformMultipleBalance ? $rootScope.profile.casino_balance : $scope.casinoBalance.balance;
            break;
        default:
            $scope.cashierFormModel.amount = 0;
            break;
        }
    };


}]);

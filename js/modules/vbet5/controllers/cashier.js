/* global VBET5 */
/**
 * @ngdoc controller
 * @name vbet5.controller:cashierCtrl
 * @description
 *  cashier controller
 */
VBET5.controller('cashierCtrl', ['$scope', '$rootScope', '$location', '$filter', 'Translator', 'Zergling', 'Config', function ($scope, $rootScope, $location, $filter, Translator, Zergling, Config) {
    'use strict';

    $scope.cashierFormModel = {
        amount: null,
        fromProduct: null,
        toProduct: null
    };

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
                $rootScope.$broadcast("globalDialogs.addDialog", {
                    type: "error",
                    title: "Error",
                    content: response.result_text
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
            case '/poker/':
                $scope.cashierFormModel.fromProduct = 'Sport';
                $scope.cashierFormModel.toProduct = 'Casino';
                break;
                //case '/sport/':
            default:
                $scope.cashierFormModel.fromProduct = 'Casino';
                $scope.cashierFormModel.toProduct = 'Sport';
            }
        }
    };

    /**
     * @ngdoc method
     * @name changeCashierFormModelFromProduct
     * @methodOf vbet5.controller:cashierCtrl
     * @description Change cashier form model from product
     */
    $scope.changeCashierFormModelFromProduct = function changeCashierFormModelFromProduct(selectedProduct , updateFrom) {
        switch (selectedProduct) {
            case 'Casino':
                $scope.cashierFormModel.toProduct = 'Sport';
                updateFrom && ($scope.cashierFormModel.fromProduct = 'Casino');
                break;
            default:
                $scope.cashierFormModel.toProduct = 'Casino';
                updateFrom && ($scope.cashierFormModel.fromProduct = 'Sport');
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
        // We use counterOfferRounding filter to 'cut' digits after dot, do the 'Transfer' button won't be disabled due to invalid 'step' on the input
        switch ($scope.cashierFormModel.fromProduct) {
        case 'Sport':
            $scope.cashierFormModel.amount = +$filter('counterOfferRounding')($rootScope.profile.calculatedBalance, Config.main.balanceFractionSize);
            break;
        case 'Casino':
            $scope.cashierFormModel.amount = +$filter('counterOfferRounding')($rootScope.profile.casino_balance, Config.main.balanceFractionSize);
            break;
        default:
            $scope.cashierFormModel.amount = 0;
            break;
        }
    };
}]);

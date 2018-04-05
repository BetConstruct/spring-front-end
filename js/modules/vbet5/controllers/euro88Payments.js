VBET5.controller('euro88PaymentsCtrl', ['$scope', '$rootScope', '$sce', '$filter', 'Zergling', 'Moment', 'Config', 'Translator', function ($scope, $rootScope, $sce, $filter, Zergling, Moment, Config, Translator) {
    'use strict';

    $scope.paymentSum = null;
    var paymentConfig = (Config.payments.length && Config.payments[0]) || {};

    function init() {
        //values of default sums are different for different currencies
        switch ($rootScope.profile.currency_name) {
            case 'KRW':
                var currency10000Won = Translator.translationExists('10000 won') ? Translator.get('10000 won') : '만원';
                $scope.sumsList = [
                    { name: '1' + currency10000Won, value: 10000},
                    { name: '5' + currency10000Won, value: 50000},
                    { name: '10' + currency10000Won, value: 100000},
                    { name: '50' + currency10000Won, value: 500000}
                ];
                break;
            default:
                $scope.sumsList = [
                    { name: $filter('number')(10, $rootScope.conf.balanceFractionSize) + ' ' + $rootScope.profile.currency_name, value: 10},
                    { name: $filter('number')(50, $rootScope.conf.balanceFractionSize) + ' ' + $rootScope.profile.currency_name, value: 50},
                    { name: $filter('number')(100, $rootScope.conf.balanceFractionSize) + ' ' + $rootScope.profile.currency_name, value: 100},
                    { name: $filter('number')(500, $rootScope.conf.balanceFractionSize) + ' ' + $rootScope.profile.currency_name, value: 500}
                ];
        }
    }
    /**
     * @ngdoc method
     * @name withdraw
     * @methodOf CMS.controller:euro88PaymentsCtrl
     * @description get data corresponding to parameters
     *
     * @param {String} action: deposit or withdraw
     * @param {String} command: CreatePaymentMessage or ConfirmPaymentMessage or GetActivePaymentMessage
     * @param {String} paymentType: 0 or 1: 0 = deposit, 1 = withdraw
     * @param {String} mID: id of current message
     */
    $scope.getData = function getData(command, paymentType,  mID) {
        $scope.requestInProcess = true;

        var payer = {
            command: command,  // CreatePaymentMessage or ConfirmPaymentMessage or GetActivePaymentMessage
            type: paymentType, // deposit == 0, withdraw == 1
            eamount: parseFloat($scope.paymentSum)

        };
        if (command === 'ConfirmPaymentMessage') {
            payer.mID = mID;
        }
        var request = {
            amount: 100, // maybe its bad idea but it need to working
            service: paymentConfig.paymentID || paymentConfig.name || "europayment",
            payer: payer
        };

        Zergling.get(request, 'deposit').then(
            function (data) {
                $scope.requestInProcess = false;
                if (data && data.result !== undefined && data.result === 0 && data.details && data.details.fields) {
                    $scope[command] = {};
                    angular.forEach(data.details.fields, function (item) {
                        $scope[command][item.name] = item.value;
                    });
                    var popupMessage;
                    if ($scope[command].status === 'error' && $scope[command].msg) {
                        popupMessage = $scope[command].msg;
                    } else {
                        switch (command) {
                            case 'GetActivePaymentMessage':
                                $scope[command].msg = $sce.trustAsHtml($scope[command].msg);
                                if ($scope[command].dateUTC) {
                                    $scope[command].dateLocale = Moment.moment(Moment.moment.utc($scope[command].dateUTC).toDate()).format('YYYY/MM/DD HH:mm:ss');
                                }
                                break;
                            case 'ConfirmPaymentMessage':
                                if ($scope[command].status === 'success' && $scope[command].msg) {
                                    popupMessage = $scope[command].msg;
                                }
                                $scope.getData('GetActivePaymentMessage', paymentType);
                                break;
                            case 'CreatePaymentMessage':
                                if ($scope[command].status === 'success' && $scope[command].msg) {
                                    popupMessage = $scope[command].msg;
                                }
                                $scope.paymentSum = null;
                                $scope.getData('GetActivePaymentMessage', paymentType);
                                break;
                        }
                    }
                    if (popupMessage) {
                        $rootScope.$broadcast("globalDialogs.addDialog", {
                            type: "info",
                            title: "Information",
                            content: popupMessage
                        });
                    }
                } else  if (command !== 'GetActivePaymentMessage'){
                    $rootScope.$broadcast("globalDialogs.addDialog", {
                        type: "error",
                        title: 'Error',
                        content: data.details.error
                    });
                }
            },
            function (reason) {
                $scope.requestInProcess = false;
                $rootScope.$broadcast("globalDialogs.addDialog", {
                    type: "error",
                    title: 'Error',
                    content: 'Error'
                });
            }
        );
    };

/**
 * @ngdoc method
 * @name increaseSum
 * @methodOf CMS.controller:euro88PaymentsCtrl
 * @description increase payment sum carresponding to value
 *
 * * @param {Number} value: increased value
 */

    $scope.increaseSum = function increaseSum(value) {
        if (!$scope.paymentSum) {
            $scope.paymentSum = 0;
        }
        $scope.paymentSum = parseInt($scope.paymentSum) + value;
    };

    init();
}]);





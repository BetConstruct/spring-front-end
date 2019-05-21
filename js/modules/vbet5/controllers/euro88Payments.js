/* global VBET5 */
VBET5.controller('euro88PaymentsCtrl', ['$scope', '$rootScope', '$sce', '$filter', 'Zergling', 'Moment', 'Config', 'Translator', function ($scope, $rootScope, $sce, $filter, Zergling, Moment, Config, Translator) {
    'use strict';

    $scope.paymentSum = null;
    var paymentConfig = (Config.payments.length && Config.payments[0]) || {};
    var additionalPaymentButtons = { // default values, if nothing was overridden in payment config
        KRW: {
            deposit: [10000, 50000, 100000, 500000, 1000000, 5000000],
            withdraw: [10000, 50000, 100000, 500000, 1000000, 5000000]
        },
        default: { // jshint ignore:line
            deposit: [10, 50, 100, 500],
            withdraw: [10, 50, 100, 500]
        }
    };

    function init(tab) {
        // The purpose of createSumsList is to return a function that, based on the current currency, will serve as a callback for map method
        var createSumsList = function createSumsList(currency) {
            if (currency === 'KRW') {
                var currency10000Won = Translator.translationExists('10000 won') ? Translator.get('10000 won') : '만원';
                return function mapFunc(val) {
                    return {
                        name: val/10000 + currency10000Won,
                        value: val
                    };
                };
            }

            return function mapFunc(val) {
                return {
                    name: $filter('number')(val, $rootScope.conf.balanceFractionSize) + ' ' + currency,
                    value: val
                };
            };
        };

        $scope.sumsList = (
            paymentConfig.additionalPaymentButtons && paymentConfig.additionalPaymentButtons[$rootScope.profile.currency_name] ||
            additionalPaymentButtons[$rootScope.profile.currency_name] ||
            additionalPaymentButtons.default // jshint ignore:line
        )[tab].map(createSumsList($rootScope.profile.currency_name));
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

    init($scope.env.sliderContent);
}]);





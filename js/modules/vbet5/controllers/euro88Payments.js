/* global VBET5 */
VBET5.controller('euro88PaymentsCtrl', ['$scope', '$rootScope', '$sce', '$filter', 'Zergling', 'Moment', 'Config', 'Translator', function ($scope, $rootScope, $sce, $filter, Zergling, Moment, Config, Translator) {
    'use strict';

    $scope.paymentSum = null;
    var paymentConfig = (Config.payments.length && Config.payments[0]) || {};
    var additionalPaymentButtons = { // default values, if nothing was overridden in payment config
        KRW: {
            default: {
                deposit: [10000, 50000, 100000, 500000, 1000000, 5000000],
                withdraw: [10000, 50000, 100000, 500000, 1000000, 5000000]
            }

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
            paymentConfig.info && paymentConfig.info[$rootScope.profile.currency_name] && paymentConfig.info[$rootScope.profile.currency_name].default && paymentConfig.info[$rootScope.profile.currency_name].default[tab]  ||
            paymentConfig[tab + 'CustomAmounts'] ||
            (additionalPaymentButtons[$rootScope.profile.currency_name] && additionalPaymentButtons[$rootScope.profile.currency_name].default[tab]) ||
            additionalPaymentButtons.default[tab] // jshint ignore:line
        ).map(createSumsList($rootScope.profile.currency_name));
    }


    /**
     * @ngdoc method
     * @name deposit
     * @description  sends deposit request to swarm, gets result, displays "external" form
     * @param {String} command: CreatePaymentMessage or ConfirmPaymentMessage or GetActivePaymentMessage
     * @param {String} paymentType: 0 or 1: 0 = deposit, 1 = withdraw
     * @param {String} mID: id of current message
     */
    $scope.deposit = function deposit(command, paymentType,  mID) {
        if (Config.main.promotionalBonuses.enable && Config.main.promotionalBonuses.showClaimableInfoBeforeDeposit) {
            $scope.requestInProcess = true;
            Zergling.get({}, "get_client_claimable_deposit_bonuses")
                .then(function(response) {
                    $scope.requestInProcess = false;
                    if(response.details && response.details.length) {
                        $rootScope.$broadcast("globalDialogs.addDialog", {
                            type: "info",
                            title: "Info",
                            content: 'Are you sure to continue without deposit bonus?',
                            buttons: [
                                {
                                    title: 'Yes', callback: function () {
                                        $scope.getData(command, paymentType,  mID);
                                    }
                                },
                                {title: 'Claim bonus', callback: function () {
                                        $rootScope.env.sliderContent = 'promotionalBonuses';
                                    }}
                            ]
                        });
                    } else {
                        $scope.getData(command, paymentType,  mID);
                    }
                });
        } else {
            $scope.getData(command, paymentType,  mID);
        }
    };
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
            service: paymentConfig.paymentID || paymentConfig.name || "europayment"
        };

        if (paymentType === "0") {
            request.payer = payer;
        } else {
            request.payee = payer;
        }

        Zergling.get(request, paymentType === '0' ? 'deposit' : "withdraw").then(
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
                                    // for the feature we should instead use formatDate filter to handle time
                                    //console.log($filter('formatDate')($scope[command].dateUTC, 'fullDate', null, $rootScope.env.timeFormat));
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
                        content: Translator.translationExists(data.details.error_code) ? data.details.error_code : data.details.error
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





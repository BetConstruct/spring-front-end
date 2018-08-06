/* global VBET5 */
/**
 * @ngdoc directive
 * @name vbet5.directive:cashOutDialog
 *
 * @description displays cash out dialog
 *
 */
VBET5.directive('cashOutDialog', ['$rootScope', '$timeout', 'Moment', 'Zergling', 'Config', 'BetService', function ($rootScope, $timeout, Moment, Zergling, Config, BetService) {
    'use strict';
    return {
        restrict: 'E',
        replace: true,
        templateUrl: 'templates/directive/cashout-dialog.html',
        link: function ($scope) {
            var dateRange, selectedUpcomingPeriod;


            function initParams() {
                $scope.canCashOut = {
                  enabled: true
                };
                $scope.minCashoutValue = BetService.cashOut.getMinCashOutValue();
                $scope.cashoutDialog = {};
                $scope.cashoutPopup = {
                    active: false
                };
                $scope.cashoutRule = {
                    created: false,
                    canceled: false,
                    error: false,
                    manualError: false,
                    valueReachesAmount: '',
                    isPartial: '',
                    loading: false
                };
                $scope.cashoutTypes = {
                    manual: 'full',
                    auto: 'full'
                };
            }


            function openDialog(event, data) {
                initParams();
                $scope.cashoutPopup.active = true;
                $scope.cashoutPopup.sliderValue = 100;
                $scope.cashoutDialog.type = 'cashout';
                $scope.cashoutTypes.manual = 'full';
                $scope.cashoutTypes.auto = 'full';
                $scope.cashoutBet = data.bet;
                $scope.cashoutBet.originalPrice = data.bet.cash_out;
                $scope.newCashoutData = {
                    new_price: parseFloat(data.bet.cash_out)
                };
                $scope.triggerAutoCashOut = {
                    amount: parseFloat($scope.cashoutBet.cash_out)
                };
                $scope.cashoutPopup.inputValue = $scope.cashoutBet.cash_out;
                $scope.autoCashOutAmount = {
                    min: ($scope.cashoutBet.cash_out + $scope.cashoutBet.cash_out / 100).toFixed(2),
                    max: ($scope.cashoutBet.possible_win - $scope.cashoutBet.possible_win / 100).toFixed(2)
                };
                if (data.dateRange && data.selectedUpcomingPeriod) {
                    dateRange = data.dateRange;
                    selectedUpcomingPeriod = data.selectedUpcomingPeriod;
                }
                if ($scope.cashoutBet.auto_cash_out_amount != null) {
                    getAutoCashOutDetails($scope.cashoutBet.id);
                }
            }


            /**
             * @ngdoc method
             * @name createAutoCashOutRule
             * @methodOf vbet5.directive:cashOutDialog
             * @description create auto cash-out rule
             */
            $scope.createAutoCashOutRule = function createAutoCashOutRule(betId) {
                $scope.cashoutRequestInProgress = true;
                var data = {
                    bet_id: betId,
                    min_amount: $scope.triggerAutoCashOut.amount
                };
                if ($scope.cashoutTypes.auto === 'partial') {
                    data.partial_amount = $scope.cashoutPopup.inputValue;
                }
                Zergling.get(data, 'set_bet_auto_cashout')
                    .then(function (response) {
                        $scope.cashoutDialog.type = 'confirm';
                        if (response.result === 0) {
                            $scope.cashoutRule.created = true;
                            $scope.cashoutRule.canceled = false;
                            $scope.cashoutRule.error = false;
                            $scope.cashoutSuccess = true;
                            $rootScope.$broadcast('updateAfterCashout', {betId: betId, autoCashout: true});
                        } else {
                            $scope.cashoutRule.error = true;
                            $scope.cashoutRule.created = false;
                            $scope.cashoutRule.canceled = true;
                            $scope.cashoutSuccess = false;
                            $scope.cashoutRule.message = response.details;
                        }
                        $scope.cashoutRequestInProgress = false;
                    });
            };


            /**
             * @ngdoc method
             * @name doCashout
             * @methodOf vbet5.directive:cashOutDialog
             * @description sends cashout requets
             *
             * @param {object} bet bet data
             * @param {object} suggested
             */
            $scope.doCashout = function doCashout(bet, suggested) {
                $scope.cashoutRequestInProgress = true;
                $scope.newCashoutData = null;
                var price = parseFloat(suggested && suggested.new_price ? suggested.new_price : bet.cash_out);
                var request = {bet_id: bet.id, price: price};

                if (suggested.partial_price) {
                    request.partial_price = suggested.partial_price;
                }

                $scope.cashoutRule = {
                    created: false,
                    canceled: false,
                    error: false,
                    manualError: false
                };

                Zergling.get(request, 'cashout')
                    .then(
                        function (response) {
                            if (response.result === "Ok") {
                                if ($rootScope.env.sliderContent === 'recentBets') {
                                    var currentTimestamp = Moment.get().unix();
                                    if (suggested.partial_price && ((dateRange.fromDate <= currentTimestamp && currentTimestamp <= dateRange.toDate) || selectedUpcomingPeriod !== 0)) {
                                        $timeout(function () { //need to remove timeout after backend's fix
                                            $rootScope.$broadcast('loadMixedBetHistory');
                                        }, 950);
                                    } else {
                                        $rootScope.$broadcast('updateAfterCashout', {betId: bet.id});
                                    }
                                }
                                $scope.cashoutDialog.type = 'confirm';
                                $scope.cashoutSuccess = (response.details && (response.details.cash_out_price || response.details.price)) || true;
                                if (Config.partner.balanceRefreshPeriod || Config.main.rfid.balanceRefreshPeriod) { // refresh balance right after successed cashout in integration skin (or for rfid)
                                    $rootScope.$broadcast('refreshBalance');
                                }
                            } else if (response.result === "Fail" && response.details && response.details.new_price) {
                                $scope.cashoutDialog.type = 'cashout';
                                $scope.newCashoutData = response.details;
                                $scope.newCashoutData.priceChanged = true;
                                // $scope.changeCashoutValue($scope.cashoutPopup.sliderValue, $scope.newCashoutData.new_price);
                                if ($scope.cashoutTypes.manual === 'partial') {
                                    $scope.newCashoutData.partial_price = $scope.cashoutPopup.inputValue;
                                }
                                bet.cash_out = $scope.newCashoutData.new_price;
                                // $scope.cashoutPopup.inputValue = bet.cash_out;
                            } else if (response.result === "NotAvailable" || response.result === "Fail") {
                                $scope.cashoutDialog.type = 'confirm';
                                $scope.cashoutSuccess = false;
                                $scope.cashoutRule.manualError = true;
                            } else {
                                $scope.cashoutDialog.type = 'confirm';
                                $scope.cashoutSuccess = false;
                                $scope.cashoutRule.manualError = true;
                                $scope.unknownError = true;
                            }
                        },
                        function (failResponse) {
                            $scope.cashoutPopup.active = true;
                            $scope.cashoutDialog.type = 'confirm';
                            $scope.cashoutSuccess = false;
                            $scope.cashoutRule.manualError = true;
                            console.log('cashout failed', failResponse);
                        }
                    )['finally'](function () {
                    $scope.cashoutRequestInProgress = false;
                });
            };


            /**
             * @ngdoc method
             * @name changeCashoutValue
             * @methodOf vbet5.directive:cashOutDialog
             * @description converts percent value(100% is the max cash-out price) to cash-out price
             */
            $scope.changeCashoutValue = function changeCashoutValue(value, calculated) {
                $scope.canCashOut.enabled = true;

                if (calculated < $scope.minCashoutValue) {
                    return;
                }

                var price = 0.01 * calculated * value;
                if (price === 0) {
                    $scope.canCashOut.enabled = false;
                }
                if (calculated >= 100 || $rootScope.conf.balanceFractionSize === 0) {
                    price = Math.round(price);
                } else if (calculated >= 10) {
                    price = Math.round(price * 10) / 10;
                } else {
                    price = Math.round(price * 100) / 100;
                }

                price = $rootScope.conf.balanceFractionSize === 0 && price < 1 ? 1 : price;

                if ($scope.minCashoutValue <= calculated - price) {
                    $scope.cashoutPopup.inputValue = price;
                    $scope.newCashoutData.partial_price = price;
                } else {
                    $scope.newCashoutData.partial_price = '';
                    $scope.cashoutPopup.inputValue = calculated;
                    $scope.newCashoutData.price = calculated;
                }
            };


            /**
             * @ngdoc method
             * @name updatePopUpInfo
             * @methodOf vbet5.directive:cashOutDialog
             * @description This function dynamically updates pop up info
             * @param {Object} event - ignore this parameter, this is passed from listener
             * @param {Object} data - cashout map
             */
            function updatePopUpInfo(event, data) {
                if ($scope.cashoutBet && $scope.cashoutBet.id && data.cashOutMap[$scope.cashoutBet.id]) { // $scope.cashoutBet is the active bet that we want to cash out
                    if (data.cashOutMap[$scope.cashoutBet.id]['CashoutAmount'] === null) {
                        return $scope.closePopUp();
                    }

                    $scope.autoCashOutAmount.min = (data.cashOutMap[$scope.cashoutBet.id]['CashoutAmount'] + (data.cashOutMap[$scope.cashoutBet.id]['CashoutAmount']) / 100).toFixed(2);
                    $scope.autoCashOutAmount.max = ($scope.cashoutBet.possible_win - $scope.cashoutBet.possible_win / 100).toFixed(2);

                    $scope.triggerAutoCashOut.amount = $scope.autoCashOutAmount.min;

                    if (($scope.cashoutDialog.type !== 'autoCashout' && $scope.cashoutTypes.manual === 'full') || ($scope.cashoutDialog.type === 'autoCashout' && $scope.cashoutTypes.auto === 'full')) {
                        $scope.cashoutPopup.inputValue = $scope.cashoutDialog.type !== 'autoCashout' ? data.cashOutMap[$scope.cashoutBet.id]['CashoutAmount'] : $scope.autoCashOutAmount.min;
                        $scope.cashoutPopup.sliderValue = 100; // 100 is the maximum slider value (100%)
                    }

                    /* $scope.newCashoutData is created when pop up is opened and contains info on cash out price
                       It is sent as the full cash out price (in case we don't manipulate either input value or slider value) */
                    if ($scope.newCashoutData) {
                        if ($scope.cashoutTypes.manual === 'partial') {
                            $scope.newCashoutData.partial_price = $scope.cashoutPopup.inputValue;
                        }
                        if ($scope.newCashoutData.new_price) {
                            $scope.newCashoutData.new_price = data.cashOutMap[$scope.cashoutBet.id]['CashoutAmount'];
                        }

                        // We delete the partial price because it doesn't need to be sent if the cash out is 'full'
                        if ($scope.newCashoutData.partial_price && $scope.cashoutTypes.manual === 'full') {
                            $scope.newCashoutData.partial_price = '';
                        }
                    }
                }
            }


            /**
             * @ngdoc method
             * @name changeBackCashoutValue
             * @methodOf vbet5.directive:cashOutDialog
             * @description converts cash-out price to percent value
             */
            $scope.changeBackCashoutValue = function changeBackCashoutValue(calculated) {
                if (isNaN(calculated)) {
                    $scope.canCashOut.enabled = true;
                    return;
                }

                var price = parseFloat($scope.cashoutPopup.inputValue);
                calculated = parseFloat(calculated);

                if (price < 0 || !price) {
                    $scope.cashoutPopup.sliderValue = 0;
                    $scope.canCashOut.enabled = false;
                    return;
                } else if ((price > calculated - $scope.minCashoutValue && price < calculated) || (price > calculated)) {
                    $scope.cashoutPopup.sliderValue = 100;
                    $scope.canCashOut.enabled = false;
                    return;
                }

                if ((calculated - price >= $scope.minCashoutValue) || price === calculated) {
                    $scope.canCashOut.enabled = true;
                    var value = price / (calculated * 0.01);
                    value = Math.round(value);
                    if (price === calculated) {
                        $scope.newCashoutData.partial_price = '';
                        $scope.cashoutPopup.sliderValue = value;
                        $scope.newCashoutData.price = price;
                    } else {
                        $scope.cashoutPopup.sliderValue = value;
                        $scope.newCashoutData.partial_price = price;
                    }
                }
            };


            /**
             * @ngdoc method
             * @name getAutoCashOutDetails
             * @methodOf vbet5.directive:cashOutDialog
             * @description get details about autoCashOuted bet
             */
            function getAutoCashOutDetails(betId) {
                $scope.cashoutRule.loading = true;
                Zergling.get({'bet_id': betId}, 'get_bet_auto_cashout')
                    .then(function (response) {
                        $scope.cashoutRule.loading = false;
                        if (response.result === 0) {
                            $scope.cashoutRule.valueReachesAmount = response.details.MinAmount;
                            $scope.cashoutRule.isPartial = !!response.details.PartialAmount;
                        }
                    });
            }

            /**
             * @ngdoc method
             * @name switchCashOutDialogType
             * @methodOf vbet5.directive:cashOutDialog
             * @description switches cash out dialog type
             */
            $scope.switchCashOutDialogType = function switchCashOutDialogType(dialogType, cashOutAmount) {
                if (dialogType === 'cashout') {
                    $scope.cashoutTypes.manual = 'full';
                    $scope.cashoutPopup.inputValue = $scope.cashoutBet.cash_out;
                } else if (dialogType === 'autoCashout') {
                    if ($scope.cashoutBet.auto_cash_out_amount != null) {
                        $scope.triggerAutoCashOut.amount = $scope.cashoutBet.auto_cash_out_amount;
                    } else {
                        $scope.triggerAutoCashOut.amount = (cashOutAmount + cashOutAmount / 100).toFixed(2);
                        $scope.cashoutPopup.inputValue = $scope.triggerAutoCashOut.amount;
                    }
                    $scope.cashoutTypes.auto = 'full';
                    $scope.triggerAutoCashOut.error = false;
                }
                $scope.cashoutPopup.sliderValue = 100;
                $scope.canCashOut.enabled = true;
            };


            /**
             * @ngdoc method
             * @name changeTriggerAmount
             * @methodOf vbet5.directive:cashOutDialog
             * @description changes input value, shows message if amount is not valid
             */
            $scope.changeTriggerAmount = function changeTriggerAmount(cashOutAmount) {
                $scope.triggerAutoCashOut.error = (parseFloat($scope.triggerAutoCashOut.amount) < parseFloat($scope.autoCashOutAmount.min) || parseFloat($scope.triggerAutoCashOut.amount) > parseFloat($scope.autoCashOutAmount.max) || !$scope.triggerAutoCashOut.amount);
                $scope.cashoutPopup.sliderValue = 100;
                $scope.cashoutTypes.auto === 'full' ? $scope.cashoutPopup.inputValue = cashOutAmount : $scope.cashoutPopup.inputValue = $scope.triggerAutoCashOut.amount;
            };


            /**
             * @ngdoc method
             * @name cancelAutoCashOutRule
             * @methodOf vbet5.directive:cashOutDialog
             * @description cancel auto cash-out rule
             */
            $scope.cancelAutoCashOutRule = function cancelAutoCashOutRule(betId) {
                $scope.cashoutRequestInProgress = true;

                Zergling.get({bet_id: betId}, 'cancel_bet_auto_cashout')
                    .then(function (response) {
                        $scope.cashoutDialog.type = 'confirm';
                        if (response.result === 0) {
                            $scope.cashoutRule.canceled = true;
                            $scope.cashoutRule.error = false;
                            $scope.cashoutRule.created = false;
                            $scope.cashoutSuccess = true;
                            $rootScope.$broadcast('updateAfterCashout', {betId: betId, autoCashout: true});
                        } else {
                            $scope.cashoutRule.error = true;
                            $scope.cashoutRule.created = false;
                            $scope.cashoutRule.canceled = false;
                            $scope.cashoutSuccess = false;
                            $scope.cashoutRule.message = response.details;
                        }
                        $scope.cashoutRequestInProgress = false;
                    });
            };


            $scope.closePopUp = function closePopUp() {
                //  $scope.changeBackCashoutValue();
                if ($scope.cashoutPopup) {
                    $scope.cashoutPopup.active = false;
                }
            };

            $scope.$on('closeCashOutPopUp', $scope.closePopUp);
            $scope.$on('updatePopUpInfo', updatePopUpInfo);
            $scope.$on('open.cashoutDialog', openDialog);
            $scope.$on('$destroy', $scope.closePopUp);
        }
    };
}]);

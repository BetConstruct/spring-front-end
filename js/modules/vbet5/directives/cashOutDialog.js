/* global VBET5 */
/**
 * @ngdoc directive
 * @name vbet5.directive:cashOutDialog
 *
 * @description displays cash out dialog
 *
 */
VBET5.directive('cashOutDialog', ['$rootScope', '$timeout', 'Moment', 'Zergling', 'Config', 'BetService', 'Translator', 'Storage', function ($rootScope, $timeout, Moment, Zergling, Config, BetService, Translator, Storage) {
    'use strict';
    return {
        restrict: 'E',
        replace: true,
        templateUrl: 'templates/directive/cashout-dialog.html',
        link: function ($scope) {
            var dateRange, selectedUpcomingPeriod;
            var minAmountMap = [1, 0.1, 0.01];


            function initParams() {
                $scope.canCashOut = {
                  enabled: true
                };
                $scope.minCashoutValue = BetService.cashOut.getMinCashOutValue();
                $scope.cashoutDialog = {};
                $scope.cashoutPopup = {
                    active: false,
                    isModeOpen: false,
                    selectedMode: Storage.get('selectedCashOutMode') ? Storage.get('selectedCashOutMode') : 0
                };
                $scope.cashoutRule = {
                    created: false,
                    canceled: false,
                    error: false,
                    manualError: "",
                    valueReachesAmount: '',
                    partialAmount: '',
                    loading: false
                };
                $scope.cashoutTypes = {
                    manual: 'full',
                    auto: 'full'
                };
                $scope.modes = {
                    0: Translator.get('Always ask'),
                    1: Translator.get('Accept higher amounts'),
                    2: Translator.get('Accept any amount change')
                };
            }

            /**
             * @ngdoc method
             * @name updateBetAfterCashout
             * @methodOf vbet5.directive:cashOutDialog
             * @description sends bet for updating
             *
             * @param {Number} betId the bet id
             * @param {boolean} [autoCashout]
             */
            function updateBetAfterCashout(betId, autoCashout) {
                setTimeout(function() {
                    BetService.getBetHistory(betId)
                        .then(function(bet) {
                            $rootScope.$broadcast('updateAfterCashout', {bet: bet, autoCashout: autoCashout});
                        });
                }, 950);
            }

            function openDialog(event, data) {
                initParams();
                $scope.cashoutPopup.active = true;
                $scope.cashoutPopup.sliderValue = 0;
                $scope.cashoutDialog.type = 'cashout';
                $scope.cashoutTypes.manual = 'full';
                $scope.cashoutTypes.auto = 'full';
                $scope.cashoutBet = data.bet;
                $scope.cashoutPopup.originalPrice = data.bet.cash_out;
                $scope.newCashoutData = {
                    new_price: parseFloat(data.bet.cash_out)
                };
                $scope.triggerAutoCashOut = {
                    amount: ''
                };
                $scope.autoCashOutAmount = {
                    min: ($scope.cashoutBet.cash_out + minAmountMap[$rootScope.currency.rounding]).toFixed(2),
                    max: ($scope.cashoutBet.possible_win - minAmountMap[$rootScope.currency.rounding]).toFixed(2)
                };
                $scope.autoCashOutAmount.disabled = parseFloat($scope.autoCashOutAmount.min) >= parseFloat($scope.autoCashOutAmount.max);
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
                            updateBetAfterCashout(betId, true);
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
                var request = {
                    bet_id: bet.id,
                    price: price,
                    mode: $scope.cashoutPopup.selectedMode
                };

                if (suggested.partial_price) {
                    request.partial_price = suggested.partial_price;
                }

                $scope.cashoutRule = {
                    created: false,
                    canceled: false,
                    error: false,
                    manualError: ""
                };

                Zergling.get(request, 'cashout')
                    .then(
                        function (response) {
                            if (response.result === "Ok") {
                                if ($rootScope.env.sliderContent === 'recentBets') {
                                    var currentTimestamp = Moment.get().unix();
                                    if (suggested.partial_price && dateRange && ((dateRange.fromDate <= currentTimestamp && currentTimestamp <= dateRange.toDate) || selectedUpcomingPeriod !== 0)) {
                                        $timeout(function () { //need to remove timeout after backend's fix
                                            $rootScope.$broadcast('loadMixedBetHistory');
                                        }, 950);
                                    } else {
                                        updateBetAfterCashout(bet.id);
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
                                if ($scope.cashoutTypes.manual === 'partial') {
                                    $scope.newCashoutData.partial_price = $scope.cashoutPopup.inputValue;
                                }
                                bet.cash_out = $scope.newCashoutData.new_price;
                                // $scope.cashoutPopup.inputValue = bet.cash_out;
                            } else if (response.result === "NotAvailable" || response.result === "Fail") {
                                $scope.cashoutDialog.type = 'confirm';
                                $scope.cashoutSuccess = false;
                                $scope.cashoutRule.manualError = response.result_text;
                            } else {
                                $scope.cashoutDialog.type = 'confirm';
                                $scope.cashoutSuccess = false;
                                $scope.cashoutRule.manualError = response.result_text;
                                $scope.unknownError = true;
                            }
                        },
                        function (failResponse) {
                            $scope.cashoutPopup.active = true;
                            $scope.cashoutDialog.type = 'confirm';
                            $scope.cashoutSuccess = false;
                            $scope.cashoutRule.manualError = failResponse.result_text;
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

                if (calculated < $scope.minCashoutValue && $scope.cashoutDialog.type !== 'cashout') {
                    return;
                }

                var price = 0.01 * calculated * value;
                if (+price.toFixed(2) === 0) {
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
                if ($scope.minCashoutValue > calculated - price) {
                    $scope.newCashoutData.price = calculated;
                }

                $scope.cashoutPopup.inputValue = price;
                $scope.newCashoutData.partial_price = price;
            };


            /**
             * @ngdoc method
             * @name updatePopUpInfo
             * @methodOf vbet5.directive:cashOutDialog
             * @description This function dynamically updates pop up info
             */
            function updatePopUpInfo() {
                if ($scope.cashoutBet) { // $scope.cashoutBet is the active bet that we want to cash out
                    if (!$scope.cashoutBet.cash_out && $scope.cashoutDialog.type !== 'confirm') {
                        return $scope.closePopUp();
                    }

                    $scope.autoCashOutAmount.min = ($scope.cashoutBet.cash_out + minAmountMap[$rootScope.currency.rounding]).toFixed(2);
                    $scope.autoCashOutAmount.max = ($scope.cashoutBet.possible_win - minAmountMap[$rootScope.currency.rounding]).toFixed(2);
                    $scope.autoCashOutAmount.disabled = parseFloat($scope.autoCashOutAmount.min) >= parseFloat($scope.autoCashOutAmount.max);

                    if ($scope.cashoutDialog.type === 'autoCashout' && $scope.cashoutBet.auto_cash_out_amount === null) {
                        $scope.changeTriggerAmount();
                    }

                    /* $scope.newCashoutData is created when pop up is opened and contains info on cash out price
                       It is sent as the full cash out price (in case we don't manipulate either input value or slider value) */
                    if ($scope.newCashoutData) {
                        if ($scope.cashoutTypes.manual === 'partial') {
                            $scope.newCashoutData.partial_price = $scope.cashoutPopup.inputValue;
                            $scope.changeBackCashoutValue($scope.cashoutBet.cash_out);
                        }
                        if ($scope.newCashoutData.new_price) {
                            $scope.newCashoutData.new_price = $scope.cashoutBet.cash_out;
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
                if ($scope.cashoutDialog.type === 'autoCashout' && $scope.cashoutTypes.auto === 'full' || isNaN(calculated)) {
                    $scope.canCashOut.enabled = true;
                    return;
                }

                var price = parseFloat($scope.cashoutPopup.inputValue);
                calculated = parseFloat(calculated);

                if (price < 0 || !price) {
                    $scope.cashoutPopup.sliderValue = 0;
                    $scope.canCashOut.enabled = false;
                    return;
                } else if (price > calculated) {
                    $scope.canCashOut.enabled = false;
                } else {
                    if (price === calculated) {
                        $scope.newCashoutData.partial_price = '';
                        $scope.newCashoutData.price = price;
                    } else {
                        $scope.newCashoutData.partial_price = price;
                    }

                    $scope.canCashOut.enabled = true;
                }

                var sliderValue = Math.round(price / (calculated * 0.01));
                $scope.cashoutPopup.sliderValue = Math.min(sliderValue, 100);
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
                            $scope.cashoutRule.partialAmount = response.details.PartialAmount;
                        }
                    });
            }

            /**
             * @ngdoc method
             * @name switchCashOutDialogType
             * @methodOf vbet5.directive:cashOutDialog
             * @description switches cash out dialog type
             */
            $scope.switchCashOutDialogType = function switchCashOutDialogType(dialogType) {
                if ($scope.cashoutDialog.type === dialogType) {
                    return;
                }
                $scope.cashoutDialog.type = dialogType;
                $scope.cashoutPopup.inputValue = '';

                if (dialogType === 'cashout') {
                    $scope.cashoutTypes.manual = 'full';
                } else if (dialogType === 'autoCashout') {
                    if ($scope.cashoutBet.auto_cash_out_amount != null) {
                        $scope.triggerAutoCashOut.amount = $scope.cashoutBet.auto_cash_out_amount;
                    } else {
                        $scope.triggerAutoCashOut.amount = '';
                    }
                    $scope.cashoutTypes.auto = 'full';
                    $scope.triggerAutoCashOut.error = false;
                }
                $scope.cashoutPopup.sliderValue = 0;
                $scope.canCashOut.enabled = true;
            };


            /**
             * @ngdoc method
             * @name changeTriggerAmount
             * @methodOf vbet5.directive:cashOutDialog
             * @description changes input value, shows message if amount is not valid
             */
            $scope.changeTriggerAmount = function changeTriggerAmount() {
                $scope.triggerAutoCashOut.error = !$scope.triggerAutoCashOut.amount || parseFloat($scope.triggerAutoCashOut.amount) < parseFloat($scope.autoCashOutAmount.min) || parseFloat($scope.triggerAutoCashOut.amount) > parseFloat($scope.autoCashOutAmount.max);
                $scope.changeBackCashoutValue($scope.triggerAutoCashOut.amount);
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
                            updateBetAfterCashout(betId, true);
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
                    $scope.cashoutBet = null;
                }
            };

            /**
             * @ngdoc method
             * @name changeCashOutMode
             * @methodOf vbet5.directive:cashOutDialog
             * @description change manual cashOut mode
             */
            $scope.changeCashOutMode = function changeCashOutMode(id) {
                $scope.cashoutPopup.selectedMode = id;
                Storage.set('selectedCashOutMode', $scope.cashoutPopup.selectedMode);
            };

            $scope.$watch('conf.balanceFractionSize', function changeInputRegEx(newVal) {
                $scope.inputRegEx = newVal === 0 ? '[^\\d]' : '(?<=\\..{' + newVal + '})[^\\]]+';
            });

            $scope.$on('closeCashOutPopUp', $scope.closePopUp);
            $scope.$on('updatePopUpInfo', updatePopUpInfo);
            $scope.$on('open.cashoutDialog', openDialog);
            $scope.$on('$destroy', $scope.closePopUp);
        }
    };
}]);

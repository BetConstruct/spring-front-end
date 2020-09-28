angular.module('vbet5.betting').controller('forecastAndTricastBetslipCtrl', ['$rootScope', '$scope', 'Zergling', 'Utils', 'partner', 'Translator',
    function ($rootScope, $scope, Zergling, Utils, partner, Translator) {
        'use strict';
        var betType;

        (function init() {
            $scope.state = $scope.activeDialog.state;
            var count = {"forecast": 2, "tricast": 3}[$scope.state.type];
            if ($scope.state.selectedAnyCount > 0) {
                $scope.events = $scope.state.selectedItems.map(function(item) {
                    return item.event.name;
                });
                $scope.combinationCount = Utils.calculatePermutationCount($scope.state.selectedAnyCount, count);
                if ($scope.state.type === 'forecast') {
                    if ($scope.state.selectedAnyCount === 2) {
                        betType = 41;
                        $scope.combinationMessage = "Reverse Forecast";
                        return;
                    }
                    betType= 42;
                    $scope.combinationMessage = "Combination Forecast";
                    return;
                }
                $scope.combinationMessage = "Combination Tricast";
                betType = 44;
                return;
            }
            $scope.combinationCount = 1;
            var mapping = {1: "1st", 2: "2nd", 3: "3rd"};
            $scope.events = $scope.state.selectedItems.map(function(item, index) {
                return mapping[index + 1] + " " + item.event.name;
            });
            if ($scope.state.type === 'forecast') {
                betType = 40;
                $scope.combinationMessage = "Straight Forecast";
                return;
            }
            betType = 43;
            $scope.combinationMessage = "Straight Tricast";
        })();


        function doBet() {
            $scope.loading = true;
            var request = {
                "source":"betting",
                "mode":1,
                "each_way":false,
                "type": betType,
                "odd_type":0,
                "amount": $scope.stake * $scope.combinationCount
            };
            request.bets = $scope.state.selectedItems.map(function (item) {
                return {
                    "event_id": item.event.id,
                    "price": -1
                };
            });
            Zergling.get(request, 'do_bet').then(function (res) {
                if (res.result === 'OK') {
                    $scope.done = true;
                    return;
                }
                $scope.errorMessage = Translator.get(res.result_text || ("message_" + res.result));

            })['finally'](function () {
                $scope.loading = false;
            });
        }

        $scope.close = function () {
            $rootScope.$broadcast("globalDialogs.removeDialogsByTag", "forecast-tricast-bet-popup");
        };
        $scope.loginAndPlaceBet = function loginAndPlaceBet() {
            if (!$scope.stake) {
                return;
            }
            if ($rootScope.env.authorized) {
               doBet();
            } else {
                $rootScope.$broadcast("openLoginForm", {
                    callback: function () {
                        doBet();
                    }
                });
            }

        };

        /**
         * @ngdoc method
         * @name deposit
         * @methodOf betting.controller:betSlipController
         * @description calls partner callback function to open deposit page(integration mode)
         */
        $scope.openPartnerDeposit = function openPartnerDeposit() {
            partner.call('deposit', 'betslip');
        };

        $scope.$on("$destroy", function () {
            if ($scope.done) {
                $rootScope.$broadcast("forecastTricastFinished", $scope.state.gameId);
            }
        });
    }
]);

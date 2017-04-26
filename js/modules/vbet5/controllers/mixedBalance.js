/**
 * @ngdoc controller
 * @name vbet5.controller:mixedMyBetsCtrl extended from myBetsCtrl
 * @description
 *  New bet history controller.
 */
VBET5.controller('mixedBalanceCtrl', ['$scope', '$controller', 'Config', '$sce', 'Moment', '$filter', function($scope, $controller, Config, $sce, Moment, $filter) {
    'use strict';
    angular.extend(this, $controller('paymentsCtrl', {
        $scope: $scope
    }));

    angular.extend(this, $controller('balanceCtrl', {
        $scope: $scope
    }));

    $scope.requestData = {
        dateFrom: $scope.today,
        dateTo: $scope.today,
        live: false
    };
    $scope.datePickerFormat = Config.main.layoutTimeFormat[Config.main.sportsLayout] == 'MM/DD' ? Config.main.dateFormat.historyBalanceFormatDate : Config.main.dateFormat.datepicker;

    $scope.balanceHistoryParams.availableProducts = {};

    if (Config.main.sportEnabled || Config.main.GmsPlatform) {
        $scope.balanceHistoryParams.availableProducts[0] = 'Main'
    }

    if (Config.main.enableCasinoBalanceHistory) {
        $scope.balanceHistoryParams.availableProducts[1] = 'Casino'
    }

    $scope.currencyHolder = {};
    $scope.dateOptions = { showWeeks: 'false' };
    $scope.$sce = $sce;

    $scope.today = Moment.get().format("YYYY-MM-DD");
    $scope.datePickerLimits = {
        maxToDate: $scope.today,
        maxFromDate: $scope.today
    };


    if (Config.payments && Config.payments.length) {
        $scope.paymentSystems = Config.payments.reduce(function (accumulator, current) {
            if (!current.isTransferToLinkedService && (current.canDeposit || current.canWithdraw)) {
                accumulator.push(current);
            }
            return accumulator;
        }, []);
    }
    $scope.paymentFormData = {};

    $scope.selectFirstSystem = function selectFirstSystem () {
        var current_systems = $filter('faqPayment')($scope.paymentSystems, $scope.env.sliderContent, $scope.currencyHolder.selectedCurrency) || [];
        current_systems[0] && $scope.selectPaymentSystem(current_systems[0]);
    };

    $scope.$watch("env.sliderContent", function() {
        if ("deposit" === $scope.env.sliderContent || "withdraw" === $scope.env.sliderContent) {
            $scope.currencyHolder.selectedCurrency = $scope.currencyHolder.selectedCurrency || ($scope.env.authorized && $scope.profile ? $scope.profile.currency_name : $scope.conf.availableCurrencies[0]);
            if($scope.env.authorized){
                $scope.init($scope.env.sliderContent);
            } else if ($scope.currencyHolder) {
                $scope.selectFirstSystem();
            }
        }
    });



    $scope.loadMixedBalanceHistory = function loadMixedBalanceHistory() {
        $scope.loadBalanceHistory($scope.balanceHistoryParams.balanceCategory === '1' ? 'Casino' : false, {
            fromDate : $scope.balanceHistoryParams.dateRange.fromDate,
            toDate: $scope.balanceHistoryParams.dateRange.toDate
        });
    };

    var initialRange = {
        fromDate: Moment.get().subtract('week', 1).startOf('day').unix(),
        toDate: Moment.get().subtract('today').endOf('day').unix(),
        str: Moment.get().subtract('week', 1).format('MMMM YYYY'),
        type: 'month'
    };

    $scope.initMixedBalanceHistory = function initMixedBalanceHistory () {
        var balanceHistoryDataRangeChanged = $scope.$watch("balanceHistoryParams.dateRange", function() {
            if("balanceHistory" === $scope.env.sliderContent) {
                $scope.requestData.dateFrom = moment.unix($scope.balanceHistoryParams.dateRange.fromDate).format('YYYY-MM-DD');
                $scope.requestData.dateTo = moment.unix($scope.balanceHistoryParams.dateRange.toDate).format('YYYY-MM-DD');
                balanceHistoryDataRangeChanged();
            }
        }, true);

        if (!$scope.balanceHistoryParams.dateRange) {
            $scope.loadBalanceHistory($scope.balanceHistoryParams.balanceCategory === '1' ? 'Casino' : false, initialRange);
        }


    };

    $scope.adjustDate = function adjustDate(type) {
        switch (type) {
            case 'from':
                if (Moment.get($scope.requestData.dateFrom).unix() > Moment.get($scope.requestData.dateTo).unix()) {
                    $scope.requestData.dateTo = Moment.moment($scope.requestData.dateFrom).format("YYYY-MM-DD");
                }

                if (Moment.get($scope.requestData.dateFrom).add(1, "M").isAfter($scope.today)) {
                    $scope.datePickerLimits.maxToDate = $scope.today;
                } else {
                    $scope.requestData.dateTo = Moment.get($scope.requestData.dateFrom).add(1, "M").format("YYYY-MM-DD");
                    $scope.datePickerLimits.maxToDate = Moment.moment($scope.requestData.dateFrom).add(1, "M").format("YYYY-MM-DD");
                }

                break;
            case 'to':
                if (Moment.get($scope.requestData.dateFrom).unix() > Moment.get($scope.requestData.dateTo).unix()) {
                    $scope.requestData.dateFrom = Moment.moment($scope.requestData.dateTo).format("YYYY-MM-DD");
                    $scope.datePickerLimits.maxToDate = Moment.moment($scope.requestData.dateFrom).add(1, "M").format("YYYY-MM-DD");
                }
                break;
        }

        $scope.balanceHistoryParams.dateRange.fromDate = Moment.get(Moment.moment($scope.requestData.dateFrom).format().split('T')[0] + 'T00:00:00').unix();
        $scope.balanceHistoryParams.dateRange.toDate = Moment.get(Moment.moment($scope.requestData.dateTo).format().split('T')[0] + 'T23:59:59').unix();
    };

}]);
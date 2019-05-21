/**
 * @ngdoc controller
 * @name vbet5.controller:mixedBalanceCtrl extended from myBetsCtrl
 * @description
 *  New bet history controller.
 */
VBET5.controller('mixedBalanceCtrl', ['$scope', '$controller', 'Config', '$sce', 'Moment', '$filter', '$rootScope', 'Zergling', 'content', 'analytics','$location', function($scope, $controller, Config, $sce, Moment, $filter, $rootScope, Zergling, content, analytics, $location) {
    'use strict';
    angular.extend(this, $controller('paymentsCtrl', {
        $scope: $scope
    }));

    angular.extend(this, $controller('balanceCtrl', {
        $scope: $scope
    }));

    Moment.setLang(Config.env.lang);
    Moment.updateMonthLocale();
    Moment.updateWeekDaysLocale();

    $scope.balanceHistoryFilter = 'all';
    $scope.requestData = {
        dateFrom: $scope.today,
        dateTo: $scope.today,
        live: false
    };
    $scope.datePickerFormat = Config.main.layoutTimeFormat[Config.main.sportsLayout] === 'MM/DD' ? Config.main.dateFormat.historyBalanceFormatDate : Config.main.dateFormat.datepicker;

    $scope.balanceHistoryParams.availableProducts = {};

    if ($rootScope.calculatedConfigs.sportEnabled) {
        $scope.balanceHistoryParams.availableProducts[0] = 'Main';
    }

    if (Config.main.enableCasinoBalanceHistory && $rootScope.casinoEnabled &&($rootScope.calculatedConfigs.casinoEnabled || $rootScope.calculatedConfigs.livedealerEnabled)) {
        $scope.balanceHistoryParams.availableProducts[1] = 'Casino';
    }

    $scope.currencyHolder = {};
    $scope.dateOptions = { showWeeks: 'false' };
    $scope.$sce = $sce;

    $scope.today = Moment.get().lang("en").format("YYYY-MM-DD");
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

    $scope.$watch("env.sliderContent", function(sliderContent) {
        if (sliderContent === 'deposit' || sliderContent === 'withdraw') {
            analytics.gaSend('send', 'event', 'slider', 'open slider',  {'page': $location.path(), 'eventLabel': sliderContent});
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
                $scope.requestData.dateFrom = moment.unix($scope.balanceHistoryParams.dateRange.fromDate).lang("en").format('YYYY-MM-DD');
                $scope.requestData.dateTo = moment.unix($scope.balanceHistoryParams.dateRange.toDate).lang("en").format('YYYY-MM-DD');
                balanceHistoryDataRangeChanged();
            }
        }, true);

        if (!$scope.balanceHistoryParams.dateRange) {
            $scope.loadBalanceHistory($scope.balanceHistoryParams.balanceCategory === '1' ? 'Casino' : false, initialRange);
        }


    };

    $scope.adjustDate = function adjustDate(type) {
        var monthCount = $scope.balanceHistoryFilter === 'all' ? (Config.main.balanceHistoryMonthCount || 1) : 3;
        switch (type) {
            case 'from':
                if (Moment.get($scope.requestData.dateFrom).unix() > Moment.get($scope.requestData.dateTo).unix()) {
                    $scope.requestData.dateTo = Moment.moment($scope.requestData.dateFrom).lang("en").format("YYYY-MM-DD");
                }

                if (Moment.get($scope.requestData.dateFrom).add(monthCount, "M").isAfter($scope.today)) {
                    $scope.datePickerLimits.maxToDate = $scope.today;
                } else {
                    $scope.requestData.dateTo = Moment.get($scope.requestData.dateFrom).add(monthCount, "M").lang("en").format("YYYY-MM-DD");
                    $scope.datePickerLimits.maxToDate = Moment.moment($scope.requestData.dateFrom).add(monthCount, "M").lang("en").format("YYYY-MM-DD");
                }

                break;
            case 'to':
                if (Moment.get($scope.requestData.dateFrom).unix() > Moment.get($scope.requestData.dateTo).unix()) {
                    $scope.requestData.dateFrom = Moment.moment($scope.requestData.dateTo).lang("en").format("YYYY-MM-DD");
                    $scope.datePickerLimits.maxToDate = Moment.moment($scope.requestData.dateFrom).add(monthCount, "M").lang("en").format("YYYY-MM-DD");
                }
                break;
        }

        $scope.balanceHistoryParams.dateRange.fromDate = Moment.get(Moment.moment($scope.requestData.dateFrom).format().split('T')[0] + 'T00:00:00').unix();
        $scope.balanceHistoryParams.dateRange.toDate = Moment.get(Moment.moment($scope.requestData.dateTo).format().split('T')[0] + 'T23:59:59').unix();
    };


    /**
     * @ngdoc function
     * @name filterBalanceHistory
     * @methodOf vbet5.controller:mixedBalanceCtrl
     * @description  Filters balance history tabs
     * @param {String} status: all - all transactions, net - net deposit
     */
    $scope.filterBalanceHistory = function filterBalanceHistory(status) {
        if ($scope.balanceHistoryFilter === status) { return; }
        $scope.balanceHistoryFilter = status;
        switch (status) {
            case 'net':
                $scope.loadNetDeposit();
                break;
            default:
                $scope.adjustDate('from');
                $scope.loadMixedBalanceHistory();
        }
    };


    /**
     * @ngdoc function
     * @name loadNetDeposit
     * @methodOf vbet5.controller:mixedBalanceCtrl
     * @description  Loads net deposit history
     */
    $scope.loadNetDeposit = function loadNetDeposit() {
        $scope.balanceHistoryLoaded = false;
        $scope.netDepositHistoryTotal = {};
        Zergling.get(
            {
                'from_date': $scope.balanceHistoryParams.dateRange.fromDate,
                'to_date': $scope.balanceHistoryParams.dateRange.toDate
            },
            'get_client_net_deposit_withdraw_history'
        ).then(
            function success(response) {
                if (response.details && response.details.Objects) {
                    $scope.netDepositHistory = response.details.Objects;
                    if ($scope.netDepositHistory.length && response.details.Totals) {
                        $scope.netDepositHistoryTotal = response.details.Totals;
                    }
                } else {
                    $scope.netDepositHistory = [];
                    $rootScope.$broadcast("globalDialogs.addDialog", {
                        type: 'error',
                        title: 'Error',
                        content: 'Failed to load net deposit history'
                    });
                }
            }
        )['finally'](function stopLoader() { $scope.balanceHistoryLoaded = true; });
    };

    /**
     * @ngdoc function
     * @name loadPaymentInfoFromCMS
     * @methodOf vbet5.controller:mixedBalanceCtrl
     * @description  load payment info from cms with slug payment-info
     */
    function loadPaymentInfoFromCMS() {
        var paymentInfoSlugs = {
            "deposit": "deposit-bottom-text",
        };
        content.getPage("payment-info-" + $rootScope.env.lang, true).then(function (response) {
            if (response.data && response.data.page && response.data.page.children) {
                $scope.cmsPaymentInfo = $scope.cmsPaymentInfo || {};
                response.data.page.children.forEach(function processItem(item) {
                    for (var key in paymentInfoSlugs) {
                        if (paymentInfoSlugs.hasOwnProperty(key)) {
                            if (item.slug === paymentInfoSlugs[key]) {
                                $scope.cmsPaymentInfo[key] = $sce.trustAsHtml(item.content);
                                break;
                            }
                        }
                    }

                });
            }
        });
    }

    (function init() { loadPaymentInfoFromCMS(); })();

}]);

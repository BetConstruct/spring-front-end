VBET5.controller('profitLossCtrl', ['$rootScope', '$scope', '$controller', '$location', 'Config', 'GameInfo', 'Moment', 'Utils', 'Zergling', function ($rootScope, $scope, $controller, $location, Config, GameInfo, Moment, Utils, Zergling) {

    // Initialize the super class and extend it.
    angular.extend(this, $controller('myBetsCtrl', {
        $scope: $scope
    }));

    Moment.setLang(Config.env.lang);
    Moment.updateMonthLocale();
    Moment.updateWeekDaysLocale();

    /**
     * @ngdoc method
     * @name initFactory
     * @methodOf vbet5.controller:profitLossCtr
     * @description Factory initialization
     */
    function initFactory(key, initialData) {
        return function (key2) {
            if (key2) {
                $scope[key][key2] = angular.copy(initialData)[key2];
            } else {
                $scope[key] = angular.copy(initialData);
            }

        };
    }

    var initRequestData =  initFactory('requestData', {
        "Sportsbook": {
            dateFrom: undefined,
            dateTo: undefined
        },
        "Casino": {
            dateFrom: undefined,
            dateTo: undefined
        }
    });

    var initDatePickerLimits = initFactory('datePickerLimits', {
        "Sportsbook": {
            'minFromDate': undefined,
            'maxFromDate': $scope.today,
            'minToDate': undefined,
            'maxToDate': $scope.today
        },
        "Casino": {
            'minFromDate': undefined,
            'maxFromDate': $scope.today,
            'minToDate': undefined,
            'maxToDate': $scope.today
        }
    });

    /**
     * @ngdoc method
     * @name initBetHistory
     * @methodOf vbet5.controller:profitLossCtr
     * @description init function. Set initial state for Mixed BetHistory and populate filters
     */
    function initBetHistory() {
        var productMode = "";
        if (Config.env.authorized) {
            if (Config.env.sliderContent === 'profitsCasino') {
                productMode = 'Casino';
            } else {
                productMode = 'Sportsbook';
            }

            $scope.customPeriodApplied = {
                "Sportsbook": false,
                "Casino": false
            };
            $scope.selectBetHistoryTimePeriod($scope.selectedUpcomingPeriod[$scope.productMode], "Sportsbook");
            $scope.selectBetHistoryTimePeriod($scope.selectedUpcomingPeriod[$scope.productMode], "Casino");
            $scope.getBetHistory(productMode, true);
        } else {
            $rootScope.loginRestored.then($scope.getBetHistory);
        }
    }

    /**
     * @ngdoc method
     * @name initScope
     * @methodOf vbet5.controller:profitLossCtr
     * @description Initialization
     */
    function initScope() {
        $scope.today = Moment.get().lang("en").format("YYYY-MM-DD");
        $scope.productMode = 'Sportsbook';
        var datePickerFormat = Config.main.layoutTimeFormat[Config.main.sportsLayout] == 'MM/DD' ? Config.main.dateFormat.historyBalanceFormatDate : Config.main.dateFormat.datepicker;

        $scope.datePickerFormat = {
            "Sportsbook": datePickerFormat,
            "Casino": datePickerFormat
        };
        $scope.betHistoryParams = {
            "Sportsbook": {
                dateRange: {
                    fromDate: undefined,
                    toDate: undefined
                }
            },
            "Casino": {
                dateRange: {
                    fromDate: undefined,
                    toDate: undefined
                }
            }
        };

        $scope.upcomingPeriods = Utils.clone(Config.main.upcomingGamesPeriods);
        //$scope.upcomingPeriods.unshift(0);  // @TODO removed 'all' upcoming period.  must  restore if backend will work correctly
        var selectedUpcomingPeriod = $scope.upcomingPeriods[Config.main.defaultBetHistoryPeriodIndex !== undefined ? Config.main.defaultBetHistoryPeriodIndex : 5]; //default period is 24h

        $scope.selectedUpcomingPeriod = {
            "Sportsbook": selectedUpcomingPeriod,
            "Casino": selectedUpcomingPeriod
        };

        $scope.dateOptions = {showWeeks: 'false'};

        $scope.expandState = Config.main.expandAllInBetHistory;
        $scope.betStatusFilter = undefined;
        $scope.betTypeSelector = undefined;

        initDatePickerLimits();
        initRequestData();
        initBetHistory();
    }


    $scope.$on('loadMixedBetHistory', function () {
        $scope.getBetHistory($scope.productMode);
    });


    initDatePickerLimits();

    initRequestData();

    /**
     * @ngdoc method
     * @name adjustDate
     * @description adjusted 'FromDate' dataPicker if FromDate is higher than ToDate and vice versa
     * @param {String}  type;
     * @methodOf vbet5.controller:profitLossCtr
     */
    $scope.adjustDate = function (type) {
        var monthCount = 3;
        switch (type) {
            case 'from':
                if (Moment.get($scope.requestData[$scope.productMode].dateFrom).unix() > Moment.get($scope.requestData[$scope.productMode].dateTo).unix()) {
                    $scope.requestData[$scope.productMode].dateTo = Moment.moment($scope.requestData[$scope.productMode].dateFrom).lang("en").format("YYYY-MM-DD");
                }

                if (Moment.get($scope.requestData[$scope.productMode].dateFrom).add(monthCount, "M").isAfter($scope.today)) {
                    $scope.datePickerLimits[$scope.productMode].maxToDate = $scope.today;
                } else {
                    $scope.requestData[$scope.productMode].dateTo = Moment.get($scope.requestData[$scope.productMode].dateFrom).add(monthCount, "M").lang("en").format("YYYY-MM-DD");
                    $scope.datePickerLimits[$scope.productMode].maxToDate = Moment.moment($scope.requestData[$scope.productMode].dateFrom).add(monthCount, "M").lang("en").format("YYYY-MM-DD");
                }
                break;
            case 'to':
                if (Moment.get($scope.requestData[$scope.productMode].dateFrom).unix() > Moment.get($scope.requestData[$scope.productMode].dateTo).unix()) {
                    $scope.requestData[$scope.productMode].dateFrom = Moment.moment($scope.requestData[$scope.productMode].dateTo).lang("en").format("YYYY-MM-DD");
                }
                break;
        }

        $scope.customPeriodApplied[$scope.productMode] = true;
        $scope.selectedUpcomingPeriod[$scope.productMode] = 0;
        $scope.betHistoryParams[$scope.productMode].dateRange.fromDate = Moment.get(Moment.moment($scope.requestData[$scope.productMode].dateFrom).format().split('T')[0] + 'T00:00:00').unix();
        $scope.betHistoryParams[$scope.productMode].dateRange.toDate = Moment.get(Moment.moment($scope.requestData[$scope.productMode].dateTo).format().split('T')[0] + 'T23:59:59').unix();
    };

    /**
     * @ngdoc method
     * @name selectBetHistoryTimePeriod
     * @methodOf vbet5.controller:profitLossCtr
     * @description  sets bet history time period
     * @param {Number} hours number of hours, 0 for no filtering
     * @param {String} productMode
     */
    $scope.selectBetHistoryTimePeriod = function selectBetHistoryTimePeriod(hours, productMode) {
        var fromDate, toDate;
        if (hours) {
            fromDate = Moment.get().unix() - hours * 3600;
            toDate = Moment.get().unix();
        }
        if (!productMode) {
            productMode = $scope.productMode;
        }

        $scope.betHistoryParams[productMode].dateRange.fromDate = fromDate;
        $scope.betHistoryParams[productMode].dateRange.toDate = toDate;

        $scope.selectedUpcomingPeriod[productMode] = hours;
        $scope.customPeriodApplied[productMode] = false;
        $scope.openedTo = false;
        $scope.openedFrom = false;

        initRequestData(productMode);
        initDatePickerLimits(productMode);
    };

    /**
     * @ngdoc method
     * @name openFrom
     * @methodOf vbet5.controller:profitLossCtr
     * @description hide 'date to' picker and show or hide 'date from' picker
     */
    $scope.openFrom = function openFrom($event) {
        $event.preventDefault();
        $event.stopPropagation();

        $scope.openedTo = false;
        $scope.openBetTypeFilter = false;
        $scope.openedFrom = !$scope.openedFrom;
        $scope.periodDropdownOpened = false;
    };

    /**
     * @ngdoc method
     * @name openTo
     * @methodOf vbet5.controller:profitLossCtr
     * @description hide 'date from' picker and show or hide 'date to' picker
     */
    $scope.openTo = function openTo($event) {
        $event.preventDefault();
        $event.stopPropagation();

        $scope.openedFrom = false;
        $scope.openBetTypeFilter = false;
        $scope.openedTo = !$scope.openedTo;
        $scope.periodDropdownOpened = false;
    };


    /**
     * @ngdoc function
     * @name getBetHistory
     * @methodOf vbet5.controller:profitLossCtr
     * @description  Filters bet history tabs
     * @param {String } [newStatus]
     * @param {boolean } [force]
     */
    $scope.getBetHistory = function getBetHistory(newStatus, force) {
        var previousStatus = $scope.productMode;
        if (newStatus !== previousStatus || force) {
            $scope.productMode = newStatus;
            $scope.betHistoryParams[$scope.productMode].betTypeSelector = undefined;
            $scope.openBetTypeFilter = false;
            $scope.betHistoryParams[$scope.productMode].betIdFilter = null;
            // User clicked the 'Profit/Loss' tab for the first time so we load the data and unsubscribe from cash out events
            $scope.unsubscribeFromCashOut();
            $scope.loadProfitLoss(newStatus);
        }
    };


    $scope.$watch('betHistory', function () {
        angular.forEach($scope.betHistory, function(b) {
            if (!b.parent_bet_id) {
                b.totalAmount = (b.bonus_bet_amount ? b.bonus_bet_amount : '' + b.amount ? b.amount : '').toString();
            }
        });
        },true);


    /**
     * @ngdoc function
     * @name loadProfitLoss
     * @methodOf vbet5.controller:profitLossCtr
     * @description  Loads profit/loss history
     */
    $scope.loadProfitLoss = function loadProfitLoss(type) {
        $scope.betHistoryLoaded = false;
        $scope.casinoHistoryLoaded = false;

        var command, success, stopLoader;
        var params = {
            'from_date': $scope.betHistoryParams[$scope.productMode].dateRange.fromDate,
            'to_date': $scope.betHistoryParams[$scope.productMode].dateRange.toDate
        };

        var noData = function (propertyName) {
            $scope[propertyName] = [];
            $scope.profitLossTotal = {};
            $rootScope.$broadcast("globalDialogs.addDialog", {
                type: 'error',
                title: 'Error',
                content: 'Failed to load bet history'
            });
        };

        if (type === 'Sportsbook') {
            command = 'get_bet_pl_history';
            success = function success(response) {
                if (response.details && response.details.bet_pl_objects && response.details.bet_pl_totals) {
                    $scope.betHistory = response.details.bet_pl_objects;
                    $scope.profitLossTotal = response.details.bet_pl_totals;

                    $scope.addIconAndTextInfo($scope.betHistory);

                } else {
                    noData('betHistory');
                }
            };
            stopLoader = function () {
                $scope.betHistoryLoaded = true;
            };
        } else if (type === 'Casino') {
            command = 'get_casino_pl_history';
            success = function success(response) {
                if (response.details && response.details.Rows) {
                    $scope.casinoHistory = response.details.Rows;
                    $scope.profitLossTotal = {
                        TotalBet: response.details.TotalBet,
                        TotalWin: response.details.TotalWin
                    };
                } else {
                    noData('casinoHistory');
                }
            };
            stopLoader = function () {
                $scope.casinoHistoryLoaded = true;
            };
        } else {
            return false;
        }
        Zergling.get(params, command).then(success)['finally'](stopLoader);
    };

    initScope();
}]);

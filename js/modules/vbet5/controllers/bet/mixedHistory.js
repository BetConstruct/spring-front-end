/* global VBET5 */
/**
 * @ngdoc controller
 * @name vbet5.controller:mixedMyBetsCtrl extended from myBetsCtrl
 * @description
 *  New bet history controller.
 */
VBET5.controller('mixedMyBetsCtrl', ['$rootScope', '$scope', '$controller', '$location', 'Config', 'GameInfo', 'Moment', 'Utils', 'BetService', 'Zergling', '$timeout', function($rootScope, $scope, $controller, $location, Config, GameInfo, Moment, Utils, BetService, Zergling, $timeout) {
    'use strict';


    // Initialize the super class and extend it.
    angular.extend(this, $controller('myBetsCtrl', {
        $scope: $scope
    }));

    Moment.setLang(Config.env.lang);
    Moment.updateMonthLocale();
    Moment.updateWeekDaysLocale();
    $scope.betConf = Config.betting;
    var timeZone = Config.env.selectedTimeZone || '';

    $scope.recalculatedBetsDataMap = {};

    /**
     * @ngdoc method
     * @name initFactory
     * @methodOf vbet5.controller:mixedMyBetsCtrl
     * @description Factory initialization
     */
    function initFactory (key, initialData) {
        return function () {
            $scope[key] = angular.copy(initialData);
        };
    }

    /**
     * @ngdoc method
     * @name initScope
     * @methodOf vbet5.controller:mixedMyBetsCtrl
     * @description Initialization
     */
    function initScope() {
        $scope.today = Moment.get().lang("en").format("YYYY-MM-DD");
        $scope.productMode = 'Sportsbook';
        $scope.datePickerFormat = Config.main.layoutTimeFormat[Config.main.sportsLayout] == 'MM/DD' ?  Config.main.dateFormat.historyBalanceFormatDate : Config.main.dateFormat.datepicker;

        $scope.betHistoryParams.dateRange = {
            fromDate: undefined,
            toDate: undefined
        };

        $scope.upcomingPeriods = Utils.clone(Config.main.upcomingGamesPeriods);
        //$scope.upcomingPeriods.unshift(0);  // @TODO removed 'all' upcoming period.  must  restore if backend will work correctly
        $scope.selectedUpcomingPeriod = $scope.upcomingPeriods[Config.main.defaultBetHistoryPeriodIndex !== undefined ? Config.main.defaultBetHistoryPeriodIndex : 5]; //default period is 24h
        $scope.dateOptions = { showWeeks: 'false' };

        $scope.expandState = Config.main.expandAllInBetHistory;
        $scope.betTypeSelector = undefined;
        $scope.betTypes = BetService.constants.betTypes;

        initMixedBetHistory();
    }

    /**
     * @ngdoc method
     * @name loadMixedBetHistory
     * @methodOf vbet5.controller:mixedMyBetsCtrl
     * @param {String}  product name
     * @description Load Mixed Bet History for specified product
     */
    $scope.loadMixedBetHistory = function loadMixedBetHistory(product) {
        if (product) {
            $scope.productMode = product;
            initDatePickerLimits();
            initBetEventCounts();
            initRequestData();

            if (product  === 'Casino') {
                $scope.requestData.dateFrom = Moment.moment($scope.today).add(-1, "w").lang("en").format("YYYY-MM-DD");
                $scope.requestData.dateTo = $scope.today;
                $scope.betHistoryParams.betTypeSelector = undefined;
                $scope.betHistoryParams.betIdFilter = null;
                $scope.adjustDate();
                $scope.customPeriodApplied = true;
            } else {
                $scope.customPeriodApplied = false;
                $scope.selectBetHistoryTimePeriod($scope.selectedUpcomingPeriod); // prepare data range for selected (or default) period
            }
        }

        var betHistoryLoadingCallback = function betHistoryLoadingCallback() {
            if($scope.expandState){
                $scope.expandCollapseAll($scope.expandState);
            }
        };

        $scope.loadBetHistory(product === 'Casino' ? 'Casino' : undefined, betHistoryLoadingCallback);

    };

    $scope.$on('loadMixedBetHistory', $scope.loadMixedBetHistory);

    var initDatePickerLimits = initFactory('datePickerLimits', {
        'minFromDate': undefined,
        'maxFromDate': $scope.today,
        'minToDate': undefined,
        'maxToDate': $scope.today
    });
    initDatePickerLimits();



    var initBetEventCounts = initFactory('betEventCounts', {
        'all': 0,
        'unsettled': 0,
        'lost': 0,
        'returned': 0,
        'won': 0,
        'cashout': 0,
        'wonReturn': 0,
        'lostReturn': 0
    });
    initBetEventCounts();

    var initRequestData = initFactory('requestData', {
        dateFrom: undefined,
        dateTo: undefined
    });
    initRequestData();

    /**
     * @ngdoc method
     * @name getBetRecalculationInfo
     * @methodOf vbet5.controller:mixedMyBetsCtrl
     *
     * @param {Array} betIds the ids of bets
     */
    function getBetRecalculationInfo(betIds) {
        if (betIds.length && Config.main.betHistory.enableRecalculationNoteColumn) {
            Zergling.get({bet_ids: betIds}, 'get_bet_recalculation_reason').then(function (response) {
                if (response.result === 0 && response.details) {
                    angular.forEach(response.details, function (detail, key) {
                        $scope.recalculatedBetsDataMap[key] = {};
                        for (var i = detail.length; i--;) {
                            $scope.recalculatedBetsDataMap[key][detail[i].SelectionId] = detail[i].ExternalReason;
                        }
                    });
                }
            });
        }
    }

    /**
     * @ngdoc method
     * @name expandCollapseAll
     * @methodOf vbet5.controller:mixedMyBetsCtrl
     * @description expand/collapse all bets
     */
    $scope.expandCollapseAll = function expandCollapseAll(state) {
        var recalculatedIds = [];

        angular.forEach($scope.betHistory, function(b) {
            b.expand = state;

            if (state && b.has_recalculation_reason && !$scope.recalculatedBetsDataMap[b.id]) {
                recalculatedIds.push(b.id);
            }
        });

        getBetRecalculationInfo(recalculatedIds);

        $scope.expandState = state;
    };

    /**
     * @ngdoc method
     * @name betEventsCalculator
     * @methodOf vbet5.controller:mixedMyBetsCtrl
     * @description calculate bet Event Statuses
     */
    var betEventsCalculator = function betEventsCalculator() {
        if ($scope.betStatusFilter === - 1) {
            for (var i = $scope.betHistory.length; i--; ) {
                $scope.betHistory[i].totalAmount = $scope.betHistory[i].amount.toString();
            }

            return;
        }
        initBetEventCounts();

        angular.forEach($scope.betHistory, function(b) {
            if (!b.parent_bet_id) {
                switch (parseInt(b.outcome)) {
                    case 0:
                        $scope.betEventCounts.unsettled++;
                        break;
                    case 1:
                        $scope.betEventCounts.lost++;
                        break;
                    case 2:
                        $scope.betEventCounts.returned++;
                        break;
                    case 3:
                        $scope.betEventCounts.won++;
                        break;
                    case 5:
                        $scope.betEventCounts.cashout++;
                        break;
                    case 11:
                        $scope.betEventCounts.wonReturn++;
                        break;
                    case 12:
                        $scope.betEventCounts.lostReturn++;
                        break;
                }

                $scope.betEventCounts.all++;
                b.totalAmount = (b.bonus_bet_amount ? b.bonus_bet_amount : '' + b.amount ? b.amount : '').toString();
            }
        });
    };

    $scope.$watch('betHistory', function () {
            betEventsCalculator();
        }, true);

    /**
     * @ngdoc method
     * @name initMixedBetHistory
     * @methodOf vbet5.controller:mixedMyBetsCtrl
     * @description init function. Set initial state for Mixed BetHistory and populate filters
     */
    function initMixedBetHistory() {
        if (Config.env.authorized) {
            if (Config.env.sliderContent === 'casinoBetHistory') {
                $scope.productMode = 'Casino';
            } else {
                $scope.productMode = 'Sportsbook';
            }
            $scope.loadMixedBetHistory($scope.productMode);
        } else {
            $rootScope.loginRestored.then($scope.loadMixedBetHistory);
        }
    }

    /**
     * @ngdoc method
     * @name adjustDate
     * @description adjusted 'FromDate' dataPicker if FromDate is higher than ToDate and vice versa
     * @param {String}  filter type;
     * @methodOf vbet5.controller:mixedMyBetsCtrl
     */
    $scope.adjustDate = function adjustDate(type) {
        var monthCount = Config.main.mixedViewMonthRange || 1;
        if ($scope.betStatusFilter !== - 1) {
            switch (type) {
                case 'from':
                    if (Moment.get($scope.requestData.dateFrom).unix() > Moment.get($scope.requestData.dateTo).unix()) {
                        $scope.requestData.dateTo = Moment.moment($scope.requestData.dateFrom).lang("en").format("YYYY-MM-DD");
                    }
                    if ($scope.productMode === "Sportsbook") {
                        if (Moment.get($scope.requestData.dateFrom).add(monthCount, "M").isAfter($scope.today)){
                            $scope.datePickerLimits.maxToDate = $scope.today;
                        } else {
                            $scope.requestData.dateTo = Moment.get($scope.requestData.dateFrom).add(monthCount, "M").lang("en").format("YYYY-MM-DD");
                            $scope.datePickerLimits.maxToDate = Moment.moment($scope.requestData.dateFrom).add(monthCount, "M").lang("en").format("YYYY-MM-DD");
                        }
                    } else {
                        if (Moment.get($scope.requestData.dateFrom).add(1, "w").isAfter($scope.today)){
                            $scope.datePickerLimits.maxToDate = $scope.today;
                        } else {
                            $scope.requestData.dateTo = Moment.get($scope.requestData.dateFrom).add(1, "w").lang("en").format("YYYY-MM-DD");
                            $scope.datePickerLimits.maxToDate = Moment.moment($scope.requestData.dateFrom).add(1, "w").lang("en").format("YYYY-MM-DD");
                        }
                    }

                    break;
                case 'to':
                    if (Moment.get($scope.requestData.dateFrom).unix() > Moment.get($scope.requestData.dateTo).unix()) {
                        $scope.requestData.dateFrom = Moment.moment($scope.requestData.dateTo).lang("en").format("YYYY-MM-DD");
                    }
                    break;
            }
            $scope.betHistoryParams.dateRange.toDate = Moment.get(Moment.moment($scope.requestData.dateTo).format().split('T')[0] + 'T23:59:59' + timeZone).unix();
        }

        $scope.customPeriodApplied = true;
        $scope.selectedUpcomingPeriod = 0;
        $scope.betHistoryParams.dateRange.fromDate = Moment.get(Moment.moment($scope.requestData.dateFrom).format().split('T')[0] + 'T00:00:00' + timeZone).unix();
    };

    /**
     * @ngdoc method
     * @name selectBetHistoryTimePeriod
     * @methodOf vbet5.controller:mixedMyBetsCtrl
     * @description  sets bet history time period
     * @param {Number} hours number of hours, 0 for no filtering
     */
    $scope.selectBetHistoryTimePeriod = function selectBetHistoryTimePeriod(hours) {
        var fromDate, toDate;
        if (hours) {
            fromDate = Moment.get().unix() - hours * 3600;
            toDate = Moment.get().unix();
        }

        $scope.betHistoryParams.dateRange.fromDate = fromDate;
        $scope.betHistoryParams.dateRange.toDate = toDate;

        $scope.selectedUpcomingPeriod = hours;
        $scope.customPeriodApplied = false;
        $scope.openedTo = false;
        $scope.openedFrom = false;

        initRequestData();
        initDatePickerLimits();
    };

    /**
     * @ngdoc method
     * @name openFrom
     * @methodOf vbet5.controller:mixedMyBetsCtrl
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
     * @methodOf vbet5.controller:mixedMyBetsCtrl
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
     * @ngdoc method
     * @name toggleBetDetails
     * @methodOf vbet5.controller:mixedMyBetsCtrl
     * @description toggles bet details and in the expanded case, if there is a recalculated note, gets it
     *
     * @param {Object} bet the bet object
    */
    $scope.toggleBetDetails = function toggleBetDetails(bet) {
        bet.expand = !bet.expand;

        if (bet.expand && bet.has_recalculation_reason && !$scope.recalculatedBetsDataMap[bet.id]) {
            getBetRecalculationInfo([bet.id]);
        }
    };

    $scope.copyIdState = {
        copiedId: false
    }
    var timeout;

    /**
     * @ngdoc method
     * @name copyToClipboard
     * @methodOf vbet5.controller:mixedMyBetsCtrl
     * @description Copy to clipboard
     */
    $scope.copyToClipboard = function copyToClipboard(id) {
        $scope.copyIdState.copiedId = id;
        $timeout.cancel(timeout);
        Utils.copyToClipboard(id);
        timeout = $timeout(function (){
            $scope.copyIdState.copiedId = false;
        }, 3000);
    };

    initScope();

    (function hasTax() {
        var taxEnabled = false;

        if ($rootScope.partnerConfig && ($rootScope.partnerConfig.tax_integration_type === 0 || $rootScope.partnerConfig.tax_integration_type === 1)) {
            if ($rootScope.partnerConfig.tax_type === 1 || $rootScope.partnerConfig.tax_type === 2) {
                taxEnabled = true;
            } else if ($rootScope.partnerConfig.tax_amount_ranges && $rootScope.partnerConfig.tax_amount_ranges.length) {
                for (var i = $rootScope.partnerConfig.tax_amount_ranges.length; i--;) {
                    var currentType = $rootScope.partnerConfig.tax_amount_ranges[i].type;
                    if (currentType === 1 || currentType === 2) {
                        taxEnabled = true;
                        break;
                    }
                }
            }
        }

        $scope.taxEnabled = taxEnabled;
    })();
}]);

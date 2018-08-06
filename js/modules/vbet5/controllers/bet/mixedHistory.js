/**
 * @ngdoc controller
 * @name vbet5.controller:mixedMyBetsCtrl extended from myBetsCtrl
 * @description
 *  New bet history controller.
 */
VBET5.controller('mixedMyBetsCtrl', ['$rootScope', '$scope', '$controller', '$location', 'Config', 'GameInfo', 'Moment', 'Utils', 'Zergling', function($rootScope, $scope, $controller, $location, Config, GameInfo, Moment, Utils, Zergling) {
    'use strict';

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
        $scope.betStatusFilter = undefined;
        $scope.betTypeSelector = undefined;

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
        } else {
            $scope.unsubscribeFromCashOut();
        }

        var betHistoryLoadingCallback = function betHistoryLoadingCallback(){
            if(Config.main.expandAllInBetHistory){
                $scope.expandCollapseAll($scope.expandState);
            }
        };

        if ($scope.productMode === 'Casino') {
            $scope.loadBetHistory('Casino', betHistoryLoadingCallback);
        } else {
            $scope.loadBetHistory(undefined, betHistoryLoadingCallback);
        }

    };

    $scope.$on('loadMixedBetHistory', function() { $scope.loadMixedBetHistory(); });

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
        'cashout': 0
    });
    initBetEventCounts();

    var initRequestData = initFactory('requestData', {
        dateFrom: undefined,
        dateTo: undefined
    });
    initRequestData();

    /**
     * @ngdoc method
     * @name expandCollapseAll
     * @methodOf vbet5.controller:mixedMyBetsCtrl
     * @description expand/collapse all bets
     */
    $scope.expandCollapseAll = function expandCollapseAll(state) {
        angular.forEach($scope.betHistory, function(b) {
            b.expand = state;
        });

        $scope.expandState = state;
    };

    $scope.openCorrespondingGame = function openCorrespondingGame (event) {
        var game = $scope.gamePointers[event.game_id];
        if(game && GameInfo.getVirtualSportIds().indexOf(parseInt(game.sport.id, 10)) === -1) {
            $location.search({
                'type': game.type === '0' ? 0 : 1,
                'sport': game.sport.id,
                'region': game.region,
                'competition': game.competition,
                'game': game.game
            });

            var neededPath = Utils.getPathAccordintToAlias(game.sport.alias);
            $location.path(neededPath);

            $scope.env.showSlider = false;
            $scope.env.sliderContent = '';
        }
    };

    /**
     * @ngdoc method
     * @name betEventsCalculator
     * @methodOf vbet5.controller:mixedMyBetsCtrl
     * @description calculate bet Event Statuses
     */
    var betEventsCalculator = function betEventsCalculator() {
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
                }

                $scope.betEventCounts.all++;
                b.totalAmount = (b.bonus_bet_amount ? b.bonus_bet_amount : '' + b.amount ? b.amount : '').toString();
            }
        });
    };

    $scope.$watch('betHistory', function () {
            betEventsCalculator();
        }
        , true);

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
        var monthCount = $scope.betStatusFilter === -1 ? 3 : (Config.main.mixedViewMonthRange || 1);
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

        $scope.customPeriodApplied = true;
        $scope.selectedUpcomingPeriod = 0;
        $scope.betHistoryParams.dateRange.fromDate = Moment.get(Moment.moment($scope.requestData.dateFrom).format().split('T')[0] + 'T00:00:00').unix();
        $scope.betHistoryParams.dateRange.toDate = Moment.get(Moment.moment($scope.requestData.dateTo).format().split('T')[0] + 'T23:59:59').unix();
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
     * @ngdoc function
     * @name filterBetHistory
     * @methodOf vbet5.controller:mixedMyBetsCtrl
     * @description  Filters bet history tabs
     * @param {Number} [newStatus]: undefined - all bets, 0 - open, 1 - lost, 2 - returned, 3 - won, 5 - cashed out, -1 - profit/loss tab
     */
    $scope.filterBetHistory = function filterBetHistory(newStatus) {
        var previousStatus = $scope.betStatusFilter;
        if (newStatus !== previousStatus) {
            $scope.betStatusFilter = newStatus;
            if (newStatus === -1) {
                $scope.betHistoryParams.betTypeSelector = undefined;
                $scope.openBetTypeFilter = false;
                $scope.betHistoryParams.betIdFilter = null;
                // User clicked the 'Profit/Loss' tab for the first time so we load the data and unsubscribe from cash out events
                $scope.unsubscribeFromCashOut();
                $scope.loadProfitLoss();
            } else if (previousStatus === -1) {
                // User clicked away from the 'Profit/Loss' tab so we load the standard bet history
                $scope.adjustDate('from');
                $scope.loadMixedBetHistory();
            }
        }
    };


    /**
     * @ngdoc function
     * @name loadProfitLoss
     * @methodOf vbet5.controller:mixedMyBetsCtrl
     * @description  Loads profit/loss history
     */
    $scope.loadProfitLoss = function loadProfitLoss() {
        $scope.betHistoryLoaded = false;
        Zergling.get(
            {
                'from_date': $scope.betHistoryParams.dateRange.fromDate,
                'to_date': $scope.betHistoryParams.dateRange.toDate
            },
            'get_bet_pl_history'
        ).then(
            function success(response) {
                if (response.details && response.details.bet_pl_objects && response.details.bet_pl_totals) {
                    $scope.betHistory = response.details.bet_pl_objects;
                    $scope.profitLossTotal = response.details.bet_pl_totals;
                } else {
                    $scope.betHistory = [];
                    $scope.profitLossTotal = {};
                    $rootScope.$broadcast("globalDialogs.addDialog", {
                        type: 'error',
                        title: 'Error',
                        content: 'Failed to load bet history'
                    });
                }
            }
        )['finally'](function stopLoader() { $scope.betHistoryLoaded = true; });
    };

    initScope();
}]);
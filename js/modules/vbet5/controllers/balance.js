/* global VBET5 */
/**
 * @ngdoc controller
 * @name vbet5.controller:balanceCtrl
 * @description
 *  bet history controller.
 */
VBET5.controller('balanceCtrl', ['$rootScope', '$scope', 'Utils', 'Zergling', 'Moment', 'Translator', 'Config', function ($rootScope, $scope, Utils, Zergling, Moment, Translator, Config) {
    'use strict';

    var balanceHistory, ITEMS_PER_PAGE = Config.main.balanceHistoryDefaultItemsCount || 10;

    $scope.balanceHistoryLoaded = false;
    $scope.balanceHistoryTypesLoaded = false;

    $scope.balanceTypes = {'-1': Translator.get('All')};

    $scope.balanceHistoryParams = {
        dateRanges: [],
        dateRange: null,
        balanceTypes: $scope.balanceTypes,
        balanceType: '-1'
    };

    (function getBalanceHistoryTypes() {
        Zergling.get({"filter_id": 1}, "get_partner_document_types").then(function (response) {
            if (response.details && response.details.length)
                angular.forEach(response.details, function (value) {
                    $scope.balanceTypes[value.DocumentTypeId] = Translator.get(value.DocumentTypeName);
                });
        })['finally'](function () {
            $scope.balanceHistoryTypesLoaded = true;
        });
    })();

    /**
     * @ngdoc method
     * @name initbalanceHistory
     * @methodOf vbet5.controller:balanceCtrl
     * @description init function. Generates  month and weeks data for select box and loads entries
     * for the first month and default type
     */
    $scope.initbalanceHistory = function initbalanceHistory(product) {
        var i, time;

        for (i = 0; i < 6; i++) {
            time = Moment.get().subtract('months', i).startOf('month');
            $scope.balanceHistoryParams.dateRanges.push({
                fromDate: time.unix(),
                toDate: time.clone().add('months', 1).unix(),
                str: time.format('MMMM YYYY'),
                type: 'month'
            });

            var monthDays = i === 0 ? Moment.get().lang('en').format('D') : time.clone().endOf('month').lang('en').format('D'),
                wCount = parseInt(monthDays / 7, 10),
                moreDaysCount = monthDays % 7;
            var j, fromDate, toDate, weekDates = [];
            for (j = 0; j < wCount; j++) {
                fromDate = time.clone().add('days', j * 7);
                toDate = time.clone().add('days', (j + 1) * 7);
                weekDates.push({
                    fromDate: fromDate.unix(),
                    toDate: toDate.unix(),
                    str: "· " + (fromDate.format('DD MMM') + " - " + toDate.format('DD MMM')),
                    type: 'week'
                });
            }
            if (moreDaysCount > 0) {
                fromDate = time.clone().add('days', j * 7);
                toDate = fromDate.clone().add('days', moreDaysCount);
                var str = moreDaysCount == 1 ? fromDate.format('DD MMM') : fromDate.format('DD MMM') + " - " + toDate.format('DD MMM');
                weekDates.push({fromDate: fromDate.unix(), toDate: toDate.unix(), str: "· " + str, type: 'week'});
            }
            $scope.balanceHistoryParams.dateRanges = $scope.balanceHistoryParams.dateRanges.concat(weekDates.reverse());
        }
        $scope.dataSelectedIndex  =  product === 'Casino' ? "1" : "0";
        $scope.loadBalanceHistory(product);
    };

    /**
     * @ngdoc method
     * @name loadBalanceHistory
     * @methodOf vbet5.controller:balanceCtrl
     * @description loads balance history according to selected parameters from  **$scope.balanceHistoryParams**
     * and selects first page
     * @param {String} [product] optional.  Sport, Casino or Poker.  Default is sport
     */
    $scope.loadBalanceHistory = function loadBalanceHistory(product, customDateRange) {
        $scope.balanceHistoryParams.dateRange = customDateRange || $scope.balanceHistoryParams.dateRanges[$scope.dataSelectedIndex];
        var timeZoneOffset = new Date().getTimezoneOffset() / 60;
        var where = {
            time_shift: -timeZoneOffset
        },
            balanceType = parseInt($scope.balanceHistoryParams.balanceType, 10);

        if ($scope.balanceHistoryParams.dateRange.fromDate !== -1) {
            where.from_date = $scope.balanceHistoryParams.dateRange.fromDate;
            where.to_date = $scope.balanceHistoryParams.dateRange.toDate;
        }

        if (balanceType !== -1) {
            where.type = balanceType;
        }
        $scope.balanceHistoryLoaded = false;
        var request = {'where': where};
        if (product) {
            request.product = product;
        }
        Zergling.get(request, 'balance_history_v2')
            .then(
                function (response) {
                    if (response.details) {
                        var i, length;

                        balanceHistory = response.details;

                        for (i = 0, length = balanceHistory.length; i < length; i += 1) {
                            balanceHistory[i].Amount = parseFloat(balanceHistory[i].Amount);
                            balanceHistory[i].DocumentTypeName = Translator.get(balanceHistory[i].DocumentTypeName);

                            if (balanceHistory[i].PaymentSystemName) {
                                balanceHistory[i].DocumentTypeName += ' (' + Translator.get(balanceHistory[i].PaymentSystemName) + ')';
                            }
                        }

                        $scope.balanceHistoryParams.loadedProductType = product === "Casino" || !$rootScope.calculatedConfigs.sportEnabled ?  "Casino" : "Main";

                        $scope.balanceHistoryGotoPage(1);
                        console.log('balance history:', balanceHistory, "response", response, "where", where);
                    } else {
                        $rootScope.$broadcast("globalDialogs.addDialog", {
                            type: "warning",
                            title: "Warning",
                            content: response.details || Translator.get('Error')
                        });
                    }
                    $scope.balanceHistoryLoaded = true;
                },
                function (failResponse) {
                    $rootScope.$broadcast("globalDialogs.addDialog", {
                        type: "error",
                        title: "Error",
                        content: failResponse.data
                    });
                    $scope.balanceHistoryLoaded = true;
                }
            )['finally'](function () {
                if (Config.partner.balanceRefreshPeriod || Config.main.rfid.balanceRefreshPeriod) { // refresh balance right after opening bet history in integration skin (or for rfid)
                    $rootScope.$broadcast('refreshBalance');
                }
            });
    };

    /**
     * @ngdoc method
     * @name balanceHistoryGotoPage
     * @methodOf vbet5.controller:balanceCtrl
     * @description selects slice of bet history data according to given page number
     *
     * @param {Number} page page number
     */
    $scope.balanceHistoryGotoPage = function balanceHistoryGotoPage(page) {
        $scope.totalPages = parseInt(balanceHistory.length / ITEMS_PER_PAGE + (balanceHistory.length % ITEMS_PER_PAGE ? 1 : 0), 10);
        $scope.balanceHistoryPages = Utils.createPaginationArray($scope.totalPages, page, 10);
        $scope.balanceHistoryActivePage = page;
        var start = (page - 1) * ITEMS_PER_PAGE;
        var end = page * ITEMS_PER_PAGE;
        end = end > balanceHistory.length ? balanceHistory.length : end;
        $scope.balanceHistory = balanceHistory.slice(start, end);
    };
    /**
     * @ngdoc method
     * @name balanceHistoryLoadMoreInfo
     * @methodOf vbet5.controller:balanceCtrl
     * @description load more ITEMS_PER_PAGE number of history
     */
    $scope.balanceHistoryLoadMoreInfo = function balanceHistoryLoadMoreInfo () {
        var length = $scope.balanceHistory.length;
        $scope.balanceHistory = balanceHistory.slice(0, length + ITEMS_PER_PAGE);
    };

    /**
     * @ngdoc method
     * @name balanceHistoryIsMoreItemsAvailable
     * @methodOf vbet5.controller:balanceCtrl
     * @description Checks is more items are available
     */
    $scope.balanceHistoryIsMoreItemsAvailable = function balanceHistoryIsMoreItemsAvailable() {
        return $scope.balanceHistory && balanceHistory && $scope.balanceHistory.length !== balanceHistory.length;
    };
}]);

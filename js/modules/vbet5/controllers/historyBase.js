/* global VBET5 */
/**
 * @ngdoc controller
 * @name vbet5.controller:historyBaseCtrl
 * @description
 *  History base controller
 */
VBET5.controller('historyBaseCtrl', ['$scope', 'Moment', "Config", function($scope, Moment, Config) {
    'use strict';

    Moment.setLang(Config.env.lang);
    Moment.updateMonthLocale();
    Moment.updateWeekDaysLocale();
    var timeZone = Config.env.selectedTimeZone || '';

    $scope.today = Moment.get().lang("en").format("YYYY-MM-DD");
    $scope.dateOptions = { showWeeks: 'false' };

    $scope.datePickerFormat = Config.main.layoutTimeFormat[Config.main.sportsLayout] === 'MM/DD' ?
        Config.main.dateFormat.historyBalanceFormatDate :
        Config.main.dateFormat.datepicker;

    $scope.requestData = {
        dateFrom: $scope.today,
        dateTo: $scope.today
    };

    $scope.datePickerLimits = {
        maxToDate: $scope.today,
        maxFromDate: $scope.today
    };

    $scope.initialRange = {
        fromDate: Moment.get().subtract('week', 1).startOf('day').unix(),
        toDate: Moment.get().subtract('today').endOf('day').unix(),
        str: Moment.get().subtract('week', 1).format('MMMM YYYY'),
        type: 'month'
    };

    $scope.calcDate = function calcDate(type, monthCount) {
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
            default:
                $scope.requestData.dateTo = $scope.requestData.dateFrom;

        }

        return {
            fromDate: Moment.get(Moment.moment($scope.requestData.dateFrom).format().split('T')[0] + 'T00:00:00' + timeZone).unix(),
            toDate: Moment.get(Moment.moment($scope.requestData.dateTo).format().split('T')[0] + 'T23:59:59' + timeZone).unix()
        };
    };
}]);

/* global VBET5 */

/**
 * @ngdoc controller
 * @name vbet5.controller:loginHistory
 * @description As a player, a user must see his login date / time, device and IP address during the selected period in the “My Profile” section.
 */
VBET5.controller('loginHistoryCtrl', ['$scope', '$rootScope', 'Zergling', 'Moment', 'Config', function ($scope, $rootScope, Zergling, Moment, Config) {
    'use strict';

    var timeZone = Config.env.selectedTimeZone || '';
    var maxRange = 1; // Months
    var defaultCount = 100;

    $scope.dateOptions = { showWeeks: 'false' };
    $scope.today = Moment.get().lang("en").format("YYYY-MM-DD");
    $scope.maxDay = new Date(Moment.moment($scope.today).lang("en").format()); // This adjusts max day if a there is a timezone config
    $scope.datePickerRange = {
        dateFrom: '',
        dateTo: ''
    };
    $scope.minFromDate = Moment.moment($scope.datePickerRange.dateTo).add((-1 * (maxRange)), 'months');
    $scope.minToDate = Moment.moment().add(-730, 'days');
    $scope.datePickerOpen = {
        from: false,
        to: false
    };


    /**
     * @ngdoc method
     * @name formatRequestDate
     * @description Formats date
     * @param {Object} request - request object
     * @param {Boolean} currentTime - if true, sets current day as the from_date
     */
    function formatRequestDate(request, selectedPeriod) {
        if (!selectedPeriod) {
            request.from_date = Moment.get(Moment.moment($scope.datePickerRange.dateFrom).format().split("T")[0] + "T00:00:00" + timeZone).unix();
            var toUnixDate = Moment.get(Moment.moment($scope.datePickerRange.dateTo).format().split("T")[0] + "T23:59:59" + timeZone).unix();
            request.to_date = toUnixDate < Moment.get().unix() ? toUnixDate : Moment.get().unix();
        } else {
            request.from_date = Moment.get().unix() - selectedPeriod * 3600;
            request.to_date = Moment.get().unix();
        }
        return request;
    }


    /**
     * @ngdoc method
     * @name selectLoginHistoryTimePeriod
     * @methodOf vbet5.controller:mixedMyBetsCtrl
     * @description  sets bet history time period
     * @param {Number} hours number of hours, 0 for no filtering
     */
    $scope.selectLoginHistoryTimePeriod = function selectLoginHistoryTimePeriod() {
        $scope.datePickerRange.dateFrom = '';
        $scope.datePickerRange.dateTo = '';

        $scope.datePickerOpen = {
            from: false,
            to: false
        };
    };


    $scope.toggleDatePicker = function toggleDatePicker(event, type) {
        event.preventDefault();
        event.stopPropagation();

        $scope.datePickerOpen[type] = !$scope.datePickerOpen[type];
        type = type === 'from' ? 'to' : 'from'; // Switching the type, to close the other one
        $scope.datePickerOpen[type] = false;
    };


    /**
     * @ngdoc method
     * @name adjustDate
     * @description adjusted 'FromDate' dataPicker if FromDate is higher than ToDate and vice versa
     * @methodOf vbet5.controller:loginHistory
     */
    $scope.adjustDate = function adjustDate(type) {
        $scope.customPeriod = '';
        switch (type) {
            case 'from':
                if (!$scope.datePickerRange.dateTo) {
                    $scope.datePickerRange.dateTo = new Date();
                }
                if (Moment.get($scope.datePickerRange.dateFrom).unix() > Moment.get($scope.datePickerRange.dateTo).unix()) {
                    $scope.datePickerRange.dateTo = Moment.moment($scope.datePickerRange.dateFrom).lang("en").format();
                } else if(Moment.get($scope.datePickerRange.dateFrom).unix() < Moment.get($scope.datePickerRange.dateTo).add((-1 * (maxRange)), 'months').unix()) {
                    $scope.datePickerRange.dateTo  = Moment.moment($scope.datePickerRange.dateFrom).add((maxRange), 'months').lang("en").format();
                }
                $scope.minFromDate = Moment.moment($scope.datePickerRange.dateTo).add((-1 * (maxRange)), 'months');
                break;
            case 'to':
                if (!$scope.datePickerRange.dateFrom) {
                    $scope.datePickerRange.dateFrom = $scope.datePickerRange.dateTo;
                }
                if (Moment.get($scope.datePickerRange.dateFrom).unix() > Moment.get($scope.datePickerRange.dateTo).unix()) {
                    $scope.datePickerRange.dateFrom = Moment.moment($scope.datePickerRange.dateTo).lang("en").format();
                }
                if(Moment.get($scope.datePickerRange.dateFrom).unix() < Moment.get($scope.datePickerRange.dateTo).add((-1 * (maxRange)), 'months').unix()){
                    $scope.datePickerRange.dateFrom = Moment.moment($scope.datePickerRange.dateTo).add((-1 * (maxRange)), 'months').lang("en").format();
                }
                $scope.minFromDate = Moment.moment($scope.datePickerRange.dateTo).add((-1 * (maxRange)), 'months');
                break;
        }
    };


    /**
     * @ngdoc method
     * @name getLoginHistory
     * @methodOf vbet5.controller:loginHistory
     * @description loads login history according to selected parameters from  **$scope.datePickerRange.dateFrom**
     */
    $scope.getLoginHistory = function getLoginHistory() {
        $scope.loginHistoryLoaded = false;
        $scope.netLoginHistory = [];

        var request = formatRequestDate({count: defaultCount}, $scope.customPeriod);

        Zergling.get(request, 'get_client_login_history')
            .then(
                function success(response) {
                    if (response.details) {
                        $scope.netLoginHistory = response.details;
                        $scope.loginHistoryLoaded = true;
                    } else {
                        $scope.netLoginHistory = [];
                        $rootScope.$broadcast("globalDialogs.addDialog", {
                            type: 'error',
                            title: 'Error',
                            content: 'Failed to load net deposit history'
                        });
                    }
                })['finally'](function stopLoader() {
            $scope.loginHistoryLoaded = true;
        });
    };

    (function () { // when the user selects the login history section, the history is displayed 24 hours ago by default, starting from that minute
        $scope.customPeriod = '24';
        $scope.getLoginHistory();
    }());

}]);

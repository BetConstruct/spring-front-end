/**
 * @ngdoc controller
 * @name vbet5.controller:betPrint
 * @description Bet Print
*/
angular.module('vbet5').controller('betPrint', ['$scope', '$location', 'TimeoutWrapper', 'Storage', 'UserAgent', 'Config', function ($scope, $location, TimeoutWrapper, Storage, UserAgent, Config) {
    'use strict';

    TimeoutWrapper = TimeoutWrapper($scope);
    $scope.betConf = Config.betting;

    /**
     * @ngdoc method
     * @name regroupEvents
     * @methodOf vbet5.controller:betPrint
     * @description Regroup events
     */
    function regroupEvents() {
        if ($scope.betData.events) {
            $scope.events = [];
            var i, length = $scope.betData.events.length;

            for (i = 0; i < length; i += 2) {
                $scope.events.push($scope.betData.events.slice(i, i + 2));
            }
        }
    }

    /**
     * @ngdoc method
     * @name printBetEvent
     * @methodOf vbet5.controller:betPrint
     * @description Print event
     */
    $scope.printBetEvent = function printBetEvent() {
        var data = $location.search().data;

        if (UserAgent.IEVersion() && Storage.get('printPreview')) {
            data = Storage.get('printPreview');
        }

        $scope.betData = JSON.parse(decodeURIComponent(data));
        console.log($scope.betData);
        regroupEvents();

        $scope.userId = $location.search().userId;
    };
    $scope.print = function(){
        TimeoutWrapper(print);
    };

    /**
     * @ngdoc method
     * @name printCouponContent
     * @methodOf vbet5.controller:betPrint
     * @description Print coupon content
     */
    $scope.printCouponContent = function printCouponContent() {
        $scope.liveCalendarGames = topLevelLiveCalendarGames;
        $scope.marketEvents = topLevelMarketEvents;
        TimeoutWrapper(print);
    };


    /**
     * @ngdoc method
     * @name specialRounding
     * @methodOf betting.controller:betSlipController
     * @param {Number} num value
     * @description special rounding based on odd even values
     */
    $scope.specialRounding = function specialRounding(num) {
        return num % 1 === 0.5 ? (Math.floor(num) % 2 === 0 ? Math.floor(num) : Math.ceil(num)) : Math.round(num);
    };
}]);

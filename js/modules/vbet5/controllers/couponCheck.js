angular.module('vbet5').controller('couponCheckCtrl', ['$scope', 'Zergling', 'Config', 'Utils', function($scope, Zergling, Config, Utils) {
    'use strict';


    $scope.betTypes = getBetTypeNames(Config.main.betTypes);
    $scope.couponDetails = {};

    /**
     * @ngdoc method
     * @name toggleView
     * @methodOf vbet5.controller:couponCheckCtrl
     * @description Toggle view
     */
    $scope.toggleView = function toggleView() {
        $scope.showCouponPopup = false;
    };

    /**
     * @ngdoc method
     * @name getBetTypeNames
     * @methodOf vbet5.controller:couponCheckCtrl
     * @description Get bet type names
     * Returns {Object} Bet type list
     */
    function getBetTypeNames(typesArr) {
        var typesObj = {};
        if(typesArr && typesArr.length) {
            for(var i = 0; i < typesArr.length; i++) {
                typesObj[typesArr[i].value] = Utils.ucfirst(typesArr[i].name);
            }
        }
        return typesObj;
    }

    /**
     * @ngdoc method
     * @name getCouponDetails
     * @methodOf vbet5.controller:couponCheckCtrl
     * @description Get coupon details and put them in the scope
     * @param {Number} Bet ID
     */
    function getCouponDetails(betId) {
        $scope.showCouponPopup = true;
        $scope.loadingCouponDetails = true;
        Zergling.get({'bet_id': betId},"get_bet_detail").then(function(response) {
            if(response.details) {
                $scope.couponDetails = response.details.bet;
                $scope.couponDetails.events = response.details.bet.events.event.length ? response.details.bet.events.event : [response.details.bet.events.event];
            } else {
                $scope.couponDetails.warningMessage = "Please make sure that bet ID you entered is correct."
            }
            $scope.loadingCouponDetails = false;
        },
        function(fail){
            $scope.couponDetails.warningMessage = "Please make sure that bet ID you entered is correct.";
            $scope.loadingCouponDetails = false;
        })['finally'](function() {
            $scope.loadingCouponDetails = false;
        });
    };

    $scope.$on('couponCheck.showDetails', function (event, betId) {
        getCouponDetails(betId);
    });
}]);

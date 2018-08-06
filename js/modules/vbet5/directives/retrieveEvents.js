/* global VBET5 */
/**
 * @ngdoc directive
 * @name vbet5.directive:retrieveEvents
 *
 * @description
 *
 */
VBET5.directive('retrieveEvents', ['$rootScope', 'BetService', 'Zergling', 'Utils', function ($rootScope, BetService, Zergling, Utils) {
    'use strict';
    return {
        restrict: 'E',
        replace: false,
        templateUrl: 'templates/directive/retrieve-events.html',
        scope: {
            'clearBetslip': '=',
            'setBetSlipType': '=',
            'betSlip': '='
        },
        link: function ($scope) {
            $scope.retrieveEvents = {
                open: false,
                loading: false,
                notFound: false
            };

            $scope.getEvents = function getEvents() {
                if (!$scope.retrieveEvents.bookingId) { return; }

                $scope.retrieveEvents.loading = true;

                Zergling.get({ 'booking_id': parseInt($scope.retrieveEvents.bookingId, 10) }, 'get_events_by_booking_id')
                    .then(
                        function success(response) {
                            if (response.details && response.details.selection_ids) {
                                BetService.getEventData(response.details.selection_ids)
                                    .then(
                                        function processData(eventData) {
                                            var betsToPlace = Utils.formatEventData(eventData.data),
                                                oddType = 'odd',
                                                i = betsToPlace.length;

                                            if (i) {
                                                $scope.clearBetslip();
                                                while (i--) {
                                                    $rootScope.$broadcast('bet', {event: betsToPlace[i].eventInfo, market: betsToPlace[i].marketInfo, game: betsToPlace[i].gameInfo, oddType: oddType});
                                                }
                                                $scope.setBetSlipType(response.details.bet_type, false);
                                                $scope.betSlip.stake = response.details.amount;
                                                $scope.clear();
                                                $scope.retrieveEvents.open = false;
                                            }

                                        }).finally(stopLoader);
                            } else {
                                $scope.retrieveEvents.notFound = true;
                                stopLoader();
                            }
                        },
                        function error() { stopLoader(); }
                    );
            };

            $scope.clear = function clear() {
                $scope.retrieveEvents.notFound = false;
                $scope.retrieveEvents.bookingId = '';
            };

            function stopLoader() {
                $scope.retrieveEvents.loading = false;
            }
        }

    };
}]);

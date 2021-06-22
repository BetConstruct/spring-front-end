/* global VBET5 */
/**
 * @ngdoc directive
 * @name vbet5.directive:retrieveEvents
 *
 * @description
 *
 */
VBET5.directive('retrieveEvents', ['$rootScope', '$q', 'BetService', 'Zergling', 'Utils', 'Storage', function ($rootScope, $q, BetService, Zergling, Utils, Storage) {
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
                open: Storage.get('retrieveEvents.open') || false,
                loading: false,
                notFound: false
            };

            function getSingleEventPromise(data) {
                var request = {
                    'source': 'betting',
                    'what': {
                        'sport': ['id', 'name', 'alias', 'order'],
                        'competition': ['id', 'order', 'name'],
                        'region': ['id', 'name', 'alias'],
                        'game': ['id', 'start_ts', 'team1_id', 'team1_name', 'team2_id', 'team2_name', 'type'],
                        'market': ['base', 'type', 'name', 'express_id', 'id'],
                        'event': ["order", "id", "type_1", "type", "type_id", "original_order", "name", "price", "nonrunner", "ew_allowed", "sp_enabled", "extra_info", "base", "display_column" ]
                    },
                    'where': {
                        'sport': {
                            'id': data.sport_id
                        },
                        'competition': {
                            'id': data.competition_id
                        },
                        'game': {
                            'id': data.game_id
                        },
                        'market': {
                            'id': data.market_id
                        },
                        'event': {
                            'id': data.selection_id
                        }
                    }
                };
                Utils.addPrematchExpressId(request);

                return Zergling.get(request)
            }

            $scope.toggleOrSetRetrieveEventsOpen = function toggleOrSetRetrieveEventsOpen(state) {
                $scope.retrieveEvents.open = state || !$scope.retrieveEvents.open;
                Storage.set('retrieveEvents.open', $scope.retrieveEvents.open);
            };

            $scope.getEvents = function getEvents() {
                if (!$scope.retrieveEvents.bookingId) { return; }

                $scope.retrieveEvents.loading = true;

                Zergling.get({ 'booking_id': parseInt($scope.retrieveEvents.bookingId, 10) }, 'get_events_by_booking_id')
                    .then(
                        function success(response) {
                            if (response.details && response.details.selections) {
                                var promises = response.details.selections.map(function(selection) {
                                    return getSingleEventPromise(selection);
                                });


                                $q.all(promises).then(function(responses) {
                                   if (responses.length) {
                                       var betsToPlace = responses.reduce(function(acc, eventData) {
                                           var singleBet = Utils.formatEventData(eventData.data);
                                           if (singleBet[0]) {
                                               acc.push(singleBet[0]);
                                           }

                                           return acc;
                                       }, []);

                                       if (betsToPlace.length) {
                                           var oddType = 'odd',
                                               i = betsToPlace.length;

                                           $scope.clearBetslip();
                                           while (i--) {
                                               $rootScope.$broadcast('bet', {event: betsToPlace[i].eventInfo, market: betsToPlace[i].marketInfo, game: betsToPlace[i].gameInfo, oddType: oddType});
                                           }
                                           $scope.setBetSlipType(response.details.bet_type, false);
                                           $scope.betSlip.stake = response.details.amount;
                                           $scope.clear();

                                       }
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

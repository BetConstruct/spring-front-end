/* global VBET5 */
/**
 * @ngdoc directive
 * @name vbet5.directive:suggeestedBets
 *
 * @description displays suggested bets
 *
 */
VBET5.directive('suggestedBets', ['$rootScope', '$http', '$filter', 'Zergling', 'GameInfo', 'Storage', function ($rootScope, $http, $filter, Zergling, GameInfo, Storage) {
    'use strict';
    return {
        restrict: 'E',
        replace: false,
        templateUrl: 'templates/directive/suggested-bets.html',
        scope: {
            // bets: '=betsInBetslip', // Bets that are currently in the betslip
            clearBetslip: '=clearBetslip',
            showRetainsButtons: '=showRetainsButtons'
        },
        link: function (scope) {
            scope.showSuggestions = Storage.get('suggestedBets');
            scope.suggestedBetsList = [];
            var isEventInBetSlip = GameInfo.isEventInBetSlip,
                eventSubId;


            /**
             * @ngdoc method
             * @name getCombos
             * @description Gets suggested bets from an API
             */
            function getCombos() {
                if (scope.showSuggestions !== "hide" && $rootScope.profile) {
                    var apiUrl = 'https://varys.betconstruct.com/api/v3/recommendations/client/';

                    $http.get(apiUrl + $rootScope.profile.id)
                        .then(function(response) {
                            if (response && response.data.data) {
                                var suggestedBetCombinations = response.data.data,
                                    x = suggestedBetCombinations.length,
                                    i;

                                for (i = 0; i < x; i++) {
                                    if (suggestedBetCombinations[i].selections.length) {
                                        $rootScope.suggestedBets.tags = suggestedBetCombinations[i].tag;
                                        getEventsData(suggestedBetCombinations[i].selections);
                                        break;
                                    }
                                }
                            }
                        });
                }
            }


            /**
             * @ngdoc method
             * @name getEventsData
             * @description Gets data of suggested events, subscribes to price changes, and groups data for the view.
             * @param {Array} eventIds that were sent by the API in getCombos function
             */
            function getEventsData(eventIds) {

                function handleResponse(data) {
                    // Grouping data to be displayed in the template and be transferred to betslip
                    var bet,
                        suggestedBets = [],
                        isNotDuplicate;
                    angular.forEach(data.sport, function(sport) {
                        angular.forEach(sport.region, function(region) {
                            angular.forEach(region.competition, function(competition) {
                                angular.forEach(competition.game, function(game) {
                                    isNotDuplicate = true;
                                    bet = {};
                                    bet.gameInfo = game;
                                    bet.gameInfo.competition = competition;
                                    bet.gameInfo.region = region;
                                    bet.gameInfo.sport = sport;
                                    bet.gameInfo.title = game.team1_name + (game.team2_name ? ' - ' + game.team2_name : '');

                                    angular.forEach(game.market, function(market) {
                                        // No need to add several markets of one game, as they will not be added to the betslip
                                        if (isNotDuplicate) {
                                            bet.marketInfo = market;
                                            bet.marketInfo.name = $filter('improveName')(market.name, game);

                                            angular.forEach(market.event, function(event) {
                                                if (isNotDuplicate) {
                                                    bet.eventInfo = event;
                                                    suggestedBets.push(bet);
                                                    isNotDuplicate = false;
                                                }
                                            });
                                        }
                                    });

                                });
                            });
                        });
                    });

                    scope.suggestedBetsList = suggestedBets;
                }

                Zergling.subscribe({
                    'source': 'betting',
                    'what': {
                        'sport': ['id', 'name', 'alias', 'order'],
                        'competition': ['id', 'order', 'name'],
                        'region': ['id', 'name', 'alias'],
                        'game': ['id', 'team1_id', 'team1_name', 'team2_id', 'team2_name', 'type'],
                        'market': ['base', 'type', 'name', 'express_id'],
                        'event': []
                    },
                    'where': {
                        'event': {
                            'id': {'@in': eventIds}
                        }
                    }
                }, handleResponse).then(function(response) {
                    if (response.subid) {
                        eventSubId = response.subid;
                    }
                    handleResponse(response.data);

                });
            }


            /**
             * @ngdoc method
             * @name addToBetslip
             * @description Adds suggested bets to the betslip
             */
            scope.addToBetslip = function addToBetslip() {
                var oddType = 'odd',
                    i,
                    eventIds = [],
                    cleared = false,
                    suggestedBetsLength = scope.suggestedBetsList.length;

                if (scope.showRetainsButtons) {
                    scope.showRetainsButtons = false;
                    scope.clearBetslip();
                    cleared = true;
                }

                for (i = 0; i < suggestedBetsLength; i++) {
                    // If the event is already in the betslip, no need to add it again (which will remove it)
                    if (cleared || !isEventInBetSlip(scope.suggestedBetsList[i].eventInfo)) {
                        $rootScope.$broadcast('bet', {event: scope.suggestedBetsList[i].eventInfo, market: scope.suggestedBetsList[i].marketInfo, game: scope.suggestedBetsList[i].gameInfo, oddType: oddType});
                        eventIds.push(scope.suggestedBetsList[i].eventInfo.id);
                    }
                }

                // Passing the ids of suggested bets to betSlipController
                $rootScope.suggestedBets.eventIds = eventIds;

                if (eventSubId) {
                    Zergling.unsubscribe(eventSubId);
                    eventSubId = undefined;
                }

                // We empty the array, because we need it to be ready for the next request and we hide the 'Suggested Bets' section by setting showSuggestions to 'false'
                scope.suggestedBetsList = [];
                scope.showSuggestions = false;

            };


            /**
             * @ngdoc method
             * @name hide
             * @description Hides 'Suggested Bets' section
             * @param {Boolean} permanent - if the section should be permanently hidden
             */
            scope.hide = function hide(permanent) {
                scope.showSuggestions = false;
                scope.suggestedBetsList = [];

                if (permanent) {
                    Storage.set("suggestedBets", "hide");
                }
                if (eventSubId) {
                    Zergling.unsubscribe(eventSubId);
                    eventSubId = undefined;
                }
            };

            scope.$on('successfulBet', function() {
                scope.showSuggestions = Storage.get('suggestedBets') || true;
                $rootScope.suggestedBets = {};
                getCombos();
            });

            scope.$on('$destroy', function () {
                if (eventSubId) {
                    Zergling.unsubscribe(eventSubId);
                    eventSubId = undefined;
                }
            });


        }
    };
}]);

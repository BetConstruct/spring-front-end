/* global VBET5 */
/**
 * @ngdoc directive
 * @name vbet5.directive:suggeestedBets
 *
 * @description displays suggested bets
 *
 */
VBET5.directive('suggestedBets', ['$rootScope', '$http', '$filter', 'Zergling', 'GameInfo', 'Storage', '$timeout', 'Config', function ($rootScope, $http, $filter, Zergling, GameInfo, Storage, $timeout, Config) {
    'use strict';
    return {
        restrict: 'E',
        replace: false,
        templateUrl: 'templates/directive/suggested-bets.html',
        scope: {
            clearBetslip: '=',
            showRetainsButtons: '=',
            betSlip: '=',
            selectBetSlipMode: '='
        },
        link: function ($scope) {
            $scope.showSuggestions = Storage.get('suggestedBets');
            $scope.suggestedBetsList = [];
            $scope.isEventInBetSlip = GameInfo.isEventInBetSlip;

            var eventSubId, currentTags, inThrottle;


            /**
             * @ngdoc function
             * @name handleResponse
             * @description Handles Suggested Bets API successful response
             */
            function handleResponse(response) {
                if (response && response.data.data) {
                    var suggestedBetCombinations = response.data.data,
                        x = suggestedBetCombinations.length,
                        i;

                    if (x === 0) {
                        $scope.noSuggestions = true;
                    } else {
                        for (i = 0; i < x; i++) {
                            if (suggestedBetCombinations[i].selections.length) {
                                currentTags = suggestedBetCombinations[i].tag;
                                getEventsData(suggestedBetCombinations[i].selections);
                                break;
                            }
                        }
                    }
                }
            }

            /**
             * @ngdoc function
             * @name handleResponseError
             * @description Handles Suggested Bets API response error
             */
            function handleResponseError() {
                $scope.noSuggestions = true;
            }

            /**
             * @ngdoc function
             * @name getCombos
             * @description Gets suggested bets from an API
             */
            function getCombos() {
                if ($rootScope.profile && $rootScope.partnerConfig) {
                    var apiUrl;
                    switch ($scope.params.type) {
                        case 'preMatch':
                            if ($scope.showSuggestions !== 'hide') {
                                apiUrl = 'https://varys.betconstruct.com/api/v3/recommendations/client/';
                                $http.get(apiUrl + $rootScope.profile.id).then(handleResponse, handleResponseError);
                            }
                            break;
                        case 'live':
                            apiUrl = 'https://khalessi.betconstruct.com/api/v1/recommendations';
                            var data = { 'partner_id': $rootScope.partnerConfig.partner_id, 'client_id': $rootScope.profile.id };
                            $http({
                                method: 'POST',
                                url: apiUrl,
                                data: JSON.stringify(data),
                                headers: { 'Content-Type': 'application/json' }
                            }).then(handleResponse, handleResponseError);
                            break;
                    }
                } else {
                    $scope.noSuggestions = true;
                }
            }

            function unsubscribe() {
                if (eventSubId) {
                    Zergling.unsubscribe(eventSubId);
                    eventSubId = undefined;
                }
            }

            /**
             * @ngdoc function
             * @name handleUpdates
             * @description Handles SWARM Updates
             */
            function handleUpdates(data) {
                if ($scope.betSlip.mode !== 'suggested') {
                    $scope.noSuggestions = true;
                    unsubscribe();
                    return;
                }
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

                $scope.suggestedBetsList = suggestedBets;
                if (!suggestedBets.length) {
                    unsubscribe();
                    $scope.noSuggestions = true;
                }
            }

            /**
             * @ngdoc method
             * @name getEventsData
             * @description Gets data of suggested events, subscribes to price changes, and groups data for the view.
             * @param {Array} eventIds that were sent by the API in getCombos function
             */
            function getEventsData(eventIds) {
                var request = {
                    'source': 'betting',
                    'what': {
                        'sport': ['id', 'name', 'alias', 'order'],
                        'competition': ['id', 'order', 'name'],
                        'region': ['id', 'name', 'alias'],
                        'game': ['id', 'start_ts', 'team1_id', 'team1_name', 'team2_id', 'team2_name', 'type', 'stats'],
                        'market': ['base', 'type', 'name', 'express_id', 'id'],
                        'event': ["order", "id", "type_1", "type", "type_id", "original_order", "name", "price", "nonrunner", "ew_allowed", "sp_enabled", "extra_info", "base", "home_value", "away_value", "display_column" ]
                    },
                    'where': {
                        'event': {
                            'id': {'@in': eventIds}
                        }
                    }
                };

                if ($scope.params.type === 'live') {
                    request.what.game.push('info');
                }

                Zergling.subscribe(request, handleUpdates)
                    .then(
                        function success(response) {
                            if (response.subid) {
                                eventSubId = response.subid;
                            }
                            if ($scope.params.type === 'preMatch' || $scope.params.initialLoad) {
                                $scope.selectBetSlipMode('suggested');
                            }
                            handleUpdates(response.data);
                        }
                    );
            }

            function closeEditBetMode() {
                if ($rootScope.editBet && $rootScope.editBet.edit) {
                    $rootScope.editBet.edit = false;
                    $rootScope.$broadcast('close.edit.mode');
                }
            }

            function setThrottle() {
                inThrottle = true;
                $timeout(function stopThrottle() { inThrottle = false; }, 2000);
            }

            /**
             * @ngdoc method
             * @name getSuggestedBets
             * @description Starts the process of getting suggested bets
             * @param {Event} event - angular event
             * @param {Object} params
             * @param {String} params.type - 'live'/'preMatch' - type of suggested bets
             * @param {Boolean} params.initialLoad - true if done during the initial load of bet slip
             */
            $scope.getSuggestedBets = function getSuggestedBets(event, params) {
                if (inThrottle) { return; }
                setThrottle();
                unsubscribe();
                $scope.params = params;
                $scope.noSuggestions = false;
                $scope.showSuggestions = $scope.params.type === 'live' ? true : Storage.get('suggestedBets') || true;
                $scope.suggestedBetsList = [];
                $rootScope.suggestedBets = {
                    eventIds: [],
                    tags: ''
                };
                getCombos();
            };

            /**
             * @ngdoc method
             * @name addToBetslip
             * @description Adds suggested bets to the betslip
             */
            $scope.addToBetslip = function addToBetslip() {
                var oddType = 'odd',
                    i,
                    eventIds = [],
                    cleared = false,
                    suggestedBetsLength = $scope.suggestedBetsList.length;

                closeEditBetMode();
                if ($scope.showRetainsButtons) {
                    $scope.showRetainsButtons = false;
                    $scope.clearBetslip();
                    cleared = true;
                }

                for (i = 0; i < suggestedBetsLength; i++) {
                    // If the event is already in the betslip, no need to add it again (which will remove it)
                    if (cleared || !$scope.isEventInBetSlip($scope.suggestedBetsList[i].eventInfo)) {
                        $rootScope.$broadcast('bet', {event: $scope.suggestedBetsList[i].eventInfo, market: $scope.suggestedBetsList[i].marketInfo, game: $scope.suggestedBetsList[i].gameInfo, oddType: oddType});
                        eventIds.push($scope.suggestedBetsList[i].eventInfo.id);
                    }
                }

                // Passing the ids of suggested bets to betSlipController
                $rootScope.suggestedBets.eventIds = eventIds;
                $rootScope.suggestedBets.tags = currentTags;

                // We empty the array, because we need it to be ready for the next request and we hide the 'Suggested Bets' section by setting showSuggestions to 'false'
                $scope.suggestedBetsList = [];
                $scope.showSuggestions = false;

                $scope.selectBetSlipMode('betting');
            };

            /**
             * @ngdoc method
             * @name addToBetslip
             * @description Adds single suggested event to bet slip
             */
            $scope.addSingleEvent = function addSingleEvent(event, e) {
                e.stopPropagation();
                closeEditBetMode();
                event.eventInfo.isSuggested = true; // We add isSuggested flag, so we can track it while preparing 'do_bet' request;

                if (!$scope.isEventInBetSlip(event.eventInfo)) {
                    $rootScope.suggestedBets.eventIds.push(event.eventInfo.id);
                    $rootScope.suggestedBets.tags = currentTags;
                } else {
                    $rootScope.suggestedBets.eventIds = $rootScope.suggestedBets.eventIds.filter(function(id) { return id !== event.eventInfo.id; });
                    // If there are no more 'suggested' events in the betSlip we don't need to keep the tag
                    $rootScope.suggestedBets.tags = $rootScope.suggestedBets.eventIds.length ? $rootScope.suggestedBets.tags : '';
                }

                $rootScope.$broadcast('bet', {event: event.eventInfo, market: event.marketInfo, game: event.gameInfo, oddType: 'odd'});
            };

            /**
             * @ngdoc method
             * @name hide
             * @description Hides 'Suggested Bets' section
             * @param {Boolean} permanent - if the section should be permanently hidden
             */
            $scope.hide = function hide(permanent) {
                $scope.showSuggestions = false;
                $scope.suggestedBetsList = [];

                if (permanent) {
                    Storage.set("suggestedBets", "hide");
                    $rootScope.$broadcast("turnOffSuggestedExpress");
                }
                unsubscribe();
                $scope.selectBetSlipMode('betting');
            };


            $scope.$on('suggestedBets.get', $scope.getSuggestedBets);
            $scope.$on('$destroy', function onDestroy() {
                if ($scope.betSlip.mode !== 'betting' && $scope.betSlip.mode !== 'booking') {
                    $scope.selectBetSlipMode(Config.main.enableBetBooking && !$rootScope.env.authorized ? 'booking' : 'betting');
                }
                unsubscribe();
            });
            $scope.$watch('betSlip.mode', function betSlipModeWatcher(newVal, oldVal) {
                if (oldVal === 'suggested' && newVal !== 'suggested') {
                    $scope.suggestedBetsList = [];
                    unsubscribe();
                }
            });

        }
    };
}]);

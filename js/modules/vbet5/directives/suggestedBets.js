/* global VBET5 */
/**
 * @ngdoc directive
 * @name vbet5.directive:suggeestedBets
 *
 * @description displays suggested bets
 *
 */
VBET5.directive('suggestedBets', ['$rootScope', '$http', '$filter', '$q', 'Zergling', 'GameInfo', 'Storage', '$timeout', 'Config', 'Utils', function ($rootScope, $http, $filter, $q, Zergling, GameInfo, Storage, $timeout, Config, Utils) {
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
            $scope.isEventInBetSlip = GameInfo.isEventInBetSlip;

            var eventSubIdsMap, currentTags, inThrottle;

            /**
             * @ngdoc function
             * @name handleResponseError
             * @description Handles Suggested Bets API response error
             */
            function handleResponseError() {
                $scope.loadProcess = false;
            }

            /**
             * @ngdoc function
             * @name handleResponse
             * @description Handles Suggested Bets API successful response
             */
            function handleResponse(response) {
                if (response && response.data.data && response.data.data.length) {
                    var promises = [],
                        data = response.data.data[0],
                        length = data.selections.length;
                    currentTags = data.tag;
                    $scope.eventIds = data.selections;

                    for (var i =0; i < length; i++) {
                        var requestData = {
                            sport: data.sports[i],
                            region: data.regions[i],
                            competition: data.competitions[i],
                            game: data.games[i],
                            market: data.markets[i],
                            event: data.selections[i]
                        };
                        promises.push(getEventsData(requestData));
                    }

                    $q.all(promises).then(function (responses) {
                        if ($scope.eventIds.length && ($scope.params.type === 'preMatch' || $scope.params.initialLoad)) {
                           $scope.selectBetSlipMode('suggested');
                        }

                        eventSubIdsMap = {};
                        for(var i = 0; i < length; ++i) {
                            var response = responses[i];
                            var eventId = data.selections[i];
                            if (response.subid) {
                                eventSubIdsMap[eventId] = response.subid;
                            }
                            createUpdateEvent(eventId)(response.data);
                        }
                        handleResponseError();
                   });
                } else {
                    handleResponseError();
                }
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
                            apiUrl = 'https://recommender.dp.bcua.io/api/v3/recommendations/client/';
                            $http.get(apiUrl + $rootScope.profile.id).then(handleResponse, handleResponseError);
                            break;
                        case 'live':
                            apiUrl = 'https://recommender.dp.bcua.io/api/v3/recommendations/partners/';
                            $http.get(apiUrl + Config.main.site_id + '/' + $rootScope.profile.id + '/live').then(handleResponse, handleResponseError);
                    }
                } else {
                    $scope.loadProcess = false;
                }
            }

            function unsubscribe(eventId) {
                if (!eventSubIdsMap) {
                    return;
                }
                if (eventId) {
                    Zergling.unsubscribe(eventSubIdsMap[eventId]);
                    delete eventSubIdsMap[eventId];
                } else {
                    angular.forEach(eventSubIdsMap, function (value) {
                        Zergling.unsubscribe(value);
                    });
                    eventSubIdsMap = {};

                }
            }

            /**
             * @ngdoc function
             * @name handleUpdates
             * @description Handles SWARM Updates
             */
            function handleUpdates(eventId, data) {
                if ($scope.betSlip.mode !== 'suggested') {
                    $scope.loadProcess = false;
                    unsubscribe();
                    return;
                }
                // Grouping data to be displayed in the template and be transferred to betslip
                var bet;
                angular.forEach(data.sport, function(sport) {
                    angular.forEach(sport.region, function(region) {
                        angular.forEach(region.competition, function(competition) {
                            angular.forEach(competition.game, function(game) {
                                bet = {};
                                bet.gameInfo = game;
                                bet.gameInfo.competition = competition;
                                bet.gameInfo.region = region;
                                bet.gameInfo.sport = sport;
                                bet.gameInfo.title = game.team1_name + (game.team2_name ? ' - ' + game.team2_name : '');

                                angular.forEach(game.market, function(market) {
                                    bet.marketInfo = market;
                                    bet.marketInfo.name = $filter('improveName')(market.name, game);

                                    angular.forEach(market.event, function(event) {
                                        bet.eventInfo = event;
                                    });
                                });

                            });
                        });
                    });
                });
                if (bet) {
                    $scope.suggestedBetMap[eventId] = bet;
                } else {
                    delete $scope.suggestedBetMap[eventId];
                    unsubscribe(eventId);
                }
            }

            function createUpdateEvent(eventId) {
                return function (data) {
                    handleUpdates(eventId, data);
                };
            }

            /**
             * @ngdoc method
             * @name getEventsData
             * @description Gets data of suggested events, subscribes to price changes, and groups data for the view.
             * @param {object} data selection filters
             */
            function getEventsData(data) {
                var request = {
                    'source': 'betting',
                    'what': {
                        'sport': ['id', 'name', 'alias', 'order'],
                        'competition': ['id', 'order', 'name'],
                        'region': ['id', 'name', 'alias'],
                        'game': ['id', 'start_ts', 'team1_id', 'team1_name', 'team2_id', 'team2_name', 'type', 'stats', 'info'],
                        'market': ['base', 'type', 'name', 'express_id', 'id'],
                        'event': ["order", "id", "type_1", "type", "type_id", "original_order", "name", "price", "nonrunner", "ew_allowed", "sp_enabled", "extra_info", "base", "home_value", "away_value", "display_column" ]
                    },
                    'where': {
                        'sport': {
                            'id': data.sport
                        },
                        'region': {
                            'id': data.region
                        },
                        'competition': {
                            'id': data.competition
                        },
                        'game': {
                            'id': data.game
                        },
                        'market': {
                            'id': data.market
                        },
                        'event': {
                            'id': data.event
                        }
                    }
                };

                if ($scope.params.type === 'live') {
                    request.what.game.push('info');
                } else {
                    Utils.addPrematchExpressId(request);
                }



                return Zergling.subscribe(request, createUpdateEvent(data.event));
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
             * @param {Object} params
             * @param {String} params.type - 'live'/'preMatch' - type of suggested bets
             * @param {Boolean} params.initialLoad - true if done during the initial load of bet slip
             */
            $scope.getSuggestedBets = function getSuggestedBets(params) {
                if (inThrottle) { return; }
                setThrottle();
                unsubscribe();
                $scope.params = params;
                $scope.loadProcess = true;
                $scope.eventIds = [];
                $scope.suggestedBetMap = {};
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
                    suggestedBetsLength = $scope.eventIds.length;

                closeEditBetMode();
                if ($scope.showRetainsButtons) {
                    $scope.showRetainsButtons = false;
                }
                $scope.clearBetslip();

                for (i = 0; i < suggestedBetsLength; i++) {
                    // If the event is already in the betslip, no need to add it again (which will remove it)
                    var event = $scope.suggestedBetMap[$scope.eventIds[i]];
                    if (event) {
                        $rootScope.$broadcast('bet', {event: event.eventInfo, market: event.marketInfo, game: event.gameInfo, oddType: oddType});
                    }
                }

                // Passing the ids of suggested bets to betSlipController
                $rootScope.suggestedBets.eventIds = $scope.eventIds;
                $rootScope.suggestedBets.tags = currentTags;

                // We empty the array, because we need it to be ready for the next request and we hide the 'Suggested Bets' section by setting showSuggestions to 'false'
                $scope.suggestedBetMap = {};
                $scope.eventIds = [];

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
                $scope.suggestedBetMap = {};
                $scope.eventIds = [];

                if (permanent) {
                    $rootScope.$broadcast("toggleSuggestedExpress", false);
                }
                unsubscribe();
                $scope.selectBetSlipMode('betting');
            };

            $scope.$on('suggestedBets.get', function (event, params) {
                $scope.showSuggestions = Storage.get('suggestedBets') !== false;

                if ($scope.showSuggestions) {
                    $scope.getSuggestedBets(params);
                }
            });
            $scope.$on('$destroy', function onDestroy() {
                if ($scope.betSlip.mode !== 'betting' && $scope.betSlip.mode !== 'booking') {
                    $scope.selectBetSlipMode(Config.main.enableBetBooking && !$rootScope.env.authorized ? 'booking' : 'betting');
                }
                unsubscribe();
            });
            $scope.$watch('betSlip.mode',  Utils.debounce(function betSlipModeWatcher() {
                if (eventSubIdsMap && Object.keys(eventSubIdsMap).length && $scope.betSlip.mode !== 'suggested') {
                    $scope.suggestedBetMap = {};
                    $scope.eventIds = [];
                    unsubscribe();
                }
             }, 100)
            );

        }
    };
}]);

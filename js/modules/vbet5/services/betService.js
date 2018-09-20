/* global VBET5 */
/**
 * @ngdoc service
 * @name vbet5.service:BetService
 * @description
 * Cash out functionality
 */
VBET5.service('BetService', ['$rootScope', 'Zergling', 'Config', '$q', 'Utils', '$location', 'GameInfo', function ($rootScope, Zergling, Config, $q, Utils, $location, GameInfo) {
    'use strict';

    var BetService = {
        cashOut: {},
        repeatBet: {}
    };

    /**
     * @ngdoc function
     * @name adjustBetData
     * @methodOf vbet5.service:BetService
     * @description Checks whether cash out option should be active or not.
     * ! Warning: this function mutates betData object !
     * @param {Object} betData - Object containing all bet info
     * @param {Boolean} [hasInactiveEvents] - true if a bet contains an event which has been calculated (has an outcome)
     */
    BetService.cashOut.adjustBetData = function adjustBetData(betData, hasInactiveEvents) {
        if (hasInactiveEvents || parseFloat(betData.cash_out) == 0 || betData.cash_out === null) {
            betData.cashoutEnabled = false;
            betData.cash_out = undefined;
        } else {
            betData.cashoutEnabled = true;
        }
    };


    /**
     * @ngdoc method
     * @name filterEvents
     * @methodOf vbet5.service:BetService
     * @description Filters bets that need to have their cash out info updated
     * This function is applicable only for bets that have cash out.
     * It doesn't filter out bets that don't have cash out - it needs to be done separately, outside this function.
     * That is why the third parameter - cashoutableBets - may be used.
     *
     * ! Warning: this function uses BetService.cashOut.adjustBetData method which mutates betData object !
     * @param {Array} bets - an array of bet objects (that have cash out option)
     * @param {Object} updatedData - updated info from SWARM
     * @param {Array} [cashoutableBets] - bets that have cash out
     * @param {Boolean} forceCalculate
     * @returns {Array} ids of bets that need to have their cash out info updated
     */
    BetService.cashOut.filterEvents = function filterEvents(bets, updatedData, cashoutableBets, forceCalculate) {
        var cashOutBetIds = [];
        angular.forEach(bets, function (betData) {
            var shouldFilter = true;
            if (cashoutableBets && cashoutableBets.indexOf(betData.id) === -1) {
                shouldFilter = false;
            }
            // Only look at 'Single' and 'Multiple' bets that are not settled
            if (shouldFilter && (betData.type == '1' || betData.type == '2') && betData.outcome == '0') {
                var hasInactiveEvents = false,
                    needsCalculation = forceCalculate;

                angular.forEach(betData.events, function (betEvent) {
                    var isEventActive = betEvent.outcome == 3;
                    var betEventId = Config.main.GmsPlatform ? betEvent.selection_id : betEvent.id;

                    angular.forEach(updatedData, function (currentEvent) {
                        if (betEventId == currentEvent.id && currentEvent.price && currentEvent.price > 1) {
                            isEventActive = true;
                            // We only need to make the call if there was a price change
                            needsCalculation = needsCalculation || currentEvent.price_change || !betData.cash_out;
                        }
                    });

                    if (!isEventActive) {
                        hasInactiveEvents = true;
                    }
                });
                /* If a bet doesn't have any inactive event and its cash out needs to be recalculated we push it to the array where the ids of those bets are stored.
                   If it doesn't need any recalculation, but all events are active, we keep the same amount which was set previously.
                   Finally, if none of the cases apply, we set it to undefined */
                if (!hasInactiveEvents && needsCalculation) {
                    cashOutBetIds.push(betData.id);
                } else {
                    BetService.cashOut.adjustBetData(betData, hasInactiveEvents);
                }

            }
        });
        return cashOutBetIds;
    };


    /**
     * @ngdoc method
     * @name getData
     * @methodOf vbet5.service:BetService
     * @description Makes a call to get updated cash out price
     * @param {Array} betIds - an array of bet objects
     * @returns {Promise} if successful returns an object where bet id is the key and its cash out info is the value
     */
    BetService.cashOut.getData = function getData(betIds) {
        var promise = $q.defer();
        Zergling.get({"bet_ids": betIds}, "calculate_cashout_amount")
            .then(
                function success(response) {
                    if (response.details) {
                        var cashOutMap = Utils.createMapFromObjItems(response.details, 'Id');
                        promise.resolve(cashOutMap);
                    }
                },
                function error() {
                    promise.reject('No response');
                }
            )
            ['catch'](function error() { promise.reject(); });

        return promise.promise;
    };


    /**
     * @ngdoc method
     * @name findAndSubscribe
     * @methodOf vbet5.service:BetService
     * @description Subscribes to events that have cash out option
     * @param {Array} data - an array of bet objects
     * @param {Function} callbackFn
     * @returns {Promise}
     */
    BetService.cashOut.findAndSubscribe = function findAndSubscribe(data, callbackFn) {
        var promise = $q.defer();
        if (data.length) {
            var cashOutEventIds = [],
                sportIds = [],
                gameIds = [];
            angular.forEach(data, function (bet) {
                if (bet.cash_out !== undefined) {
                    angular.forEach(bet.events, function (betEvent) {
                        var betEventId = parseInt((Config.main.GmsPlatform ? betEvent.selection_id : betEvent.id), 10);
                        cashOutEventIds.push(betEventId);
                        sportIds.push(betEvent.sport_id);
                        gameIds.push(betEvent.game_id);
                    });
                }
            });

            if (cashOutEventIds.length) {
                sportIds = Utils.uniqueNum(sportIds);
                gameIds = Utils.uniqueNum(gameIds);

                return Zergling
                    .subscribe({
                            'source': 'betting',
                            'what': {
                                'event': ['id', 'price']
                            },
                            'where': {
                                'event': { 'id': { '@in': cashOutEventIds } },
                                'sport': { 'id': { '@in': sportIds } },
                                'game': { 'id': { '@in': gameIds } }
                            }
                        },
                        callbackFn);
            } else {
                promise.reject();
            }
        } else {
            promise.reject();
        }

        return promise.promise;
    };


    /**
     * @ngdoc method
     * @name processData
     * @methodOf vbet5.service:BetService
     * @description Updates cash out info of a bet
     * ! Warning: this function mutates betData object !
     * @param {Array} currentBets - an array of bet objects
     * @param {Object} cashOutMap - the object received from BetService.cashOut.getData method
     */
    BetService.cashOut.processData = function processData(currentBets, cashOutMap) {
        angular.forEach(currentBets, function(betData) {
            if (cashOutMap[betData.id]) {
                betData.cash_out = cashOutMap[betData.id].CashoutAmount;
                $rootScope.$broadcast('updatePopUpInfo', {cashOutMap: cashOutMap});
                BetService.cashOut.adjustBetData(betData);
            }
        });
    };


    /**
     * @ngdoc method
     * @name getMinCashOutValue
     * @methodOf vbet5.service:BetService
     * @description Calculates minimum cash out value
     */
    BetService.cashOut.getMinCashOutValue = function getMinCashOutValue() {
        if (BetService.cashOut.minCashOutValue === undefined && $rootScope.profile && $rootScope.partnerConfig) {
            BetService.cashOut.minCashOutValue = parseFloat($rootScope.partnerConfig.min_bet_stakes && $rootScope.partnerConfig.min_bet_stakes[$rootScope.profile.currency_name]) || 0.1;
        }
        return BetService.cashOut.minCashOutValue;
    };


    /**
     * @ngdoc method
     * @name addEvents
     * @methodOf vbet5.service:BetService
     * @description place bet from bet history, and the second param for edit bet functional
     * @param {Object} eventsFromBetHistory - bet object w/ events
     * @param {Boolean} [editBet] - if true turns on edit bet mode
     * @param {Function} [callbackFn] - callback function to be invoked when event info is received
     */
    BetService.repeatBet.addEvents = function addEvents(eventsFromBetHistory, editBet, callbackFn) {
        var promise = $q.defer();

        var betsToPlace,
            oddType = 'odd';
        if (editBet) {
            $rootScope.editBet = {
                increaseStake: {
                    tooltip: false,
                    amount: '',
                    savedAmount: ''
                },
                loading: true,
                edit: true,
                oldBetId: eventsFromBetHistory.id,
                originalEventIds: eventsFromBetHistory.events.map(function getSelectionIds(event) { return event.selection_id; }),
                stakeAmount: eventsFromBetHistory.cash_out,
                openSelectionsPart: false,
                dateTime: eventsFromBetHistory.date_time,
                changed: false
            };

            $rootScope.$broadcast('clear.bets', editBet);
        }


        var eventIds = [];
        angular.forEach(eventsFromBetHistory.events, function(event) {
            if(event.outcome === null || event.outcome === 0) {
                eventIds.push(event.selection_id);
            }
        });

        Zergling.get({
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
            }}).then(
                function success(response) {
                    if(response.data) {
                        if (editBet) {
                            $rootScope.editBet.loading = false;
                        }
                        betsToPlace = Utils.formatEventData(response.data);
                        for (var i = 0; i < betsToPlace.length; i++) {
                            if (!GameInfo.isEventInBetSlip(betsToPlace[i].eventInfo)) {
                                $rootScope.$broadcast('bet', {event: betsToPlace[i].eventInfo, market: betsToPlace[i].marketInfo, game: betsToPlace[i].gameInfo, oddType: oddType});
                            }
                        }
                        $rootScope.env.showSlider = false;
                        $rootScope.env.sliderContent = '';
                        if (typeof callbackFn === 'function') {
                            callbackFn();
                        }
                        promise.resolve();
                    }
                },
                function error() {
                    promise.reject();
                })['finally'](
                    function() {
                        if (editBet) {
                            $rootScope.$broadcast('disable.add.bet');
                        }
                    });

        if ($location.path() !== '/sport/' && $location.path() !== '/dashboard/' &&
            $location.path() !== '/multiview/' && $location.path() !== '/livecalendar/') {
            $location.url('/sport/?type=1');
        }

        return promise.promise;
    };


    /**
     * @ngdoc method
     * @name getEventData
     * @methodOf vbet5.service:BetService
     * @description gets event data from SWARM
     * @param {array} eventIds
     * @returns {Promise}
     */
    BetService.getEventData = function getEventData(eventIds) {
        var promise = $q.defer();

        Zergling.get({
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
            }})
            .then(function resolve(response) { promise.resolve(response); }, function reject(response) { promise.reject(response); });

        return promise.promise;

    };

    return BetService;
}]);
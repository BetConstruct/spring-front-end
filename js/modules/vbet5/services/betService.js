/* global VBET5, JSON */
/* jshint -W024 */

/**
 * @ngdoc service
 * @name vbet5.service:BetService
 */
VBET5.factory('BetService', ['$rootScope', 'Zergling', 'Config', '$q', 'Utils', '$location', 'GameInfo', '$window', 'Translator', 'Storage', function betService($rootScope, Zergling, Config, $q, Utils, $location, GameInfo, $window, Translator, Storage) {
    'use strict';

    var BetService = {
        cashOut: {},
        print: {
            state: { // Used for storing the state necessary to print last best (in bet slip)
                id: null,
                inProgress: false
            }
        },
        constants: {
            customCorrectScoreLogic: ['Soccer', 'Tennis', 'IceHockey', 'Baseball', 'TableTennis', 'Snooker', 'CyberFootball'],
            marketsPreDividedByColumns:  [
                'MatchWinningMargin',
                'GameWinningMargin',
                'SetWinningMargin',
                'WinningMargin',
                'CorrectScore',
                'Firstset/match',
                'SetsEffectiveness',
                'SeriesCorrectScore',
                'SeriesCorrectScoreAfterGame3',
                'SeriesCorrectScoreAfterGame4',
                'CurrectScoreGroup',
                'MatchBettingAndTeamsToScore',
                'HalfTimeFullTime',
                'HalfTimeFullTimeDoubleChance',
                'ExtraTimeHomeTeamCorrectTotal',
                'ExtraTimeAwayTeamCorrectTotal',
                'OutcomeandBothTeamToScore',
                'DoubleChanceAndBothTeamToScore',
                'DoubleChanceAndBothTeamToScore',
                'TotalAndBothTeamsToScore',
                'FirstHalfOutcomeAndBothTeamToScore',
                'SecondHalfOutcomeAndBothTeamToScore',
                '1stHalf-2ndHalfBothToScore',
                'GameCorrectScore',
                'MatchTieBreakCorrectScore',
                'SetTieBreakCorrectScore',
                '1stSet-Match',
                '1stGame/2ndGameWinner',
                '2ndGame/3thGameWinner',
                '3thGame/4thGameWinner',
                '4thGame/5thGameWinner',
                '5thGame/6thGameWinner',
                '6thGame/7thGameWinner',
                '7thGame/8thGameWinner',
                '8thGame/9thGameWinner',
                '9thGame/10thGameWinner',
                '10thGame/11thGameWinner',
                '11thGame/12thGameWinner',
                'SetScore',
                'SetCorrectScore',
                '5thSetCorrectScore',
                'MatchTieBreakCorrectScore',
                'OutcomeAndTotal15',
                'OutcomeAndTotal25',
                'OutcomeAndTotal35',
                'OutcomeAndTotal45'
            ], // Market types which are pre-divided by back-end into columns
            betTypes: {
                1: 'Single',
                2: 'Express',
                3: 'System',
                4: 'Chain',
                5: 'Trixie',
                6: 'Yankee',
                8: 'Super Yankee',
                9: 'Heinz',
                10: 'Super Heinz',
                11: 'Goliath',
                12: 'Patent',
                14: 'Lucky 15',
                15: 'Lucky 31',
                16: 'Lucky 63',
                50: 'Bet Builder',
                51: 'Bet On Lineups',
                'Toto': 'Pool Betting'
            },
            fullCoverTypesMap : {
                1: "Singles",
                2: "Doubles",
                3: "Trebles",
                'default': "Folds"
            },
            fullCoverAdditionalTypesMap : {
                3: [
                    {
                        name: "Trixie",
                        type: 5
                    },
                    {
                        name: "Patent",
                        type: 12,
                        includeSingles: true
                    }
                ],
                4: [
                    {
                        name: "Yankee",
                        type: 6
                    },
                    {
                        name: "Lucky 15",
                        type: 14,
                        includeSingles: true
                    }
                ],
                5: [
                    {
                        name: "Super Yankee",
                        type: 8
                    },
                    {
                        name: "Lucky 31",
                        type: 15,
                        includeSingles: true
                    }
                ],
                6: [
                    {
                        name: "Heinz",
                        type: 9
                    },
                    {
                        name: "Lucky 63",
                        type: 16,
                        includeSingles: true
                    }
                ],
                7: [
                    {
                        name: "Super Heinz",
                        type: 10
                    }
                ],
                8: [
                    {
                        name: "Goliath",
                        type: 11
                    }
                ]
            }
        }
    };

    ////////////////////////////////////////////////////////////////////////////////
    // PRIVATE VARIABLES
    ////////////////////////////////////////////////////////////////////////////////
    var _cache = {};

    var _cashOut = {
        subId: null,
        subscriptionInProgress: false,
        callbacks: {},
        unsubQueue: []
    };
    ////////////////////////////////////////////////////////////////////////////////
    // PRIVATE VARIABLES - END
    ////////////////////////////////////////////////////////////////////////////////

    ////////////////////////////////////////////////////////////////////////////////
    // PRIVATE METHODS
    ////////////////////////////////////////////////////////////////////////////////
    _cashOut.generateSubId = function generateSubId() {
        return Date.now();
    };
    ////////////////////////////////////////////////////////////////////////////////
    // PRIVATE METHODS - END
    ////////////////////////////////////////////////////////////////////////////////


    ////////////////////////////////////////////////////////////////////////////////
    // PUBLIC METHODS
    ////////////////////////////////////////////////////////////////////////////////
    /**
     * @ngdoc method
     * @name subscribe
     * @methodOf vbet5.service:BetService
     * @description Subscribes to cash out notifications. Currently only used for bet history and 'Open bets'
     * @param {Function} callback
     * @returns {Number} internalSubId - a sub id generated internally
     */
    BetService.cashOut.subscribe = function cashOutSubscribe(callback) {
        if (!callback || typeof callback !== 'function') {
            throw new Error('Please provide a callback function');
        }

        var internalSubId = _cashOut.generateSubId();
        if (_cashOut.subId || _cashOut.subscriptionInProgress) {
            _cashOut.callbacks[internalSubId] = callback;
        } else {
            _cashOut.subscriptionInProgress = true;
            Zergling.subscribe(
                {
                    'source': 'notifications',
                    'what': {
                        'user': []
                    }
                },
                function updatingCashOutSubscribers(data) {
                    if (data.cashout) {
                        angular.forEach(_cashOut.callbacks, function(cb) {
                            cb(data.cashout);
                        });
                    }
                })
                .then(function storeSubId(response) {
                    _cashOut.subId = response.subid;
                    _cashOut.subscriptionInProgress = false;
                    _cashOut.callbacks[internalSubId] = callback;

                    _cashOut.unsubQueue.forEach(BetService.cashOut.unsubscribe);
                    _cashOut.unsubQueue = [];
                })
                .catch(function(err) {
                    _cashOut.subscriptionInProgress = false;
                    _cashOut.callbacks = {};
                    _cashOut.unsubQueue = [];
                    console.warn('Couldn\'t subscribe to cash out notifications: ' +  err);
                });
        }

        return internalSubId;
    };


    /**
     * @ngdoc method
     * @name unsubscribe
     * @methodOf vbet5.service:BetService
     * @param {Number} internalSubId - internal id of a subscription (callback)
     * @description Removes a callback from the callback array and unsubscribes from cash out notifications if necessary
     */
    BetService.cashOut.unsubscribe = function cashOutUnsubscribe(internalSubId) {
        if (!_cashOut.callbacks[internalSubId]) {
            _cashOut.unsubQueue.push(internalSubId);
            return;
        }

        delete _cashOut.callbacks[internalSubId];
        if (Utils.isObjectEmpty(_cashOut.callbacks) && _cashOut.subId) {
            Zergling.unsubscribe(_cashOut.subId);
            _cashOut.subId = null;
        }
    };


    /**
     * @ngdoc method
     * @name getMinCashOutValue
     * @methodOf vbet5.service:BetService
     * @description Calculates minimum cash out value
     */
    BetService.cashOut.getMinCashOutValue = function getMinCashOutValue() {
        if (!_cache.minCashOutValue && $rootScope.profile && $rootScope.partnerConfig) {
            _cache.minCashOutValue = parseFloat($rootScope.partnerConfig.min_bet_stakes && $rootScope.partnerConfig.min_bet_stakes[$rootScope.profile.currency_name]) || 0.1;
        }
        return _cache.minCashOutValue;
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
    BetService.repeatBet = function repeatBet(eventsFromBetHistory, editBet, callbackFn) {
        var promise = $q.defer();
        if ( editBet && Config.betting.fullCoverBetTypes.enabled ) {
            promise.reject();
            return promise.promise;
        }

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
                changed: false,
                cashOutSubId: null,
                unsubPromise: null
            };

            $rootScope.$broadcast('clear.bets', editBet);
            // Subscribing to cash out for updating stake amount
            $rootScope.editBet.cashOutSubId = BetService.cashOut.subscribe(function updateStakeAmount(data) {
                if (data[$rootScope.editBet.oldBetId]) {
                    $rootScope.editBet.stakeAmount = data[$rootScope.editBet.oldBetId].amount;
                }
            });

        }

            var sportIds = [];
            var gameIds = [];
            var eventIds = [];

            angular.forEach(eventsFromBetHistory.events, function (event) {
                if (event.outcome === null || event.outcome === 0) {
                    eventIds.push(event.selection_id);
                    gameIds.push(event.game_id);
                    sportIds.push(event.sport_id);
                }
            });

            Zergling.get({
                'source': 'betting',
                'what': {
                    'sport': ['id', 'name', 'alias', 'order'],
                    'competition': ['id', 'order', 'name'],
                    'region': ['id', 'name', 'alias'],
                    'game': ['id', 'team1_id', 'start_ts', 'team1_name', 'team2_id', 'team2_name', 'type'],
                    'market': ['base', 'type', 'name', 'express_id', 'id'],
                    'event': ["order", "id", "type_1", "type", "type_id", "original_order", "name", "price", "nonrunner", "ew_allowed", "sp_enabled", "extra_info", "display_column"]
                },
                'where': {
                    'event': {
                        'id': {'@in': eventIds}
                    },
                    'game': {
                        'id': {'@in': Utils.uniqueNum(gameIds)}
                    },
                    'sport': {
                        'id': {'@in': Utils.uniqueNum(sportIds)}
                    }
                }
            }).then(
                function success(response) {
                    if (response.data) {
                        if (editBet) {
                            $rootScope.editBet.loading = false;
                        }
                        betsToPlace = Utils.formatEventData(response.data);

                        if(!betsToPlace.length){
                            $rootScope.$broadcast('globalDialogs.addDialog', {
                                type: 'warning',
                                title: 'Warning',
                                hideCloseButton: true,
                                content: 'No available event to add',
                                buttons: [
                                    {
                                        title: 'Ok'
                                    }
                                ]
                            });
                            return;
                        }

                       var process = function process() {
                            var eventIds = [];
                            var addEventsInBetSlipByURL = $location.path() !== '/sport/' && $location.path() !== '/dashboard/' && $location.path() !== '/multiview/' && $location.path() !== '/livecalendar/';

                            if (!addEventsInBetSlipByURL) {
                                $rootScope.$broadcast('betSlipType', eventsFromBetHistory.type);
                            }

                            for (var i = 0; i < betsToPlace.length; i++) {
                                if (addEventsInBetSlipByURL) {
                                    eventIds.push(betsToPlace[i].eventInfo.id);
                                } else {
                                    $rootScope.$broadcast('bet', {
                                        event: betsToPlace[i].eventInfo,
                                        market: betsToPlace[i].marketInfo,
                                        game: betsToPlace[i].gameInfo,
                                        oddType: oddType
                                    });
                                }
                            }

                            if (addEventsInBetSlipByURL) {
                                $location.url('/sport/');

                                var params = {
                                    'event': eventIds.join(','),
                                    'betSlipType': eventsFromBetHistory.type,
                                    'type': 1
                                };

                                $location.search(params);
                            }

                            $rootScope.env.showSlider = false;
                            $rootScope.env.sliderContent = '';
                            if (typeof callbackFn === 'function') {
                                callbackFn();
                            }
                            promise.resolve();
                        };

                        if(!editBet) {
                            var betSlip = Storage.get('betslip');
                            if (betSlip && betSlip.bets && betSlip.bets.length) {
                                $rootScope.$broadcast('globalDialogs.addDialog', {
                                    type: "warning",
                                    title: "Warning",
                                    hideCloseButton: true,
                                    content: "You already have events in the betslip. If you select a repeat bet the events will be deleted. Do you want to continue?",
                                    buttons: [
                                        {
                                            title: 'Yes',
                                            callback: function () {
                                                $rootScope.$broadcast('clear.bets', true, true);
                                                process();
                                            }
                                        },
                                        {
                                            title: 'No',
                                            callback: function () {
                                                if (typeof callbackFn === 'function') {
                                                    callbackFn();
                                                }
                                                promise.reject();
                                            }
                                        }]
                                });
                            } else {
                                process();
                            }
                        }else {
                            process();
                        }
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
                'game': ['id', 'start_ts', 'team1_id', 'team1_name', 'team2_id', 'team2_name', 'type'],
                'market': ['base', 'type', 'name', 'express_id', 'id'],
                'event': ["order", "id", "type_1", "type", "type_id", "original_order", "name", "price", "nonrunner", "ew_allowed", "sp_enabled", "extra_info", "base", "display_column" ]
            },
            'where': {
                'event': {
                    'id': {'@in': eventIds}
                }
            }})
            .then(function resolve(response) { promise.resolve(response); }, function reject(response) { promise.reject(response); });

        return promise.promise;

    };


    /**
     * @ngdoc method
     * @name getBetHistory
     * @methodOf vbet5.service:BetService
     * @description gets bets' history
     * @param {Number} betId
     * @returns {Promise}
     */
    BetService.getBetHistory = function getBetHistory(betId) {
        var deferred = $q.defer();
        if ($rootScope.profile) {
            Zergling.get({ where: { bet_id: betId }}, 'bet_history')
                .then(function success(response) {
                    if (response.bets && response.bets.length) {
                        deferred.resolve(response.bets[0]);
                    } else {
                        deferred.reject('No data');
                    }
                })
                .catch(function error(err) { //jshint ignore:line
                    deferred.reject(err);
                });
        } else {
            deferred.reject('Not logged in');
        }

        return deferred.promise;
    };


    /**
     * @ngdoc method
     * @name openPrintPreview
     * @methodOf vbet5.service:BetService
     * @description opens printPreview page specified by bet
     *
     * @param {object} betData bet data
     */
    BetService.print.openPrintPreview = function openPrintPreview(betData) {
        var betDataInfo = Utils.copyObj(betData);
        betDataInfo.userId = ($rootScope.profile && ($rootScope.profile.id || $rootScope.profile.unique_id)) || '';
        betDataInfo.userName = ($rootScope.profile && $rootScope.profile.username) || '';
        betDataInfo.viewType = $rootScope.conf.bookingBetPrint.viewType;
        betDataInfo.partnerConfig = {};
        betDataInfo.partnerConfig.multiple_price_decimals = $rootScope.partnerConfig.multiple_price_decimals;
        betDataInfo.partnerConfig.price_decimals = $rootScope.partnerConfig.price_decimals;
        betDataInfo.partnerConfig.price_round_method = $rootScope.partnerConfig.price_round_method;

        var encodedBetData = encodeURIComponent(JSON.stringify(betDataInfo));
        $window.open('#/popup/?action=betprintpreview&data=' + encodedBetData, Config.main.skin + 'betprintpreview.popup', "scrollbars=1,width=1000,height=600,resizable=yes");
    };


    /**
     * @ngdoc method
     * @name getExpressBonusRules
     * @methodOf vbet5.service:BetService
     * @description gets express bonus rules
     */
    BetService.getExpressBonusRules = function getExpressBonusRules() {
        var deferred = $q.defer();

        if (_cache.expressBonus) {
            deferred.resolve(Utils.copyObj(_cache.expressBonus));
            return deferred.promise;
        }

        var expressBonus = {
            enabled: false
        };

        Zergling.get({}, 'get_sport_bonus_rules').then(function(response) {
            if (response.details) {
                var rules = response.details;

                for (var i = 0, x = rules.length; i < x; i++) {
                    if (rules[i].BetType !== 2) {
                        expressBonus.enabled = false;
                        break;
                    }

                    if (!expressBonus.enabled) {
                        expressBonus = {
                            enabled: true,
                            minOdds: rules[i].MinOdds,
                            ignoreLowOdds: rules[i].IgnoreLowOddSelection,
                            basis: rules[i].Basis,
                            map: {
                                minTotalCoefficient: rules[i].MinBetOdds
                            }
                        };
                    }

                    var minimumSelections = rules[i].MinimumSelections;
                    var maximumSelections = rules[i].MaximumSelections;
                    // If maximum selections are not set then we try to get it from the next rule's minimum selection
                    if (maximumSelections === null && rules[i+1] && rules[i+1].MinimumSelections) {
                        maximumSelections = rules[i+1].MinimumSelections - 1;
                    }
                    expressBonus.map[minimumSelections] = rules[i].AmountPercent;

                    if (minimumSelections !== maximumSelections) {
                        if (maximumSelections === null) {
                            expressBonus.map.default = rules[i].AmountPercent; //jshint ignore:line
                        } else if (maximumSelections > minimumSelections) {
                            while (++minimumSelections <= maximumSelections) {
                                expressBonus.map[minimumSelections] = rules[i].AmountPercent;
                            }
                        }
                    }

                }

                if (expressBonus.enabled) {
                    expressBonus.visibilityQty = Math.min.apply(
                        null,
                        Object.keys(expressBonus.map).filter(function filterNaN(val) { return +val === +val; })
                    ) - 1;

                    var noBonusSelections = expressBonus.visibilityQty;
                    while (noBonusSelections >= 0) {
                        expressBonus.map[noBonusSelections--] = 0;
                    }
                }

            }
        })['finally'](function cacheAndResolve() {
            _cache.expressBonus = expressBonus;
            deferred.resolve(Utils.copyObj(expressBonus));
        });

        return deferred.promise;
    };


    BetService.getEachWayTerms = function getEachWayTerms(market) {
        if (Config.main.showEachWay && market.extra_info && market.extra_info.EachWayPlace > 1) {
           return ' EW: ' + '1/' + market.extra_info.EachWayK + ' ' + Translator.get('Odds') + ' ' + market.extra_info.EachWayPlace + ' ' + Translator.get('Places');
        }
        return '';
    };

    ////////////////////////////////////////////////////////////////////////////////
    // PUBLIC METHODS - END
    ////////////////////////////////////////////////////////////////////////////////


    return BetService;
}]);

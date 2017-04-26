/* global BettingModule */
/**
 * @ngdoc controller
 * @name betting.controller:betSlipController
 * @usage dsa
 * @description
 * Explorer controller
 */
BettingModule.controller('betSlipController', ['$q', '$scope', '$rootScope', '$filter', 'Config', 'Zergling', 'Storage', 'Translator', '$location', '$route', '$window', '$injector', 'analytics', 'DomHelper', 'Utils', 'partner', 'TimeoutWrapper', 'UserAgent', function ($q, $scope, $rootScope, $filter, Config, Zergling, Storage, Translator, $location, $route, $window, $injector, analytics, DomHelper, Utils, partner, TimeoutWrapper, UserAgent) {
    'use strict';

    TimeoutWrapper = TimeoutWrapper($scope);
    var betslipSubscriptionProgress = null; // couldn't come up with a good name for this :/
    var oddLimitExceededFlag = false;
    var addBetInProgress = false;

    var addGameToFavorites = function (game) {
        if (!$rootScope.conf.addToFavouritesOnBet) {
            return;
        }

        $rootScope.$broadcast('game.addToMyGames', game);
        console.log("adding game ", game.id, " to favorites");
    };

    $scope.freeBetSelectorRadio = 0;

    $scope.betConf = Config.betting;
    $scope.showBetSettings = $scope.betConf.enableShowBetSettings;
    $scope.enableSigninRegisterLinks =  Config.partner.enableSigninRegisterCallbacks;
    $scope.sportsbookAvailableViews = Utils.checkForAvailableSportsbookViews(Config);

    $scope.displayQuickBet = false;
    $scope.bonusBet = {
        enabled: false
    };
    $scope.freeBet = {
        enabled: false
    };
    $scope.counterOffer = {
        enabled: false,
        minAmount: 100000
    };
    $scope.bonusBet = {
        enabled: false
    };
    var mathCuttingFunction = Utils.mathCuttingFunction;//Config.main.decimalFormatRemove3Digit ? Math.floor : Math.round;

    /**
     * @ngdoc object
     * @name calculateQuickBetVisibility
     * @methodOf betting.controller:betSlipController
     * @description Detects if quickbet should be visible based on scope and url data
     */
    function calculateQuickBetVisibility () {
        $scope.displayQuickBet = $scope.env.authorized
            && $scope.betConf.quickBet.enableQuickBetStakes
            && $scope.quickBetEnabled
            && $scope.conf.sportsLayout === 'combo'
            && $scope.betConf.quickBet.visibleForPaths.indexOf($location.path().split('/')[1]) > -1;
    }
    /**
     * @ngdoc object
     * @name getBetTitle
     * @methodOf betting.controller:betSlipController
     * @description Renders bet title and flips team1 and team2 names based on the language
     */
    function getBetTitle (game) {
        if (Config.betting.reverseTeamNamesFor.indexOf($rootScope.env.lang) !== -1) {
            return (game.team2_name ? game.team2_name + ' - ' : '') + game.team1_name;
        }
        return game.team1_name + (game.team2_name ? ' - ' + game.team2_name : '');
    }

    /**
     * @ngdoc object
     * @name sysBetSelectedValue
     * @methodOf betting.controller:betSlipController
     * @description System Bet selected value
     */
    $scope.sysBetSelectedValue = 2;

    /**
     * @ngdoc object
     * @name acceptPriceChanges
     * @methodOf betting.controller:betSlipController
     * @description indicates if event price changes after adding to betslip are ok for user
     */

    if (Storage.get('autoAcceptSettings')) {
        $scope.acceptPriceChanges = Storage.get('autoAcceptSettings');
    } else if (Config.betting.defaultPriceChangeSetting) {
        $scope.acceptPriceChanges = Config.betting.defaultPriceChangeSetting;
    } else {
        $scope.acceptPriceChanges = '0';
    }


    /**
     * @ngdoc object
     * @name isBetsInProgress
     * @methodOf betting.controller:betSlipController
     * @description indicates if betting is in process
     */

    $scope.isBetsInProgress = false;

    /**
     * @ngdoc object
     * @name quickBetEnabled
     * @methodOf betting.controller:betSlipController
     * @description indicates if quick bet mode is enabled
     */

    $scope.quickBetEnabled = false;

    /**
     * @ngdoc object
     * @name isBetAccepted
     * @methodOf betting.controller:betSlipController
     * @description indicates if current bet is accepted
     */

    $scope.isBetAccepted = false;

    /**
     * @ngdoc object
     * @name quickBet
     * @methodOf betting.controller:betSlipController
     * @description Quick Bet Result
     */
    $scope.quickBet = {
        status: 'idle',
        massage: "",
        showTimer: {}
    };

    var betAcceptedWatcherPromise, showQuickBetWatcherPromise;

    /**
     * @ngdoc method
     * @name betEventsToRootScope
     * @methodOf betting.controller:betSlipController
     * @description places all event ids from betslip to 'betEvents' object in $rootScope.
     * Needed for showing selected event in game view
     */
    function betEventsToRootScope() {
        $rootScope.betEvents = {};
        $scope.betSlip.bets.map(function (bet) {
            $rootScope.betEvents[bet.eventId] = {selected: true, oddType: bet.oddType};
        });
        if ($scope.betSlip.bets.length !== 1 || $scope.betSlip.type.value !== 1) {
            $scope.betSlip.betterOddSelectionMode = false;
        }
    }

    $scope.$watch('betSlip', betEventsToRootScope, true);
    $scope.$watch('acceptPriceChanges', function () {
        Storage.set('autoAcceptSettings', $scope.acceptPriceChanges);
    }, true);
    $scope.$watch('env.authorized', function (newValue, oldValue) {
        if (oldValue && !newValue) {
            $scope.clearBetslip();
        }
    }, true);

    $scope.$watch('quickBetEnabled', function () {
        calculateQuickBetVisibility();
    });

    $scope.$watchCollection('[betSlip.stake, betSlip.unitStake, betSlip.divisionCoefficient]', function (newStakes, oldStakes) {

        if ($scope.betConf.roundBetCents) {
            $scope.betSlip.stake = Math.floor($scope.betSlip.stake);
        }

        if ((!newStakes[0] && !!oldStakes[0]) || (!newStakes[1] && !!oldStakes[1])) {
            if (newStakes[0] === undefined || newStakes[1] === undefined) {
                $scope.betSlip.stake = $scope.betSlip.unitStake = undefined;
            } else {
                $scope.betSlip.stake = $scope.betSlip.unitStake = 0;
            }
        } else {
            if (newStakes[0] !== oldStakes[0] && $scope.betSlip.type.value !== 3) {
                $scope.betSlip.unitStake = $scope.betSlip.stake / $scope.betSlip.divisionCoefficient;
            } else {
                if (!!$scope.betSlip.unitStake) {
                    $scope.betSlip.stake = Math.round($scope.betSlip.divisionCoefficient * $scope.betSlip.unitStake * 100) / 100;
                }
            }
        }

    });


    /**
     * Subscription id
     *
     * @type {number}
     */
    var subId = null;
    var exchangeSubId = null;


    /**
     * Copy betType list from config to scope
     * @type {.main.betTypes|*|Array|.main.betTypes|*}
     */
    $scope.betTypes = Config.main.betTypes || [];
    /**
     * @ngdoc method
     * @name calcBetterOdd
     * @methodOf betting.controller:betSlipController
     * @description calculates the better price
     *
     * @param {Object} price
     */
    function calcBetterOdd (price) {
        price = parseFloat(price, 10);
        if (price < 1.06) {
            return price;
        }

        price = (price - 1) * 0.1 + price;
        if(price > 10) {
            price = Math.ceil(price);
        } else {
            price = +price.toFixed(2);
        }
        return price;
    }

    /**
     * @ngdoc method
     * @name hideBetProcessLoaders
     * @methodOf betting.controller:betSlipController
     * @description hide all loaders
     *
     * @param {Object} price
     */
    function hideBetProcessLoaders () {
        $scope.betInProgress = false;
        $scope.isBetsInProgress = false;
        if ($scope.betSlip && $scope.betSlip.bets) {
            angular.forEach($scope.betSlip.bets, function (bet) {
                bet.processing = false;
            });
        }
    }

    /**
     * @ngdoc method
     * @name updateEventWithAnother
     * @methodOf betting.controller:betSlipController
     * @description replaces the event id of provided event with another from same type of market with nearest base
     * then updates betslip subscription after which corresponding bet in betslip gets news event's properties
     *
     * @param {Object} originalEvent betslip event that ned to be replaced
     * @param {Object} data swarm response object (requested events from same game with same market and  event type)
     */
    function updateEventWithAnother(originalEvent, data) {
        var events = [], minBaseDifference, selectedIndex;
        angular.forEach(data.data.market, function (market) {
            angular.forEach(market.event, function (event) {
                events.push({id: event.id, base: event.base || market.base});
            });
        });

        events.map(function (event, index) {
            var diff = Math.abs(event.base - originalEvent.baseInitial);
            if (minBaseDifference === undefined || diff < minBaseDifference) {
                minBaseDifference = diff;
                selectedIndex = index;
            }
        });
        if (selectedIndex !== undefined && events[selectedIndex]) {

            originalEvent.eventId = events[selectedIndex].id;
            originalEvent.deleted = false;
            updateBetslipSubscription();
        } else {
            originalEvent.deleted = true;
        }
    }

    /**
     * @ngdoc method
     * @name updateExchangeEventPrices
     * @methodOf betting.controller:betSlipController
     * @description updates event prices in betslip according to update received from Exchange
     * @param {object} data data from swarm
     */

    function updateExchangeEventPrices(data) {
        if (data) {
            angular.forEach($scope.betSlip.bets, function (b){
                b.exchangePrice = null;
                angular.forEach(data.fairEvent, function (val) {
                    if (b.eventId === val.event_id && val.amount !== 0 && b.exchangePrice < val.price) {
                        b.exchangePrice = val.price;
                    }
                });
            });
        }
    }

    /**
     * @ngdoc method
     * @name updateEventPrices
     * @methodOf betting.controller:betSlipController
     * @description updates event prices in betslip according to update received from subsciption and marks deleted events
     * @param {object} data data from swarm
     */
    function updateEventPrices(data) {
        console.log('betslip update:', data);
        $scope.betSlip.thereAreDeletedEvents = false;
        $scope.betSlip.thereAreEventBaseChanges = false;

        angular.forEach($scope.betSlip.bets, function (b) {
            b.deleted = true;
            angular.forEach(data.game, function (game) {
                angular.forEach(game.market, function (market) {
                    angular.forEach(market.event, function (event) {
                        if(Config.main.showPlayerRegion){
                            game.team1_name = game.team1_reg_name && game.team1_name.indexOf(game.team1_reg_name) === -1 ? game.team1_name + ' (' + game.team1_reg_name + ')' : game.team1_name;
                            game.team2_name = game.team2_reg_name && game.team2_name.indexOf(game.team2_reg_name) === -1 ? game.team2_name + ' (' + game.team2_reg_name + ')' : game.team2_name;
                        }
                        if (b.eventId === event.id) {
                            b.deleted = false;
                            b.priceChange = event.price_change;
                            b.price = event.price;
                            b.betterPrice = calcBetterOdd (event.price);
                            b.base = event.base || market.base;
                            b.blocked = (game.is_blocked || ($filter('oddConvert')(event.price, 'decimal')) == 1);
                            b.title = (game.displayTitle ?  game.displayTitle + " " : "") + getBetTitle(game);
                            b.marketName = $filter('improveName')(market.name, game);
                            b.team1Name = game.team1_name;
                            b.team2Name = game.team2_name;
                            b.marketHomeScore = market.home_score;
                            b.marketAwayScore = market.away_score;
                            b.eventType1 = event.type_1;

                            event.name = $filter('removeParts')(event.name, [market.name]);
                            if (Config.main.dontReplaceP1P2WithTeamNamesForEvents) {
                                if (!Config.main.dontReplaceP1P2WithTeamNamesForEvents[market.type]) {
                                    event.name = $filter('improveName')(event.name, game);
                                }
                            }
                            else if (Config.main.replaceP1P2WithTeamNames) {
                                event.name = $filter('improveName')(event.name, game);
                            }
                            b.pick = event.name;
                        }
                    });
                });
            });
            if (b.deleted && b.base !== undefined && !$scope.isBetsInProgress) {  // try to replace it with another from same game with same market and event type
                b.deleted = false;
                Zergling
                    .get({
                        'source': 'betting',
                        'what': {
                            'market': ['base', 'home_score', 'away_score'],
                            'event': ['id', 'base', 'type_1']
                        },
                        'where': {
                            'game': {'id': b.gameId},
                            'market': {'type': b.marketType},
                            event: {'type': b.eventType}
                        }
                    })
                    .then(function (data) {updateEventWithAnother(b, data); });
            }
            if (b.baseInitial !== b.base) {
                $scope.betSlip.thereAreEventBaseChanges = true;
            }
            if (b.deleted && !b.blocked) {
                $scope.betSlip.thereAreDeletedEvents = true;
            }
        });
        //$scope.showBetSettings = $scope.thereIsPriceChange(); //temporarily disable show bets settings on price change
    }

    /**
     * @ngdoc method
     * @name broadcastBetslipState
     * @methodOf betting.controller:betSlipController
     * @description broadcasts betslip state ('betslip.isEmpty' if theree are no events and 'betslip.hasEvents' if it has)
     */
    function broadcastBetslipState() {
        $rootScope.betSlipBetsCount = $scope.betSlip.bets.length;
        if ($scope.betSlip.bets.length === 0) {
            $rootScope.$broadcast('betslip.isEmpty', $scope.betSlip.bets.length);
        } else {
            $rootScope.$broadcast('betslip.hasEvents', $scope.betSlip.bets.length);
        }
    }

    /**
     * @ngdoc method
     * @name subscribeToBetslipEvents
     * @methodOf betting.controller:betSlipController
     * @description subscribes to events which are in betslip.
     * When subscription is done resolves **betslipSubscriptionProgress** promise with subscription id
     */
    function subscribeToBetslipEvents() {

        var subscribingProgress = $q.defer();
        betslipSubscriptionProgress = subscribingProgress.promise;

        var eventIds = $scope.betSlip.bets.map(function (bet) {
            return bet.eventId;
        });
        var gameIds = $scope.betSlip.bets.map(function (bet) {
            return bet.gameId;
        });
        console.log('betslip subscribing to events:', JSON.stringify(eventIds));
        if (eventIds.length === 0) {
            console.log('no betslip events to subscribe');
            betslipSubscriptionProgress = null;
            return;
        }
        Zergling
            .subscribe({
                'source': 'betting',
                'what': {
                    'game': ['id', 'is_blocked', 'team1_name', 'team2_name', 'team1_reg_name', 'team2_reg_name'],
                    'market': ['base', 'type', 'name', 'home_score', 'away_score'],
                    'event': ['id', 'price', 'type', 'type_1', 'name', 'base', 'base1', 'base2']
                },
                'where': {
                    'game': {
                        'id': {'@in': gameIds}
                    },
                    'event': {
                        'id': {'@in': eventIds}
                    }
                }
            }, updateEventPrices).then(function (response) {
            subId = response.subid;
            subscribingProgress.resolve(subId);
            updateEventPrices(response.data);
        });

        /*if (Config.main.showExchangePrices) {
            Zergling
                .subscribe({
                    "source": "fair_events",
                    "what": {
                        "fairEvent": []
                    },
                    "where": {
                        "fairEvent": {
                            "event_id": {"@in": eventIds},
                            "type": 0
                        }
                    }
                }, updateExchangeEventPrices).then(function (response) {
                exchangeSubId = response.subid;
                updateExchangeEventPrices(response.data);
            });
        }*/

    }

    /**
     * @ngdoc method
     * @name updateBetslipSubscription
     * @methodOf betting.controller:betSlipController
     * @description subscribes to event in betslip after unsubscribing from old subscription(if there's one)
     */
    function updateBetslipSubscription() {
        if (betslipSubscriptionProgress === null) { // first time
            subscribeToBetslipEvents();
        } else {
            betslipSubscriptionProgress.then(function (subId) {
                Zergling.unsubscribe(subId);
                if (exchangeSubId) {
                    Zergling.unsubscribe(exchangeSubId);
                    exchangeSubId = null;
                }
                subscribeToBetslipEvents();
            });
        }
    }
    /**
     * @ngdoc method
     * @name acceptChanges
     * @methodOf betting.controller:betSlipController
     * @description Cleans up BetSlip to be ready to place bets,
     * i.e. accepts all price changes and removes non-existing events from BetSlip
     */
    $scope.acceptChanges = function acceptChanges() {
        // var newBets = [];
        angular.forEach($scope.betSlip.bets, function (b) {
            b.priceInitial = b.price;
            b.baseInitial = b.base;
            /*if (!b.deleted) {
             newBets.push(b);
             }*/
        });
        // $scope.betSlip.bets = newBets;
        Storage.set('betslip', $scope.betSlip, Config.betting.storedBetslipLifetime);
        broadcastBetslipState();
        updateBetslipSubscription();
    };

    /**
     * @ngdoc object
     * @name betSlip
     * @propertyOf betting.controller:betSlipController
     * @type {Object}
     * @description betSlip storage object.
     * Will be retrieved from local storage if present, or initialized with empty structure.
     */
    if (!Config.betting.deleteBetsOnReload) {
        $scope.betSlip = Storage.get('betslip');
    }

    if ($scope.betSlip === undefined || $scope.betSlip === null) {
        $scope.betSlip = {
            bets: [],
            generalBetResult: "",
            isBettingAllowed: true,
            sysValArray: [],
            stake: "",
            expOdds: "",
            sysOptions: "",
            type: $scope.betTypes[0],
            mode: 'betting',
            bookingResultId: '',
            eachWayMode: false,
            divisionCoefficient: 1
        };
    } else {
        $scope.betSlip.bets.map(function (bet) {bet.processing = false; });//reset previous state if it remained for some raeason
        $scope.betSlip.stake = '';
        $scope.betSlip.unitStake = '';
        $scope.betSlip.generalBetResult = "";
        updateBetslipSubscription();
        broadcastBetslipState();
    }
    if (!$scope.betConf.enabled) {
        $scope.betSlip.mode = 'booking';
    }


    /**
     * @ngdoc method
     * @name repeatSingleStake
     * @methodOf betting.controller:betSlipController
     * @param {String} Stake to repeat
     * @description repeat single stake for all single bets
     */
    $scope.repeatSingleStake = function repeatSingleStake(betStake) {
        if (!isNaN(betStake) && betStake > 0) {
            angular.forEach($scope.betSlip.bets, function (value) {
                value.singleStake = betStake;
                value.singleUnitStake = value.singleStake / 2;
            });
        }
    };

    /**
     * @ngdoc method
     * @name getMaxBet
     * @methodOf betting.controller:betSlipController
     * @param {Object} Requested bet
     * @description Get Maximum stake amount for selected event
     */
    $scope.getMaxBet = function getMaxBet(betEvents) {
        var request = {
            'events': []
        };
        if (angular.isArray(betEvents)) {
            angular.forEach(betEvents, function (betEvent) {
                request.events.push(betEvent.eventId);
            });
        } else {
            request.events.push(betEvents.eventId);
        }

        var processMaxBetResults = function (result) {
            var maxResult = Config.main.onlyDecimalStakeAmount ? Math.floor(result.result) : parseFloat(result.result);
            if (angular.isArray(betEvents)) {
                $scope.lustMaxBetResult = $scope.betSlip.stake = maxResult;
            } else {
                betEvents.singleStake = maxResult;
            }
        };

        Zergling
            .get(request, 'get_max_bet').then(processMaxBetResults)['catch'](function (reason) {
            console.log('Error:', reason);
        });
    };

    /**
     * @ngdoc method
     * @name removeBet
     * @methodOf betting.controller:betSlipController
     * @param {String} betToRemove bet object.  if field of object is used to find bet in betslip
     * @description removes bet from betslip
     */
    $scope.removeBet = function removeBet(betToRemove) {
        var i;

        angular.forEach($scope.betSlip.bets, function (bet) {
            for (i = bet.conflicts.length - 1; i >= 0; i--) {
                if (betToRemove.eventId === bet.conflicts[i].eventId) {
                    bet.conflicts.splice(i, 1);
                }
            }
        });

        for (i = $scope.betSlip.bets.length - 1; i >= 0; i--) {
            if ($scope.betSlip.bets[i].eventId === betToRemove.eventId) {
                $scope.betSlip.bets.splice(i, 1);
            }
        }

        angular.forEach($scope.betTypes, function(betType) {
            if (betType.value === 1) {
                if ($scope.betSlip.bets.length === 1 && $scope.betSlip.type.value === 2 || ($scope.betSlip.bets.length === 0)) {
                    $scope.setBetSlipType({'name': 'single', 'value': 1});
                    $scope.betSlip.eachWayMode = false;
                    $scope.betSlip.superbetSelector = false;
                }
            }
        });

        if ($scope.betSlip.bets.length === 0) {
            //$scope.counterOffer.enabled = false;
            if(Config.betting.resetAmountAfterBet) {
                $scope.betSlip.stake = undefined;
            }
        }

        $scope.betSlip.generalBetResult = "";
        $scope.betSlip.bookingResultId = "";
        $scope.sysBetSelectedValue = 2;

        Storage.set('betslip', $scope.betSlip, Config.betting.storedBetslipLifetime);
        updateBetslipSubscription();
        checkFreeBet();
        $rootScope.$broadcast('betslip.removeBet', betToRemove);
        broadcastBetslipState();
        if ($scope.lustMaxBetResult == $scope.betSlip.stake) {
            $scope.betSlip.stake = undefined;
        }
        $scope.lustMaxBetResult = undefined;

        if ($scope.betSlip.bets.length === 0) {
            $scope.showRetainsButtons = false;
        }
    };

    $scope.$on('removeBet', function (event, data) { $scope.removeBet(data); });

    /**
     * @ngdoc method
     * @name clearBetslip
     * @methodOf betting.controller:betSlipController
     * @description removes all bet from betslip
     */

    $scope.clearBetslip = function clearBetslip() {
        $scope.betSlip.bets.length = 0;
        $scope.betSlip.generalBetResult = "";
        $scope.betSlip.bookingResultId = "";
        $scope.sysBetSelectedValue = 2;
        $scope.betSlip.stake = '';
        $scope.betSlip.eachWayMode = false;
        $scope.betSlip.superbetSelector = false;
        $scope.counterOffer.enabled = false;
        $scope.isBetAccepted = false;
        // switch to single if it available
        var i, isContains = false, btLength = $scope.betTypes.length;
        for (i = 0; i < btLength; i += 1) {
            if($scope.betTypes[i].name === 'single'){
                isContains = true;
                break;
            }
        }
        if (isContains) {

            $scope.setBetSlipType({'name': 'single', 'value': 1});
        }
        $scope.quickBetEnabled = false;

        Storage.remove('betslip');

        updateBetslipSubscription();
        broadcastBetslipState();
        clearFreeBet();
        $scope.showRetainsButtons = false;
    };

    /**
     * @ngdoc method
     * @name addBet
     * @methodOf betting.controller:betSlipController
     * @param {Object} event event object
     * @param {Object} data bet data object
     * @description adds bet to betslip and stores betslip in local storage
     */
    function addBet(event, data) {
        if (!addBetInProgress && !$scope.isBetsInProgress && $scope.quickBet.status !== 'processing' && ($filter('oddConvert')(data.event.price, 'decimal')) != 1 && !data.game.is_blocked && (Config.betting.enableHorseRacingBetSlip || (!Config.betting.enableHorseRacingBetSlip && data.event.price  !== undefined))) {//temporary reject add events without price into betslip

            addBetInProgress = true;
            $scope.isBetAccepted = false;
            $scope.isBetOnHold = false;

            if ($scope.quickBetEnabled) {
                $scope.placeQuickBet(data);
            } else {

                console.log('addBet', data);

                $scope.betSlip.generalBetResult = "";
                $scope.betSlip.bookingResultId = "";

                if (!data.event || !data.game || !data.market || data.event.is_empty) {
                    console.warn('betslip got invalid data:', data);
                    return;
                }
                //check duplicate and delete it
                var isDuplicate = false;
                angular.forEach($scope.betSlip.bets, function (value) {

                    if (value.eventId === data.event.id) {
                        if (value.oddType === data.oddType) {
                            $scope.removeBet(value);
                        } else {
                            value.oddType = data.oddType;
                        }
                        isDuplicate = true;
                    }
                });
                if (!isDuplicate) {

                    $scope.sysBetSelectedValue = 2;

                    if ($scope.betSlip.bets.length === 1 && $scope.betSlip.type.value === 1) {
                        $scope.betSlip.betterOddSelectionMode = false;

                        if (!$scope.counterOffer.enabled) {
                            $scope.setBetSlipType({'name': 'express', 'value': 2});
                        }
                    }

                    if(Config.main.showPlayerRegion){
                        data.game.team1_name = data.game.team1_reg_name && data.game.team1_name.indexOf(data.game.team1_reg_name) === -1 ? data.game.team1_name + ' (' + data.game.team1_reg_name + ')' : data.game.team1_name;
                        data.game.team2_name = data.game.team2_reg_name && data.game.team2_name.indexOf(data.game.team2_reg_name) === -1 ? data.game.team2_name + ' (' + data.game.team2_reg_name + ')' : data.game.team2_name;
                    }
                    $scope.betSlip.bets.push(
                        {
                            title: (data.game.displayTitle ?  data.game.displayTitle + " " : "") + getBetTitle(data.game),
                            pick: data.event.name,
                            price: data.event.price,
                            base: data.event.base !== undefined ? data.event.base : data.market.base,
                            baseInitial: data.event.base !== undefined ? data.event.base : data.market.base,
                            eventBases: (data.event.base1 !== undefined && data.event.base2 !== undefined) ? [data.event.base1, data.event.base2] : null,
                            priceInitial: data.event.price,
                            betterPrice: calcBetterOdd (data.event.price),
                            marketName: $filter('improveName')(data.market.name, data.game),
                            marketType: data.market.type,
                            marketBase: data.market.base,
                            marketHomeScore: data.market.home_score,
                            marketAwayScore: data.market.away_score,
                            displayKey: data.market.display_key,
                            ewAllowed: !!data.event.ew_allowed,
                            exchangePrice: undefined,
                            eachWay: false,
                            ewCoeff: data.market.ew_coeff,
                            spEnabled: data.event.sp_enabled,
                            oddType: data.oddType,
                            priceChange: null,
                            deleted: false,
                            processing: false,
                            blocked: (data.game.is_blocked || ($filter('oddConvert')(data.event.price, 'decimal')) == 1),
                            excludeIds: data.game.exclude_ids,
                            incInSysCalc: true,
                            banker: false,
                            expressId: (data.market.express_id !== undefined ? data.market.express_id : 1),
                            gameId: data.game.id,
                            eventId: data.event.id,
                            isLive: data.game.is_live !== undefined ? !!data.game.is_live : data.game.type === 1,
                            eventType: data.event.type,
                            eventType1: data.event.type_1,
                            team1Name: data.game.team1_name,
                            team2Name: data.game.team2_name,
                            expMinLen: data.game.express_min_len,
                            singleStake: '',
                            singleUnitStake: '',
                            singlePosWin: 0,
                            conflicts: getBetConflicts(data),
                            gamePointer: {
                                'game': data.game.id,
                                'sport': data.game.isVirtual ? -3 : data.game.sport.id,
                                'vsport':  data.game.isVirtual ? data.game.sport.id : undefined,
                                'competition': data.game.competition.id,
                                'type': (data.game.isVirtual || data.game.type === 2 ? 0 : data.game.type).toString(),
                                'region': data.game.region.id,
                                'alias': data.game.sport.alias
                            }
                        }
                    );

                    DomHelper.scrollBottom('betEventsContainer');
                    // corresponding input is waiting for this event to get focus.
                    // timeout is needed for input to become available for focusing
                    TimeoutWrapper(function () {
                        $scope.$broadcast('bet' + data.event.id);
                    }, 100);

                    updateBetslipSubscription();

                    if ($scope.lustMaxBetResult == $scope.betSlip.stake) {
                        $scope.betSlip.stake = undefined;
                    }
                    $scope.lustMaxBetResult = undefined;
                    checkFreeBet();
                }
                Storage.set('betslip', $scope.betSlip, Config.betting.storedBetslipLifetime);
                broadcastBetslipState();
            }
        }
        addBetInProgress = false;
    }

    /**
     * @ngdoc method
     * @name getBetConflicts
     * @methodOf betting.controller:betslipCtrl
     * @description update bet conflicts
     */
    function getBetConflicts(data) {
        var conflicts = [];
        var pushValues = function pushValues (value) {
            conflicts.push({
                title: value.title,
                pick: value.pick,
                eventId: value.eventId
            });
            value.conflicts.push({
                title: data.game.team1_name + (data.game.team2_name ? ' - ' + data.game.team2_name : ''),
                pick: data.event.name,
                eventId: data.event.id
            });
        }

        angular.forEach($scope.betSlip.bets, function (value) {
            if (value.gameId === data.game.id && (data.market.express_id === undefined || value.expressId === data.market.express_id)) {
                pushValues(value);
            }

            if (value.gameId === data.game.exclude_ids || value.excludeIds === data.game.id) {
                pushValues(value);
            }
        });
        return conflicts;
    }

    /**
     * @ngdoc method
     * @name getBetSlipError
     * @methodOf betting.controller:betSlipController
     * @param {Object} Result object
     * @returns {String}
     * @description return error messages. Used to remove multiple uses in this class
     */
    function getBetSlipError(result, lang) {
        if (result === undefined) {
            return result;
        }
        var showFullMessage = false;
        if (typeof result === 'string' || typeof result === 'number') {
            $scope.betSlip.lastErrorCode = Math.abs(parseInt(result, 10) || 99).toString();
        } else {
            showFullMessage = true;
            $scope.betSlip.lastErrorCode = Math.abs(parseInt(result.code || result.result || result.status || 99, 10)).toString();
        }

        console.log('Betslip error', $scope.betSlip.lastErrorCode);

        var code = 'message_' + $scope.betSlip.lastErrorCode;

        if (result.details && result.details.api_code) {
            return Translator.get('api_' + result.details.api_code, undefined, lang);
        }
        if (Translator.translationExists('custom_' + code)) {
            return Translator.get('custom_' + code, undefined, lang);
        }
        if (!showFullMessage) {
            return Translator.get(code, undefined, lang);
        }
        return Translator.get("Sorry we can't accept your bets now, please try later") + ' (' + Translator.get(code, undefined, lang) + ')';
    }

    /**
     * @ngdoc method
     * @name autoSuperBet
     * @methodOf betting.controller:betSlipController
     * @param {Number} Stake amount
     * @returns {Boolean}
     * @description return true in case of stake amount > superbetLimit
     */

    function autoSuperBet(stake) {
        if ($scope.env.authorized && !$scope.betSlip.hasLiveEvents && Config.betting.autoSuperBetLimit && $rootScope.currency && $rootScope.currency.name && Config.betting.autoSuperBetLimit[$rootScope.currency.name] && stake >= Config.betting.autoSuperBetLimit[$rootScope.currency.name]) {
            return true;
        }
        return false;
    }

    /**
     * @ngdoc method
     * @name processBetEvents
     * @methodOf betting.controller:betSlipController
     * @description Process bet events and put error message in resuls field
     */
    function processBetEvents (result, bet) {
        angular.forEach(result.details, function (betResult) {
            if (bet.eventId != betResult.event_id) {
                return;
            }

            if (betResult.status === "OK") {
                if ($scope.betSlip.type.value !== 1) {
                    bet.result = getBetSlipError(betResult.status);
                } else {
                    bet.isAccepted = false;
                    bet.result = getBetSlipError(result.result);

                }
            } else {
                bet.isAccepted = false;
                bet.result = getBetSlipError(betResult.status);
            }

            bet.processing = false;
        });
    }

    /**
     * @ngdoc method
     * @name placeBookingBet
     * @methodOf betting.controller:betSlipController
     * @description Place booking bet.
     */
    $scope.placeBookingBet = function placeBookingBet() {
        console.log('placeBookingBet');
        if ($scope.betInProgress) {
            return;
        }
        $scope.betInProgress = true;
        $scope.betSlip.generalBetResult = "";
        analytics.gaSend('send', 'event', 'betting', 'PlaceBookingBet ' + (Config.main.sportsLayout) + ($scope.env.live ? '(LIVE)' : '(PM)'), {'page': $location.path(), 'eventLabel': ({1: 'single', 2: 'express', 3: 'system', 4: 'chain'}[$scope.betSlip.type.value])});
        var requests = [];
        var currentBets;

        switch ($scope.betSlip.type.value) {
            case 1:
                currentBets = [];
                angular.forEach($scope.betSlip.bets, function (bet) {
                    currentBets.push({'event_id': bet.eventId, 'amount': parseFloat(bet.singleStake) || 0});
                });
                requests.push({
                    'type': $scope.betSlip.type.value,
                    'source': Config.betting.bet_source,
                    'amount': NaN,
                    'bets': currentBets
                });
                break;
            case 2:
            case 10:
            case 11:
            case 12:
            case 13:
            case 14:
            case 15:
            case 16:
            case 17:
            case 18:
            case 19:
                currentBets = [];
                angular.forEach($scope.betSlip.bets, function (bet) {
                    currentBets.push({'event_id': bet.eventId});
                });
                requests.push({
                    'type': $scope.betSlip.type.value,
                    'source': Config.betting.bet_source,
                    'amount': parseFloat($scope.betSlip.stake),
                    'bets': currentBets
                });
                break;
            case 3:
                currentBets = [];
                angular.forEach($scope.betSlip.bets, function (bet) {
                    currentBets.push({'event_id': bet.eventId});
                    bet.processing = true;
                });
                requests.push({
                    'type': $scope.betSlip.type.value,
                    'source': Config.betting.bet_source,
                    'amount': parseFloat($scope.betSlip.stake),
                    'bets': currentBets,
                    'sys_bet': parseInt($scope.sysBetSelectedValue, 10)
                });
                break;
            case 4:
                currentBets = [];
                angular.forEach($scope.betSlip.bets, function (bet) {
                    currentBets.push({'event_id': bet.eventId});
                });
                requests.push({
                    'type': $scope.betSlip.type.value,
                    'source': Config.betting.bet_source,
                    'amount': parseFloat($scope.betSlip.stake),
                    'bets': currentBets
                });
                break;

            default:
                break;
        }
        var betCounter = 0, haveAcceptedEvent = false;
        angular.forEach(requests, function (request) {
            betCounter++;
            var processBetResults = function (result) {
                console.log("request =", request);
                if (result.result === 0) {
                    haveAcceptedEvent = true;
                    analytics.gaSend('send', 'event', 'betting', 'AcceptedBookingBet ' + (Config.main.sportsLayout) + ($scope.env.live ? '(LIVE)' : '(PM)'), {'page': $location.path(), 'eventLabel': ({1: 'single', 2: 'express', 3: 'system', 4: 'chain'}[$scope.betSlip.type.value])});
                    Utils.setJustForMoment($scope, 'isBetAccepted', true, 30000);
                    $scope.betSlip.bookingResultId = result.details.number;

                    $scope.bookIdPopup(result.details.number);

                    angular.forEach($scope.betSlip.bets, function (value) {
                        if ($scope.betSlip.type.value !== 1 || request.bets[0].event_id == value.eventId) {
                            value.processing = false;
                            value.result = Translator.get('message_OK');
                        }
                    });
                } else if (result.result === -1) {
                    console.log('Error:', result.details);
                    $scope.betSlip.generalBetResult = getBetSlipError(result);
                    analytics.gaSend('send', 'event', 'betting', 'RejectedBookingBet ' + (Config.main.sportsLayout) + ($scope.env.live ? '(LIVE)' : '(PM)'),  {'page': $location.path(), 'eventLabel': ('err(' + result.result + ') - ' + result.details)});
                    angular.forEach($scope.betSlip.bets, function (value) {
                        value.processing = false;
                    });
                    $scope.betInProgress = false;
                } else {
                    console.log('do bet result', result.result);
                    if (Translator.get('message_' + result.result) !== ('message_' + result.result)) {
                        $scope.betSlip.generalBetResult = getBetSlipError(result.result);
                    } else if (Translator.get('message_' + result.result, undefined, 'eng') !== ('message_' + result.result)) {
                        $scope.betSlip.generalBetResult = getBetSlipError(result.result, undefined, 'eng');
                    } else {
                        $scope.betSlip.generalBetResult =  getBetSlipError(result);
                    }
                    angular.forEach($scope.betSlip.bets, function (bet) {
                        if (result.details && result.details !== null) {
                            processBetEvents(result, bet);
                        } else {
                            bet.processing = false;
                        }

                    });
                    $scope.betInProgress = false;
                }
            };

            Zergling
                .get(request, 'book_bet').then(processBetResults)['catch'](function (reason) {
                console.log('Error:', reason);
                $scope.betSlip.generalBetResult = getBetSlipError(reason);
                analytics.gaSend('send', 'event', 'betting', 'RejectedBookingBet ' + (Config.main.sportsLayout) + ($scope.env.live ? '(LIVE)' : '(PM)'), {'page': $location.path(), 'eventLabel': ('err(' + reason.code + ') - ' + reason.msg)});
                angular.forEach($scope.betSlip.bets, function (value) {
                    value.processing = false;
                });
            })['finally'](function () {
                if ((Config.partner.balanceRefreshPeriod || Config.main.rfid.balanceRefreshPeriod) && haveAcceptedEvent && requests.length === betCounter) { // refresh balance right after doing bet in integration skin
                    $rootScope.$broadcast('refreshBalance');
                }
            });
        });
        $scope.betInProgress = false;
    };

    /**
     * @ngdoc method
     * @name thereIsPriceChange
     * @methodOf betting.controller:betSlipController
     * @description  Indicate if bet slip events price is changing
     */

    $scope.thereIsPriceChange = function thereIsPriceChange() {
        var indicator = false;
        var priceAcceptanceValue = parseInt($scope.acceptPriceChanges, 10);
        angular.forEach($scope.betSlip.bets, function (b) {
            if (b.oddType !== 'sp' && ((b.price - b.priceInitial < 0 && priceAcceptanceValue !== 2) || (b.price - b.priceInitial !== 0 && priceAcceptanceValue === 0))) {
                indicator = true;
            }
        });

        return indicator;
    };

    /**
     * @ngdoc method
     * @name placeQuickBet
     * @methodOf betting.controller:betSlipController
     * @param {Object} selected event
     * @description place Quick Bet
     */

    $scope.placeQuickBet = function placeQuickBet(data) {
        console.log('quick bet data', data);
        if ($scope.betSlip.totalStake > $scope.profile.calculatedBalance + $scope.profile.calculatedBonus && Config.main.sportsLayout === 'euro2016') {
            $scope.quickBet.status = 'error';
            $scope.quickBet.massage = Translator.get('Insufficient balance');
        } else if ($scope.quickBetEnabled && !$scope.hasWrongStakes && !$scope.betSlip.hasEmptyStakes && $scope.env.authorized && !$scope.isBetsInProgress && $scope.betSlip.totalStake <= $scope.profile.calculatedBalance + ($scope.profile.calculatedBonus || 0)) {
            $scope.quickBet.status = 'idle';
            $scope.quickBet.massage = '';

            if (showQuickBetWatcherPromise) {
                TimeoutWrapper.cancel(showQuickBetWatcherPromise);
            }

            var request = {
                'type': 1,
                'source': Config.betting.bet_source,
                'amount': parseFloat($scope.betSlip.stake),
                'mode': autoSuperBet(parseFloat($scope.betSlip.stake)) ? -1 : parseInt($scope.acceptPriceChanges, 10),
                'bets': [
                    {'event_id': data.event.id, 'price': data.oddType === 'sp' ? -1 : data.event.price}
                ]
            };

            if (Config.betting.bonusBetCheckbox) {
                request.wallet_type = $scope.bonusBet.enabled ? 2 : 1;
            }

            if ($scope.freeBetSelected()) {
                request.bonus_id = $scope.freeBet.selected.id;
            }

            var processQuickBetResults = function (result) {
                console.log("request =", request);
                $scope.isBetsInProgress = false;
                if (result.result === 'OK') {
                    if (Config.partner.balanceRefreshPeriod || Config.main.rfid.balanceRefreshPeriod) {
                        $rootScope.$broadcast('refreshBalance');
                    }
                    $scope.quickBet.status = 'accepted';
                    $scope.massage = getBetSlipError(result.result);
                    if(!data.game.isVirtual){
                        addGameToFavorites(data.game);
                    }
                } else if (result.result === -1) {
                    console.log('Error:', result.details);
                    $scope.quickBet.status = 'error';
                } else {
                    $scope.quickBet.status = 'error';
                    $scope.quickBet.massage = getBetSlipError(result.result);
                }
            };

            $scope.quickBet.status = 'processing';
            $scope.isBetsInProgress = true;
            analytics.gaSend('send', 'event', 'betting', 'placeQuickBet' + (Config.main.sportsLayout),  {'page': $location.path(), 'eventLabel': ($scope.env.live ? '(LIVE)' : '(PM)')});
            Zergling
                .get(request, 'do_bet')
                .then(processQuickBetResults)['catch'](
                function (reason) {
                    $scope.quickBet.status = 'error';
                    $scope.isBetsInProgress = false;
                    console.log('Error:', reason);
                }
            );

            showQuickBetWatcherPromise = TimeoutWrapper(function () {
                if ($scope.quickBet.status === 'processing') {
                    $scope.isBetsInProgress = false;
                }
                $scope.quickBet.status = 'idle';
            }, 15000);
        }
    };

    /**
     * @ngdoc method
     * @name clearFreeBet
     * @methodOf betting.controller:betSlipController
     * @description clear FreeBet Data
     */
    function clearFreeBet() {
        $scope.freeBet.selected = null;
        $scope.freeBet.enabled = false;
        $scope.freeBet.list = [];
    }

    /**
     * @ngdoc method
     * @name checkFreeBet
     * @methodOf betting.controller:betSlipController
     * @description check if free bet is avaliable
     */
    function checkFreeBet() {
        if ($rootScope.profile && $rootScope.profile.has_free_bets && $scope.betSlip.bets.length && $scope.env.authorized) {
            var requests = prepareBetsData(false, true);
            if (requests.length > 0) {
                Zergling.get(requests[0], 'get_freebets_for_betslip').then(function (response) {
                    $scope.freeBet.list = [];
                    if (response && response.details) {
                        angular.forEach(response.details, function (details) {
                            if (details.amount){
                                $scope.freeBet.list.push(details);
                            }
                        });
                    }
                    if (!$scope.freeBet.list.length) {
                        clearFreeBet();
                    }
                });
            }
        } else {
            clearFreeBet();
        }
    }

    $scope.$on('profile', checkFreeBet);

    if ($rootScope.profile) {
        TimeoutWrapper(function () {
            checkFreeBet();
        }, 3000);
    }

    $scope.freeBetSelected = function freeBetSelected () {
        return $scope.freeBet.enabled && $scope.freeBet.list && $scope.freeBet.list.length > 0 && $scope.freeBet.selected && $scope.freeBet.selected.id;
    };

    $scope.freeBetStateChanged = function freeBetStateChanged(value) {
        value = value || 0;
        if ($scope.freeBet.enabled && $scope.freeBet.list.length > 0) {
            $scope.freeBet.selected = $scope.freeBet.list[value];
            $scope.betSlip.stake = $scope.freeBet.list[value].amount;
            $scope.freeBetSelectorRadio = value;
        } else {
            $scope.freeBet.selected = undefined;
        }
    };

    /**
     * @ngdoc method
     * @name placeBet
     * @methodOf betting.controller:betSlipController
     * @description Prepares bet data, for booking and betting free bet and single bet events
     * @param {Boolean} True if its a single bet;
     * @param {Boolean} Tru if calculation must be done for free bet;
     */
    function prepareBetsData (singleBetEvent, forFreeBet) {
        var requests = [], data;
        var currentBets;
        switch ($scope.betSlip.type.value) {
            case 1:
                var bets = singleBetEvent ? [singleBetEvent] : $scope.betSlip.bets;
                angular.forEach(bets, function (bet) {
                    if ((!$scope.betSlip.thereAreDeletedEvents && !$scope.thereIsPriceChange() && !isNaN(parseFloat(bet.singleStake))) || forFreeBet) {
                        var isCounterOffer = $scope.counterOffer.enabled && bet.counterOffer > bet.price;
                        data = {
                            'type': $scope.betSlip.type.value,
                            'source': Config.betting.bet_source,
                            'is_offer': $scope.betSlip.betterOddSelectionMode ? 1 : 0,
                            'mode': autoSuperBet(parseFloat(bet.singleStake)) ? -1 : (isCounterOffer ? 3 : parseInt($scope.acceptPriceChanges, 10)),
                            'each_way': bet.eachWay,
                            'bets': [
                                {'event_id': bet.eventId, 'price': bet.oddType === 'sp' ? -1 : $scope.betSlip.betterOddSelectionMode ? bet.betterPrice : (isCounterOffer ? parseFloat(bet.counterOffer) : bet.price)}
                            ]
                        };
                        if (!forFreeBet) {
                            data.amount = parseFloat(bet.singleStake);
                        } else {
                            data.is_live = bet.isLive;
                        }
                        requests.push(data);
                        bet.processing = !forFreeBet;
                    }
                });
                break;
            case 2:
            case 10:
            case 11:
            case 12:
            case 13:
            case 14:
            case 15:
            case 16:
            case 17:
            case 18:
            case 19:
                currentBets = [];
                angular.forEach($scope.betSlip.bets, function (bet) {
                    currentBets.push({'event_id': bet.eventId, 'price': bet.oddType === 'sp' ? -1 : bet.price});
                    bet.processing = !forFreeBet;
                });
                data = {
                    'type': $scope.betSlip.type.value,
                    'source': Config.betting.bet_source,
                    'mode': autoSuperBet(parseFloat($scope.betSlip.stake)) ? -1 : parseInt($scope.acceptPriceChanges, 10),
                    'each_way': $scope.betSlip.eachWayMode,
                    'bets': currentBets
                };
                if (!forFreeBet) {
                    data.amount = parseFloat($scope.betSlip.stake);
                } else {
                    data.is_live = $scope.betSlip.hasLiveEvents;
                }
                requests.push(data);
                break;
            case 3:
                currentBets = [];
                angular.forEach($scope.betSlip.bets, function (bet) {
                    currentBets.push({'event_id': bet.eventId, 'price': bet.oddType === 'sp' ? -1 : bet.price, 'banker': bet.banker ? 1 : 0});
                    bet.processing = !forFreeBet;
                });
                data = {
                    'type': $scope.betSlip.type.value,
                    'source': Config.betting.bet_source,
                    'mode': autoSuperBet(parseFloat($scope.betSlip.stake)) ? -1 : parseInt($scope.acceptPriceChanges, 10),
                    'each_way': $scope.betSlip.eachWayMode,
                    'bets': currentBets,
                    'sys_bet': parseInt($scope.sysBetSelectedValue, 10) + ($scope.betSlip.bankerBetsCount ? $scope.betSlip.bankerBetsCount : 0)
                };
                if (!forFreeBet) {
                    data.amount = parseFloat($scope.betSlip.stake);
                } else {
                    data.is_live = $scope.betSlip.hasLiveEvents;
                }
                requests.push(data);
                break;
            case 4:
                currentBets = [];
                angular.forEach($scope.betSlip.bets, function (bet) {
                    currentBets.push({'event_id': bet.eventId, 'price': bet.oddType === 'sp' ? -1 : bet.price});
                    bet.processing = !forFreeBet;
                });
                data = {
                    'type': $scope.betSlip.type.value,
                    'source': Config.betting.bet_source,
                    'mode': autoSuperBet(parseFloat($scope.betSlip.stake)) ? -1 : parseInt($scope.acceptPriceChanges, 10),
                    'each_way': $scope.betSlip.eachWayMode,
                    'bets': currentBets
                };
                if (!forFreeBet) {
                    data.amount = parseFloat($scope.betSlip.stake);
                } else {
                    data.is_live = $scope.betSlip.hasLiveEvents;
                }
                requests.push(data);
                break;

            default:
                break;
        }
        return requests;
    }

    /**
     * @ngdoc method
     * @name placeBet
     * @methodOf betting.controller:betSlipController
     * @description place current bets
     * @param {Number} Single Event Optional;
     */
    $scope.placeBet = function placeBet(singleBetEvent) {
        console.log('placeBet');

        if ($scope.betInProgress) {
            return;
        }
        $scope.betInProgress = true;
        $scope.betSlip.generalBetResult = "";
        $scope.betSlip.bookingResultId = "";

        analytics.gaSend('send', 'event', 'betting', 'PlaceBet ' + (Config.main.sportsLayout) + ($scope.env.live ? '(LIVE)' : '(PM)'), {'page': $location.path(), 'eventLabel': ({1: 'single', 2: 'express', 3: 'system', 4: 'chain'}[$scope.betSlip.type.value])});
        var requests = prepareBetsData(singleBetEvent);

        var betCounter = 0, haveAcceptedEvent = false;
        angular.forEach(requests, function (request) {
            betCounter++;
            var processBetResults = function (result) {
                console.log("request =", request);
                if (result.result === 'OK') {
                    if(Config.betting.enableRetainSelectionAfterPlacment){
                        $scope.showRetainsButtons = true;
                    }
                    haveAcceptedEvent = true;
                    analytics.gaSend('send', 'event', 'betting', 'AcceptedBet ' + (Config.main.sportsLayout) + ($scope.env.live ? '(LIVE)' : '(PM)'), {'page': $location.path(), 'eventLabel': ({1: 'single', 2: 'express', 3: 'system', 4: 'chain'}[$scope.betSlip.type.value])});

                    if (betAcceptedWatcherPromise) {
                        TimeoutWrapper.cancel(betAcceptedWatcherPromise);
                    }
                    $scope.isBetAccepted = true;
                    $scope.isSuperbet = result.details.is_superbet;

                    var hasCounterOffer = false;
                    betAcceptedWatcherPromise = TimeoutWrapper(function () { $scope.isBetAccepted = false; }, Config.betting.betAcceptedMessageTime);
                    angular.forEach($scope.betSlip.bets, function (value) {
                        if (!value.gamePointer.vsport) {
                            addGameToFavorites({id: value.gameId});
                        }

                        if (value.counterOffer && parseFloat(value.counterOffer) > value.price) {
                            hasCounterOffer = true;
                        }
                        if ($scope.betSlip.type.value !== 1 || request.bets[0].event_id == value.eventId) {
                            $scope.betslipRemoveBetsProcess = true; // bad solution for disable place bet button until removing betslip
                            value.isAccepted = true;
                            value.result = getBetSlipError(result.result);
                            if (Config.betting.alternativeBetSlip) {
                                $rootScope.notificationPopup = {title: Translator.get('Your bet is accepted.')};
                            }
                            TimeoutWrapper(function () {
                                if(!Config.betting.enableRetainSelectionAfterPlacment) {
                                    $scope.removeBet(value);
                                    if (Config.betting.resetAmountAfterBet) {
                                        $scope.betSlip.stake = undefined;
                                    }
                                }
                                $scope.betslipRemoveBetsProcess = false;
                                value.processing = false;

                            }, 1000);
                        }
                    });
                    //superbet for spring================================= // also for counter offer
                    if (Config.main.GmsPlatform && parseInt($scope.acceptPriceChanges, 10) === -1 && !$scope.counterOffer.enabled) {
                        $scope.isBetOnHold = true;
                        /*$rootScope.$broadcast("globalDialogs.addDialog", {
                            type: 'info',
                            tag: 'onHoldConfirm',
                            title: 'On hold',
                            content: 'message_' + result.result
                        });*/
                        $scope.acceptPriceChanges = '0';
                    }
                    //superbet for spring end==============================

                } else if (result.result === -1) {
                    console.log('Error:', result.details);
                    $scope.betSlip.generalBetResult = getBetSlipError(result);
                    analytics.gaSend('send', 'event', 'betting', 'RejectedBet ' + (Config.main.sportsLayout) + ($scope.env.live ? '(LIVE)' : '(PM)'),  {'page': $location.path(), 'eventLabel': ('err(' + result.result + ') - ' + result.details)});
                    if (Config.betting.alternativeBetSlip) {
                        $rootScope.notificationPopup = {title: Translator.get('Your bet is not accepted'), message: $scope.betSlip.generalBetResult};
                    }
                    angular.forEach($scope.betSlip.bets, function (value) {
                        value.processing = false;
                    });
                } else if (result.result === 3019) {
                    console.log('Error:', result.details);
                    $scope.betSlip.generalBetResult = Translator.get("Incompatible bet") + ' (' + result.result + ')';
                    analytics.gaSend('send', 'event', 'betting', 'RejectedBet ' + (Config.main.sportsLayout) + ($scope.env.live ? '(LIVE)' : '(PM)'),  {'page': $location.path(), 'eventLabel': ('err(' + result.result + ') - ' + result.details)});
                    if (Config.betting.alternativeBetSlip) {
                        $rootScope.notificationPopup = {title: Translator.get('Incompatible bet'), message: $scope.betSlip.generalBetResult};
                    }
                    angular.forEach($scope.betSlip.bets, function (value) {
                        value.processing = false;
                    });
                } else {
                    console.log('do bet result', result.result);
                    if (Translator.get('message_' + result.result) !== ('message_' + result.result)) {
                        $scope.betSlip.generalBetResult = getBetSlipError(result.result + ((result.result === '1510' && Config.betting.allowManualSuperBet) ? '_sb' : ''));
                    } else if (Translator.get('message_' + result.result, undefined, 'eng') !== ('message_' + result.result)) {
                        $scope.betSlip.generalBetResult = getBetSlipError(result.result, 'eng');
                    } else {
                        $scope.betSlip.generalBetResult =  getBetSlipError(result);
                    }
                    if (Config.betting.alternativeBetSlip) {
                        $rootScope.notificationPopup = {title: Translator.get('Your bet is not accepted'), message: $scope.betSlip.generalBetResult};
                    }

                    analytics.gaSend('send', 'event', 'betting', 'RejectedBet ' + (Config.main.sportsLayout) + ($scope.env.live ? '(LIVE)' : '(PM)'),  {'page': $location.path(), 'eventLabel': ('err(' + result.result + ') - ' + getBetSlipError(result.result, 'eng'))});
                    if (result.result == '1800' && !Storage.get('settingAutoShowOneDayDelay')) {
                        Storage.set('settingAutoShowOneDayDelay', true, 86400000);
                        $scope.showBetSettings = true;
                    }
                    if (!Config.main.GmsPlatform && result.result == 'ONHOLD') {
                        if (result.details && result.details.bet_id && result.details.bet_id !== -1) {
                            $rootScope.$broadcast('checkSuperBet', result.details.bet_id);
                            $scope.isBetOnHold = true;

                            $rootScope.$broadcast("globalDialogs.addDialog", {
                                type: 'info',
                                tag: 'onHoldConfirm',
                                title: 'On hold',
                                content: 'message_' + result.result
                            });

                            $scope.acceptPriceChanges = '0';
                            analytics.gaSend('send', 'event', 'betting', 'SuperBet ' + (Config.main.sportsLayout) + ($scope.env.live ? '(LIVE)' : '(PM)'), {'page': $location.path(), 'eventLabel': 'place superbet'});
                        }
                    }
                    angular.forEach($scope.betSlip.bets, function (bet) {
                        if (!Config.main.GmsPlatform && result.result == 'ONHOLD') {
                            TimeoutWrapper(function () {
                                $scope.removeBet(bet);
                                bet.processing = false;
                                if (Config.betting.resetAmountAfterBet) {
                                    $scope.betSlip.stake = undefined;
                                }
                            }, 1000);
                            bet.processing = false;
                        } else if (result.details && result.details !== null) {
                            processBetEvents(result, bet);
                        } else {
                            bet.processing = false;
                        }
                    });
                }
                //$scope.betInProgress = false;
                hideBetProcessLoaders();

            };

            if (Config.betting.bonusBetCheckbox) {
                request.wallet_type = $scope.bonusBet.enabled ? 2 : 1;
            }

            if ($scope.freeBetSelected()) {
                request.bonus_id = $scope.freeBet.selected.id;
            }

            if ($scope.bonusBet.enabled) {
                request.is_bonus_money = true;
            }

            Zergling
                .get(request, 'do_bet').then(processBetResults)['catch'](function (reason) {
                console.log('Error:', reason);
                $scope.betInProgress = false;
                $scope.betSlip.generalBetResult = getBetSlipError(reason);
                if (Config.betting.alternativeBetSlip) {
                    $rootScope.notificationPopup = {title: Translator.get('Your bet is not accepted'), message: $scope.betSlip.generalBetResult};
                }
                analytics.gaSend('send', 'event', 'betting', 'RejectedBet ' + (Config.main.sportsLayout) + ($scope.env.live ? '(LIVE)' : '(PM)'), {'page': $location.path(), 'eventLabel': ('err(' + reason.code + ') - ' + reason.msg)});
                angular.forEach($scope.betSlip.bets, function (value) {
                    value.processing = false;
                });
            })['finally'](function () {
                if ((Config.partner.balanceRefreshPeriod || Config.main.rfid.balanceRefreshPeriod) && haveAcceptedEvent && requests.length === betCounter) { // refresh balance right after doing bet in integration skin
                    $rootScope.$broadcast('refreshBalance');
                }
                $scope.betInProgress = false;
            });
        });

    };

    /**
     * @ngdoc method
     * @name factorial
     * @methodOf betting.controller:betSlipController
     * @param {Number} x x
     * @returns {Number} factorial
     * @description calculate factorial
     */
    function factorial(x) {
        if (x !== undefined && !isNaN(x) && x >= 0) {
            return x === 0 ? 1 : (x * factorial(x - 1));
        }
    }

    /**
     * @ngdoc method
     * @name calculateSystemPossibleWin
     * @methodOf betting.controller:betSlipController
     * @returns {Object} possible win and options count
     * @description calculate system possible winning sets system selected value
     */
    function calculateSystemPossibleWin() {
        var tempPosWin = 0;
        var tempPosEwWin = 0;
        var indexArray = [];
        var indexMaxArray = [];
        var tempOdd;
        var tempEwOdd;
        var tempIterator;
        var numOfSysOptions;
        var sysPerBetStake;
        var k = $scope.sysBetSelectedValue;
        var i;
        for (i = 0; i < k; i++) {
            indexArray[i] = i;
            indexMaxArray[i] = $scope.betSlip.bets.length - i;
        }

        indexMaxArray = indexMaxArray.reverse();
        tempIterator = k - 1;
        var m, j;
        while (indexArray[0] <= indexMaxArray[0]) {
            if (indexArray[tempIterator] < indexMaxArray[tempIterator]) {
                if (tempIterator !== k - 1) {
                    tempIterator = k - 1;
                    continue;
                }
                tempOdd = 1;
                tempEwOdd = 1;
                for (m = 0; m < k; m++) {
                    if ($scope.betSlip.bets[indexArray[m]].incInSysCalc && !$scope.betSlip.bets[indexArray[m]].banker) {
                        tempOdd *= $scope.betSlip.bets[indexArray[m]].price;
                        tempEwOdd *= $scope.betSlip.bets[indexArray[m]].ewAllowed && $scope.betSlip.bets[indexArray[m]].ewCoeff ? Math.round((($scope.betSlip.bets[indexArray[m]].price - 1) / $scope.betSlip.bets[indexArray[m]].ewCoeff + 1) * 100) / 100 : $scope.betSlip.bets[indexArray[m]].price;
                        /*tempOdd = Utils.mathCuttingFunction((tempOdd * $scope.betSlip.bets[indexArray[m]].price)*100)/100;
                        tempEwOdd *= $scope.betSlip.bets[indexArray[m]].ewAllowed && $scope.betSlip.bets[indexArray[m]].ewCoeff ? Utils.mathCuttingFunction((($scope.betSlip.bets[indexArray[m]].price - 1) / $scope.betSlip.bets[indexArray[m]].ewCoeff + 1) * 100) / 100 : $scope.betSlip.bets[indexArray[m]].price;*/
                    } else {
                        tempOdd = 0;
                        tempEwOdd = 0;
                    }
                }

                /*tempPosWin += tempOdd;
                tempPosEwWin += tempEwOdd;*/
                tempPosWin = tempPosWin +  Utils.mathCuttingFunction(tempOdd * 100)/100;
                tempPosEwWin = tempPosEwWin + Utils.mathCuttingFunction(tempEwOdd *100)/100;


                indexArray[tempIterator]++;
            } else {
                tempIterator--;

                indexArray[tempIterator]++;

                for (j = tempIterator; j < k - 1; j++) {
                    indexArray[j + 1] = indexArray[j] + 1;
                }
            }

        }

        numOfSysOptions = Math.round(factorial($scope.betSlip.bets.length - $scope.betSlip.bankerBetsCount) / (factorial(k) * factorial($scope.betSlip.bets.length - k - $scope.betSlip.bankerBetsCount)));

        sysPerBetStake = $scope.betSlip.stake / numOfSysOptions;

        if ($scope.betSlip.eachWayMode) {
            sysPerBetStake /= 2;
        }

        return {win: Utils.mathCuttingFunction(tempPosWin * sysPerBetStake*100)/100, ewWin: Utils.mathCuttingFunction(tempPosEwWin * sysPerBetStake*100), options: numOfSysOptions};
    }

    /**
     * @ngdoc method
     * @name calcSystemOptionsCount
     * @methodOf betting.controller:betSlipController
     * @param {Number} number of selected events
     * @description calculate system options count
     */
    $scope.calcSystemOptionsCount = function calcSystemOptionsCount(k) {
        return Math.round(factorial($scope.betSlip.bets.length - $scope.betSlip.bankerBetsCount) / (factorial(k) * factorial($scope.betSlip.bets.length - k - $scope.betSlip.bankerBetsCount)));
    };

    /**
     * @ngdoc method
     * @name expressBonusCalculator
     * @methodOf betting.controller:betSlipController
     * @param {Number} type bonus type,
     * @param {Number} n number of events,
     * @param {Number} k odd,
     * @param {Number} s stake,
     * @description calculate express bonus
     */
    function expressBonusCalculator(type, n, k, s) {
        switch (type) {
            case 1:
                return (k * s - s) * n / 100;
            case 2:
                switch (n) {
                    case 0:
                    case 1:
                    case 2:
                    case 3:
                    case 4:
                    case 5:
                        return (k * s - s) * n / 100;
                    case 6:
                        return (k * s - s) * 0.1;
                    case 7:
                        return (k * s - s) * 0.15;
                    case 8:
                        return (k * s - s) * 0.2;
                    case 9:
                        return (k * s - s) * 0.25;
                    default:
                        return (k * s - s) * 0.3;
                }
            case 3:
                if (k > 2.5) {
                    return (k * s - s) * 0.07;
                }
                break;
            case 4:
                switch (n) {
                    case 0:
                    case 1:
                    case 2:
                    case 3:
                        return 0;
                    case 4:
                        return (k * s - s) * 0.04;
                    case 5:
                        return (k * s - s) * 0.05;
                    case 6:
                        return (k * s - s) * 0.1;
                    case 7:
                        return (k * s - s) * 0.15;
                    case 8:
                        return (k * s - s) * 0.2;
                    case 9:
                        return (k * s - s) * 0.25;
                    default:
                        return (k * s - s) * 0.3;
                }
            case 5:
                switch (n) {
                    case 0:
                    case 1:
                    case 2:
                    case 3:
                    case 4:
                    case 5:
                        return (k * s - s) * n / 100;
                    case 6:
                        return (k * s - s) * 0.1;
                    case 7:
                        return (k * s - s) * 0.15;
                    case 8:
                        return (k * s - s) * 0.2;
                    case 9:
                        return (k * s - s) * 0.25;
                    case 10:
                    case 11:
                    case 12:
                    case 13:
                    case 14:
                        return (k * s - s) * 0.3;
                    default:
                        return (k * s - s) * 0.4;
                }
            case 6:
                switch (n) {
                    case 0:
                    case 1:
                    case 2:
                    case 3:
                    case 4:
                    case 5:
                    case 6:
                    case 7:
                    case 8:
                    case 9:
                        return (k * s - s) * n / 100;
                    default:
                        return (k * s - s) * 0.1;
                }
            case 7:
                switch (n) {
                    case 0:
                    case 1:
                    case 2:
                    case 3:
                        return 0;
                    case 4:
                    case 5:
                    case 6:
                    case 7:
                    case 8:
                    case 9:
                    case 10:
                    case 11:
                    case 12:
                    case 13:
                    case 14:
                        return (k * s - s) * (n * 0.01);
                    default:
                        return (k * s - s) * 0.15;
                }
            case 8:
                switch (n) {
                    case 0:
                    case 1:
                    case 2:
                        return 0;
                    case 3:
                        return (k * s - s) * 0.03;
                    case 4:
                        return (k * s - s) * 0.05;
                    case 5:
                        return (k * s - s) * 0.08;
                    case 6:
                        return (k * s - s) * 0.10;
                    case 7:
                        return (k * s - s) * 0.12;
                    case 8:
                        return (k * s - s) * 0.15;
                    case 9:
                        return (k * s - s) * 0.18;
                    case 10:
                        return (k * s - s) * 0.22;
                    case 11:
                        return (k * s - s) * 0.26;
                    case 12:
                        return (k * s - s) * 0.30;
                    case 13:
                    case 14:
                        return (k * s - s) * 0.35;
                    case 15:
                    case 16:
                        return (k * s - s) * 0.40;
                    case 17:
                    case 18:
                    case 19:
                        return (k * s - s) * 0.45;
                    default:
                        return (k * s - s) * 0.50;
                }
            case 9:
                switch(n){
                    case 0:
                    case 1:
                    case 2:
                    case 3:
                    case 4:
                    case 5:
                        return 0;
                    case 6:
                        return (k * s - s) * 0.10;
                    case 7:
                        return (k * s - s) * 0.15;
                    case 8:
                        return (k * s - s) * 0.20;
                    case 9:
                        return (k * s - s) * 0.25;
                    case 10:
                    case 11:
                    case 12:
                    case 13:
                    case 14:
                    case 15:
                        return (k * s - s) * 0.30;
                    default:
                        return (k * s - s) * 0.40;
                }
            case 10:
                switch (n) {
                    case 0:
                    case 1:
                    case 2:
                        return 0;
                    case 3:
                        return (k * s - s) * 0.04;
                    case 4:
                        return (k * s - s) * 0.05;
                    case 5:
                        return (k * s - s) * 0.08;
                    case 6:
                        return (k * s - s) * 0.1;
                    case 7:
                        return (k * s - s) * 0.12;
                    case 8:
                        return (k * s - s) * 0.14;
                    case 9:
                        return (k * s - s) * 0.16;
                    case 10:
                    case 11:
                    case 12:
                    case 13:
                    case 14:
                        return (k * s - s) * 0.3;
                    case 15:
                    case 16:
                    case 17:
                    case 18:
                    case 19:
                        return (k * s - s) * 0.4;
                    default:
                        return (k * s - s) * 0.5;
                }
            case 11:
                switch (n) {
                    case 0:
                    case 1:
                    case 2:
                    case 3:
                    case 4:
                        return 0;
                    case 5:
                    case 6:
                        return (k * s - s) * 0.05;
                    case 7:
                    case 8:
                        return (k * s - s) * 0.1;
                    case 9:
                    case 10:
                        return (k * s - s) * 0.15;
                    case 11:
                    case 12:
                        return (k * s - s) * 0.2;
                    case 13:
                    case 14:
                        return (k * s - s) * 0.25;
                    case 15:
                    case 16:
                    case 17:
                    case 18:
                    case 19:
                    case 20:
                    case 21:
                    case 22:
                    case 23:
                    case 24:
                    case 25:
                        return (k * s - s) * 0.3;
                    case 26:
                    case 27:
                    case 28:
                    case 29:
                        return (k * s - s) * 0.5;
                    default:
                        return (k * s - s) * 1;
                }
            case 12:
                if (k >= 6) {
                    switch (n) {
                        case 0:
                        case 1:
                        case 2:
                        case 3:
                        case 4:
                            return 0;
                        case 5:
                            return (k * s - s) * 0.05;
                        case 6:
                            return (k * s - s) * 0.07;
                        case 7:
                            return (k * s - s) * 0.10;
                        case 8:
                            return (k * s - s) * 0.15;
                        case 9:
                            return (k * s - s) * 0.20;
                        default:
                            return (k * s - s) * 0.30;
                    }
                }
                return 0;
            case 13:
                switch (n) {
                    case 0:
                    case 1:
                        return 0;
                    case 2:
                        return (k * s - s) * 0.025;
                    case 3:
                        return (k * s - s) * 0.03;
                    case 4:
                        return (k * s - s) * 0.04;
                    case 5:
                    case 6:
                    case 7:
                    case 8:
                    case 9:
                    case 10:
                        return (k * s - s) * 0.10;
                    case 11:
                    case 12:
                    case 13:
                    case 14:
                    case 15:
                        return (k * s - s) * 0.15;
                    case 16:
                    case 17:
                    case 18:
                    case 19:
                    case 20:
                    case 21:
                    case 22:
                    case 23:
                    case 24:
                        return (k * s - s) * 0.20;
                    default:
                        return (k * s - s) * 0.30;
                }
            case 14:
                switch (n) {
                    case 0:
                    case 1:
                    case 2:
                    case 3:
                    case 4:
                        return 0;
                    case 5:
                        return (k * s - s) * 0.05;
                    case 6:
                        return (k * s - s) * 0.09;
                    case 7:
                        return (k * s - s) * 0.13;
                    case 8:
                        return (k * s - s) * 0.16;
                    case 9:
                        return (k * s - s) * 0.20;
                    case 10:
                        return (k * s - s) * 0.23;
                    case 11:
                    case 12:
                    case 13:
                    case 14:
                    case 15:
                        return (k * s - s) * 0.26;
                    case 16:
                    case 17:
                    case 18:
                    case 19:
                    case 20:
                        return (k * s - s) * 0.30;
                    default:
                        return (k * s - s) * 0.40;
                }
            case 15:
                switch (n) {
                    case 0:
                    case 1:
                    case 2:
                        return 0;
                    case 3:
                        return (k * s - s) * 0.01;
                    case 4:
                        return (k * s - s) * 0.02;
                    case 5:
                        return (k * s - s) * 0.03;
                    case 6:
                        return (k * s - s) * 0.04;
                    case 7:
                        return (k * s - s) * 0.06;
                    case 8:
                        return (k * s - s) * 0.08;
                    case 9:
                        return (k * s - s) * 0.10;
                    case 10:
                        return (k * s - s) * 0.12;
                    case 11:
                        return (k * s - s) * 0.15;
                    case 12:
                        return (k * s - s) * 0.18;
                    case 13:
                        return (k * s - s) * 0.21;
                    case 14:
                        return (k * s - s) * 0.24;
                    case 15:
                        return (k * s - s) * 0.28;
                    case 16:
                        return (k * s - s) * 0.32;
                    case 17:
                        return (k * s - s) * 0.36;
                    case 18:
                        return (k * s - s) * 0.50;
                    case 19:
                        return (k * s - s) * 0.45;
                    default:
                        return (k * s - s) * 0.50;
                }
            case 16:
                switch (n) {
                    case 0:
                    case 1:
                    case 2:
                    case 3:
                    case 4:
                    case 5:
                        return 0;
                    case 6:
                        return (k * s - s) * 0.10;
                    case 7:
                        return (k * s - s) * 0.15;
                    case 8:
                        return (k * s - s) * 0.20;
                    case 9:
                        return (k * s - s) * 0.25;
                    case 10:
                    case 11:
                    case 12:
                    case 13:
                    case 14:
                    case 15:
                        return (k * s - s) * 0.30;
                    default:
                        return (k * s - s) * 0.40;
                }
            case 17:
                switch (n) {
                    case 0:
                    case 1:
                    case 2:
                    case 3:
                    case 4:
                        return 0;
                    case 5:
                        return (k * s - s) * 0.05;
                    case 6:
                        return (k * s - s) * 0.07;
                    case 7:
                        return (k * s - s) * 0.10;
                    case 8:
                        return (k * s - s) * 0.15;
                    case 9:
                        return (k * s - s) * 0.20;
                    case 10:
                    case 11:
                    case 12:
                    case 13:
                    case 14:
                        return (k * s - s) * 0.30;
                    default:
                        return (k * s - s) * 0.40;
                }
            case 18:
                switch (n) {
                    case 0:
                    case 1:
                    case 2:
                    case 3:
                    case 4:
                        return 0;
                    case 5:
                        return (k * s - s) * 0.05;
                    case 6:
                        return (k * s - s) * 0.06;
                    case 7:
                        return (k * s - s) * 0.07;
                    case 8:
                        return (k * s - s) * 0.08;
                    case 9:
                        return (k * s - s) * 0.09;
                    case 10:
                    case 11:
                    case 12:
                    case 13:
                    case 14:
                    case 15:
                        return (k * s - s) * 0.15;
                    case 16:
                    case 17:
                    case 18:
                    case 19:
                    case 20:
                        return (k * s - s) * 0.20;
                    default:
                        return (k * s - s) * 0.30;
                }
            case 19:
                switch (n) {
                    case 0:
                    case 1:
                    case 2:
                    case 3:
                        return 0;
                    case 4:
                    case 5:
                    case 6:
                    case 7:
                    case 8:
                    case 9:
                        return (k * s - s)* 0.065
                    case 10:
                    case 11:
                    case 12:
                    case 13:
                    case 14:
                    case 15:
                        return (k * s - s) * 0.15;
                    case 16:
                    case 17:
                    case 18:
                    case 19:
                    case 20:
                    case 21:
                    case 22:
                    case 23:
                    case 24:
                    case 25:
                        return (k * s - s) * 0.18;
                    case 26:
                    case 27:
                    case 28:
                    case 29:
                    case 30:
                        return (k * s - s) * 0.2;
                    default:
                        return (k * s - s) * 0.23;
                }
            case 20:
                switch (n) {
                    case 0:
                    case 1:
                    case 2:
                        return 0;
                    case 3:
                        return (k * s - s) * 0.03;
                    case 4:
                        return (k * s - s) * 0.04;
                    case 5:
                    case 6:
                        return (k * s - s) * 0.05;
                    case 7:
                    case 8:
                    case 9:
                        return (k * s - s) * 0.07;
                    case 10:
                        return (k * s - s) * 0.15;
                    case 11:
                    case 12:
                    case 13:
                    case 14:
                    case 15:
                        return (k * s - s) * 0.2;
                    case 16:
                    case 17:
                    case 18:
                    case 19:
                    case 20:
                        return (k * s - s) * 0.35;
                    default:
                        return (k * s - s) * 0.50;
                }
            case 21:
                switch (n) {
                    case 0:
                    case 1:
                        return 0;
                    case 2:
                    case 3:
                    case 4:
                    case 5:
                    case 6:
                    case 7:
                    case 8:
                    case 9:
                        return (k * s - s) * (n - 1) / 100;
                    case 10:
                    case 11:
                    case 12:
                    case 13:
                    case 14:
                    case 15:
                        return (k * s - s) * 0.1;
                    default:
                        return (k * s - s) * 0.2;
                }
            case 22:
                switch (n) {
                    case 0:
                    case 1:
                        return 0;
                    case 2:
                        return (k * s - s) * 0.02;
                    case 3:
                        return (k * s - s) * 0.03;
                    case 4:
                        return (k * s - s) * 0.04;
                    case 5:
                        return (k * s - s) * 0.05;
                    case 6:
                        return (k * s - s) * 0.06;
                    case 7:
                        return (k * s - s) * 0.07;
                    case 8:
                        return (k * s - s) * 0.08;
                    case 9:
                        return (k * s - s) * 0.09;
                    default:
                        return (k * s - s) * 0.40;
                }
            case 23:
                switch (n) {
                    case 0:
                    case 1:
                    case 2:
                        return 0;
                    case 3:
                        return (k * s - s) * 0.03;
                    case 4:
                        return (k * s - s) * 0.05;
                    case 5:
                        return (k * s - s) * 0.10;
                    case 6:
                        return (k * s - s) * 0.15;
                    case 7:
                        return (k * s - s) * 0.20;
                    case 8:
                        return (k * s - s) * 0.25;
                    case 9:
                        return (k * s - s) * 0.30;
                    case 10:
                        return (k * s - s) * 0.35;
                    case 11:
                        return (k * s - s) * 0.40;
                    case 12:
                        return (k * s - s) * 0.45;
                    default:
                        return (k * s - s) * 0.50;
                }
        }

        return;
    }

    var calculateExpressBonus;
    if ($injector.has('ExpressBonusCalculator')) {
        calculateExpressBonus = $injector.get('ExpressBonusCalculator').calculate;
    } else {
        calculateExpressBonus = function (betSlip) {
            var minOdd = $scope.betConf.expressBonusMinOdd, length = betSlip.bets.length;
            for (var i = 0; i < length; i++) {
                if(betSlip.bets[i].price < minOdd) {
                    return 0;
                }
            }
            console.log((expressBonusCalculator(Config.betting.expressBonusType, betSlip.bets.length, betSlip.expOdds, betSlip.stake) * 100 || 0) / 100);
            return Math.round(expressBonusCalculator(Config.betting.expressBonusType, betSlip.bets.length, betSlip.expOdds, betSlip.stake) * 100 || 0) / 100;
        };
    }
    calculateExpressBonus = Utils.memoize(calculateExpressBonus);


    /**
     * @ngdoc method
     * @name posWin
     * @methodOf betting.controller:betSlipController
     * @description calculate possible Win for current bets
     */
    $scope.posWin = function posWin() {

        var totalOdd = 1;
        var ewOdd = 1;
        var possibleWin = 0;
        var bankerTotalPrice = 1;
        var tmpBankerBetsCount = 0;
        var sameGameIds = {};
        $scope.betSlip.hasConflicts = false;
        $scope.betSlip.hasEachWayReadyEvents = false;
        $scope.betSlip.hasSingleOnlyEvents = false;
        $scope.betSlip.hasWrongStakes = false;
        $scope.betSlip.hasEmptyStakes = false;
        $scope.betSlip.hasLockedEvents = false;
        $scope.betSlip.thereAreDeletedEvents = false;
        $scope.betSlip.hasSpOddTypes = false;
        $scope.betSlip.hasLiveEvents = false;
        $scope.betSlip.hasEventsFromSameGame = false;
        $scope.betSlip.sysValArray = [];
        $scope.betSlip.hasCounterOfferError = false;

        function setMaxWinLimit(value) {
            if ($scope.env.authorized && $rootScope.currency && $rootScope.currency.rounding !== undefined && !isNaN($rootScope.currency.rounding)) {
                if (Config.betting.maxWinLimit && $rootScope.currency.amd_rate && value * $rootScope.currency.amd_rate > Config.betting.maxWinLimit) {
                    return parseFloat((Config.betting.maxWinLimit / $rootScope.currency.amd_rate).toFixed(Math.abs($rootScope.currency.rounding)));
                }
                return parseFloat(value.toFixed(Math.abs($rootScope.currency.rounding)));
            }
            return parseFloat(value);
        }

        if (!$scope.quickBetEnabled) {
            $scope.isBetsInProgress = false;
            $scope.quickBet.status = 'idle';
        } else {
            $scope.quickBetStakeCoeff = Config.betting.quickBet.quickBetStakeCoeffs[$rootScope.currency.name];
            if (!$scope.quickBetStakeSelector) {
                $scope.quickBetStakeSelector = Config.betting.quickBet.quickBetStakeCoeffs[$rootScope.currency.name]
            }
        }

        if ($scope.betSlip.sysValArray === undefined || $scope.betSlip.sysValArray.length !== ($scope.betSlip.bets.length - 2)) {
            $scope.betSlip.sysValArray = [];
        }

        if ($scope.betSlip.type.value === 1 && !$scope.quickBetEnabled) {
            $scope.betSlip.totalStake = 0;
        } else {
            $scope.betSlip.totalStake = parseFloat($scope.betSlip.stake);
        }
        angular.forEach($scope.betSlip.bets, function (bet, i) {
            switch ($scope.betSlip.type.value) {
                case 1://single
                    if ($scope.betSlip.bets.length === 1 && !Config.betting.alternativeBetSlip) {
                        bet.singleStake = $scope.betSlip.stake;
                        bet.singleUnitStake = $scope.betSlip.unitStake;
                        bet.eachWay = $scope.betSlip.eachWayMode;
                    }
                    $scope.betSlip.hasWrongStakes = $scope.betSlip.hasWrongStakes || (isNaN(parseFloat(bet.singleStake)) && bet.singleStake != "") || parseFloat(bet.singleStake) < 0;
                    $scope.betSlip.hasEmptyStakes = $scope.betSlip.hasEmptyStakes || bet.singleStake == "" || parseFloat(bet.singleStake) == 0;
                    if (!isNaN(parseFloat(bet.singleStake)) && parseFloat(bet.singleStake) > 0 && !bet.deleted && bet.oddType !== 'sp' && !bet.blocked) {
                        $scope.betSlip.totalStake += (bet.singleStake * 1);
                        var realPrice = $scope.betSlip.betterOddSelectionMode ? bet.betterPrice : ($scope.counterOffer.enabled && bet.counterOffer > bet.price ? bet.counterOffer : (Config.main.decimalFormatRemove3Digit ? parseFloat($filter('oddConvert')(bet.price, 'decimal')): bet.price));
                        if (bet.eachWay && bet.ewAllowed && bet.ewCoeff) {
                            bet.singlePosWin = setMaxWinLimit(mathCuttingFunction(((((realPrice - 1) / bet.ewCoeff + 1) + realPrice) * bet.singleUnitStake) * 10 * 10 || 0) / 100);
                        } else {
                            bet.singlePosWin = setMaxWinLimit(mathCuttingFunction((realPrice * bet.singleStake) * 10 * 10 || 0) / 100);
                        }
                        possibleWin += bet.singlePosWin;

                        $scope.betSlip.hasCounterOfferError = $scope.counterOffer.enabled && ($scope.betSlip.hasCounterOfferError || bet.singleStake < $scope.counterOffer.minAmount || !bet.counterOffer || bet.counterOffer <= bet.price || bet.counterOffer > bet.price / 0.95);
                    } else {
                        bet.singlePosWin = 0;
                    }
                    break;
                case 2: //express
                    var betPrice = Config.main.decimalFormatRemove3Digit ? (mathCuttingFunction(bet.price * 10 * 10) / 100) : bet.price;
                    totalOdd *= betPrice;
                    ewOdd *= bet.ewAllowed && bet.ewCoeff ? mathCuttingFunction(((betPrice - 1) / bet.ewCoeff + 1) * 10 * 10) / 100 : betPrice;
                    break;
                case 3: //system
                    if ($scope.betSlip.sysValArray.length < ($scope.betSlip.bets.length - 2 - $scope.betSlip.bankerBetsCount) && i > 1) {
                        $scope.betSlip.sysValArray.push(i);
                    }
                    break;
            }
            if ($scope.betSlip.type.value !== 1 && bet.conflicts.length) {
                $scope.betSlip.hasConflicts = true;
            }

            if (sameGameIds[bet.gameId]) {
                $scope.betSlip.hasEventsFromSameGame = true;
            }
            sameGameIds[bet.gameId] = true;

            if (bet.ewAllowed) {
                $scope.betSlip.hasEachWayReadyEvents = true;
            }
            if ($scope.betSlip.type.value !== 1 && bet.expMinLen === 1) {
                $scope.betSlip.hasSingleOnlyEvents = true;
            }

            if (bet.blocked) {
                $scope.betSlip.hasLockedEvents = true;
            }

            if (bet.isLive) {
                $scope.betSlip.hasLiveEvents = true;

                if (!Config.betting.allowSuperBetOnLive && $scope.betSlip.superbetSelector) {
                    $scope.betSlip.superbetSelector = false;
                    if (parseInt($scope.acceptPriceChanges, 10) === -1) {
                        $scope.acceptPriceChanges = '0';
                    }
                }

                $scope.counterOffer.enabled && $scope.toggleCounterOffer();
            }

            if (bet.deleted) {
                $scope.betSlip.thereAreDeletedEvents = true;
            }

            if (bet.processing || ($scope.quickBetEnabled && $scope.quickBet.status === 'processing')) {
                $scope.isBetsInProgress = true;
            }

            if (bet.oddType !== 'odd') {
                $scope.betSlip.hasSpOddTypes = true;
            }

            if (bet.banker && bet.price) {
                bankerTotalPrice *= bet.price;
                tmpBankerBetsCount++;
            }

        });

        if ($scope.betSlip.bankerBetsCount !== tmpBankerBetsCount) {
            $scope.betSlip.bankerBetsCount = tmpBankerBetsCount;
            $scope.sysBetSelectedValue = 2;
        }

        if (!$scope.betSlip.hasEachWayReadyEvents) {
            $scope.betSlip.eachWayMode = false;
        }

        if (($scope.betSlip.type.value !== 1 || $scope.quickBetEnabled) && (isNaN(parseFloat($scope.betSlip.stake)) && $scope.betSlip.stake != "") || parseFloat($scope.betSlip.stake) < 0) {
            $scope.betSlip.hasWrongStakes = true;
        }

        if (($scope.betSlip.type.value !== 1 || $scope.quickBetEnabled) && ($scope.betSlip.stake == "" || parseFloat($scope.betSlip.stake) == 0)) {
            $scope.betSlip.hasEmptyStakes = true;
        }

        if (parseInt($scope.acceptPriceChanges, 10) === -1 && ($scope.betSlip.type.value > 2 || $scope.quickBetEnabled)) {
            $scope.acceptPriceChanges = '0';
        }

        if ($scope.betSlip.bets.length > 0) {
            $scope.betSlip.divisionCoefficient = ($scope.betSlip.eachWayMode ? 2 : 1) * ($scope.betSlip.type.value === 3 && $scope.calcSystemOptionsCount($scope.sysBetSelectedValue) > 0 ? $scope.calcSystemOptionsCount($scope.sysBetSelectedValue) : 1);
        }

        if (($scope.betSlip.type.value !== 1 && ($scope.betSlip.bets.length < 2 || $scope.betSlip.hasSingleOnlyEvents)) || ($scope.betSlip.type.value === 3 && $scope.betSlip.bets.length < 3) ||
            ($scope.betSlip.type.value !== 1 && (isNaN($scope.betSlip.stake) || !$scope.betSlip.stake)) || $scope.betSlip.hasConflicts || $scope.betSlip.hasWrongStakes || $scope.betSlip.hasEmptyStakes ||
            $scope.betSlip.hasLockedEvents || $scope.betSlip.thereAreEventBaseChanges || Config.betting.enableBankerBet && ($scope.betSlip.bets.length - $scope.betSlip.bankerBetsCount < 2) || ($scope.betSlip.type.value === 1 && $scope.betSlip.hasEventsFromSameGame && Config.betting.blockSingleGameBets)) {
            $scope.betSlip.isBettingAllowed = false;
        } else {
            $scope.betSlip.isBettingAllowed = true;
        }

        switch ($scope.betSlip.type.value) {
            case 1:
                if ($scope.betSlip.bets.length === 1 && !Config.betting.alternativeBetSlip && $scope.betSlip.stake && ($scope.freeBetSelected() || $scope.bonusBet.enabled)) {
                    possibleWin -= $scope.betSlip.stake;
                }
                return setMaxWinLimit(mathCuttingFunction(possibleWin * 10 * 10 || 0) / 100);
            case 2:
                if (totalOdd > Config.betting.totalOddsMax) {
                    totalOdd = Config.betting.totalOddsMax;
                    if (Config.betting.enableLimitExceededNotifications && !oddLimitExceededFlag) {
                        $rootScope.$broadcast("globalDialogs.addDialog", {
                            title: 'Odd limit exceeded',
                            type: 'info',
                            content: 'You have already reached your Max Odd limit. Any additional event added will not increase the Total Odd'
                        });
                        oddLimitExceededFlag = true;
                    }
                } else {
                    oddLimitExceededFlag = false;
                }
                $scope.betSlip.expOdds = mathCuttingFunction(totalOdd * 10 * 10) / 100;
                totalOdd = $scope.betSlip.expOdds;
                $scope.betSlip.expBonus = calculateExpressBonus($scope.betSlip);
                if ($scope.betSlip.eachWayMode && ewOdd > 1 && $scope.betSlip.unitStake) {
                    return setMaxWinLimit(mathCuttingFunction(((totalOdd + ewOdd) * $scope.betSlip.unitStake) * 10 * 10 || 0) / 100);
                }
                if ($scope.betSlip.stake && ($scope.freeBetSelected() || $scope.bonusBet.enabled)) {
                    return setMaxWinLimit(mathCuttingFunction((totalOdd * $scope.betSlip.stake - $scope.betSlip.stake) * 10 * 10 || 0) / 100);
                }
                return setMaxWinLimit(mathCuttingFunction((totalOdd * $scope.betSlip.stake) * 10 * 10 || 0) / 100);
            case 3:
                if ($scope.betSlip.bets.length > 2) {
                    var tempResult = calculateSystemPossibleWin();
                    $scope.betSlip.sysOptions = tempResult.options;
                    if ($scope.betSlip.eachWayMode) {
                        return setMaxWinLimit(mathCuttingFunction((tempResult.win + tempResult.ewWin) * 1000 || 0) / 1000);
                    }
                    if ($scope.betSlip.stake && $scope.bonusBet.enabled) {
                        return setMaxWinLimit(mathCuttingFunction((bankerTotalPrice * tempResult.win - $scope.betSlip.stake) * 1000 || 0) / 1000);
                    }
                    return setMaxWinLimit(mathCuttingFunction((bankerTotalPrice * tempResult.win) * 1000 || 0) / 1000);
                }
                break;
            default:
                return 0;
        }
    };


    $scope.$on('bet', addBet);

    /**
     * @ngdoc method
     * @name setBetSlipType
     * @methodOf betting.controller:betSlipController
     * @description sets betslip type

     * @param {object} type betslip type, one of the following: single, express, system, chain
     */
    $scope.setBetSlipType = function setBetSlipType(type) {
        $scope.betSlip.type = type;
        Storage.set('betslip', $scope.betSlip, Config.betting.storedBetslipLifetime);
        if (parseInt($scope.acceptPriceChanges, 10) === -1 && type.value > 2) {
            $scope.acceptPriceChanges = '0';
        }
        checkFreeBet();

        if (type.value !== 1) {
            $scope.counterOffer.enabled = false;
        }
    };

    /**
     * @ngdoc method
     * @name setSystemValue
     * @methodOf betting.controller:betSlipController
     * @param {Number} val selected value
     * @description sets system selected value
     */

    $scope.setSystemValue = function setSystemValue(val) {
        $scope.sysBetSelectedValue = val;
    };

    /**
     * @ngdoc method
     * @name openLoginForm
     * @methodOf betting.controller:betSlipController
     * @description broadcasts a message to open slider with login form
     *
     * @param {Object} $event click event
     */
    $scope.openLoginForm = function openLoginForm($event) {
        if (!Config.main.integrationMode) {
            $rootScope.$broadcast("openLoginForm");
            $event.stopPropagation();
        } else if (Config.partner.enableSigninRegisterCallbacks) {
            partner.call('login', 'betslip');
        }
    };

    /**
     * @ngdoc method
     * @name openRegisterForm
     * @methodOf betting.controller:betSlipController
     * @description broadcasts a message to open slider with register form
     *
     * @param {Object} $event click event
     */
    $scope.openRegForm = function openRegForm($event) {
        if (!Config.main.integrationMode) {
            $rootScope.$broadcast("openRegForm");
            $event.stopPropagation();
        } else if (Config.partner.enableSigninRegisterCallbacks) {
            partner.call('register', 'betslip');
        }
    };

    /**
     * @ngdoc method
     * @name deposit
     * @methodOf betting.controller:betSlipController
     * @description calls partner callback function to open deposit page(integration mode)
     */
    $scope.openPartnerDeposit = function openPartnerDeposit() {
        partner.call('deposit', 'betslip');
    };

    /**
     * @ngdoc method
     * @name gotoBetGame
     * @methodOf betting.controller:betSlipController
     * @description  Navigates to Events game
     *
     * @param {Object} gamePointer game object
     */
    $scope.gotoBetGame = function gotoBetGame(gamePointer) {
        $location.search({
            'type': gamePointer.type,
            'sport': gamePointer.sport.id !== undefined ? gamePointer.sport.id : gamePointer.sport,
            'region': gamePointer.region,
            'competition': gamePointer.competition,
            'game': gamePointer.game,
            'vsport': gamePointer.vsport
        });

        if (gamePointer.alias && Config.main.sportsLayout === 'Combo' && gamePointer.sport !== - 3) {
            $location.search('alias', gamePointer.alias);
        }

        var neededPath = gamePointer.sport === - 3 ? '/virtualsports' : Utils.getPathAccordintToAlias(gamePointer.alias);

        if ($location.path() !== neededPath + '/') {
            $location.path(neededPath);
        } else {
            $route.reload();
        }
    };

    /**
     * @ngdoc method
     * @name betFromKeyboard
     * @methodOf betting.controller:betSlipController
     * @description  Place Bet by pressing Enter key on keyboard
     * @param {Object} $event keypress event
     */

    $scope.betFromKeyboard = function betFromKeyboard($event) {

        if (Config.betting.disableBetFromKeyboard) {
            return;
        }
        if (($scope.betSlip.type.value !== 1 || $scope.quickBetEnabled) && ($scope.betSlip.stake == "" || parseFloat($scope.betSlip.stake) == 0)) {
            $scope.betSlip.hasEmptyStakes = true;
        }else{
            $scope.betSlip.hasEmptyStakes = false;
        }

        if ($event.keyCode == 13 && !($scope.thereIsPriceChange() || !$scope.betSlip.isBettingAllowed || !$scope.env.authorized || $scope.isBetsInProgress || $scope.betSlip.thereAreDeletedEvents || $scope.betSlip.hasCounterOfferError || ($scope.env.authorized && !$scope.freeBet.enabled && $scope.betSlip.totalStake > $scope.profile.balance + $scope.profile.bonus_balance + ($scope.profile.bonus_win || 0)))) {
            $scope.placeBet();
        }
    };

    /**
     * @ngdoc function
     * @name getDisplayBase
     * @methodOf betting.controller:betSlipController
     * @description returns base to display
     *
     * @param {Object} bet bet object
     * @param {Boolean} initial truthy to display initial base, falsy for current
     *
     * @returns {String} base to display
     */
    $scope.getDisplayBase = function getDisplayBase(bet, initial) {
        var baseFieldName = initial ? 'baseInitial' : 'base';
        var prefix = (bet.marketType && bet.marketType.substr(-8) === 'Handicap' && bet[baseFieldName] > 0 ? '+' : '');

        return prefix + (bet.eventBases && !Config.main.displayEventsMainBase ? bet.eventBases.join("-") : bet[baseFieldName]);
    };

    $scope.goToTop = DomHelper.goToTop;

    /**
     * @ngdoc method
     * @name openBookingPrintPopup
     * @methodOf betting.controller:betSlipController
     * @param {Number} Booking ID
     * @description show booking print popup
     */
    $scope.openBookingPrintPopup = function openBookingPrintPopup(bookingId) {
        var encodedBetData = encodeURIComponent(JSON.stringify({
            'bets': $scope.betSlip.bets,
            'amount': $scope.betSlip.stake,
            'betType': $scope.betSlip.type.value,
            'sysVal': $scope.sysBetSelectedValue,
            'bookId': $scope.betSlip.bookingResultId,
            'viewType': Config.main.bookingBetPrint.viewType,
            'message': Translator.get(Config.main.bookingBetPrint.message)
        }));

        if (encodedBetData.length > 1020 && UserAgent.IEVersion()) {
            Storage.set('printPreview', encodedBetData);
            encodedBetData = '';
        }

        $window.open($window.document.location.pathname + "#/popup/?action=booking&data=" + encodedBetData, "_blank", "toolbar=no, scrollbars=no, resizable=no, width=700, height=500");
    };

    /**
     * @ngdoc method
     * @name bookIdPopup
     * @methodOf betting.controller:betSlipController
     * @param {Number} Booking ID
     * @description show booking popup
     */
    $scope.bookIdPopup = function bookIdPopup(id) {
        if (Config.main.enableBetBookingPopup) {
            $rootScope.$broadcast("globalDialogs.addDialog", {
                title: 'bet slip',
                type: 'info',
                content: 'Your Booking ID is:',
                contentBox: id
            });
        }
    };

    /**
     * @ngdoc method
     * @name specialRounding
     * @methodOf betting.controller:betSlipController
     * @param {Number} valule
     * @description special rounding based on odd even values
     */
    $scope.specialRounding = function specialRounding(num) {
        return num % 1 === 0.5 ? (Math.floor(num) % 2 === 0 ? Math.floor(num) : Math.ceil(num)) : Math.round(num);
    };

    /**
     * @ngdoc method
     * @name toggleBetterOddSelectionMode
     * @methodOf betting.controller:betSlipController
     */
    $scope.toggleBetterOddSelectionMode = function toggleBetterOddSelectionMode () {
        if ($scope.betSlip.betterOddSelectionMode) {
            $scope.setBetSlipType({name: "single", value: 1});
        }
        Storage.set('betslip', $scope.betSlip, Config.betting.storedBetslipLifetime);
    };

    /**
     * @ngdoc method
     * @name toggleCounterOffer
     * @methodOf betting.controller:betSlipController
     */
    $scope.toggleCounterOffer = function toggleCounterOffer () {
        $scope.counterOffer.enabled = !$scope.counterOffer.enabled;

        if ($scope.counterOffer.enabled) {
            $scope.betSlip.superbetSelector = false;
            $scope.setBetSlipType({'name': 'single', 'value': 1});
        } else {
            $scope.betSlip.hasCounterOfferError = false;
            $scope.acceptPriceChanges = '0';
        }
    };

    /**
     * @ngdoc method
     * @name togglesSuperbetSelector
     * @methodOf betting.controller:betSlipController
     */
    $scope.togglesSuperbetSelector = function togglesSuperbetSelector () {
        $scope.betSlip.superbetSelector = !$scope.betSlip.superbetSelector;
        if ($scope.betSlip.superbetSelector) {
            $scope.counterOffer.enabled = false;
            $scope.acceptPriceChanges = '-1';
        } else {
            $scope.acceptPriceChanges = '0';
            $scope.showBetSettings = false;
        }
    };

    /**
     * @ngdoc method
     * @name showInfo
     * @methodOf betting.controller:betSlipController
     * @description Shows information dialog for better bet and counter offer
     * @param {String} betterBet or counterOffer
     */
    $scope.showInfo = function showInfo (source) {
        var content;
        switch (source) {
            case "betterBet":
                content = "You have a chance to apply for a higher than the existing odd for an event and submit the query which may be approved or declined by our traders.";
                break;
            case "counterOffer":
                content = "counter_offer_description";
                break;
            default:
                break;
        }
        if (content) {
            $rootScope.$broadcast("globalDialogs.addDialog", {
                type: 'info',
                title: 'Information',
                content: content
            });
        }
    };

    /**
     * @ngdoc object
     * @methodOf betting.controller:betslipCtrl
     * @description hide quick bet when there isn't single bet type
     */

    if (!$scope.betConf.quickBet.hideQuickBet && $scope.betTypes.length) {
        var hideQuickBet = true;
        angular.forEach($scope.betTypes, function (b) {
            if (b.name === 'single') {
                hideQuickBet = false;
            }
        });
        $scope.betConf.quickBet.hideQuickBet = hideQuickBet;
    }

}]);

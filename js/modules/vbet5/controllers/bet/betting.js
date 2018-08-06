/* global BettingModule */
/**
 * @ngdoc controller
 * @name betting.controller:betSlipController
 * @usage dsa
 * @description
 * Explorer controller
 */
BettingModule.controller('betSlipController', ['$q', '$scope', '$rootScope', '$filter', 'Config', 'Zergling', 'Storage', 'Translator', '$location', '$route', '$window', '$injector', 'analytics', 'DomHelper', 'Utils', 'partner', 'TimeoutWrapper', 'UserAgent', '$timeout', 'BetService', function ($q, $scope, $rootScope, $filter, Config, Zergling, Storage, Translator, $location, $route, $window, $injector, analytics, DomHelper, Utils, partner, TimeoutWrapper, UserAgent, $timeout, BetService) {
    'use strict';

    TimeoutWrapper = TimeoutWrapper($scope);
    var betslipSubscriptionProgress = null; // couldn't come up with a good name for this :/
    var oddLimitExceededFlag = false;
    var addBetInProgress = false;
    var subscribePromise, freebetPromise, promiseTimer = 300;

    var addGameToFavorites = function (game) {
        if (!$rootScope.conf.addToFavouritesOnBet) return;

        $rootScope.$broadcast('game.addToMyGames', game);
    };

    var ODD_TYPE_MAP = {
        'decimal': 0,
        'fractional': 1,
        'american': 2,
        'hongkong': 3,
        'malay': 4,
        'indo': 5
    };

    $rootScope.offersCount = 0;

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
        enabled: false
    };
    $scope.bonusBet = {
        enabled: false
    };

    $scope.eventReplace = {
        visibilityProcess: false,
        visibilityTime: 2000
    };

    $scope.openBetsState = {
      open: false
    };

    var eventReplaceMessageVisibilatyPromise;

    $scope.fullCoverBet = {
        enabled: Config.betting.enableFullCoverBetTypes,
        expanded: false, // make colapsed by default
        types: {}
    };

    $scope.taxOnStake = {
        enabled: false
    };

    var fullCoverTypesMap = {
        1: "Singles",
        2: "Doubles",
        3: "Trebles",
        'default': "Folds"
    };

    var fullCoverAdditionalTypesMap = {
        3: {
            name: "Trixie",
            type: 5
        },
        4: {
            name: "Yankee",
            type: 6
        },
        5: {
            name: "Super Yankee",
            type: 8
        },
        6: {
            name: "Heinz",
            type: 9
        },
        7: {
            name: "Super Heinz",
            type: 10
        },
        8: {
            name: "Goliath",
            type: 11
        },
        'default': {
            name: 'Block',
            type: 20
        }
    };

    var fullCoverLastItemKey;

    var mathCuttingFunction = Utils.mathCuttingFunction;//Config.main.decimalFormatRemove3Digit ? Math.floor : Math.round;

    var isPlaceBetsAfterAcceptChanges = false;

    /**
     * @ngdoc object
     * @name calculateQuickBetVisibility
     * @methodOf betting.controller:betSlipController
     * @description Detects if quickbet should be visible based on scope and url data
     */
    function calculateQuickBetVisibility () {
        $scope.displayQuickBet = $scope.env.authorized
            && $scope.betConf.quickBet.enableQuickBetStakes
            && $scope.quickBet.enabled
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
        $scope.acceptPriceChanges = Config.betting.defaultPriceChangeSetting + '';
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
        enabled: false,
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
        $scope.thereIsPriceChange();
    }, true);
    $scope.$watch('env.authorized', function (newValue, oldValue) {
        if (oldValue && !newValue) {
            $scope.clearBetslip();
            $scope.taxOnStake.enabled = false;
        } else if (newValue) {
            if($rootScope.profile) {
                $scope.taxOnStake.enabled = $rootScope.profile.is_tax_applicable && $rootScope.partnerConfig && $rootScope.partnerConfig.tax_percent && $rootScope.partnerConfig.tax_type === 4;
            } else {
                var profileWatcherPromise = $scope.$watch('profile', function (newValue) {
                    if (newValue) {
                        profileWatcherPromise();
                        $scope.taxOnStake.enabled = $rootScope.profile.is_tax_applicable && $rootScope.partnerConfig && $rootScope.partnerConfig.tax_percent && $rootScope.partnerConfig.tax_type === 4;
                    }
                });
            }

        }
    }, true);

    $scope.$watch('quickBet.enabled', function () {
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
            if (event.base) {
                var diff = Math.abs(event.base - originalEvent.baseInitial);
                if (minBaseDifference === undefined || diff < minBaseDifference) {
                    minBaseDifference = diff;
                    selectedIndex = index;
                }
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
     * @name updateeditBetStakeAmount
     * @methodOf betting.controller:betSlipController
     * @description updates stake amount(for editBet functionality it is the same as cash-out amount) when there is a price change
     *
     */
    function updateeditBetStakeAmount() {
        if($rootScope.editBet && $rootScope.editBet.edit) {
            Zergling.get({"bet_ids": [$rootScope.editBet.oldBetId]}, "calculate_cashout_amount").then(function(response) {
                if (response.details) {
                    $rootScope.editBet.stakeAmount = response.details[0].CashoutAmount;
                }
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
        updateeditBetStakeAmount();

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
            if (b.deleted && b.base !== undefined && !$scope.isBetsInProgress && b.gamePointer && Config.main.enableBSEventReplacingForSports.indexOf(b.gamePointer.sport) !== -1) {  // try to replace it with another from same game with same market and event type
                b.deleted = false;
                var request = {
                    'source': 'betting',
                    'what': {
                        'market': ['base', 'home_score', 'away_score'],
                        'event': ['id', 'base', 'type_1']
                    },
                    'where': {
                        'game': {'id': b.gameId},
                        'market': {'type': b.marketType}
                    }
                };
                request.where.event = b.eventType ? {'type': b.eventType} : {'type_1': b.eventType1};

                Zergling
                    .get(request)
                    .then(function (data) {updateEventWithAnother(b, data); });
            }
            if (b.baseInitial !== b.base && $scope.acceptPriceChanges !== '2') {
                $scope.betSlip.thereAreEventBaseChanges = true;
            }
            if (b.deleted && !b.blocked) {
                $scope.betSlip.thereAreDeletedEvents = true;
            }
        });
        $scope.thereIsPriceChange();

        if (isPlaceBetsAfterAcceptChanges) {
            isPlaceBetsAfterAcceptChanges = false;
            placeBet();
        }
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
        if (eventIds.length === 0) {
            console.log('no betslip events to subscribe');
            betslipSubscriptionProgress = null;
            return;
        }
        var request = {
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
        };
        Config.main.GmsPlatform && (request.is_betslip = true);
        Zergling.subscribe(request, updateEventPrices).then(function (response) {
            subId = response.subid;
            subscribingProgress.resolve(subId);
            updateEventPrices(response.data);
        });
    }

    /**
     * @ngdoc method
     * @name updateBetslipSubscription
     * @methodOf betting.controller:betSlipController
     * @description subscribes to event in betslip after unsubscribing from old subscription(if there's one)
     */
    function updateBetslipSubscription() {
        if (subscribePromise) {
            TimeoutWrapper.cancel(subscribePromise);
        }
        subscribePromise = TimeoutWrapper(function updateBetslipSubscriptionTimeout() {
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
        }, promiseTimer);
    }
    /**
     * @ngdoc method
     * @name acceptChangesAndPlaceBets
     * @methodOf betting.controller:betSlipController
     * @description Cleans up BetSlip and place bets,
     * i.e. accepts all price changes and removes non-existing events from BetSlip
     */
    $scope.acceptChangesAndPlaceBets = function acceptChangesAndPlaceBets() {
        if ($scope.isTherePriceChange || $scope.thereAreEventBaseChanges){
            $scope.isAcceptAndPlaceBetStarted = true;
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
            isPlaceBetsAfterAcceptChanges = true;
            broadcastBetslipState();
            updateBetslipSubscription();
        } else {
           placeBet();
        }

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

        if($rootScope.editBet && $rootScope.editBet.edit && $scope.betSlip && $scope.betSlip.bets) {
            $scope.disableAddBets = {};
            var betSlipLength = $scope.betSlip.bets.length;
            var i;
            if($rootScope.editBet.openSelectionsPart) {
                $scope.disableAddBets.newSelections = false;
                $scope.disableAddBets.saveChanges = true;
                $scope.disableAddBets.addBet = false;
                $scope.showInSelections = true;
                for(i = 0; i < betSlipLength; i++) {
                    $scope.emptyNewSelections = !$scope.betSlip.bets[i].showInSelections;
                }
            } else {
                for(i = 0; i < betSlipLength; i++) {
                    $scope.disableAddBets.saveChanges = $scope.betSlip.bets[i].showInSelections === undefined && !$rootScope.editBet.changed;
                }
                $scope.disableAddBets.newSelections = true;
                $scope.disableAddBets.addBet = true;
                $scope.showInSelections = false;
                $scope.emptyNewSelections = true;
            }
        } else {
            $scope.showInSelections = false;   // if true => we should add events in new selections part of betSlip; if false => we'll add events as usual
            $scope.emptyNewSelections = true;  // if true => new selections part is empty
            $scope.disableAddBets = {
                newSelections: false,  // if true => disables 'Add selection' button
                addBet: false,         // if true => disables 'Add to bet' button
                saveChanges: true      // if true => disables 'Save changes' button
            };
        }
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
            divisionCoefficient: 1,
            superbet: {
                selector: $scope.acceptPriceChanges === '-1',
                possible: true // If there's a virtual sport event in the bet slip superbet is turned off
            },
            counterOfferPossible: true // If there's a virtual sport event in the bet slip counter offer is turned off
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

    //broadcast event about new type
    Config.main.disableOddFormatsSpecialCase && $rootScope.$broadcast('betslip.type', $scope.betSlip.type);

    /**
     * @ngdoc method
     * @name repeatSingleStake
     * @methodOf betting.controller:betSlipController
     * @param {String} betStake to repeat
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
     * @param {Object} betEvents bet
     * @pstsm {Object} fullCoverType object
     * @description Get Maximum stake amount for selected event
     */
    $scope.getMaxBet = function getMaxBet(betEvents, fullCoverType) {
        var request = {
            'events': []
        };
        if (Config.main.GmsPlatform) {
            request.type = $scope.betSlip.type.value;
        };
        var isArray = angular.isArray(betEvents);
        if (isArray) {
            angular.forEach(betEvents, function (betEvent) {
                request.events.push(betEvent.eventId);
            });
        } else {
            request.events.push(betEvents.eventId);
        }

        var processMaxBetResults = function (result) {
            var maxResult = Config.main.onlyDecimalStakeAmount ? Math.floor(result.result) : parseFloat(result.result);
            if (fullCoverType) {
                fullCoverType.amount = maxResult;
            } else if (isArray) {
                $scope.lustMaxBetResult = $scope.betSlip.stake = maxResult;
            } else {
                betEvents.singleStake = maxResult;
            }
        };

        //full cover type case
        if (fullCoverType) {
            fullCoverType.sysCount && (request.sys_min_count = fullCoverType.sysCount);
            request.type = fullCoverType.type;
        }

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
     * @param {Boolean} skipStateUpdate. if true skiping some functionality
     * @description removes bet from betslip
     */
    $scope.removeBet = function removeBet(betToRemove, skipStateUpdate) {
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

        if ($rootScope.editBet && $rootScope.editBet.edit) {
            $rootScope.editBet.changed = true;
            if ($rootScope.editBet.openSelectionsPart && $scope.betSlip && $scope.betSlip.bets) {
                var eventsNumberInNewSelection = 0;
                angular.forEach($scope.betSlip.bets, function(bet) {
                    if(bet.showInSelections) {
                        eventsNumberInNewSelection++;
                    }
                });
                if (eventsNumberInNewSelection === 0) $scope.emptyNewSelections = true;
            } else {
                $scope.disableAddBets.saveChanges = false;
            }
        }

        angular.forEach($scope.betTypes, function(betType) {
            if (betType.value === 1) {
                if ($scope.betSlip.bets.length === 1 && $scope.betSlip.type.value === 2 || ($scope.betSlip.bets.length === 0)) {
                    $scope.setBetSlipType(1, false);
                    $scope.betSlip.eachWayMode = false;
                    $scope.betSlip.superbet.selector = false;
                }
            }
        });
        if (!skipStateUpdate) {
            $scope.betSlip.bets.length === 0 && Config.betting.resetAmountAfterBet && ($scope.betSlip.stake = undefined);

            $scope.betSlip.generalBetResult = "";
            $scope.betSlip.bookingResultId = "";
            $scope.sysBetSelectedValue = 2;

            Storage.set('betslip', $scope.betSlip, Config.betting.storedBetslipLifetime);

            updateBetslipSubscription();
            checkFreeBet();
            checkSuperBetAndCounterOffer();
            broadcastBetslipState();

            $scope.betSlip.bets.length === 0 && ($scope.betSlip.stake = undefined);
            $scope.lustMaxBetResult = undefined;
        }

        if (Config.betting.enableRetainSelectionAfterPlacment && $scope.betSlip.bets.length === 0) {
            $scope.showRetainsButtons = false;
        }

        $rootScope.$broadcast('betslip.removeBet', betToRemove);
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
        $scope.betSlip.superbet.selector = false;
        $scope.betSlip.superbet.possible = true;
        $scope.betSlip.counterOfferPossible = true;
        $scope.counterOffer.enabled = false;
        $scope.isBetAccepted = false;
        // switch to single if it available
        $scope.setBetSlipType(1, false);

        $scope.quickBet.enabled = false;

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
        if ($scope.disableAddBets && $scope.disableAddBets.addBet && !$rootScope.openSelectionsPart) return;

        if ($rootScope.editBet && $rootScope.editBet.edit && !$rootScope.editBet.openSelectionsPart) {
            $scope.disableAddBets.saveChanges = true;
        }

        if (!addBetInProgress && !$scope.isBetsInProgress && $scope.quickBet.status !== 'processing' && ($filter('oddConvert')(data.event.price, 'decimal')) != 1 && !data.game.is_blocked && (Config.betting.enableHorseRacingBetSlip || (!Config.betting.enableHorseRacingBetSlip && data.event.price  !== undefined))) {//temporary reject add events without price into betslip

            $scope.isBetAccepted = false;
            $scope.isBetOnHold = false;

            if ($scope.quickBet.enabled) {
                $scope.placeQuickBet(data);
            } else {
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
                    } else {
                        //Check and replace the excluded event with a new one
                        if (value.gameId === data.game.id && (data.market.express_id === undefined || value.expressId === data.market.express_id) || value.gameId === data.game.exclude_ids || value.excludeIds === data.game.id) {
                            $scope.removeBet(value, true);
                            $scope.eventReplace.visibilityProcess = true;
                            eventReplaceMessageVisibilatyPromise && TimeoutWrapper.cancel(eventReplaceMessageVisibilatyPromise);
                            eventReplaceMessageVisibilatyPromise = TimeoutWrapper(function() {
                                $scope.eventReplace.visibilityProcess = false;
                            }, $scope.eventReplace.visibilityTime);
                        }
                    }
                });
                if (!isDuplicate) {

                    $scope.sysBetSelectedValue = 2;

                    if ($scope.betSlip.bets.length === 1 && $scope.betSlip.type.value === 1) {
                        $scope.betSlip.betterOddSelectionMode = false;

                        if (!$scope.counterOffer.enabled && !$scope.fullCoverBet.enabled) {
                            $scope.setBetSlipType(2, false);
                        }
                    }

                    if(Config.main.showPlayerRegion){
                        data.game.team1_name = data.game.team1_reg_name && data.game.team1_name.indexOf(data.game.team1_reg_name) === -1 ? data.game.team1_name + ' (' + data.game.team1_reg_name + ')' : data.game.team1_name;
                        data.game.team2_name = data.game.team2_reg_name && data.game.team2_name.indexOf(data.game.team2_reg_name) === -1 ? data.game.team2_name + ' (' + data.game.team2_reg_name + ')' : data.game.team2_name;
                    }
                    if (Config.main.limitForBetslipEvents && $scope.betSlip.bets.length >= Config.main.limitForBetslipEvents) {
                        $scope.moreThanEventsMaxNumber = false;
                        Utils.setJustForMoment($scope, 'moreThanEventsMaxNumber', true, 4000);
                        return;
                    }

                    var eventInfo = {
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
                    };

                    // checks if betSlip is in editMode , and new selections part is open => adds key in eventInfo to add it in new selections part
                    if($rootScope.editBet && $rootScope.editBet.edit && $rootScope.editBet.openSelectionsPart) {
                        eventInfo.showInSelections = $scope.showInSelections;
                        $scope.disableAddBets.newSelections = false;
                        $scope.emptyNewSelections = false;
                    }
                    if (Config.main.openBetsAndEditBet) {
                        $rootScope.$broadcast('closeOpenBets');
                    }

                    $scope.betSlip.bets.push(eventInfo);

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
                    checkSuperBetAndCounterOffer();
                }

                Storage.set('betslip', $scope.betSlip, Config.betting.storedBetslipLifetime)
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
        };

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
     * @param {Object} result object
     * @returns {String}
     * @description return error messages. Used to remove multiple uses in this class
     */
    function getBetSlipError(result) {
        if (result === undefined) {
            return result;
        }

        if (result.result === '1510') {
            $scope.betSlip.lastErrorCode = result.result + '_sb';
        } else {
            $scope.betSlip.lastErrorCode = Math.abs(parseInt(result.code || result.result || result.status || 99, 10)).toString();
        }

        if (result.result_text && Translator.translationExists(result.result_text)) {
            return Translator.get(result.result_text);
        }

        if (result.details && result.details.api_code) {
            return Translator.get('api_' + result.details.api_code, undefined, 'eng');
        }


        var code = 'message_' + $scope.betSlip.lastErrorCode;

        if (Translator.translationExists('custom_' + code)) {
            return Translator.get('custom_' + code, undefined, lang);
        }

        if (Translator.get(code) !== code) {
            return Translator.get(code);
        }

        return Translator.get("Sorry we can't accept your bets now, please try later") + ' (' + Translator.get(result.result_text || code) + ')';
    }

    /**
     * @ngdoc method
     * @name autoSuperBet
     * @methodOf betting.controller:betSlipController
     * @param {Number} stake amount
     * @returns {Boolean}
     * @description return true in case of stake amount > superbetLimit
     */

    function autoSuperBet(stake) {
        return $scope.env.authorized && !$scope.betSlip.hasLiveEvents && Config.betting.autoSuperBetLimit && $rootScope.currency && $rootScope.currency.name && Config.betting.autoSuperBetLimit[$rootScope.currency.name] && stake >= Config.betting.autoSuperBetLimit[$rootScope.currency.name];
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
                    bet.result = getBetSlipError(betResult);
                } else {
                    bet.isAccepted = false;
                    bet.result = getBetSlipError(result);

                }
            } else {
                bet.isAccepted = false;
                bet.result = getBetSlipError(betResult);
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
                    currentBets.push({'event_id': bet.eventId});
                });
                requests.push({
                    'type': $scope.betSlip.type.value,
                    'source': Config.betting.bet_source,
                    'amount': parseFloat($scope.betSlip.stake),
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
            var processBetResults = function (result) {
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
                    $scope.betSlip.generalBetResult = getBetSlipError(result);
                    analytics.gaSend('send', 'event', 'betting', 'RejectedBookingBet ' + (Config.main.sportsLayout) + ($scope.env.live ? '(LIVE)' : '(PM)'),  {'page': $location.path(), 'eventLabel': ('err(' + result.result + ') - ' + result.details)});
                    angular.forEach($scope.betSlip.bets, function (value) {
                        value.processing = false;
                    });
                    $scope.betInProgress = false;
                } else {
                    $scope.betSlip.generalBetResult =  getBetSlipError(result);

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
                betCounter++;
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
        $scope.isTherePriceChange = false;
        var priceAcceptanceValue = parseInt($scope.acceptPriceChanges, 10);
        angular.forEach($scope.betSlip.bets, function (b) {
            if (b.oddType !== 'sp' && ((b.price - b.priceInitial < 0 && priceAcceptanceValue !== 2) || (b.price - b.priceInitial !== 0 && priceAcceptanceValue === 0))) {
                $scope.isTherePriceChange = true;
            }
        });

    };

    /**
     * @ngdoc method
     * @name placeQuickBet
     * @methodOf betting.controller:betSlipController
     * @param {Object} data selected event
     * @description place Quick Bet
     */

    $scope.placeQuickBet = function placeQuickBet(data) {
        console.log('quick bet data', data);
        if ($scope.betSlip.totalStake > $scope.profile.calculatedBalance + $scope.profile.calculatedBonus && Config.main.sportsLayout === 'euro2016') {
            $scope.quickBet.status = 'error';
            $scope.quickBet.massage = Translator.get('Insufficient balance');
        } else if ($scope.quickBet.enabled && !$scope.betSlip.hasEmptyStakes && $scope.env.authorized && !$scope.isBetsInProgress && $scope.betSlip.totalStake <= $scope.profile.calculatedBalance + ($scope.profile.calculatedBonus || 0)) {
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
                    $rootScope.$broadcast('refreshBalance');
                    $scope.quickBet.status = 'accepted';
                    $scope.massage = getBetSlipError(result);
                    if(!data.game.isVirtual){
                        addGameToFavorites(data.game);
                    }
                } else if (result.result === -1) {
                    console.log('Error:', result.details);
                    $scope.quickBet.status = 'error';
                } else {
                    $scope.quickBet.status = 'error';
                    $scope.quickBet.massage = getBetSlipError(result);
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
        if (freebetPromise) {
            TimeoutWrapper.cancel(freebetPromise);
        }
        freebetPromise = TimeoutWrapper(function checkFreeBetTimeout() {
            if ($rootScope.profile && $rootScope.profile.has_free_bets && $scope.betSlip.bets.length && $scope.env.authorized) {
                var requests = prepareBetsData(false, true);
                if (requests.length > 0) {
                    Zergling.get(requests[0], 'get_freebets_for_betslip').then(function (response) {
                        $scope.freeBet.list = [];
                        if (response && response.details) {
                            angular.forEach(response.details, function (details) {
                                if (details.amount){
                                    $scope.freeBet.list.push(details);
                                    $scope.freeBetStateChanged();
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
        }, promiseTimer);
    }

    $scope.$on('login.loggedIn', checkFreeBet);
    $scope.$on('loggedIn', checkFreeBet);
    $scope.$on('login.loggedOut', checkFreeBet);


    /**
     * @ngdoc method
     * @name checkSuperBetAndCounterOffer
     * @methodOf betting.controller:betSlipController
     * @description Checks is there are any virtual sport events in the bet slip and disables superbet and counter offer accordingly
     */
    function checkSuperBetAndCounterOffer() {
        var virtualSportsEvents = false;
        for (var i = 0, x = $scope.betSlip.bets.length; i < x; i++) {
            if ($scope.betSlip.bets[i].gamePointer.sport === -3) {
                virtualSportsEvents = true;
                break;
            }
        }
        if (virtualSportsEvents) {
            $scope.betSlip.superbet.possible = false;
            $scope.betSlip.superbet.selector = false;
            $scope.betSlip.counterOfferPossible = false;
            $scope.counterOffer.enabled = false;
            $scope.acceptPriceChanges = '0'; // Need this to prevent auto super bet
        } else {
            $scope.betSlip.superbet.possible = true;
            $scope.betSlip.counterOfferPossible = true;
        }
    }

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
            if ($scope.fullCoverBet.enabled && Object.keys($scope.fullCoverBet.types).length) {
                for (var type in $scope.fullCoverBet.types) {
                    $scope.fullCoverBet.types[type].amount = '';
                    if ($scope.fullCoverBet.types[type].totalCoef > 0) { // If a full cover type has totalCoef property it signals that it is the 'express' type;
                        $scope.fullCoverBet.types[type].amount = $scope.freeBet.list[value].amount;
                    }
                }
                // Clearing up all single stake amounts
                for (var i = 0, x = $scope.betSlip.bets.length; i < x; i++) {
                    $scope.betSlip.bets[i].singleStake = '';
                    $scope.betSlip.bets[i].singleUnitStake = 0;
                }
            } else {
                $scope.betSlip.stake = $scope.freeBet.list[value].amount;
            }
            $scope.freeBet.selected = $scope.freeBet.list[value];
            $scope.freeBetSelectorRadio = value;
        } else {
            $scope.freeBet.selected = undefined;
        }
    };

    function addFullCoverBetRequests(requests, freeBet) {
        var expressBets = [], systemBets = [];
        var i, bet, length = $scope.betSlip.bets.length;
        var request = {
            'source': Config.betting.bet_source,
            'mode': parseInt($scope.acceptPriceChanges, 10),
            'each_way': $scope.betSlip.eachWayMode
        };

        if (freeBet) {
            request.bets = requests.map(function(request) { return request.bets[0]; });
            request.type = 2;
            requests.unshift(request); // Unshifting the request because checkFreeBet() takes the first request in the array to check for free bets;
        } else {
            angular.forEach($scope.fullCoverBet.types, function (type, key) {

                if (key !== fullCoverTypesMap[1]) { // singles bet already added to the requests
                    if (!isNaN(type.amount) && parseFloat(type.amount) > 0) {
                        request.type = type.type;
                        request.amount = parseFloat(type.amount) * type.count;

                        if (type.type === 3) { // calculates as systembet
                            if (!systemBets.length) {
                                for (i = 0; i < length; ++i) {
                                    bet = $scope.betSlip.bets[i];
                                    systemBets.push({'event_id': bet.eventId, 'price': bet.oddType === 'sp' ? -1 : bet.price, 'banker': bet.banker ? 1 : 0});
                                    bet.processing = true;
                                }
                            }
                            request.bets = systemBets;
                            request.sys_bet = type.sysCount + ($scope.betSlip.bankerBetsCount ? $scope.betSlip.bankerBetsCount : 0)
                        } else {
                            if (!expressBets.length) {
                                for (i = 0; i < length; ++i) {
                                    bet = $scope.betSlip.bets[i];
                                    expressBets.push({'event_id': bet.eventId, 'price': bet.oddType === 'sp' ? -1 : bet.price});
                                    bet.processing = true;
                                }
                            }
                            request.bets = expressBets;
                        }

                        requests.push(request);
                    }
                }
            });
        }
    }

    function getMappedOddType(bet) {
        if (Config.main.oddTypeMapInPlacingBet && Config.main.oddTypeMapInPlacingBet[$rootScope.env.oddFormat]) {
            return ODD_TYPE_MAP[Config.main.oddTypeMapInPlacingBet[$rootScope.env.oddFormat]];
        }

        if ($scope.betSlip.type.value !== 1 || !Config.main.specialOddFormat || !Config.main.specialOddFormat[$rootScope.env.oddFormat] || Config.main.specialOddFormat[$rootScope.env.oddFormat].displayKey[bet.displayKey]) {
            return ODD_TYPE_MAP[Config.env.oddFormat];
        }

        return ODD_TYPE_MAP[Config.main.specialOddFormat[$rootScope.env.oddFormat].default];
    }
    /**
     * @ngdoc method
     * @name placeBet
     * @methodOf betting.controller:betSlipController
     * @description Prepares bet data, for booking and betting free bet and single bet events
     * @param {Boolean} singleBetEvent True if its a single bet;
     * @param {Boolean} forFreeBet True if calculation must be done for free bet;
     */
    function prepareBetsData (singleBetEvent, forFreeBet) {
        var requests = [], data;
        var currentBets;
        switch ($scope.betSlip.type.value) {
            case 1:
                var bets = singleBetEvent ? [singleBetEvent] : $scope.betSlip.bets;
                angular.forEach(bets, function (bet) {
                    if ((!$scope.betSlip.thereAreDeletedEvents && !$scope.isTherePriceChange && !isNaN(parseFloat(bet.singleStake))) || forFreeBet) {
                        var isCounterOffer = $scope.counterOffer.enabled && bet.counterOffer > bet.price;
                        data = {
                            'type': $scope.betSlip.type.value,
                            'source': Config.betting.bet_source,
                            'is_offer': $scope.betSlip.betterOddSelectionMode ? 1 : 0,
                            'mode': autoSuperBet(parseFloat(bet.singleStake)) ? -1 : (isCounterOffer ? 3 : parseInt($scope.acceptPriceChanges, 10)),
                            'each_way': $scope.betSlip.eachWayMode,
                            'bets': [
                                {'event_id': bet.eventId, 'price': bet.oddType === 'sp' ? -1 : $scope.betSlip.betterOddSelectionMode ? bet.betterPrice : (isCounterOffer ? parseFloat(bet.counterOffer) : bet.price)}
                            ]
                        };
                        if (!forFreeBet) {
                            data.amount = parseFloat(bet.customSingleStake || bet.singleStake);
                        } else {
                            data.is_live = bet.isLive;
                        }
                        if($rootScope.editBet && $rootScope.editBet.edit) {
                            data.amount  = $rootScope.editBet.stakeAmount;
                            data.old_bet_id = $rootScope.editBet.oldBetId;
                        }
                        if (Config.main.GmsPlatform) {
                            data.odd_type = getMappedOddType(bet);
                        }
                        requests.push(data);
                        bet.processing = !forFreeBet;
                    }
                });

                if ($scope.betConf.enableFullCoverBetTypes && $scope.betSlip.bets.length > 1) {
                    addFullCoverBetRequests(requests, forFreeBet);
                }
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
                if($rootScope.editBet && $rootScope.editBet.edit) {
                    data.amount  = $rootScope.editBet.stakeAmount;
                    data.old_bet_id = $rootScope.editBet.oldBetId;
                }
                if (Config.main.GmsPlatform) {
                    data.odd_type = getMappedOddType({});
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
                if (Config.main.GmsPlatform) {
                    data.odd_type = getMappedOddType({});
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
                if (Config.main.GmsPlatform) {
                    data.odd_type = getMappedOddType({});
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
     * @param {Number} singleBetEvent Event Optional;
     */
     function placeBet(singleBetEvent) {
        console.log('placeBet');

        if ($scope.betInProgress && $rootScope.editBet && !$rootScope.editBet.edit) {
            return;
        }
        $scope.betInProgress = true;
        $scope.isAcceptAndPlaceBetStarted = false;
        $scope.betSlip.generalBetResult = "";
        $scope.betSlip.bookingResultId = "";

        analytics.gaSend('send', 'event', 'betting', 'PlaceBet ' + (Config.main.sportsLayout) + ($scope.env.live ? '(LIVE)' : '(PM)'), {'page': $location.path(), 'eventLabel': ({1: 'single', 2: 'express', 3: 'system', 4: 'chain'}[$scope.betSlip.type.value])});
        var requests = prepareBetsData(singleBetEvent);

        var betCounter = 0, haveAcceptedEvent = false, enablePopupAfterBet = false;
        if (requests.length) {
            angular.forEach(requests, function (request) {
                var processBetResults = function (result) {
                    if (result.result === 'OK') {
                        if (request.mode == 3) {
                            $rootScope.offersCount += 1;
                        }

                        if($rootScope.editBet) {
                            $rootScope.editBet.edit = false;
                            $scope.disableAddBets.addBet = false;
                        }

                        if(Config.betting.enableRetainSelectionAfterPlacment){
                            $scope.showRetainsButtons = true;
                            if ($scope.betSlip.superbet.selector) {
                                $scope.togglesSuperbetSelector();
                            }
                        }
                        haveAcceptedEvent = true;
                        if ($scope.betConf.popupMessageAfterBet && $scope.betConf.popupMessageAfterBet[$rootScope.currency.name] && result.details.amount >= $scope.betConf.popupMessageAfterBet[$rootScope.currency.name]) {
                            enablePopupAfterBet = true;
                        }
                        if (Config.main.enableSuggestedBets) {
                            $rootScope.$broadcast('successfulBet');
                        }
                        if (result.details && result.details.FreeBetAmount) {
                            checkFreeBet();
                        }
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
                            if (request.type !== 1 || request.bets[0].event_id == value.eventId) {
                                $scope.betslipRemoveBetsProcess = true; // bad solution for disable place bet button until removing betslip
                                value.isAccepted = true;
                                value.result = getBetSlipError(result);
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
                        // if($rootScope.editBet) {
                        //     $rootScope.editBet.edit = true;
                        // }
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
                        // if($rootScope.editBet) {
                        //     $rootScope.editBet.edit = true;
                        // }
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
                        // if($rootScope.editBet) {
                        //     $rootScope.editBet.edit = true;
                        // }
                        $scope.betSlip.generalBetResult = getBetSlipError(result);

                        if (Config.betting.alternativeBetSlip) {
                            $rootScope.notificationPopup = {title: Translator.get('Your bet is not accepted'), message: $scope.betSlip.generalBetResult};
                        }

                        analytics.gaSend('send', 'event', 'betting', 'RejectedBet ' + (Config.main.sportsLayout) + ($scope.env.live ? '(LIVE)' : '(PM)'),  {'page': $location.path(), 'eventLabel': ('err(' + result.result + ') - ' + result.details)});
                        if (result.result == '1800' && !Storage.get('settingAutoShowOneDayDelay')) {
                            Storage.set('settingAutoShowOneDayDelay', true, 86400000);
                            $scope.showBetSettings = true;
                        }
                        if (!Config.main.GmsPlatform && result.result === 'ONHOLD') {
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
                            if (!Config.main.GmsPlatform && result.result === 'ONHOLD') {
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

                if (Config.main.enableSuggestedBets) {
                    request.tags = 0;

                    if ($rootScope.suggestedBets && $rootScope.suggestedBets.eventIds) {
                        var suggestedBetsIds = $rootScope.suggestedBets.eventIds;

                        if (request.type === 2 /* express */ && suggestedBetsIds.length === request.bets.length) {
                            request.tags = $rootScope.suggestedBets.tags;
                            for (var i = 0; i < request.bets.length; i++) {
                                if (suggestedBetsIds.indexOf(request.bets[i].event_id) === -1) {
                                    request.tags = 0;
                                    break;
                                }
                            }
                        }
                    }

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
                    betCounter++;
                    if (haveAcceptedEvent && requests.length === betCounter) {
                        if (Config.partner.balanceRefreshPeriod || Config.main.rfid.balanceRefreshPeriod) { // refresh balance right after doing bet in integration skin
                            $rootScope.$broadcast('refreshBalance');
                        }
                        enablePopupAfterBet && $rootScope.$broadcast('showPopupBySlug', 'after_bet');
                    }
                    $scope.betInProgress = false;
                });
            });
        } else {
            $scope.betInProgress = false;
        }
    }

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
    function calculateSystemPossibleWin(k, stake) {
        var tempPosWin = 0;
        var tempPosEwWin = 0;
        var indexArray = [];
        var indexMaxArray = [];
        var tempOdd;
        var tempEwOdd;
        var tempIterator;
        var numOfSysOptions;
        var sysPerBetStake;
        var i;
        k = k || $scope.sysBetSelectedValue;
        stake = ($rootScope.editBet && $rootScope.editBet.edit && $rootScope.editBet.stakeAmount) ? $rootScope.editBet.stakeAmount : (stake || $scope.betSlip.stake);
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
                    } else {
                        tempOdd = 0;
                        tempEwOdd = 0;
                    }
                }
                tempPosWin = (tempPosWin * 10 * 10 + mathCuttingFunction(tempOdd * 10 * 10)) / 100;
                tempPosEwWin = tempPosEwWin + tempEwOdd;

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

        sysPerBetStake = stake / numOfSysOptions;

        if ($scope.betSlip.eachWayMode) {
            sysPerBetStake /= 2;
        }

        return {win: mathCuttingFunction(tempPosWin * sysPerBetStake*100)/100, ewWin: mathCuttingFunction(tempPosEwWin * sysPerBetStake*100), options: numOfSysOptions};
    }

    /**
     * @ngdoc method
     * @name calcSystemOptionsCount
     * @methodOf betting.controller:betSlipController
     * @param {Number} k number of selected events
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
        type =  !$scope.betConf.expressBonusMap ? type : false;
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
            default:
                var calc = $scope.betConf.expressBonusMap, dontCalculateBonus = false;
                if (calc !== undefined && (calc.min === undefined || n >= calc.min)) {
                    if ($scope.betConf.minCoefficient) {
                        angular.forEach($scope.betSlip.bets, function (bet) {
                            if (bet.price && bet.price < $scope.betConf.minCoefficient) {
                                dontCalculateBonus = true;
                            }
                        });
                        if (dontCalculateBonus) {
                            return;
                        }
                    }
                    if (calc.minTotalCoefficient !== undefined && k < calc.minTotalCoefficient) {
                        return;
                    } else if (calc[n] === 0) {
                        return;
                    } else if (calc[n]) {
                        return (k * s - s) * (calc[n] * 0.01);
                    } else if (calc.default) {
                        return (k * s - s) * (calc.default * 0.01);
                    }
                }
        }
        return 0;
    }

    var calculateExpressBonus;
    if ($injector.has('ExpressBonusCalculator')) {
        calculateExpressBonus = $injector.get('ExpressBonusCalculator').calculate;
    } else {
        calculateExpressBonus = function (betSlip) {
            var expressBonusMap = $scope.betConf.expressBonusMap;
            var minOdd = $scope.betConf.expressBonusMinOdd, length = betSlip.bets.length;
            if($scope.betConf.enableNewExpressBonusType && length > $scope.betConf.expressBonusVisibilityQty) {
                /* e.g.
                    expressBonusVisibilityQty: n,
                    expressBonusMinOdd: m,

                   if there are at least n+1 events in betSlip, and bet.price >= m for at least n+1 events, then newExpressBonus would continue to calculate the express bonus
                 */
                var oddForNewExpressBonus = 1;
                var n = 0;
                angular.forEach(betSlip.bets, function (bet) {
                    if (bet.price && bet.price >= minOdd) {
                        if(oddForNewExpressBonus * bet.price >= betSlip.expOdds) {
                            oddForNewExpressBonus = betSlip.expOdds;
                        } else {
                            oddForNewExpressBonus *= bet.price;
                        }
                        n++;
                    }
                });

                $scope.betSlip.expBonusPercentage = expressBonusMap[n] ? expressBonusMap[n] : expressBonusMap.default;
                if (expressBonusMap.minTotalCoefficient !== undefined && oddForNewExpressBonus < expressBonusMap.minTotalCoefficient) {
                    return;
                } else if (expressBonusMap[n] === 0) {
                    return;
                } else if (expressBonusMap[n]) {
                    return ($scope.finalWinValue - betSlip.stake) * (expressBonusMap[n] * 0.01);
                } else if (expressBonusMap.default) {
                    return ($scope.finalWinValue - betSlip.stake) * (expressBonusMap.default * 0.01);
                }
            } else {
                for (var i = 0; i < length; i++) {
                    if(betSlip.bets[i].price < minOdd) {
                        $scope.totalPossibleWin = undefined;
                        return 0;
                    }
                }
            }

            // console.log((expressBonusCalculator(Config.betting.expressBonusType, betSlip.bets.length, betSlip.expOdds, betSlip.stake) * 100 || 0) / 100);
            if($scope.taxOnStake.enabled) {
                return Math.round(expressBonusCalculator(Config.betting.expressBonusType, betSlip.bets.length, betSlip.expOdds, $scope.taxOnStake.total) * 100 || 0) / 100;
            } else {
                return Math.round(expressBonusCalculator(Config.betting.expressBonusType, betSlip.bets.length, betSlip.expOdds, betSlip.stake) * 100 || 0) / 100;
            }
        };
    }
    calculateExpressBonus = Utils.memoize(calculateExpressBonus);

    function setMaxWinLimit(value) {
        if ($scope.env.authorized && $rootScope.currency && $rootScope.currency.rounding !== undefined && !isNaN($rootScope.currency.rounding)) {
            if (Config.betting.maxWinLimit && $rootScope.currency.amd_rate && value * $rootScope.currency.amd_rate > Config.betting.maxWinLimit) {
                return parseFloat((Config.betting.maxWinLimit / $rootScope.currency.amd_rate).toFixed(Math.abs($rootScope.currency.rounding)));
            }
            return parseFloat(value.toFixed(Math.abs($rootScope.currency.rounding)));
        }
        return parseFloat(value);
    }

    function calcSinglePosWinAndTotalStake(bet, price) {
        $scope.betSlip.totalStake += bet.singleStake * 1;
        bet.customSingleStake && (delete bet.customSingleStake);
        if (bet.eachWay && bet.ewAllowed && bet.ewCoeff) {
            bet.singlePosWin = setMaxWinLimit(mathCuttingFunction(((((price - 1) / bet.ewCoeff + 1) + price) * bet.singleUnitStake) * 10 * 10 || 0) / 100);
        } else {
            bet.singlePosWin = setMaxWinLimit(mathCuttingFunction((price * bet.singleStake) * 10 * 10 || 0) / 100);
        }
    }

    function calcCustomAmountAndTotalStake(bet, price) {
        bet.customSingleStake = mathCuttingFunction(bet.singleStake / (price - 1) * 10 * 10) / 100;
        bet.singlePosWin = bet.customSingleStake + bet.singleStake;
        $scope.betSlip.totalStake += bet.customSingleStake * 1;
    }

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
        var chainTotalPrice = 0;
        var bankerTotalPrice = 1;
        var tmpBankerBetsCount = 0;
        var sameGameIds = {};
        $scope.betSlip.hasConflicts = false;
        $scope.betSlip.hasEachWayReadyEvents = false;
        $scope.betSlip.hasSingleOnlyEvents = false;
        $scope.betSlip.hasEmptyStakes = false;
        $scope.betSlip.hasFilledStake = false;
        $scope.betSlip.hasLockedEvents = false;
        $scope.betSlip.thereAreDeletedEvents = false;
        $scope.betSlip.hasSpOddTypes = false;
        $scope.betSlip.hasLiveEvents = false;
        $scope.betSlip.hasEventsFromSameGame = false;
        $scope.betSlip.sysValArray = [];
        $scope.betSlip.hasCounterOfferError = false;

        if (!$scope.quickBet.enabled) {
            $scope.isBetsInProgress = false;
            $scope.quickBet.status = 'idle';
        } else {
            $scope.quickBetStakeCoeff = Config.betting.quickBet.quickBetStakeCoeffs[$rootScope.currency.name];
            $scope.quickBetStakeSelector = $scope.quickBetStakeSelector || Config.betting.quickBet.quickBetStakeCoeffs[$rootScope.currency.name];
        }

        if ($scope.betSlip.sysValArray === undefined || $scope.betSlip.sysValArray.length !== ($scope.betSlip.bets.length - 2)) {
            $scope.betSlip.sysValArray = [];
        }

        if ($scope.betSlip.type.value === 1 && !$scope.quickBet.enabled) {
            $scope.betSlip.totalStake = 0;
        } else {
            $scope.betSlip.totalStake = parseFloat($scope.betSlip.stake);
        }

        function calcBetPrice(price) {
            var betPrice = Config.main.decimalFormatRemove3Digit ? (mathCuttingFunction(price * 10 * 10) / 100) : price;
            totalOdd *= betPrice;
            return betPrice;
        }
        angular.forEach($scope.betSlip.bets, function (bet, i) {
            switch ($scope.betSlip.type.value) {
                case 1://single
                    if ($scope.betSlip.bets.length === 1 && !Config.betting.alternativeBetSlip) {
                        bet.singleStake = $scope.betSlip.stake;
                        bet.singleUnitStake = $scope.betSlip.unitStake;
                        bet.eachWay = $scope.betSlip.eachWayMode;
                    }
                    if($rootScope.editBet && $rootScope.editBet.edit) {
                        bet.singleStake = $rootScope.editBet.stakeAmount;
                    }
                    $scope.betSlip.hasEmptyStakes = $scope.betSlip.hasEmptyStakes || bet.singleStake === undefined || bet.singleStake == "" || parseFloat(bet.singleStake) === 0;
                    if (!isNaN(parseFloat(bet.singleStake)) && parseFloat(bet.singleStake) > 0 && !bet.deleted && bet.oddType !== 'sp' && !bet.blocked) {
                        var realPrice = $scope.betSlip.betterOddSelectionMode ? bet.betterPrice : ($scope.counterOffer.enabled && bet.counterOffer > bet.price ? bet.counterOffer : (Config.main.decimalFormatRemove3Digit ? parseFloat($filter('oddConvert')(bet.price, 'decimal')): bet.price));

                        if ($scope.betSlip.type.value === 1 && $scope.betConf.customAmountCalc && $scope.betConf.customAmountCalc[$rootScope.env.oddFormat] && (!Config.main.specialOddFormat || !Config.main.specialOddFormat[$rootScope.env.oddFormat] || Config.main.specialOddFormat[$rootScope.env.oddFormat].displayKey[bet.displayKey])) {
                            var customPriceData = $scope.betConf.customAmountCalc[$rootScope.env.oddFormat];
                            if (realPrice > customPriceData.moreThan || realPrice < customPriceData.lessThan) {
                                calcCustomAmountAndTotalStake(bet, realPrice);
                            } else {
                                calcSinglePosWinAndTotalStake(bet, realPrice);
                            }
                        } else {
                            calcSinglePosWinAndTotalStake(bet, realPrice);
                        }

                        possibleWin += parseFloat(bet.singlePosWin);
                        $scope.betSlip.hasCounterOfferError = $scope.counterOffer.enabled && ($scope.betSlip.hasCounterOfferError || bet.singleStake < (($rootScope.profile.counter_offer_min_amount).toFixed($rootScope.currency && $rootScope.currency.rounding || 2)) * 1 || !bet.counterOffer || bet.counterOffer <= bet.price || Number(bet.counterOffer) > Number(bet.maxCounterOffer));
                    } else {
                        bet.singlePosWin = 0;
                    }
                    $scope.betConf.enableFullCoverBetTypes && calcBetPrice(bet.price);
                    break;
                case 2: //express
                    var betPrice = calcBetPrice(bet.price);
                    ewOdd *= bet.ewAllowed && bet.ewCoeff ? mathCuttingFunction(((betPrice - 1) / bet.ewCoeff + 1) * 10 * 10) / 100 : betPrice;
                    break;
                case 3: //system
                    if ($scope.betSlip.sysValArray.length < ($scope.betSlip.bets.length - 2 - $scope.betSlip.bankerBetsCount) && i > 1) {
                        $scope.betSlip.sysValArray.push(i);
                    }
                    break;
                case 4: // chain
                    chainTotalPrice += (bet.price - 1);
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

                if (!Config.betting.allowSuperBetOnLive && $scope.betSlip.superbet.selector) {
                    $scope.betSlip.superbet.selector = false;
                    if (parseInt($scope.acceptPriceChanges, 10) === -1) {
                        $scope.acceptPriceChanges = '0';
                    }
                }

                $scope.counterOffer.enabled && $scope.toggleCounterOffer();
            }

            if (bet.deleted) {
                $scope.betSlip.thereAreDeletedEvents = true;
            }

            if (bet.processing || ($scope.quickBet.enabled && $scope.quickBet.status === 'processing')) {
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

        if (($scope.betSlip.type.value !== 1 || $scope.quickBet.enabled) && ($scope.betSlip.stake === undefined || $scope.betSlip.stake == "" || parseFloat($scope.betSlip.stake) == 0)) {
            $scope.betSlip.hasEmptyStakes = true;
        }

        if (parseInt($scope.acceptPriceChanges, 10) === -1 && ($scope.betSlip.type.value > 2 || $scope.quickBet.enabled)) {
            $scope.acceptPriceChanges = '0';
        }

        if ($scope.betSlip.bets.length > 0) {
            $scope.betSlip.divisionCoefficient = ($scope.betSlip.eachWayMode ? 2 : 1) * ($scope.betSlip.type.value === 3 && $scope.calcSystemOptionsCount($scope.sysBetSelectedValue) > 0 ? $scope.calcSystemOptionsCount($scope.sysBetSelectedValue) : 1);
        }

        if (Config.main.enableBetBooking) {
            $scope.betSlip.bookingNotAllowed = ($scope.betSlip.type.value !== 1 && $scope.betSlip.bets.length < 2) || ($scope.betSlip.type.value === 3 && $scope.betSlip.bets.length < 3);
        }

        switch ($scope.betSlip.type.value) {
            case 1:
                if ($scope.betSlip.bets.length === 1 && !Config.betting.alternativeBetSlip && $scope.betSlip.stake && ($scope.freeBetSelected() || $scope.bonusBet.enabled)) {
                    possibleWin -= $scope.betSlip.stake;
                }

                //full cover type case:
                if ($scope.betConf.enableFullCoverBetTypes) {
                    var lastTypeAmount = fullCoverLastItemKey && $scope.fullCoverBet.types[fullCoverLastItemKey] && !isNaN(parseFloat($scope.fullCoverBet.types[fullCoverLastItemKey].amount)) && parseFloat($scope.fullCoverBet.types[fullCoverLastItemKey].amount) || 0;
                    angular.forEach($scope.fullCoverBet.types, function (type, key) {

                        if (key !== fullCoverTypesMap[1] && key !== fullCoverLastItemKey) {
                            var calcAmount = (!isNaN(parseFloat(type.amount)) && parseFloat(type.amount) || 0) + lastTypeAmount;
                            if (calcAmount) {
                                var calcWin;
                                if (type.sysCount) {
                                    var calcResult = calculateSystemPossibleWin(type.sysCount, calcAmount * type.count);
                                    if ($scope.betSlip.eachWayMode) {
                                        calcWin = calcResult.win + calcResult.ewWin;
                                    } else if ($scope.bonusBet.enabled) {
                                        calcWin = bankerTotalPrice * calcResult.win - calcAmount
                                    } else {
                                        calcWin = bankerTotalPrice * calcResult.win;
                                    }
                                } else if (type.totalCoef && totalOdd) {
                                    calcWin = totalOdd * calcAmount;
                                }
                                possibleWin += setMaxWinLimit(mathCuttingFunction(calcWin * 1000 || 0) / 1000);
                                if ($scope.freeBetSelected()) {
                                    possibleWin -= calcAmount;
                                }

                                $scope.betSlip.totalStake += calcAmount * type.count;

                                $scope.betSlip.hasFilledStake = true;
                            }

                            type.totalCoef !== undefined && (type.totalCoef = mathCuttingFunction(totalOdd * 10 * 10) / 100);
                        }
                    });
                }
                //@end full cover case
                break;
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
                if ($scope.betSlip.expBonus > 0 && $scope.betConf.expressBonusMap !== undefined && !$scope.betConf.enableNewExpressBonusType) {
                    $scope.betSlip.expBonusPercentage = $scope.betConf.expressBonusMap["" + $scope.betSlip.bets.length] || $scope.betConf.expressBonusMap["default"];
                }
                if ($scope.betSlip.eachWayMode && ewOdd > 1 && $scope.betSlip.unitStake) {
                    possibleWin = (totalOdd + ewOdd) * $scope.betSlip.unitStake;
                } else if ($scope.betSlip.stake && ($scope.freeBetSelected() || $scope.bonusBet.enabled)) {
                    possibleWin = totalOdd * $scope.betSlip.stake - $scope.betSlip.stake;
                } else {
                    $rootScope.editBet && $rootScope.editBet.edit ? possibleWin = totalOdd * $rootScope.editBet.stakeAmount : possibleWin = totalOdd * $scope.betSlip.stake;
                }
                break;
            case 3:
                if ($scope.betSlip.bets.length > 2) {
                    var tempResult = calculateSystemPossibleWin();
                    $scope.betSlip.sysOptions = tempResult.options;
                    if ($scope.betSlip.eachWayMode) {
                        possibleWin = tempResult.win + tempResult.ewWin;
                    } else if ($scope.betSlip.stake && $scope.bonusBet.enabled) {
                        possibleWin = bankerTotalPrice * tempResult.win - $scope.betSlip.stake;
                    } else {
                        possibleWin = bankerTotalPrice * tempResult.win;
                    }
                }
                break;

            case 4:
                if ($scope.betSlip.stake) {
                    possibleWin = Number((parseFloat($scope.betSlip.stake) + (chainTotalPrice * $scope.betSlip.stake))).toFixed(2);
                }
                break;

            default:
                possibleWin = 0;
                break;
        }

        if (Config.betting.showNetWinning && Config.betting.showNetWinning.enabled) {
            var showNetWinning = Config.betting.showNetWinning;
            var dontShowNetWinning;
            // Making sure the correct odd type is set
            if (showNetWinning.oddTypes && showNetWinning.oddTypes.length && showNetWinning.oddTypes.indexOf($rootScope.env.oddFormat) === -1) {
                dontShowNetWinning = true;
            }
            // Making sure only the specified markets are in the betslip
            if (!dontShowNetWinning && showNetWinning.marketTypes && showNetWinning.marketTypes.length) {
                for (var i = 0, length = $scope.betSlip.bets.length; i < length; ++i) {
                    if (!$scope.betSlip.bets[i].marketType || showNetWinning.marketTypes.indexOf($scope.betSlip.bets[i].marketType) === -1) {
                        dontShowNetWinning = true;
                        break; // No need to iterate if even one event had market type different from what we specified in the config
                    }
                }
            }
            // If every condition is met we show the net winning
            if (!dontShowNetWinning) {
                possibleWin -= $scope.betSlip.stake;
            }
        }

        $scope.betSlip.isBettingAllowed = checkIfBettingIsAllowed();

        if($scope.taxOnStake.enabled) {
            $scope.taxOnStake.tax = $scope.betSlip.stake * ($rootScope.partnerConfig.tax_percent) / 100;
            $scope.taxOnStake.total = $scope.betSlip.stake - $scope.taxOnStake.tax;
            $scope.taxOnStake.posWin = possibleWin - (possibleWin * $rootScope.partnerConfig.tax_percent)/100;
        }

        if ($scope.betSlip.expBonus) {
            $scope.totalPossibleWin = $scope.taxOnStake.enabled ? $scope.betSlip.expBonus + $scope.taxOnStake.posWin : parseFloat(possibleWin + $scope.betSlip.expBonus).toFixed(2);
        }
         $scope.finalWinValue = parseFloat(setMaxWinLimit(mathCuttingFunction(possibleWin * 10 * 10 || 0) / 100));
        if ($rootScope.partnerConfig && $rootScope.partnerConfig.tax_percent && $rootScope.partnerConfig.tax_type === 1) { // 1 - tax on profit ; 4 - tax on stack
            $scope.possibleWinTax = ($scope.finalWinValue - $scope.betSlip.stake) * ($rootScope.partnerConfig.tax_percent / 100);
            $scope.finalWinTaxValue = $scope.finalWinValue - $scope.possibleWinTax;

            if ($scope.betSlip.expBonus) {
                $scope.possibleWinBonusTax = ($scope.finalWinValue + $scope.betSlip.expBonus - $scope.betSlip.stake) * ($rootScope.partnerConfig.tax_percent / 100);
                $scope.finalWinBonusTaxValue = $scope.totalPossibleWin - $scope.possibleWinBonusTax;
            }
        }
        return $scope.finalWinValue;
    };

    function checkIfBettingIsAllowed() {
        return !(
            ($scope.betSlip.type.value !== 1 && ($scope.betSlip.bets.length < 2 || $scope.betSlip.hasSingleOnlyEvents)) ||
            ($scope.betSlip.type.value !== 1 && (isNaN($scope.betSlip.stake) || !$scope.betSlip.stake)) ||
            ($scope.betSlip.type.value === 1 && $scope.betSlip.hasEventsFromSameGame && Config.betting.blockSingleGameBets) ||
            ($scope.betSlip.type.value === 3 && $scope.betSlip.bets.length < 3) ||
            ($scope.betSlip.type.value === 3 && $scope.betSlip.bets.length > 16) || // System bet restriction (max 16 events)
            (Config.betting.enableBankerBet && $scope.betSlip.bets.length - $scope.betSlip.bankerBetsCount < 2) ||
            ($scope.betSlip.hasEmptyStakes && !$scope.betSlip.hasFilledStake) ||
            $scope.betSlip.hasLockedEvents  ||
            $scope.betSlip.hasConflicts
        );
    }

    $scope.$on('bet', addBet);

    /**
     * @ngdoc method
     * @name setBetSlipType
     * @methodOf betting.controller:betSlipController
     * @description sets betslip type

     * @param {object} type betslip type, one of the following: single, express, system, chain
     * @param {boolean} notCheckForFreeBet
     */
    $scope.setBetSlipType = function setBetSlipType(value, notCheckForFreeBet) {
        var canSet = false;
        for (var i = 0, x = $scope.betTypes.length; i < x; i++) {
            if ($scope.betTypes[i].value === value) {
                canSet = true;
                $scope.betSlip.type = $scope.betTypes[i];
                break;
            }
        }
        if (!canSet) { return; }

        var changeOddFormatForBetslipType = Config.main.asian.changeOddFormatForBetslipType;
        //Added functionality for changing odd format from indo or malay into hongkong when placing multiple or system bet
        if (changeOddFormatForBetslipType !== undefined &&  changeOddFormatForBetslipType[$scope.betSlip.type.name] !== undefined && changeOddFormatForBetslipType[$scope.betSlip.type.name][$rootScope.env.oddFormat] !== undefined) {
            $rootScope.env.oddFormat = changeOddFormatForBetslipType[$scope.betSlip.type.name][$rootScope.env.oddFormat];
        }
        //broadcast event about new type
        Config.main.disableOddFormatsSpecialCase && $rootScope.$broadcast('betslip.type', $scope.betSlip.type);

        Storage.set('betslip', $scope.betSlip, Config.betting.storedBetslipLifetime);
        if (parseInt($scope.acceptPriceChanges, 10) === -1 && $scope.betSlip.type.value > 2) {
            $scope.acceptPriceChanges = '0';
        }
        !notCheckForFreeBet && (checkFreeBet());

        if ($scope.betSlip.type.value !== 1) {
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
        $rootScope.$broadcast("openLoginForm");
        $event.stopPropagation();
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
        $rootScope.$broadcast("openRegForm");
        $event.stopPropagation();
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

        var getVirtualPath = function () {
            var virtualsPath = '/virtualsports';
            angular.forEach(Config.main.virtualSportIds, function (value, key) {
                value.indexOf(gamePointer.vsport) !== -1 && (virtualsPath = key);
            });

            return virtualsPath;
        };

        var neededPath = gamePointer.sport === -3 ? getVirtualPath() : Utils.getPathAccordintToAlias(gamePointer.alias);

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
        $scope.betSlip.hasEmptyStakes = ($scope.betSlip.type.value !== 1 || $scope.quickBet.enabled) && ($scope.betSlip.stake === "" || parseFloat($scope.betSlip.stake) === 0);

        if ($event.keyCode === 13 && !( !$scope.betSlip.isBettingAllowed || !$scope.env.authorized || $scope.isBetsInProgress || $scope.betSlip.thereAreDeletedEvents || $scope.betSlip.hasCounterOfferError || ($scope.env.authorized && !$scope.freeBet.enabled && $scope.betSlip.totalStake > $scope.profile.balance + $scope.profile.bonus_balance + ($scope.profile.bonus_win || 0)))) {
            $scope.acceptChangesAndPlaceBets();
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
        var betData = {
            'bets': $scope.betSlip.bets,
            'amount': $scope.betSlip.stake,
            'betType': $scope.betSlip.type.value,
            'sysVal': $scope.sysBetSelectedValue,
            'bookId': $scope.betSlip.bookingResultId,
            'viewType': Config.main.bookingBetPrint.viewType,
            'odds': $scope.betSlip.type.value === 1 ? $scope.betSlip.bets[0].price : $scope.betSlip.expOdds,
            'possibleWin': $scope.possibleWinValue,
            'possibleWinTax': $scope.possibleWinTax,
            'finalWinTaxValue': $scope.finalWinTaxValue,
            'totalPossibleWin': $scope.totalPossibleWin,
            'possibleWinBonusTax': $scope.possibleWinBonusTax,
            'finalWinBonusTaxValue': $scope.finalWinBonusTaxValue
        };
        if (Config.betting.enableExpressBonus) {
            betData['expBonusPercentage'] = $scope.betSlip.expBonusPercentage;
            betData['expBonus'] = $scope.betSlip.expBonus;
            betData['expOdds'] = $scope.betSlip.expOdds;
            betData['hasSpOddTypes'] = $scope.betSlip.hasSpOddTypes;
        }
        if ($rootScope.partnerConfig && $rootScope.partnerConfig.tax_type && $rootScope.partnerConfig.tax_percent) {
            betData['tax'] = {
                'type': $rootScope.partnerConfig.tax_type,
                'percent': $rootScope.partnerConfig.tax_percent
            };
        }
        var encodedBetData = encodeURIComponent(JSON.stringify(betData));

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
                contentBox: id,
                showCustomButton: Config.main.bookingBetPrint.showPrintButton
            });
        }
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

    /**
     * @ngdoc method
     * @name toggleBetterOddSelectionMode
     * @methodOf betting.controller:betSlipController
     */
    $scope.toggleBetterOddSelectionMode = function toggleBetterOddSelectionMode () {
        if ($scope.betSlip.betterOddSelectionMode) {
            $scope.setBetSlipType(1, false);
        }
        Storage.set('betslip', $scope.betSlip, Config.betting.storedBetslipLifetime);
    };

    /**
     * @ngdoc method
     * @name toggleCounterOffer
     * @methodOf betting.controller:betSlipController
     */
    $scope.toggleCounterOffer = function toggleCounterOffer () {
        if (!$scope.betSlip.counterOfferPossible) { return; }
        $scope.counterOffer.enabled = !$scope.counterOffer.enabled;

        if ($scope.counterOffer.enabled) {
            $scope.betSlip.superbet.selector = false;
            $scope.setBetSlipType(1, true);
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
        if (!$rootScope.profile.is_super_bet_available || !$scope.betSlip.superbet.possible) return;

        $scope.betSlip.superbet.selector = !$scope.betSlip.superbet.selector;
        if ($scope.betSlip.superbet.selector) {
            $scope.counterOffer.enabled = false;
            $scope.acceptPriceChanges = '-1';
        } else {
            $scope.acceptPriceChanges = '0';
            $scope.showBetSettings = false;
        }
        Storage.set('betslip', $scope.betSlip, Config.betting.storedBetslipLifetime);
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

    /**
     * @ngdoc method
     * @name singleBetTypeAmountChange
     * @methodOf betting.controller:betSlipController
     * @description checks and fill  amount of 'singles'   in full cover types
     */
    $scope.singleBetTypeAmountChange = function singleBetTypeAmountChange() {
        if ($scope.betConf.enableFullCoverBetTypes && $scope.betSlip.bets.length > 1) {
            var i = 1, length = $scope.betSlip.bets.length, currentAmount = $scope.betSlip.bets[0].singleStake;
            for (; i < length; ++i) {
                if (currentAmount !== $scope.betSlip.bets[i].singleStake) {
                    $scope.fullCoverBet.types[fullCoverTypesMap[1]].amount = "";
                    return;
                }
            }
            $scope.fullCoverBet.types[fullCoverTypesMap[1]].amount = currentAmount;
        }
    };

    /**
     * @ngdoc method
     * @name fullCoverTypeAmountChange
     * @methodOf betting.controller:betSlipController
     * @description Handles single's type amount change and applies for all events
     * @param {String} key the key of current type of full cover types
     * @param {String} the current amount of current type
     */
    $scope.fullCoverTypeAmountChange = function fullCoverTypeAmountChange(key, amount) {
        if (key === fullCoverTypesMap[1]) {
            $scope.repeatSingleStake(amount);
        }
    };

    /**
     *@description recalculates all possible types if full cover bet types enabled from config
     */
    function calculateFullCoverTypes(newLength) {
        if (!newLength || newLength < 2) {
            $scope.fullCoverBet.types = {};
        } else {
            var i = 1, key, lastCount = 0, newTypes = {};
            for (; i <= newLength;  ++i) {
                key  = fullCoverTypesMap[i] || i + fullCoverTypesMap['default'];
                newTypes[key] = $scope.fullCoverBet.types[key] || {
                        order: i,
                        amount: '',
                        name: fullCoverTypesMap[i] && Translator.get(fullCoverTypesMap[i]) || (i + ' ' + Translator.get(fullCoverTypesMap["default"]))
                    };
                if (i > 1) {
                    newTypes[key].count = $scope.calcSystemOptionsCount(i);
                    lastCount += newTypes[key].count;

                    if (newTypes[key].count === 1) {
                        newTypes[key].totalCoef = 1; // will be calculated inside posWin
                        newTypes[key].type = 2; // actually this is system bet
                        newTypes[key].sysCount && (delete newTypes[key].sysCount);

                    } else {
                        newTypes[key].sysCount = i;
                        newTypes[key].type = 3; // actually this is system bet
                        newTypes[key].totalCoef && (delete newTypes[key].totalCoef);
                    }

                } else {
                    newTypes[key].count = newLength;
                }
            }

            if (newLength > 2) {
                fullCoverLastItemKey = (fullCoverAdditionalTypesMap[newLength] && fullCoverAdditionalTypesMap[newLength].name) || i + newLength + fullCoverAdditionalTypesMap['default'].name;
                newTypes[fullCoverLastItemKey] = $scope.fullCoverBet.types[fullCoverLastItemKey] || {
                    order: i,
                    amount: '',
                    name: fullCoverAdditionalTypesMap[newLength] && Translator.get(fullCoverAdditionalTypesMap[newLength].name) || Translator.get(fullCoverAdditionalTypesMap["default"].name)
                };
                newTypes[fullCoverLastItemKey].type = fullCoverAdditionalTypesMap[newLength] && fullCoverAdditionalTypesMap[newLength].type || fullCoverAdditionalTypesMap["default"].type;
                newTypes[fullCoverLastItemKey].count = lastCount;
            } else {
                fullCoverLastItemKey = undefined;
            }

            $scope.fullCoverBet.types = newTypes;

            // need to check and fill single type amount
            $scope.singleBetTypeAmountChange();
        }
    }

    /**
     * @ngdoc method
     * @name addSelections
     * @methodOf betting.controller:betSlipController
     * @description add new selections
     */
    $scope.addSelections = function addSelections(showSelectionsPart) {
        $scope.disableAddBets.newSelections = true;
        //if param showSelectionsPart is true => clicked on 'Add to bet' button
        if(showSelectionsPart) {
            $rootScope.editBet.openSelectionsPart = true;
            $scope.showInSelections = true;
            $scope.disableAddBets.addBet = false;
            $scope.disableAddBets.saveChanges = true;
            $scope.emptyNewSelections = true;
        } else {
            //if param showSelectionsPart is undefined => clicked on 'Add selection' button, it opens new selections part
            $rootScope.editBet.openSelectionsPart = false;
            $scope.disableAddBets.addBet = true;
            $scope.disableAddBets.saveChanges = false;
        }
        angular.forEach($scope.betSlip.bets, function(bet) {
            if(bet.showInSelections) {
                bet.showInSelections = false;
            }
        });
        Storage.set('betslip', $scope.betSlip, Config.betting.storedBetslipLifetime);
    };


    /**
     * @ngdoc method
     * @name removeNewSelectionsFromBetSlip
     * @methodOf betting.controller:betSlipController
     * @description removes new selections from betSlip
     */
    $scope.removeNewSelectionsFromBetSlip = function removeNewSelectionsFromBetSlip() {
        $rootScope.editBet.openSelectionsPart = false;
        $scope.disableAddBets.saveChanges = !$rootScope.editBet.changed;
        $scope.disableAddBets.addBet = true;
        angular.forEach($scope.betSlip.bets, function(bet) {
            if(bet.showInSelections) {
                $scope.betSlip.bets.splice($scope.betSlip.bets.indexOf(bet));
            }
        });
        Storage.set('betslip', $scope.betSlip, Config.betting.storedBetslipLifetime);
    };

    if ($scope.betConf.enableFullCoverBetTypes) {
        $scope.$watch('betSlip.bets.length', calculateFullCoverTypes);

        $scope.betSlip.type.value !== 1 && $scope.setBetSlipType(1, false);
    }


    /**
     * @ngdoc function
     * @name lookForEventsInURL
     * @methodOf betting.controller:betSlipController
     * @description Looks for event ids and stake in the url and adds them to bet slip
     */
    (function lookForEventsInURL() {
        var params = $location.search();
        if (params.event && typeof params.event === 'string') {
            var eventIds;
            if (params.event.indexOf(',') > 0) {
                eventIds = Utils.uniqueNum(params.event.split(','))
            } else if (!isNaN(Number(params.event))) { // Checking if the url format is correct (e.g. event=,41545315 is wrong)
                eventIds = [Number(params.event)];
            }
            if (eventIds) {
                $location.search('event', undefined);
                BetService.getEventData(eventIds).then(function success(response) {
                    if (response.data) {
                        var betsToPlace = Utils.formatEventData(response.data),
                            oddType = 'odd';
                        $scope.clearBetslip();
                        for (var i = 0; i < betsToPlace.length; i++) {
                            $rootScope.$broadcast('bet', {event: betsToPlace[i].eventInfo, market: betsToPlace[i].marketInfo, game: betsToPlace[i].gameInfo, oddType: oddType});
                        }
                        if (params.stake && typeof params.stake === 'string' && !isNaN(Number(params.stake))) {
                            $scope.betSlip.stake = Number(params.stake);
                            $location.search('stake', undefined);
                        }
                    }
                })
            }
        }
    }());


    $scope.$on("openBetBookingPrintPopup", function (event, data) {
        $scope.openBookingPrintPopup(data);
    });

    $scope.$on('close.edit.mode', function() {
        $scope.showInSelections = false;
        $scope.emptyNewSelections = true;
        $scope.disableAddBets = {
            newSelections: false,
            addBet: false,
            saveChanges: true
        };
    });
    $scope.$on('clear.bets',function(event, editBet) {if($scope.showRetainsButtons || editBet) { $scope.clearBetslip() }});
    $scope.$on('disable.add.bet', function() {$scope.disableAddBets.addBet = true});
    $scope.$on('$destroy', function() {
        if (subId) {
            Zergling.unsubscribe(subId);
            subId = undefined;
        }
    })

}]);

/**
 * @ngdoc controller
 * @name vbet5.controller:betBuilderCtrl
 */
VBET5.controller('betBuilderCtrl', ['$rootScope', '$scope', '$filter', '$q', '$timeout', 'Zergling', 'Translator', 'Utils', 'partner', function($rootScope, $scope, $filter, $q, $timeout, Zergling, Translator, Utils, partner) {
    'use strict';

    var orderedMarkets = [
        {
            key: "WINNER",
            displayName: "Match Result"
        },
        {
            key: "TOTALS",
            displayName: "Total Goals"
        },
        {
            key: "BOTHTEAMTOSCORE",
            displayName: "Both Teams To Score"
        },
        {
            key: "CORRECT SCORE",
            displayName: "Correct Score"
        },
        {
            key: "HANDICAP3WAY",
            displayName: "Winning Margin"
        }
    ];

    var eventNamesTemplatesMap = {
        "WINNER": "{1} {2}{3}",
        "TOTALS": "{1} goals in {2}",
        "BOTHTEAMTOSCORE": "Both Teams to score ({1}) in {2}",
        "CORRECT SCORE": "{1} in {2}",
        "HANDICAP3WAY": "{1} {2} {3} goals"
    };

    var marketTypesIdsMap = {
        5498: "match",
        5503: "match",
        10046: "match",
        5515: "match",
        5508: "match",
        5500: "match",
        5504: "match",

        6505: "firstHalf",
        8718: "firstHalf",
        5518: "firstHalf",
        6500: "firstHalf",
        5520: "firstHalf",
        8962 : "firstHalf",

        6598: "secondHalf",
        8724: "secondHalf",
        8725: "secondHalf",
        8715: "secondHalf",
        8719: "secondHalf",
        8963 : "secondHalf"
    };

    var ODD_TYPE_MAP = {
        'decimal': 0,
        'fractional': 1,
        'american': 2,
        'hongkong': 3,
        'malay': 4,
        'indo': 5
    };

    var availablePeriods = {
        "firstHalf": Translator.get("1st Half"),
        "secondHalf": Translator.get("2nd Half"),
        "match": Translator.get("Full Time")
    };

    var oddsRecalculationPromise;

    //initial selection
    $scope.selectedKeys = {
        period: "",
        market: "",
        marketName: ""
    };

    $scope.oddsCalculationState = {
        loading: false,
        failed: false,
        odd: 0,
        previousOdd: 0
    };
    $scope.betState = {
        isBetsInProgress: false
    };
    $scope.selectedBet = null;
    $scope.selectedEvents = [];

    var correctScoreMap = {
        "firstHalf": {
            "homeValues": [],
            "awayValues": [],
            "resultMap": {}
        },
        "secondHalf": {
            "homeValues": [],
            "awayValues": [],
            "resultMap": {}

        },
        "match": {
            "homeValues": [],
            "awayValues": [],
            "resultMap": {}
        }
    };

    var handicap3WayMap = {
        "firstHalf": {
            "p1": {
                "win": [],
                "lose": [],
                "exactly": []
            },
            "p2": {
                "win": [],
                "lose": [],
                "exactly": []
            }
        },
        "secondHalf": {
            "p1": {
                "win": [],
                "lose": [],
                "exactly": []
            },
            "p2": {
                "win": [],
                "lose": [],
                "exactly": []
            }
        },
        "match": {
            "p1": {
                "win": [],
                "lose": [],
                "exactly": []
            },
            "p2": {
                "win": [],
                "lose": [],
                "exactly": []
            }
        }

    };

    var totalsMap = {
        "firstHalf": {},
        "secondHalf": {},
        "match": {}
    };

    var matchResultNameMap = {
       "firstHalf": {
           "none": ["____", Translator.get("to win")," " + Translator.get("in") + " " + availablePeriods.firstHalf],
           "0": [$scope.betBuilderGame.team1_name, Translator.get("to win"), " " + Translator.get("in") + " " + availablePeriods.firstHalf],
           "2": [$scope.betBuilderGame.team2_name, Translator.get("to win"), " " + Translator.get("in") + " " + availablePeriods.firstHalf],
           "1": [Translator.get("Match"), Translator.get("to be drawn"),  " " + Translator.get("in") + " " + availablePeriods.firstHalf]
       },
        "secondHalf": {
            "none": ["____", Translator.get("to win"),  " " +Translator.get("in") + " " + availablePeriods.secondHalf],
            "0": [$scope.betBuilderGame.team1_name, Translator.get("to win"),  " " + Translator.get("in") + " " + availablePeriods.secondHalf],
            "2": [$scope.betBuilderGame.team2_name, Translator.get("to win"), " " + Translator.get("in") + " " + availablePeriods.secondHalf],
            "1": [Translator.get("Match"), Translator.get("to be drawn"),  " " +Translator.get("in") + " " + availablePeriods.secondHalf]
        },
        "match": {
           "none": ["____", Translator.get("to win"), ""],
            "0": [$scope.betBuilderGame.team1_name, Translator.get("to win"), ""],
            "2": [$scope.betBuilderGame.team2_name, Translator.get("to win"), ""],
            "1": [Translator.get("Match"), Translator.get("to be drawn"), ""]

        }
    };

    var bothTeamToScoreMap = {
        'none': '__',
        '0': Translator.get('Yes'),
        '1': Translator.get('No')
    };

    function setBetName(bet) {
        if (!bet) {
            return;
        }
        var placeholders;
        switch(bet.market) {
            case 'WINNER':
                placeholders = matchResultNameMap[bet.period][bet.state.selectedIndex === undefined?'none': bet.state.selectedIndex.toString()];
                break;
            case 'BOTHTEAMTOSCORE':
                placeholders = [bothTeamToScoreMap[bet.state.selectedIndex === undefined?'none': bet.state.selectedIndex.toString()], availablePeriods[bet.period]];
                break;
            case 'TOTALS':
            case 'CORRECT SCORE':
                placeholders = [(bet.bet? bet.bet.name: '____'), availablePeriods[bet.period]];
                break;
            case 'HANDICAP3WAY':
                var teamMap = {
                    "p1": $scope.betBuilderGame.team1_name,
                    "p2": $scope.betBuilderGame.team2_name
                };
                var wonTypeMap = {
                    "win": Translator.get("Will win by more than"),
                    "lose": Translator.get("Will not lose by more than"),
                    "exactly": Translator.get("Will win by exactly")
                };
                var player = bet.state.selectedTeam? teamMap[bet.state.selectedTeam]: "____";
                var wonType = bet.state.wonType?wonTypeMap[bet.state.wonType]: "____";
                var goalCount = bet.bet? bet.bet.goalCount: "_";
                placeholders = [player, wonType, goalCount];
                break;
        }
        bet.name = Translator.get(eventNamesTemplatesMap[bet.market], placeholders);
    }

    function addPeriodFromMarket(list, periodKey, market) {
        if (market[periodKey].length) {
            list.push({
                key: periodKey,
                name: availablePeriods[periodKey]
            });
        }
    }

    function preparePeriodsListBySelectedMarket(market) {
        var periods = [];

        addPeriodFromMarket(periods, "firstHalf", market);
        addPeriodFromMarket(periods, "secondHalf", market);
        addPeriodFromMarket(periods, "match", market);

        $scope.periods = periods;
        // handle selection
        var isContains = false;
        if ($scope.selectedKeys.period ) {
            for(var j = periods.length; j--;) {
                if (periods[j].key === $scope.selectedKeys.period) {
                    isContains = true;
                    break;
                }
            }
        }
        if (!isContains) {
            $scope.selectedKeys.period = periods[periods.length - 1].key;
        }
    }

    function totalsSorting(a, b) {
        if(a.handicap === b.handicap){
            return a.order - b.order;
        }
        return a.handicap < b.handicap ? -1 : 1;
    }

    function numberSorting(a, b) {
        return a - b;
    }
/*
    function handicaps3WaySorting(a, b) {
        if(a.handicap === b.handicap){
            return a.order - b.order;
        }
        return a.handicap < b.handicap ? 1 : -1;
    }*/

    function resetOptions() {
        $scope.oddsCalculationState.failed = false;
        $scope.oddsCalculationState.odd = 0;
        $scope.oddsCalculationState.previousOdd = 0;
        $scope.oddsCalculationState.loading = false;
    }

    function handleEmptyCase () {
        $scope.selectKey('market', {});
        resetOptions();

        if (oddsRecalculationPromise) {
            $timeout.cancel(oddsRecalculationPromise);
        }
    }

    function getOdds() {
        var defer = $q.defer();

        var ids = [];
        var eventsLength = $scope.selectedEvents.length;
        var notContainsError = true;
        for (var i = 0; i < eventsLength; ++i) {
            if (!$scope.selectedEvents[i].bet) {
                defer.reject({eventsLength:$scope.selectedEvents.length, notValid: true});
                notContainsError = false;
                break;

            } else {
                ids.push({
                    SelectionId: $scope.selectedEvents[i].bet.id,
                    Handicap: $scope.selectedEvents[i].bet.handicap
                });
            }
        }
        if (notContainsError) {
            Zergling.get({"selection_ids": ids}, "bet_builder_calculate").then(function (response) {
                if (response.result === 0 && response.details) {
                    defer.resolve({odd:response.details.Odds, eventsLength:ids.length});
                } else {
                    defer.reject({eventsLength:ids.length});
                }
            });
        }


        return defer.promise;
    }

    function calculateOdd()  {
        if (oddsRecalculationPromise) {
            $timeout.cancel(oddsRecalculationPromise);
        }
        $scope.oddsCalculationState.failed = false;

        if ($scope.selectedEvents.length <= 1) {
            resetOptions();
        } else {
            $scope.oddsCalculationState.loading = true;
            oddsRecalculationPromise = $timeout(function() {
                getOdds().then(function (resolve) {
                    if ($scope.selectedEvents.length === resolve.eventsLength) {
                        $scope.oddsCalculationState.odd = $scope.oddsCalculationState.previousOdd = resolve.odd;
                        $scope.oddsCalculationState.failed = false;
                    }
                })['catch'](function(reject) {
                    if ($scope.selectedEvents.length === reject.eventsLength) {
                        if (!reject.notValid) {
                            $scope.oddsCalculationState.failed = true;
                        }
                        $scope.oddsCalculationState.odd = $scope.oddsCalculationState.previousOdd = 0;
                    }
                })['finally'](function () {
                    $scope.oddsCalculationState.loading = false;
                });
            },700);
        }
    }

    function initMarketState(bet) {
        if (bet) {
            $scope.marketState = angular.copy(bet.state);
        } else {
            switch ($scope.selectedKeys.market) {
                case 'HANDICAP3WAY':
                    $scope.marketState = {
                        selectedTeam: 'p1',
                        wonType: 'win',
                        selectedIndex: 0
                    };
                    break;
                case 'CORRECT SCORE':
                    $scope.marketState = {
                        homeValue: $scope.marketsData[$scope.selectedKeys.market].group[$scope.selectedKeys.period].homeValues[0],
                        awayValue: $scope.marketsData[$scope.selectedKeys.market].group[$scope.selectedKeys.period].awayValues[0]
                    };
                    break;
            }
        }

    }

    function selectByState(period) {
        var event = null;
        switch ($scope.selectedBet.market) {
            case 'WINNER':
            case 'BOTHTEAMTOSCORE':
                event = $scope.marketsData[$scope.selectedBet.market][period][$scope.selectedBet.state.selectedIndex];
                break;
            case 'TOTALS':
                event = totalsMap[period][$scope.selectedBet.state.handicap + '-' + $scope.selectedBet.state.order];
                break;
            case 'CORRECT SCORE':
                event = $scope.marketsData[$scope.selectedKeys.market].group[period].resultMap[$scope.selectedBet.state.homeValue + '-' + $scope.selectedBet.state.awayValue];
                break;
            case 'HANDICAP3WAY':
                event = $scope.marketsData[$scope.selectedKeys.market].group[period][$scope.selectedBet.state.selectedTeam][$scope.selectedBet.state.wonType][$scope.selectedBet.state.selectedIndex];
                break;
        }
        if (checkIsContainsEvent(event)) {
            showDuplicateAlert();
            return false;
        } else {
            $scope.selectedBet.bet = event;
            return true;
        }
    }

    function clearNotSelectedEventBet() {
        if ($scope.selectedBet && !$scope.selectedBet.bet) {
            $scope.selectedEvents = $scope.selectedEvents.filter(function (item) {
                return item !== $scope.selectedBet;
            });
            calculateOdd();
        }
    }

    $scope.selectKey = function selectPeriod(type, value, bet) {
        if (type === 'market') {
            $scope.selectedKeys.market = value.key;
            $scope.selectedKeys.marketName = value.displayName;
            clearNotSelectedEventBet();
            if (value.key) {
                preparePeriodsListBySelectedMarket($scope.marketsData[value.key]);
                if (bet) {
                    $scope.selectedBet = bet;
                    $scope.selectedKeys.period = bet.period;
                } else {
                    $scope.selectedBet = {
                        market: $scope.selectedKeys.market,
                        marketObj: value,
                        period: $scope.selectedKeys.period,
                        bet: null,
                        state: {}
                    };
                    $scope.selectedEvents.push($scope.selectedBet);
                    calculateOdd();
                }
                initMarketState(bet);
            } else {
                $scope.selectedBet = null;
            }


        } else {
            $scope.selectedKeys[type] = value;
            if (selectByState($scope.selectedKeys.period)) {
                calculateOdd();
                $scope.selectedBet.period = $scope.selectedKeys.period;
            }
        }
        setBetName($scope.selectedBet);
    };

    function checkIsContainsEvent(selectedEvent) {
       return $scope.selectedEvents.filter(function (item) {
            return item.bet === selectedEvent;
       }).length > 0;
    }
    function showDuplicateAlert() {
        $rootScope.$broadcast("globalDialogs.addDialog", {
            type: "error",
            title: "Error",
            content: "You cannot add a duplicate event."
        });
    }

    $scope.attachEvent = function attachEvent(event) {
        if ($scope.selectedBet.bet === event) {
            return;
        }
        if (checkIsContainsEvent(event)) {
            showDuplicateAlert();
            return;
        }
        $scope.selectedBet.period = $scope.selectedKeys.period;
        $scope.selectedBet.bet = event;
        switch($scope.selectedBet.market) {
            case 'WINNER':
            case 'BOTHTEAMTOSCORE':
                $scope.selectedBet.state.selectedIndex = event.order - 1;
                break;
            case 'TOTALS':
                $scope.selectedBet.state.handicap = event.handicap;
                $scope.selectedBet.state.order = event.order;
                break;
            case 'CORRECT SCORE':
            case 'HANDICAP3WAY':
                $scope.selectedBet.state = angular.copy($scope.marketState);
                break;
        }
        setBetName($scope.selectedBet);
        calculateOdd();

    };

    $scope.clearAllSelections = function clearAllSelections() {
        $scope.selectedEvents.length = 0;
        $scope.betState.errorMessage = "";
        $scope.betState.stake = "";
        handleEmptyCase();
    };

    $scope.placeBet = function placeBet() {
        $scope.betState.isBetsInProgress = true;
        var request = {
            type: 50,
            mode: 2, // provided odds and actual odds is different so there is no correct solution right now than hard coded mode
            each_way: false,
            amount: parseFloat($scope.betState.stake),
            odd_type: ODD_TYPE_MAP[$rootScope.env.oddFormat]
        };
        var eventMap = {};

        request.bets = $scope.selectedEvents.map(function(item) {
            var event = item.bet;
            eventMap[event.id] = event;
            return {"event_id": event.id, "price": parseFloat(event.price), "basis": event.handicap};
        });
        Zergling.get(request, 'do_bet').then(function (response) {
            if (response.result === "OK") {
                $scope.betState.isBetsInProgress = false;
                $scope.clearAllSelections();
                Utils.setJustForMoment($scope.betState, "successMessage", Translator.get("Successfully placed bet"), 2000);
            } else if (response.result === 1800) { // price change
                if (response.details) {
                    angular.forEach(response.details, function (value) {
                        eventMap[value.event_id].price = value.new_price;
                    });
                }
                getOdds().then(function (resolve) {
                    if ($scope.oddsCalculationState.odd === resolve.odd) { // odd before the price change and odd after the price change the same.
                        placeBet();
                    } else {
                        $scope.oddsCalculationState.odd = resolve;
                    }
                })['catch'](function() {
                    $scope.betState.errorMessage = Translator.get("Sorry we can't accept your bets now, please try later");
                });
            } else {
                $scope.betState.errorMessage = Translator.get(response.result_text || ("message_" + response.result));
                $scope.betState.isBetsInProgress = false;
            }
        });

    };

    function addIfNotExists(list, value) {
        if (list.indexOf(value) === -1) {
            list.push(value);
        }
    }

    function groupCorrectScoreEvents(event, container) {
        addIfNotExists(container.homeValues, event.homeValue);
        addIfNotExists(container.awayValues, event.awayValue);
        container.resultMap[event.homeValue + '-' + event.awayValue] = event;
    }

    function groupHandicap3WayEvent(event, container) {
        var player;
        var winType;
        switch(event.order) {
            case 1:
                player = "p1";
                if (event.handicap > 0) {
                    winType = "win";
                } else if (event.handicap < -1) {
                    winType = "lose";
                    event.goalCount = Math.abs(event.handicap) - 1;

                }
                break;
            case 2:
                winType = "exactly";
                if (event.handicap > 0) {
                   player = "p1";
                } else {
                   player = "p2";
                }
                break;
            case 3:
                player = "p2";
                if (event.handicap < 0) {
                   winType = "win";
                } else if (event.handicap > 1) {
                   winType = "lose";
                   event.goalCount = Math.abs(event.handicap) - 1;
                }
                break;
        }
        if (event.goalCount === undefined) {
            event.goalCount = Math.abs(event.handicap);
        }
        if (player && winType) {
            container[player][winType].push(event);
        }

    }

    $scope.clearBetslipErrors = function clearBetslipErrors() {
        $scope.betState.errorMessage = "";
    };

    $scope.removeEvent = function removeEvent(bet) {
        $scope.selectedEvents =  $scope.selectedEvents.filter(function (item) {
            return item !== bet;
        });
        $scope.selectedBet = null;
        calculateOdd();
        if ($scope.selectedEvents.length === 0) {
            handleEmptyCase();
        } else {
            $scope.selectKey('market', {key: '', displayName: '' });
        }

    };

    function checkHandicapIsNotWhole(item) {
        return Math.round(item.handicap) !== item.handicap;
    }

    function groupTotal(period) {
        var map = totalsMap[period];
        return function (event) {
            map[event.handicap + '-' + event.order] = event;
        };
    }

    (function init() {
        $scope.loadingInProgress = true;

        Zergling.get({game_id: $scope.betBuilderGame.id}, 'get_bet_builder_markets').then(function (response) {
            if (response && response.result === 0 && response.details.length) {
                var i;
                var marketsData = {};
                for (i = response.details.length; i--;) {
                    var market = response.details[i];
                    marketsData[market.DisplayKey] = marketsData[market.DisplayKey] || {
                        id: market.Id, // remove
                        name: market.Name, //remove
                        typeId: market.MarketTypeId, //remove
                        key: market.DisplayKey, //remove
                        firstHalf: [],
                        secondHalf: [],
                        match: []
                    };



                    for (var j = market.Selections.length; j--;) {
                        var selection = market.Selections[j];

                        if (marketTypesIdsMap[market.MarketTypeId]) {
                            marketsData[market.DisplayKey][marketTypesIdsMap[market.MarketTypeId]].push(
                                {
                                    id: selection.Id,
                                    marketId: selection.MarketId,
                                    typeId: market.MarketTypeId,
                                    name: $filter('improveName')(selection.Name, $scope.betBuilderGame),
                                    marketName: selection.MarketName,
                                    price: selection.Price,
                                    order: selection.Order,
                                    matchId:selection.MatchId,
                                    homeValue: selection.HomeValue,
                                    awayValue: selection.AwayValue,
                                    handicap: market.Handicap
                                }
                            );
                        }
                    }
                }

                //prepare events ordering
                angular.forEach(marketsData, function (value, key) {
                   switch (key) {
                       case 'WINNER':
                       case 'BOTHTEAMTOSCORE':
                           value.firstHalf.sort(Utils.orderSorting);
                           value.secondHalf.sort(Utils.orderSorting);
                           value.match.sort(Utils.orderSorting);
                           break;
                       case 'CORRECT SCORE':
                           ["firstHalf", "secondHalf", "match"].forEach(function (period) {
                               var conatiner = correctScoreMap[period];
                               value[period].forEach(function (event) {
                                   groupCorrectScoreEvents(event, conatiner);
                               });
                              conatiner.homeValues.sort(numberSorting);
                              conatiner.awayValues.sort(numberSorting);
                           });
                           value.group = correctScoreMap;
                           break;
                       case 'TOTALS':
                           //TODO remove after backend change
                           value.firstHalf = value.firstHalf.filter(checkHandicapIsNotWhole);
                           value.secondHalf = value.secondHalf.filter(checkHandicapIsNotWhole);
                           value.match = value.match.filter(checkHandicapIsNotWhole);

                           var firstHalfGroupTotal = groupTotal("firstHalf");
                           var secondHalfGroupTotal = groupTotal("secondHalf");
                           var mathGroupTotal = groupTotal("match");

                           value.firstHalf.forEach(firstHalfGroupTotal);
                           value.secondHalf.forEach(secondHalfGroupTotal);
                           value.match.forEach(mathGroupTotal);

                           value.firstHalf.sort(totalsSorting);
                           value.secondHalf.sort(totalsSorting);
                           value.match.sort(totalsSorting);
                           break;
                       case "HANDICAP3WAY":
                           ["firstHalf", "secondHalf", "match"].forEach(function (period) {
                               var conatiner = handicap3WayMap[period];
                               value[period].forEach(function (event) {
                                   groupHandicap3WayEvent(event, conatiner);
                               });
                               angular.forEach(conatiner, function (player) {
                                   angular.forEach(player, function (events) {
                                       events.sort(function (item1, item2) {
                                           return Math.abs(item1.handicap) - Math.abs(item2.handicap);
                                       });
                                   });
                               });
                           });
                           value.group = handicap3WayMap;

                           break;
                   }
                });

                $scope.marketsData = marketsData;

                //calculate ordered markets simple list
                $scope.markets = [];
                for (i = 0; i < orderedMarkets.length; i++) {
                    if (marketsData[orderedMarkets[i].key]) {
                        $scope.markets.push({
                            key: orderedMarkets[i].key,
                            displayName: Translator.get(orderedMarkets[i].displayName)
                        });
                    }
                }
            }
        })['finally'](function () {
            $scope.loadingInProgress = false;
        });
   })();

    /**
     * @ngdoc method
     * @name deposit
     * @methodOf betting.controller:betSlipController
     * @description calls partner callback function to open deposit page(integration mode)
     */
    $scope.openPartnerDeposit = function openPartnerDeposit() {
        partner.call('deposit', 'betslip');
    };

    $scope.$on("$destroy", function() {
        if (oddsRecalculationPromise) {
            $timeout.cancel(oddsRecalculationPromise);
            oddsRecalculationPromise = undefined;
        }
    });
}]);

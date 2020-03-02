/**
 * @ngdoc controller
 * @name vbet5.controller:betBuilderCtrl
 */
VBET5.controller('betBuilderCtrl', ['$rootScope', '$scope', '$filter', '$q', '$timeout', 'Zergling', 'Translator', 'Utils', function($rootScope, $scope, $filter, $q, $timeout, Zergling, Translator, Utils) {
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

    $scope.eventsDataMap = {};
    $scope.activeEventsMap = [];

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
    }

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

        var ids = $scope.activeEventsMap.map(function(typeId) {
            return $scope.eventsDataMap[typeId].id;
        });

        Zergling.get({"selection_ids": ids}, "bet_builder_calculate").then(function (response) {
            if (response.result === 0 && response.details) {
                defer.resolve({odd:response.details.Odds, eventsLength:ids.length});
            } else {
                defer.reject({eventsLength:ids.length});
            }
        });

        return defer.promise;
    }

    function calculateOdd()  {
        if (oddsRecalculationPromise) {
            $timeout.cancel(oddsRecalculationPromise);
        }
        $scope.oddsCalculationState.failed = false;

        if ($scope.activeEventsMap.length === 1) {
            resetOptions();
        } else {
            $scope.oddsCalculationState.loading = true;
            oddsRecalculationPromise = $timeout(function() {
                getOdds().then(function (resolve) {
                    if ($scope.activeEventsMap.length === resolve.eventsLength) {
                        $scope.oddsCalculationState.odd = $scope.oddsCalculationState.previousOdd = resolve.odd;
                        $scope.oddsCalculationState.failed = false;
                    }
                })['catch'](function(reject) {
                    if ($scope.activeEventsMap.length === reject.eventsLength) {
                        $scope.oddsCalculationState.failed = true;
                        $scope.oddsCalculationState.odd = $scope.oddsCalculationState.previousOdd = 0;
                    }
                })['finally'](function () {
                    $scope.oddsCalculationState.loading = false;
                });
            },700);
        }
    }

    function initMarketState() {
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

    $scope.selectKey = function selectPeriod(type, value) {
        if (type === 'market') {
            $scope.selectedKeys.market = value.key;
            $scope.selectedKeys.marketName = value.displayName;

            if (value.key) {
                preparePeriodsListBySelectedMarket($scope.marketsData[value.key]);
            }
        } else {
            $scope.selectedKeys[type] = value;
        }
        initMarketState();
    };

    $scope.toggleEvent = function toggleEvent(event) {
        if (!$scope.eventsDataMap[event.typeId]) {
            $scope.eventsDataMap[event.typeId] = event;
            $scope.activeEventsMap.push(event.typeId);
        } else if ($scope.eventsDataMap[event.typeId].id !== event.id) {
            $scope.eventsDataMap[event.typeId] = event;
        } else {
            delete $scope.eventsDataMap[event.typeId];
            $scope.activeEventsMap.splice( $scope.activeEventsMap.indexOf(event.typeId), 1 );
        }

        if ($scope.activeEventsMap.length) {
            calculateOdd();
        } else {
            handleEmptyCase();
        }
    };

    $scope.clearAllSelections = function clearAllSelections() {
        $scope.eventsDataMap = {};
        $scope.activeEventsMap.length = 0;
        $scope.betState.errorMessage = "";
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

        request.bets = $scope.activeEventsMap.map(function(typeId) {
            var event = $scope.eventsDataMap[typeId];
            eventMap[event.id] = event;
            return {"event_id": event.id, "price": parseFloat(event.price)};
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

    function checkHandicapIsNotWhole(item) {
        return Math.round(item.handicap) !== item.handicap;
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

    $scope.$on("$destroy", function() {
        if (oddsRecalculationPromise) {
            $timeout.cancel(oddsRecalculationPromise);
            oddsRecalculationPromise = undefined;
        }
    });
}]);

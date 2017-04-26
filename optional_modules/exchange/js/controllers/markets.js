/**
 * Created by arman on 8/18/15.
 */
angular.module('exchange').controller('markets', ['$rootScope', '$scope', 'Zergling', 'lodash', 'GameInfo', function ($rootScope, $scope, Zergling, _, GameInfo) {
    'use strict';


    // $scope.pageType = 0;
    $rootScope.pageType = 1;
    $scope.gameType = 0;
    $scope.fairBetIsActiv = "";
    $scope.bets = [{}];
    $scope.gameMaxPossibleLiability = 0;
    $scope.optionIsReady={};
    $scope.liveGamesSoccerTemplate = GameInfo.liveGamesSoccerTemplate;
    $scope.framesCount = GameInfo.framesCount;
    $scope.slideSets = GameInfo.slideSets;
    $scope.showFrameAlias = GameInfo.showFrameAlias;
    $scope.visibleSetsNumber = 5; // number of sets to be visible for multiset games

    $scope.$on('CurrencyCoinRateBroadcastToMarket', function (events, defaultCurrencyCoinRate , defaultCurrencyShortName ,defaultCurrencyRound) {

        $scope.optionIsReady.coinRate = defaultCurrencyCoinRate;
        $scope.optionIsReady.currencyShortName = defaultCurrencyShortName;
        $scope.optionIsReady.defaultCurrencyRound = defaultCurrencyRound;
        //console.log(defaultCurrencyCoinRate,defaultCurrencyShortName,"CurrencyCoinRateBroadcastToMarket",$scope.gameId,$scope.sportId );

        $scope.defaultCurrencyCoinRate = defaultCurrencyCoinRate;
        $scope.defaultCurrencyShortName = defaultCurrencyShortName;
        //game($scope.gameId, $scope.sportId);




    });

    $scope.highlight = function () {

    };

    var getEventProfit = function (bets, isUpdate) {
        //console.log("asdasd");
        var defaultCurrencyRound;
        if($scope.defaultCurrencyRound <= 0 ){
            defaultCurrencyRound = Math.abs($scope.defaultCurrencyRound)
        }else{
            defaultCurrencyRound = $scope.defaultCurrencyRound
        }
        for (var market in $scope.markets) {

            if (isUpdate && $scope.markets[market].mStableProfit) {
                delete $scope.markets[market].mStableProfit;
            }

            for (var event in $scope.markets[market].event) {
                if (isUpdate) {
                    delete $scope.markets[market].event[event].eStableProfit;
                }
                //console.log("asdasd1");

                for (var bet in bets) {
                    console.log(bets,"asdasd2");

                    if ($scope.gameId == bets[bet].gameId) {
                        //console.log("asdasd3");

                        if (bets[bet].marketId == $scope.markets[market].id) {

                            if (!$scope.markets[market].mStableProfit) {
                                $scope.markets[market].mStableProfit = 0
                            }

                            if (bets[bet].event_id == $scope.markets[market].event[event].id) {
                                //if(bets[bet].amount && $scope.defaultCurrencyCoinRate){
                                //    bets[bet].amount = (Number(bets[bet].amount * $scope.defaultCurrencyCoinRate)).toFixed(defaultCurrencyRound)
                                //}
                                if (bets[bet].type == 1) {

                                    if ($scope.markets[market].event[event].eStableProfit) {
                                        $scope.markets[market].event[event].eStableProfit = Number((bets[bet].price  * bets[bet].amount + $scope.markets[market].event[event].eStableProfit).toFixed(2));
                                    } else {
                                        $scope.markets[market].event[event].eStableProfit = Number((bets[bet].price  * bets[bet].amount).toFixed(2));
                                    }

                                    $scope.markets[market].mStableProfit -= Number((bets[bet].amount));

                                } else if (bets[bet].type == 0) {
                                    if ($scope.markets[market].event[event].eStableProfit) {
                                        $scope.markets[market].event[event].eStableProfit = Number((bets[bet].amount * bets[bet].price * -1 + $scope.markets[market].event[event].eStableProfit).toFixed(2));
                                    } else {
                                        $scope.markets[market].event[event].eStableProfit = Number((bets[bet].amount * bets[bet].price * -1).toFixed(2));
                                    }

                                    $scope.markets[market].mStableProfit += Number((bets[bet].amount));
                                }

                            }

                        }
                    }
                }
            }

        }

        for (var market in $scope.markets) {
            if($scope.markets[market].mStableProfit ||  $scope.markets[market].mStableProfit == 0){
                for (var event in $scope.markets[market].event) {

                    if ($scope.markets[market].event[event].eStableProfit) {

                        $scope.markets[market].event[event].eStableProfit = Number($scope.markets[market].event[event].eStableProfit + $scope.markets[market].mStableProfit).toFixed(2);
                    }else{
                        $scope.markets[market].event[event].eStableProfit = Number($scope.markets[market].mStableProfit).toFixed(2);
                    }

                    if ($scope.markets[market].event[event].eStableProfit >= 0) {
                        $scope.markets[market].event[event].eStableProfit = Number(($scope.markets[market].event[event].eStableProfit * 95) / 100).toFixed(2);
                    }
                    $scope.markets[market].event[event].eStableProfit = (Number($scope.markets[market].event[event].eStableProfit * $scope.defaultCurrencyCoinRate)).toFixed(2)
                }
            }

        }

        // for (var market in $scope.markets) {

        //     for (var event in $scope.markets[market].event) {
        //         for (bet in bets) {

        //             if (bets[bet].event_id == $scope.markets[market].event[event].id) {
        //                 if (bets[bet].type != 1) {
        //                     $scope.markets[market].event[event].eStableProfit = parseFloat(Number($scope.markets[market].event[event].eStableProfit + $scope.markets[market].mStableProfit).toFixed(2));
        //                 } else if (bets[bet].type != 0) {
        //                     $scope.markets[market].event[event].eStableProfit = parseFloat(Number($scope.markets[market].event[event].eStableProfit - $scope.markets[market].mStableProfit).toFixed(2));
        //                 }
        //             } else {
        //                 if (!$scope.markets[market].event[event].eStableProfit) {

        //                     if (bets[bet].type != 1) {
        //                         $scope.markets[market].event[event].eStableProfit = parseFloat(Number($scope.markets[market].mStableProfit).toFixed(2));

        //                     } else {
        //                         $scope.markets[market].event[event].eStableProfit = -parseFloat(Number($scope.markets[market].mStableProfit).toFixed(2));

        //                     }
        //                 }
        //             }
        //         }

        //         if ($scope.markets[market].event[event].eStableProfit >= 0) {
        //             $scope.markets[market].event[event].eStableProfit = ($scope.markets[market].event[event].eStableProfit * 95) / 100
        //         }
        //     }
        // }


    };



    var getEventPossibleProfit = function (bets, isUpdate) {

        for (var market in $scope.markets) {

            if (isUpdate && $scope.markets[market].mPossibleProfit) {
                delete $scope.markets[market].mPossibleProfit;
            }

            for (var event in $scope.markets[market].event) {
                if (isUpdate) {
                    delete $scope.markets[market].event[event].ePossibleProfit;
                }
                for (var bet in bets) {


                    if ( bets[bet].gameId && $scope.gameId == bets[bet].gameId) {
                        if (bets[bet].marketId == $scope.markets[market].id) {

                            if (!$scope.markets[market].mPossibleProfit) {
                                $scope.markets[market].mPossibleProfit = 0;
                            }

                            if (bets[bet].event_id == $scope.markets[market].event[event].id) {
                                // console.log(typeof bets[bet].unstablePrice,"bets[bet].unstablePrice");
                                // console.log(typeof  bets[bet].unstableAmount," bets[bet].unstableAmount");
                                $scope.markets[market].commission = "Commission on this market";
                                $scope.markets[market].commissionRate = " 5% ";
                                //$scope.marketCommissionRate = "";


                                // console.log(typeof $scope.markets[market].event[event].ePossibleProfit,"$scope.markets[market].event[event].ePossibleProfit");
                                // console.log(typeof $scope.markets[market].mPossibleProfit ,"$scope.markets[market].mPossibleProfit ");

                                if (bets[bet].type == 0) {


                                    if ($scope.markets[market].event[event].ePossibleProfit) {
                                        $scope.markets[market].event[event].ePossibleProfit = Number((Number(bets[bet].unstablePrice  * bets[bet].unstableAmount + $scope.markets[market].event[event].ePossibleProfit)).toFixed(2));
                                    } else {
                                        $scope.markets[market].event[event].ePossibleProfit = Number((Number(bets[bet].unstablePrice  * bets[bet].unstableAmount)).toFixed(2));
                                        console.log($scope.markets[market].event[event].ePossibleProfit,"##############")
                                    }

                                    $scope.markets[market].mPossibleProfit -= Number((Number(bets[bet].unstableAmount)).toFixed(2));

                                } else if (bets[bet].type == 1) {
                                    if ($scope.markets[market].event[event].ePossibleProfit) {
                                        $scope.markets[market].event[event].ePossibleProfit = Number((Number(bets[bet].unstableAmount * (bets[bet].unstablePrice * -1) + $scope.markets[market].event[event].ePossibleProfit)).toFixed(2));
                                    } else {
                                        $scope.markets[market].event[event].ePossibleProfit = Number((Number(bets[bet].unstableAmount * bets[bet].unstablePrice * -1)).toFixed(2));
                                    }

                                    $scope.markets[market].mPossibleProfit += Number((Number(bets[bet].unstableAmount)).toFixed(2));
                                }

                            }

                        }
                    }
                }
            }

        }


        for (var market in $scope.markets) {


            if($scope.markets[market].mPossibleProfit ||  $scope.markets[market].mPossibleProfit == 0){

                for (var event in $scope.markets[market].event) {



                    if ($scope.markets[market].event[event].ePossibleProfit) {

                        $scope.markets[market].event[event].ePossibleProfit = Number(Number($scope.markets[market].event[event].ePossibleProfit + $scope.markets[market].mPossibleProfit).toFixed(2));
                    }else{
                        $scope.markets[market].event[event].ePossibleProfit = Number(Number($scope.markets[market].mPossibleProfit).toFixed(2));
                    }






                    if($scope.markets[market].event[event].eStableProfit){
                        $scope.markets[market].event[event].ePossibleProfit = (Number($scope.markets[market].event[event].ePossibleProfit) + Number($scope.markets[market].event[event].eStableProfit /19*20)).toFixed(2);
                    }
                    if ($scope.markets[market].event[event].ePossibleProfit >= 0) {
                        $scope.markets[market].event[event].ePossibleProfit = Number(Number($scope.markets[market].event[event].ePossibleProfit * 0.95).toFixed(2));

                    }
                    //$scope.markets[market].event[event].ePossibleProfit = (Number($scope.markets[market].event[event].ePossibleProfit * $scope.defaultCurrencyCoinRate)).toFixed(2)

                }
                //console.log($scope.markets[market].mPossibleProfit,"$scope.markets[market].mPossibleProfit gameMaxPossibleLiability");

            }



        }
        //console.log("****")


    };
    $scope.betsFromBetslip = {};




    $scope.$on('RemovePossibleBetBroadcastToMarket', function (events, arg) {

        //console.log(arg,"#7b8191");
        //console.log($scope.bets,"#7b8191");

        if(arg.marketId){

            if($scope.markets[arg.marketId]){ $scope.markets[arg.marketId].commission = "" }
            var betIndex = _.findIndex($scope.bets, {type: arg.type, event_id: arg.event_id});

            //console.log(betIndex,"betIndex");
            if ( betIndex || betIndex == 0) {
                $scope.bets.splice(betIndex,1);
                //$scope.bets.shift(arg);
            }

            getEventPossibleProfit($scope.bets,true);

        }else if(arg == true){
            $scope.bets = [];
            getEventPossibleProfit($scope.bets,true);
        }


        //console.log($scope.bets,"#7b8191");
    });
    $scope.$on('NewBetBroadcastToMarket', function (events, bet) {


        // console.log();
        var betIndex = _.findIndex($scope.bets, {type: bet.type, event_id: bet.event_id});

        if (-1 !==betIndex) {
            $scope.bets[betIndex] = bet;
        } else {
            $scope.bets.push(bet);
        }

        getEventPossibleProfit($scope.bets,true);

    });


    $scope.$on('BetBroadcastToMarket', function (events, bets, isUpdate) {


        //console.log(bets,"bets");
        //if($scope.optionIsReady.coinRate){

        $scope.betsFromBetslip.bets = bets;
        $scope.betsFromBetslip.isUpdate = isUpdate;
        getEventProfit($scope.betsFromBetslip.bets, $scope.betsFromBetslip.isUpdate);

        //}

    });
    $scope.$watch('optionIsReady', function( newValue, oldValue ){



        if(newValue.coinRate && newValue.currencyShortName &&  newValue.gameId && newValue.sportId ) {
            game($scope.gameId, $scope.sportId);
            console.log($scope.betsFromBetslip.bets,$scope.betsFromBetslip.isUpdate,"$scope.betsFromBetslip.isUpdate");

            //

        }

        //console.log(newValue,"newValuenewValuenewValuenewValue")


    }, true);

    $scope.$on('RouteChange', function (events, args) {

        if (!args.gameId) {

            // $scope.homePage();
            $rootScope.pageType = 0;
        } else {
            $rootScope.pageType = 1;
        }

        if (args.gameId) {

            $scope.gameId = parseInt(args.gameId);
            $scope.sportId = parseInt(args.sportId);
            $scope.optionIsReady.gameId = $scope.gameId;
            $scope.optionIsReady.sportId = $scope.sportId;
        }
        if (args.type) {
            $scope.gameType = parseInt(args.type)
        }


    });


    var game = function (id, sportId) {


        var request = {
            "source": "betting",
            "what": {
                "game": [
                    []
                ],
                "event": [
                    "id",
                    "price",
                    "type",
                    "name"
                ],
                "market": []
            },
            "where": {
                "game": {
                    "is_fair": 1,
                    "id": id
                },
                "market": {
                    "is_fair": 1
                }
            },
            "subscribe": true
        };

        var requestSport = {
            "source": "betting",
            "what": {
                "sport": ["alias"],
                "region": [
                    "id",
                    "name"
                ],
                "competition": [
                    "id",
                    "name",
                    "order"
                ]
            },
            "where": {
                "sport": {
                    "id": sportId
                },
                "game": {
                    "id": id
                }
            },
            "subscribe": true
        };


        Zergling.get(requestSport)
            .then(function (result) {
                if (result) {

                    //console.log(result.data.sport[sportId].region,"cbsfgb region legue");
                    var regionId = Object.keys(result.data.sport[sportId].region)[0];
                    $scope.regionName = result.data.sport[sportId].region[regionId].name;
                    var competitionId = Object.keys(result.data.sport[sportId].region[regionId].competition)[0];
                    $scope.competitionName = result.data.sport[sportId].region[regionId].competition[competitionId].name;
                    $scope.sportAlias = result.data.sport[sportId].alias.toLowerCase();

                }
            })['catch'](function (reason) {
            console.log('Error:', reason);
        });


        Zergling.get(request)
            .then(function (result) {
                if (result) {

                    //console.log(result, "market_market_market_market_market_market_market_market_market_market_market_market_market_market_market_market_market_");
                    $scope.game = result.data.game[id];
                    console.log($scope.game,"$scope.game");
                    var nana = {
                        "sport":{
                            "alias":$scope.sportAlias,
                            "id":$scope.sportId
                        }
                    };
                    $scope.openGame = _.merge($scope.game, nana);
                    $scope.openGame.competition = {"name" : $scope.competitionName};
                    $scope.openGame.setsOffset = $scope.openGame.setsOffset || 0;
                    if ($scope.openGame.type === 1) {
                            GameInfo.updateGameStatistics($scope.openGame);
                            GameInfo.extendLiveGame($scope.openGame);
                            $scope.dotaGamesList = GameInfo.dotaGamesList;
                            if($scope.openGame.sport.alias === "Soccer" || $scope.openGame.sport.alias === "CyberFootball") {
                                GameInfo.generateTimeLineEvents($scope.openGame, $scope);

                                // if ($scope.openGame.live_events) { //need this for sorting
                                //     $scope.openGame.live_events.map(function (event) {
                                //         event.add_info_order = parseInt(event.add_info, 10);
                                //     });
                                // }

                               // if ($scope.openGame.last_event && $scope.openGame.last_event.type === "Goal") {
                                //    generateAutostopAnimationEvent($scope.openGame);
                               // }
                            }
                        }
                    $rootScope.$broadcast("submitOpenGame", $scope.openGame)

                    // $scope.openGame {
                    //     "sport":{"alias":$scope.sportAlias}
                    // }
                    console.log($scope.openGame ,"sportAliassportAliassportAliassportAliassportAlias");
                    //_.sortBy(result.data.game[id].market, 'order');
                    $scope.gameMarket(result.data.game[id]);

                }
            })['catch'](function (reason) {
            console.log('Error:', reason);
        });
    };


    $scope.addBets = function (type) {


        if (type == "down") {
            //console.log( this.market.id,"EventBroadcastToBetSlip",type);

            for (var eventId in this.market.event) {
                $rootScope.$broadcast('EventBroadcastToBetSlip',  this.market.event[eventId].fairEvent.down[2], $scope.game, this.market.event[eventId].name, this.market.event[eventId].base,this.market.id ,type);
            }
        } else if (type == "up") {
            //console.log( this.market.id,"EventBroadcastToBetSlip",type);

            for (var eventId in this.market.event) {
                $rootScope.$broadcast('EventBroadcastToBetSlip',  this.market.event[eventId].fairEvent.up[0], $scope.game, this.market.event[eventId].name, this.market.event[eventId].base,this.market.id,type);
            }
        } else {
            //console.log( this.$parent.$parent.market.id,"EventBroadcastToBetSlip",type);
            $rootScope.$broadcast('EventBroadcastToBetSlip', this.fairEvent, $scope.game, this.$parent.event.name, this.$parent.event.base, this.$parent.$parent.market.id);
        }
    };

    $scope.isActive = function (obj) {

        if (obj.game_number) {
            if (obj.isActive) {
                obj.isActive = "";
            } else {
                obj.isActive = "active";
            }
        } else {

            if (obj.isActive == "closed") {
                obj.isActive = "";
            } else {
                obj.isActive = "closed";
            }

        }


    };
    function PercentCalculator(dPrices, uPrices) {

        for (var dPrice in dPrices) {


            if (typeof dPrices[dPrice] == "object") {
                for (var i = 0, dcount = 0; i < dPrices[dPrice].length; i++) {
                    dcount += 1 / dPrices[dPrice][i];
                }
                if (!$scope.markets[dPrice].downPercent) $scope.markets[dPrice].downPercent = (dcount * 100).toFixed(2);

            }

        }

        for (var uPrice in uPrices) {
            if (typeof uPrices[uPrice] == "object") {
                for (var j = 0, ucount = 0; j < uPrices[uPrice].length; j++) {
                    ucount += 1 / uPrices[uPrice][j];
                }

                if (!$scope.markets[uPrice].upPercent) $scope.markets[uPrice].upPercent = (ucount * 100).toFixed(2);

            }


        }
        //console.log($scope,"markets")
    }

    $scope.gameMarket = function (game) {

        $scope.markets = game.market;
        $scope.events = [];
        var marketId = [];
        var eventsId = [];
        var fairEvents = [];
        var topDownPrice = [];
        var topUpPrice = [];

        var defaultCurrencyRound;
        if($scope.optionIsReady.defaultCurrencyRound  <= 0 ){
            defaultCurrencyRound = Math.abs($scope.optionIsReady.defaultCurrencyRound )
        }else{
            defaultCurrencyRound = $scope.optionIsReady.defaultCurrencyRound
        }
        if (game.isActive !== "active") {

            $scope.markets = _.sortBy($scope.markets, 'order');

            _.mapKeys(game.market, function (valueM, key) {

                if (!valueM.isActive && $scope.markets[0].id != valueM.id) {

                    valueM.isActive = "closed"
                }

                marketId.push(valueM.id);
            });


            _(marketId).forEach(function (mId) {
                _.mapKeys(game.market[mId].event, function (valueE, key) {
                    eventsId.push(valueE.id);
                });
            }).value();


            var request = {
                "source": "fair_events",
                "what": {
                    "fairEvent": []
                },
                "where": {
                    "fairEvent": {
                        "event_id": {"@in": eventsId}
                    }
                }
            };

            var parseFairEvents = function (isUpdate) {

                var cEvent;


                for (var marketId in $scope.markets) {
                    var itaration = 1;
                    if (isUpdate) {
                        if (topDownPrice[marketId]) {
                            topDownPrice[marketId] = undefined;
                        }

                        if (topUpPrice[marketId]) {
                            topUpPrice[marketId] = undefined;
                        }
                        //console.log($scope.markets[marketId], "$scope.markets[marketId]");

                        $scope.markets[marketId].downPercent = undefined;
                        $scope.markets[marketId].upPercent = undefined;
                        //console.log($scope.markets[marketId], "$scope.markets[marketId]");
                    }


                    for (var eventId in $scope.markets[marketId].event) {

                        cEvent = $scope.markets[marketId].event[eventId];
                        //if (cEvent.base) {
                        //    cEvent.base = $scope.markets[marketId].base
                        //} else {
                        //    if ($scope.markets[marketId].type == "Handicap") {
                        //        cEvent.base = 0
                        //    } else {
                        //       cEvent.base = ""
                        //    }
                        //
                        //}

                        if ((itaration % 2 == 1) && ($scope.markets[marketId].type == "Handicap") && $scope.markets[marketId].base) {
                            if (!cEvent.base) {
                                cEvent.base = Number($scope.markets[marketId].base * 1)
                            }
                        } else if ((itaration % 2 == 0) && ($scope.markets[marketId].type == "Handicap") && $scope.markets[marketId].base) {
                            if (!cEvent.base) {
                                cEvent.base = Number($scope.markets[marketId].base * -1)
                            }
                        } else if ($scope.markets[marketId].type == "Handicap") {
                            if (!cEvent.base) {
                                cEvent.base = 0
                            }
                        } else if ($scope.markets[marketId].base) {
                            cEvent.base = Number($scope.markets[marketId].base)
                        } else {
                            cEvent.base = "";
                        }
                        //console.log(cEvent,"cEvent cEvent cEvent cEvent cEvent",itaration);


                        if (isUpdate) {
                            cEvent.fairEvent = undefined;
                        }
                        if (!cEvent.fairEvent) {
                            cEvent.fairEvent = [];
                        }
                        if (!cEvent.fairEvent.down) {
                            cEvent.fairEvent.down = [];
                        }
                        if (!cEvent.fairEvent.up) {
                            cEvent.fairEvent.up = [];
                        }

                        while (cEvent.fairEvent.down.length < 3) {
                            cEvent.fairEvent.down.unshift({price: "", type: 0, event_id: eventId});

                        }


                        for (var fairEvent in fairEvents) {
                            if (fairEvents[fairEvent].event_id == eventId && fairEvents[fairEvent].amount != 0) {

                                if(fairEvents[fairEvent].amount && $scope.defaultCurrencyCoinRate){
                                    fairEvents[fairEvent].userCurrencyAmount = (Number(fairEvents[fairEvent].amount * $scope.defaultCurrencyCoinRate)).toFixed(defaultCurrencyRound)

                                }

                                if (fairEvents[fairEvent].type == 0) {

                                    cEvent.fairEvent.down.unshift(fairEvents[fairEvent]);
                                    cEvent.fairEvent.down = _.sortBy(cEvent.fairEvent.down, 'price');
                                    cEvent.fairEvent.down = cEvent.fairEvent.down.slice(-3);

                                } else {

                                    cEvent.fairEvent.up.unshift(fairEvents[fairEvent]);
                                    cEvent.fairEvent.up = _.sortBy(cEvent.fairEvent.up, 'price');
                                    cEvent.fairEvent.up = cEvent.fairEvent.up.slice(0, 3);

                                }

                                $scope.events.push(cEvent);

                            }
                        }

                        while (cEvent.fairEvent.up.length < 3) {

                            cEvent.fairEvent.up.push({price: "", type: 1, event_id: eventId});
                        }


                        if (!topDownPrice[marketId]) {
                            topDownPrice[marketId] = [];
                        }


                        if (cEvent.fairEvent.down[2].price) {
                            topDownPrice[marketId].push(cEvent.fairEvent.down[2].price);
                        } else {
                            topDownPrice[marketId].push(1);
                        }


                        if (!topUpPrice[marketId]) {
                            topUpPrice[marketId] = [];
                        }

                        if (cEvent.fairEvent.up[0].price) {
                            topUpPrice[marketId].push(cEvent.fairEvent.up[0].price);
                        } else {

                        }

                        itaration++;
                    }


                }

                PercentCalculator(topDownPrice, topUpPrice);
            };


            Zergling.subscribe(request, function (data) {
                fairEvents = data.fairEvent;
                parseFairEvents(1);
            })
                .then(function (result) {
                    if (result) {

                        fairEvents = result.data.fairEvent;
                        parseFairEvents(0);
                        $scope.isActive(game);
                    }
                })['catch'](function (reason) {
                console.log('Error:', reason);
            });
            getEventProfit($scope.betsFromBetslip.bets, $scope.betsFromBetslip.isUpdate);
        }
    };

    //$scope.getMarketBase = function (i, market) {
    //
    //    if ((i % 2 == 1) && (market.type == "Handicap") && market.base) {
    //        return "(" + market.base * -1 + ")"
    //    } else {
    //        if (market.base) {
    //            return "(" + market.base + ") "
    //        } else {
    //            if (market.type == "Handicap") {
    //                return "(" + 0 + ")";
    //            } else {
    //                return "";
    //            }
    //
    //        }
    //
    //    }
    //
    //};

    $scope.theGame = {
        sport: {
            alias: "Soccer"
        },
        info: {
            current_game_state: "timeout",
            shirt1_color: "0033cc",
            current_game_time: "44'",
            add_info: "Possible format change",
            field: "1",
            shirt2_color: "ffffff",
            score1: "0",
            score2: "1",
            short1_color: "CCCCCC",
            short2_color: "ffffff"
        },
        live_events: [

            {
                add_info: "6`",
                event_type: "goal",
                team: "team2"
            },
            {
                add_info: "37`",
                event_type: "corner",
                team: "team1"
            },
            {
                add_info: "37`",
                event_type: "corner",
                team: "team1"
            },
            {
                add_info: "37`",
                event_type: "corner",
                team: "team1"
            },
            {
                add_info: "37`",
                event_type: "corner",
                team: "team1"
            },
            {
                add_info: "45`",
                event_type: "yellow_card",
                team: "team1"
            },
            {
                add_info: "45`",
                event_type: "corner",
                team: "team1"
            }
        ],
        last_event: {
            corner_score: "5:0",
            type_id: "10",
            event_id: "3773718",
            sequence: "2",
            value: "1",
            redcard_score: "0:0",
            current_minute: "0",
            time_utc: "2015-09-01T11:57:46.3210994",
            dangerous_attack_score: "0:0",
            score: "0:1",
            shot_off_target_score: "0:0",
            match_length: "90",
            shot_on_target_score: "0:0",
            id: "17898719",
            type: "Period",
            yellowcard_score: "0:0",
            side: "0"
        }
    };

    $scope.changeStatsMode = function changeStatsMode(mode) {
        $scope.flipMode = mode;
    };
}]);

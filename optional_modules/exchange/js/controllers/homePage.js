/**
 * Created by arman on 9/9/15.
 */

angular.module('exchange').controller('homePage', ['$rootScope', '$scope', '$location', 'Zergling', 'content', 'lodash', function ($rootScope, $scope, $location, Zergling, content, _) {
    'use strict';
    content.getPage("exchange-featured-games-"+$rootScope.env.lang, true).then(function (response) {
        console.log(response.data.page,"response.data.page");
        if(!$scope.weeklyMarkets){
            $scope.getWeeklyGame();
        }
        $scope.homePageImageUrl = response.data.page.children[0].thumbnail_images.full.url;

    });
    $scope.bets = [{}];


    $scope.$on('CurrencyCoinRateBroadcastToMarket', function (events, defaultCurrencyCoinRate , defaultCurrencyShortName ,defaultCurrencyRound ) {

        console.log(defaultCurrencyCoinRate,defaultCurrencyShortName);
        if( defaultCurrencyCoinRate ){
            $scope.defaultCurrencyCoinRate = defaultCurrencyCoinRate;
            $scope.defaultCurrencyShortName = defaultCurrencyShortName;
            $scope.defaultCurrencyRound = defaultCurrencyRound;
            //if(!$scope.weeklyMarkets){
            //    $scope.getWeeklyGame();
            //}
        }

    });
    $scope.banerStatus ="close";
    $scope.isClosed = "";


    var getEventProfit = function (bets, isUpdate) {
        //console.log("getEventProfit");
        var defaultCurrencyRound;
        if($scope.defaultCurrencyRound <= 0 ){
            defaultCurrencyRound = Math.abs($scope.defaultCurrencyRound)
        }else{
            defaultCurrencyRound = $scope.defaultCurrencyRound
        }
        for (var market in $scope.weeklyMarkets) {

            if (isUpdate && $scope.weeklyMarkets[market].mStableProfit) {
                delete $scope.weeklyMarkets[market].mStableProfit;
            }

            for (var event in $scope.weeklyMarkets[market].event) {
                if (isUpdate) {
                    delete $scope.weeklyMarkets[market].event[event].eStableProfit;
                }
                for (var bet in bets) {
                    //console.log("getEventProfit2");

                    if ($scope.weeklyGameId == bets[bet].gameId) {
                        if (bets[bet].marketId == $scope.weeklyMarkets[market].id) {

                            if (!$scope.weeklyMarkets[market].mStableProfit) {
                                $scope.weeklyMarkets[market].mStableProfit = 0
                            }

                            if (bets[bet].event_id == $scope.weeklyMarkets[market].event[event].id) {
                                //if(bets[bet].amount && $scope.defaultCurrencyCoinRate){
                                //    bets[bet].amount = (Number(bets[bet].amount * $scope.defaultCurrencyCoinRate)).toFixed(defaultCurrencyRound)
                                //}
                                //console.log("getEventProfit3");

                                if (bets[bet].type == 1) {

                                    if ($scope.weeklyMarkets[market].event[event].eStableProfit) {
                                        $scope.weeklyMarkets[market].event[event].eStableProfit = Number((bets[bet].price  * bets[bet].amount + $scope.weeklyMarkets[market].event[event].eStableProfit).toFixed(2));
                                    } else {
                                        $scope.weeklyMarkets[market].event[event].eStableProfit = Number((bets[bet].price  * bets[bet].amount).toFixed(2));
                                    }

                                    $scope.weeklyMarkets[market].mStableProfit -= Number((bets[bet].amount).toFixed(2));

                                } else if (bets[bet].type == 0) {
                                    if ($scope.weeklyMarkets[market].event[event].eStableProfit) {
                                        $scope.weeklyMarkets[market].event[event].eStableProfit = Number((bets[bet].amount * bets[bet].price * -1 + $scope.weeklyMarkets[market].event[event].eStableProfit).toFixed(2));
                                    } else {
                                        $scope.weeklyMarkets[market].event[event].eStableProfit = Number((bets[bet].amount * bets[bet].price * -1).toFixed(2));
                                    }

                                    $scope.weeklyMarkets[market].mStableProfit += Number((bets[bet].amount).toFixed(2));
                                }

                            }

                        }
                    }
                }
            }

        }

        for (var market in $scope.weeklyMarkets) {
            if($scope.weeklyMarkets[market].mStableProfit ||  $scope.weeklyMarkets[market].mStableProfit == 0){
                for (var event in $scope.weeklyMarkets[market].event) {

                    if ($scope.weeklyMarkets[market].event[event].eStableProfit) {

                        $scope.weeklyMarkets[market].event[event].eStableProfit = Number($scope.weeklyMarkets[market].event[event].eStableProfit + $scope.weeklyMarkets[market].mStableProfit).toFixed(2);
                    }else{
                        $scope.weeklyMarkets[market].event[event].eStableProfit = Number($scope.weeklyMarkets[market].mStableProfit).toFixed(2);
                    }

                    if ($scope.weeklyMarkets[market].event[event].eStableProfit >= 0) {
                        $scope.weeklyMarkets[market].event[event].eStableProfit = Number(($scope.weeklyMarkets[market].event[event].eStableProfit * 95) / 100).toFixed(2);
                    }
                    $scope.weeklyMarkets[market].event[event].eStableProfit = (Number($scope.weeklyMarkets[market].event[event].eStableProfit * $scope.defaultCurrencyCoinRate)).toFixed(2)
                    console.log($scope.weeklyMarkets[market].event[event].eStableProfit,"$scope.weeklyMarkets[market].event[event].eStableProfit")
                }
            }

        }

    };


    var getEventPossibleProfit = function (bets, isUpdate) {
        console.log("getEventProfit1,bets1",bets);

        for (var market in $scope.weeklyMarkets) {

            if (isUpdate && $scope.weeklyMarkets[market].mPossibleProfit) {
                delete $scope.weeklyMarkets[market].mPossibleProfit;
            }

            for (var event in $scope.weeklyMarkets[market].event) {
                if (isUpdate) {
                    delete $scope.weeklyMarkets[market].event[event].ePossibleProfit;
                }
                for (var bet in bets) {
                    console.log("getEventProfit1,bets1",1);


                    if ( bets[bet].gameId && $scope.weeklyGameId == bets[bet].gameId) {
                        if (bets[bet].marketId == $scope.weeklyMarkets[market].id) {

                            if (!$scope.weeklyMarkets[market].mPossibleProfit) {
                                $scope.weeklyMarkets[market].mPossibleProfit = 0;
                            }
                            console.log("getEventProfit1,bets1",2);

                            if (bets[bet].event_id == $scope.weeklyMarkets[market].event[event].id) {
                                // console.log(typeof bets[bet].unstablePrice,"bets[bet].unstablePrice");
                                // console.log(typeof  bets[bet].unstableAmount," bets[bet].unstableAmount");
                                $scope.weeklyMarkets[market].commission = "Commission on this market";
                                $scope.weeklyMarkets[market].commissionRate = " 5% ";
                                //$scope.marketCommissionRate = "";


                                // console.log(typeof $scope.markets[market].event[event].ePossibleProfit,"$scope.markets[market].event[event].ePossibleProfit");
                                // console.log(typeof $scope.markets[market].mPossibleProfit ,"$scope.markets[market].mPossibleProfit ");
                                console.log("getEventProfit1,bets1",3);

                                if (bets[bet].type == 0) {


                                    if ($scope.weeklyMarkets[market].event[event].ePossibleProfit) {
                                        $scope.weeklyMarkets[market].event[event].ePossibleProfit = Number((Number(bets[bet].unstablePrice  * bets[bet].unstableAmount + $scope.weeklyMarkets[market].event[event].ePossibleProfit)).toFixed(2));
                                    } else {
                                        $scope.weeklyMarkets[market].event[event].ePossibleProfit = Number((Number(bets[bet].unstablePrice  * bets[bet].unstableAmount)).toFixed(2));
                                    }

                                    $scope.weeklyMarkets[market].mPossibleProfit -= Number((Number(bets[bet].unstableAmount)).toFixed(2));

                                } else if (bets[bet].type == 1) {
                                    if ($scope.weeklyMarkets[market].event[event].ePossibleProfit) {
                                        $scope.weeklyMarkets[market].event[event].ePossibleProfit = Number((Number(bets[bet].unstableAmount * (bets[bet].unstablePrice * -1) + $scope.weeklyMarkets[market].event[event].ePossibleProfit)).toFixed(2));
                                    } else {
                                        $scope.weeklyMarkets[market].event[event].ePossibleProfit = Number((Number(bets[bet].unstableAmount * bets[bet].unstablePrice * -1)).toFixed(2));
                                    }

                                    $scope.weeklyMarkets[market].mPossibleProfit += Number((Number(bets[bet].unstableAmount)).toFixed(2));
                                }

                            }

                        }
                    }
                }
            }

        }


        for (var market in $scope.weeklyMarkets) {


            if($scope.weeklyMarkets[market].mPossibleProfit ||  $scope.weeklyMarkets[market].mPossibleProfit == 0){

                for (var event in $scope.weeklyMarkets[market].event) {

                    if ($scope.weeklyMarkets[market].event[event].ePossibleProfit) {

                        $scope.weeklyMarkets[market].event[event].ePossibleProfit = Number(Number($scope.weeklyMarkets[market].event[event].ePossibleProfit + $scope.weeklyMarkets[market].mPossibleProfit).toFixed(2));
                    }else{
                        $scope.weeklyMarkets[market].event[event].ePossibleProfit = Number(Number($scope.weeklyMarkets[market].mPossibleProfit).toFixed(2));
                    }

                    if ($scope.weeklyMarkets[market].event[event].ePossibleProfit >= 0) {
                        $scope.weeklyMarkets[market].event[event].ePossibleProfit = Number(Number(($scope.weeklyMarkets[market].event[event].ePossibleProfit * 95) / 100).toFixed(2));

                    }

                    if($scope.weeklyMarkets[market].event[event].eStableProfit){
                        $scope.weeklyMarkets[market].event[event].ePossibleProfit = (Number($scope.weeklyMarkets[market].event[event].ePossibleProfit) + Number($scope.weeklyMarkets[market].event[event].eStableProfit)).toFixed(2);
                    }

                    //$scope.markets[market].event[event].ePossibleProfit = (Number($scope.markets[market].event[event].ePossibleProfit * $scope.defaultCurrencyCoinRate)).toFixed(2)

                }
                //console.log($scope.markets[market].mPossibleProfit,"$scope.markets[market].mPossibleProfit gameMaxPossibleLiability");

            }
        }

    };
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
    $scope.$on('RemovePossibleBetBroadcastToMarket', function (events, arg) {

        console.log(arg,"#7b8191");
        //console.log($scope.bets,"#7b8191");

        if(arg.marketId){

            if($scope.weeklyMarkets[arg.marketId]){ $scope.weeklyMarkets[arg.marketId].commission = "" }
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

    $scope.addBets = function (type) {


        if (type == "down") {
            //console.log( this.market.id,"EventBroadcastToBetSlip",type);

            for (var eventId in this.market.event) {
                $rootScope.$broadcast('EventBroadcastToBetSlip',  this.market.event[eventId].fairEvent.down[2], $scope.weeklyGameData, this.market.event[eventId].name, this.market.event[eventId].base,this.market.id);
            }
        } else if (type == "up") {
            //console.log( this.market.id,"EventBroadcastToBetSlip",type);

            for (var eventId in this.market.event) {
                $rootScope.$broadcast('EventBroadcastToBetSlip',  this.market.event[eventId].fairEvent.up[0], $scope.weeklyGameData, this.market.event[eventId].name, this.market.event[eventId].base,this.market.id);
            }
        } else {
            //console.log( this.$parent.$parent.market.id,"EventBroadcastToBetSlip",type);
            $rootScope.$broadcast('EventBroadcastToBetSlip', this.fairEvent, $scope.weeklyGameData, this.$parent.event.name, this.$parent.event.base, this.$parent.$parent.market.id);
        }
    };
    $scope.widgetToggle =function(){
        //console.log("dsghdfg");
        if($scope.isClosed == ""){
            $scope.isClosed = "closed";
            $scope.banerStatus ="open";
        }else if($scope.isClosed == "closed"){
            $scope.isClosed = "";
            $scope.banerStatus ="close ";
        }
    };
    $scope.getWeeklyGame = function(){

        var eventsId = [];
        var request = {
            "source": "betting",
            "what": {
                "sport":["id", "name", "alias"],
                "region":[],
                "competition":[ "id", "name"],
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
                    "top_game_fair": 2
                },
                "market": {
                    "is_fair": 1,
                    "is_fair_blocked":0
                }
            },
            "subscribe": true
        };

        Zergling.get(request)
            .then(function (result) {
                if (result) {
                    console.log(result,"result result");
                    $scope.weeklyGameSportId = Object.keys(result.data.sport)[0];

                    if(result.data.sport[$scope.weeklyGameSportId]){
                        $scope.weeklyGameSportName = result.data.sport[$scope.weeklyGameSportId].name;
                        $scope.weeklyGameRegionId = Object.keys(result.data.sport[$scope.weeklyGameSportId].region)[0];
                        $scope.weeklyGameRegionName = result.data.sport[$scope.weeklyGameSportId].region[$scope.weeklyGameRegionId].name;
                        $scope.weeklyGameCompetitionId = Object.keys(result.data.sport[$scope.weeklyGameSportId].region[$scope.weeklyGameRegionId].competition)[0];
                        $scope.weeklyGameCompetitionName = result.data.sport[$scope.weeklyGameSportId].region[$scope.weeklyGameRegionId].competition[$scope.weeklyGameCompetitionId].name;
                        $scope.weeklyGameId = Object.keys(result.data.sport[$scope.weeklyGameSportId].region[$scope.weeklyGameRegionId].competition[$scope.weeklyGameCompetitionId].game)[0];

                        $scope.weeklyGameData = result.data.sport[$scope.weeklyGameSportId].region[$scope.weeklyGameRegionId].competition[$scope.weeklyGameCompetitionId].game[$scope.weeklyGameId];

                        for(var marketId in $scope.weeklyGameData.market){
                            for(var eventId in $scope.weeklyGameData.market[marketId].event){
                                eventsId.push($scope.weeklyGameData.market[marketId].event[eventId].id)
                            }
                        }

                        $scope.WeeklyGameFairEvents(eventsId);

                    }

                }
            })['catch'](function (reason) {
            console.log('Error:', reason);
        });
    };

    $scope.WeeklyGameFairEvents =function(ids ){

        var fairEvents = [];
        var topDownPrice = [];
        var topUpPrice = [];
        $scope.weeklyMarkets =  $scope.weeklyGameData.market;
        $scope.weeklyEvents = [];
        var request = {
            "source": "fair_events",
            "what": {
                "fairEvent": []
            },
            "where": {
                "fairEvent": {
                    "event_id": {"@in": ids}
                }
            }
        };


        function PercentCalculator(dPrices, uPrices) {

            for (var dPrice in dPrices) {


                if(typeof dPrices[dPrice] == "object"){
                    for (var i = 0, dcount = 0; i < dPrices[dPrice].length; i++) {
                        dcount += 1 / dPrices[dPrice][i];
                    }
                    if (!$scope.weeklyMarkets[dPrice].downPercent) $scope.weeklyMarkets[dPrice].downPercent = (dcount * 100).toFixed(2);

                }

            }

            for (var uPrice in uPrices) {
                if(typeof uPrices[uPrice] == "object"){
                    for (var j = 0, ucount = 0; j < uPrices[uPrice].length; j++) {
                        ucount += 1 / uPrices[uPrice][j];
                    }

                    if (!$scope.weeklyMarkets[uPrice].upPercent) $scope.weeklyMarkets[uPrice].upPercent = (ucount * 100).toFixed(2);

                }


            }
            //console.log($scope,"markets")
        }



        var parseFairEvents = function (isUpdate) {

            var cEvent;
            var defaultCurrencyRound;
            if($scope.defaultCurrencyRound <= 0 ){
                defaultCurrencyRound = Math.abs($scope.defaultCurrencyRound)
            }else{
                defaultCurrencyRound = $scope.defaultCurrencyRound
            }

            for (var marketId in $scope.weeklyMarkets) {
                var itaration = 1;
                if (isUpdate) {
                    if (topDownPrice[marketId]) {
                        topDownPrice[marketId] = undefined ;
                    }

                    if (topUpPrice[marketId]) {
                         topUpPrice[marketId] = undefined ;
                    }
                    //console.log($scope.markets[marketId], "$scope.markets[marketId]");

                     $scope.weeklyMarkets[marketId].downPercent = undefined ;
                    $scope.weeklyMarkets[marketId].upPercent = undefined ;
                    //console.log($scope.markets[marketId], "$scope.markets[marketId]");
                }

                for (var eventId in $scope.weeklyMarkets[marketId].event) {

                    cEvent = $scope.weeklyMarkets[marketId].event[eventId];

                    if ((itaration % 2 == 1) && ($scope.weeklyMarkets[marketId].type == "Handicap") && $scope.weeklyMarkets[marketId].base) {
                        if (!cEvent.base) {
                            cEvent.base = Number($scope.weeklyMarkets[marketId].base * 1)
                        }
                    } else if ((itaration % 2 == 0) && ($scope.weeklyMarkets[marketId].type == "Handicap") && $scope.weeklyMarkets[marketId].base) {
                        if (!cEvent.base) {
                            cEvent.base = Number($scope.weeklyMarkets[marketId].base * -1)
                        }
                    } else if ($scope.weeklyMarkets[marketId].type == "Handicap") {
                        if (!cEvent.base) {
                            cEvent.base = 0
                        }
                    } else if ($scope.weeklyMarkets[marketId].base) {
                        cEvent.base = Number($scope.weeklyMarkets[marketId].base)
                    } else {
                        cEvent.base = "";
                    }

                    if (isUpdate) {
                        cEvent.fairEvent = undefined ;
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

                            $scope.weeklyEvents.push(cEvent);

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
                    }

                    itaration++;
                }


            }


           // console.log(topDownPrice,'rwtgerrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrt')
            PercentCalculator(topDownPrice, topUpPrice);
            //console.log($scope,'rwtgerrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrt');
        };



        Zergling.subscribe(request, function (data) {
            if (data) {
                fairEvents = data.fairEvent;
                parseFairEvents(1);
            }
        })
            .then(function (result) {
                if (result) {
                    fairEvents = result.data.fairEvent;
                    parseFairEvents(0);
                }
            })['catch'](function (reason) {
            console.log('Error:', reason);
        });




        //Zergling.subscribe(request, function (data) {
        //    //console.log(data,"$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$dataupdate");
        //    fairEvents = data.fairEvent;
        //    parseFairEvents(1);
        //})
        //    .then(function (result) {
        //        if (result) {
        //            //console.log($scope,"$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$updateaddFairEvent");
        //
        //            //console.log(result,"$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$");
        //            fairEvents = result.data.fairEvent;
        //            parseFairEvents(0);
        //            $scope.isActive(game);
        //        }
        //    })['catch'](function (reason) {
        //    console.log('Error:', reason);
        //});

    };
    $scope.betsFromBetslip = {};

    $scope.$on('BetBroadcastToMarket', function (events, bets, isUpdate) {


        if(bets.length > 0){
            console.log(bets,"bets");

        $scope.betsFromBetslip.bets = bets;
        $scope.betsFromBetslip.isUpdate = isUpdate;
            getEventProfit($scope.betsFromBetslip.bets, $scope.betsFromBetslip.isUpdate);

        }

    });
    $scope.gameMarkets = function (id) {

        var request = {
            "source": "betting",
            "what": {
                "sport": ["id", "name", "alias", "order", "active"],
                "region": ["id"],
                "competition": ["id"]
            },
            "where": {
                "game": {
                    "id": id
                }
            }
        };
        Zergling.get(request)
            .then(function (result) {
                if (result) {
                    var sportId = $scope.sportId = Object.keys(result.data.sport)[0];
                    var regionId = $scope.regionId = Object.keys(result.data.sport[sportId].region)[0];
                    $scope.competitionId = Object.keys(result.data.sport[sportId].region[regionId].competition)[0];
                    var path = "exchange/0/" + $scope.sportId + "/" + $scope.regionId + "/" + $scope.competitionId + "/" + id + "/";
                    $location.path(path);
                }
            })['catch'](function (reason) {
            console.log('Error:', reason);
        });

    };
    $scope.marketsCount = function (id) {

        //   return _.size(obj);
        //   var request = {
        //       "source": "betting",
        //       "what": {
        //           "game": [
        //               []
        //           ],
        //           "event": [
        //               "id",
        //               "price",
        //               "type",
        //               "name"
        //           ],
        //           "market": []
        //       },
        //       "where": {
        //           "game": {
        //               "id": id,
        //               "is_fair": 1,
        //               "top_game_fair":1
        //           },
        //           "market": {
        //               "is_fair": 1
        //           }
        //       },
        //
        //       "subscribe": true
        //   };
        //   Zergling.get(request)
        //       .then(function (result) {
        //           if (result) {
        //               console.log(result,"topGametopGametopGametopGametopGametopGametopGametopGametopGametopGametopGametopGametopGametopGame");
        //
        //               return result.data.game.id;
        //           }
        //       })['catch'](function (reason) {
        //       console.log('Error:', reason);
        //   });

    };
    $scope.mostPopular = function () {
        //console.log(id);
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
                    "top_game_fair": 1
                },
                "market": {
                    "is_fair": 1,
                    "type": {'@in': ['P1XP2', 'P1P2']}
                }
            },
            "subscribe": true
        };

        Zergling.get(request)
            .then(function (result) {
                if (result) {
                    console.log(result , "top_game_fair");
                    if (!$scope.mostPopulargames) {
                        $scope.mostPopulargames = []
                    }
                    $scope.mostPopulargames = result.data.game;
                    $scope.mostPopularEvents($scope.mostPopulargames);
                    //console.log(result.data.game,"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa");
                    //    $scope.gameMarket(result.data.game);
                    //   $scope.game = result.data.game[id];
                    //            console.log(result, id, "dfg");
                    //  $scope.gameMarket(result.data.game[id]);

                }
            })['catch'](function (reason) {
            console.log('Error:', reason);
        });
    };

    $scope.mostPopularEvents = function (games) {

        var eventIds = [];
        for (var game in games) {
            for (var marketId in games[game].market) {
                for (var eventId in games[game].market[marketId].event) {

                    eventIds.push(games[game].market[marketId].event[eventId].id);
                }
            }
        }

        var parseMostPopularFairEvents = function (games, fairEvents) {


            var cEvent;
            var topDownPrice = [];
            var topUpPrice = [];

            if (!$scope.events) {
                $scope.events = [];
            }

            for (var game in games) {

                for (var marketId in $scope.mostPopulargames[game].market) {

                    //if( $scope.mostPopulargames[game].market[marketId].type == "P1P2" || $scope.mostPopulargames[game].market[marketId].type == "P1XP2"){
                    //
                    //
                    //}else{
                    //    //console.log($scope.mostPopulargames[game].market[marketId] ,"$scope.mostPopulargames[game].market[marketId]");
                    //    $scope.mostPopulargames[game].market.marketId = {};
                    //    //_.remove($scope.mostPopulargames[game].market[marketId], function(currentObject) {
                    //    //    return currentObject.id === marketId;
                    //    //});
                    //
                    //    //_.remove($scope.mostPopulargames[game].market[marketId], {
                    //    //    $scope.mostPopulargames[game].market[marketId].id : []
                    //    //});
                    //    console.log($scope.mostPopulargames[game] ,"$scope.mostPopulargames[game].market[marketId]");
                    //}


                    for (var eventId in $scope.mostPopulargames[game].market[marketId].event) {

                        cEvent = $scope.mostPopulargames[game].market[marketId].event[eventId];

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

                            console.log(topDownPrice[marketId],"#####");
                        } else {
                            topDownPrice[marketId].push(1);
                        }
                        if (!topUpPrice[marketId]) {
                            topUpPrice[marketId] = [];
                        }
                        if (cEvent.fairEvent.up[0].price) {
                            topUpPrice[marketId].push(cEvent.fairEvent.up[0].price);
                            console.log(topUpPrice[marketId],"&&&&&&");

                        }


                    }


                }

            }

            console.log($scope.mostPopulargames,"*********######**********")
        };

        var request = {
            "source": "fair_events",
            "what": {
                "fairEvent": []
            },
            "where": {
                "fairEvent": {
                    "event_id": {"@in": eventIds}
                }
            }
        };

        Zergling.get(request)
            .then(function (result) {
                if (result) {
                    parseMostPopularFairEvents(games, result.data.fairEvent);

                }
            })['catch'](function (reason) {
            console.log('Error:', reason);
        });

    };
    //testbeting
    //Test7777777
    $scope.mostPopular();
}]);

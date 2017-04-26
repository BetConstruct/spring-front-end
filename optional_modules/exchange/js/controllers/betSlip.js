/**
 * Created by arman on 8/18/15.
 */
angular.module('exchange').controller('betSlip', ['$rootScope', '$scope', '$route', '$timeout', '$location', 'Zergling', 'AuthData', 'lodash', function ($rootScope, $scope, $route, $timeout, $location, Zergling, AuthData, _) {
    'use strict';
    $scope.betSlipId = 0;
    $scope.betIsActive = "";
    $scope.cancelAllIsActive = true;
    $scope.placeBetIsActive = true;
    $scope.userIsLogin = false;
    //console.log($scope.games);

    //var lastRoute = $route.current;
    //$scope.$on('$locationChangeSuccess', function(event) {
    //    $route.current = lastRoute;
    //});
    $scope.$watch('userIsLogin', function( newValue, oldValue ){


        $rootScope.$watchCollection(
            "partnerConfig",
            function (newPartnerConfig, oldPartnerConfig) {
                if (newPartnerConfig.max_win) {

                    if(newValue){
                        $scope.minBid = $rootScope.partnerConfig.min_bid;
                        $scope.maxBid = $rootScope.partnerConfig.max_bid;
                        $scope.maxWin = $rootScope.partnerConfig.max_win;
                        getUserCurrency();

                        console.log(newPartnerConfig.max_win,"$locationChangeSuccess true");
                    }else{
                        getPartnerCurrency();
                        console.log("$locationChangeSuccess false");
                    }

                }
                //console.log("__________________________________________________________+++",newValue, oldValue);
            }
        );

    }, true);

    var getUserCurrency = function(){

        var userCurrencyName;
        var request = {"source":"user","what":{"profile":[]},"subscribe":true};

        Zergling.get(request)
            .then(function (result) {
                if (result) {
                    
                    for (var userId in result.data.profile){
                        userCurrencyName = result.data.profile[userId].currency_name;
                    }

                    getCurrencyRate(userCurrencyName,function(result){

                        console.log($scope.minBid,"$scope.minBid$scope.minBid");
                        if($scope.defaultCurrencyShortName == result.name && $scope.minBid){

                        }else if($scope.defaultCurrencyCoinRate && $scope.defaultCurrencyRound){
                            $scope.minBid = (Number($rootScope.partnerConfig.min_bid/$scope.defaultCurrencyCoinRate)*result.rate).toFixed(result.round);
                            $scope.maxBid = (Number($rootScope.partnerConfig.max_bid/$scope.defaultCurrencyCoinRate)*result.rate).toFixed(result.round);
                            $scope.maxWin = (Number($rootScope.partnerConfig.max_win/$scope.defaultCurrencyCoinRate)*result.rate).toFixed(result.round)
                        }else{

                        }
                        $scope.defaultCurrencyShortName = result.name;
                            //"AMD";
                            //result.name;
                        $scope.defaultCurrencyCoinRate = result.rate;
                            //565;
                            //result.rate;
                        $scope.defaultCurrencyRound = result.round;
                            //0;
                        //result.round;




                    });
                    console.log(userCurrencyName,"userCurrencyName")


                }
            })['catch'](function (reason) {
            console.log('Error:', reason);
        });




    };
    var getPartnerCurrency = function(){
        var currency;
        console.log($rootScope.conf.registration.defaultCurrency,"$rootdefaultCurrencyScope");
        if($rootScope.conf.registration.defaultCurrency){
            currency = $rootScope.conf.registration.defaultCurrency
        }else{
            currency = "USD";
        }
        getCurrencyRate(currency,function(result){
            $scope.defaultCurrencyShortName = result.name;
            $scope.defaultCurrencyCoinRate = result.rate;
            $scope.defaultCurrencyRound = result.round;
            $scope.minBid = $rootScope.partnerConfig.min_bid;
            $scope.maxBid = $rootScope.partnerConfig.max_bid;
            $scope.maxWin = $rootScope.partnerConfig.max_win;
            console.log($rootScope.partnerConfig,"$scope.maxBid");
            
        });

    };
    var getCurrencyRate = function (currency,callback){

        //console.log(currency,"partnerCurrency")
        var request = {
                "source":"config.currency",
                "what":{
                    "currency":[
                    ]
                },
                "where":{
                    "currency":{
                        "name":currency
                    }
                }
            };

        Zergling.get(request)
            .then(function (result) {
                if (result) {

                    console.log(result.data.currency,"partnerCurrency")
                    for (var currencyId in result.data.currency ){
                        if(result.data.currency[currencyId].name == currency){
                            console.log(result.data.currency[currencyId],"result.data.currency[currencyId]")
                            callback( {
                                name:result.data.currency[currencyId].name,
                                rate:result.data.currency[currencyId].coin_rate,
                                round:result.data.currency[currencyId].rounding
                            });

                        }

                    }
                }
            })['catch'](function (reason) {
            console.log('Error:', reason);
        });

    };
    $scope.bidIsActive = 0;
    var lastGameId = 0;
    var j = 0;
    $scope.myTrackingFunction = function (fairBid){
        // console.log(this,"sadf",fairBid.gameId,"fairBid.gameId",lastGameId,"lastGameId");
        if(lastGameId == fairBid.gameId){
            fairBid.gameId = 0;
        }else{
            lastGameId = fairBid.gameId ;

        }

        j++;
        return j
    };
    $scope.$watch('cancelAllIsActive', function( newValue, oldValue ){
        //console.log('entireScope has changed',newValue, oldValue);
        if(newValue){
            //console.log("asa");

            $rootScope.$broadcast('RemovePossibleBetBroadcastToMarket', newValue );

        }
    }, true);

    $scope.$watch('defaultCurrencyCoinRate', function( newValue, oldValue ){

        console.log("LOOOOOOOOOOOOOOOOOOOD GAAAAAAAAAAME newValue",newValue,$scope.defaultCurrencyCoinRate,$scope.defaultCurrencyShortName);
        if(newValue){

            $rootScope.$broadcast('CurrencyCoinRateBroadcastToMarket',  $scope.defaultCurrencyCoinRate , $scope.defaultCurrencyShortName ,$scope.defaultCurrencyRound );
            getUserOpenBeds();
            getUserOpenBets(true);
        }
    }, true);


            
    $scope.keyPress =function ($event) {
        if ($event.keyCode == 38) {
            this.betFairEvent.price  = this.betFairEvent.unstablePrice = $scope.upArrow(this.betFairEvent.price)
        } else if ($event.keyCode == 40) {
            this.betFairEvent.price  = this.betFairEvent.unstablePrice = $scope.downArrow(this.betFairEvent.price)
        }
        this.betFairEvent.unstableAmount  = Number(this.betFairEvent.amount);

        if(this.betFairEvent.unstablePrice > 1 && this.betFairEvent.unstableAmount >= (1*$scope.defaultCurrencyCoinRate) ){
            this.betFairEvent.betProfit = getProfit(this.betFairEvent.amount,this.betFairEvent.price);

            //console.log(this,"keyPress");

            $rootScope.$broadcast('NewBetBroadcastToMarket', this.betFairEvent );

        }

    };

    $scope.arrow = function (pointer){
        if(pointer == 'down'){
            this.betFairEvent.price  = this.betFairEvent.unstablePrice = $scope.downArrow(this.betFairEvent.price)
        }else if(pointer == 'up'){
            this.betFairEvent.price  = this.betFairEvent.unstablePrice = $scope.upArrow(this.betFairEvent.price)
        }
        this.betFairEvent.unstableAmount  = Number(this.betFairEvent.amount);

        if(this.betFairEvent.unstablePrice > 1 && this.betFairEvent.unstableAmount >= (1*$scope.defaultCurrencyCoinRate) ){
            this.betFairEvent.betProfit = getProfit(this.betFairEvent.amount,this.betFairEvent.price);


            //console.log(this,"keyPress");

            $rootScope.$broadcast('NewBetBroadcastToMarket', this.betFairEvent );

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

    $scope.broadcast = function(){
        console.log($rootScope.partnerConfig,"$locationChangeSuccess', function(event");

        var priceLength,
            stake,
            amountLength;
        console.log(this,"broadcast");

        if(this.fairBid){
            stake = this.fairBid;
            stake.gameId = this.fairBid.gameId;
        }else if(this.betFairEvent){
            stake = this.betFairEvent;
            stake.gameId = this.game.id;
        }
        var re = /^(?:[1-9]\d*|0)?(?:\.\d+$)?(?:\d+\.)?$/m;
        if(stake.amount.toString().match(re) != stake.amount ){
            stake.amount = stake.amount.toString().match(re);
        }
        if(stake.price.toString().match(re) != stake.price){
            stake.price = stake.price.toString().match(re);
        }


        if(stake.price !== null ){
            priceLength =  stake.price.toString().split(".");
        }
        if(stake.amount !== null ){
            amountLength = stake.amount.toString().split(".");
        }


        if(priceLength && priceLength[1]){
            if( priceLength[1].length >= 3 ){
                stake.price = (Number(stake.price).toFixed(2));
            }
        }

        if(priceLength && priceLength[0]){
            if( priceLength[0].length >= 4 ){
                if(priceLength[1]){
                    stake.price = ( Number( stake.price/10 + (priceLength[1] / Math.pow(10, priceLength[1].length)).toFixed(2) ) );

                }else{

                    stake.price = Math.floor(stake.price/10);

                }

            }
        }
        var defaultCurrencyRound;
        if($scope.defaultCurrencyRound <= 0 ){
            defaultCurrencyRound = Math.abs($scope.defaultCurrencyRound)
        }else{
            defaultCurrencyRound = $scope.defaultCurrencyRound
        }


        if(amountLength && amountLength[1]){

            console.log(amountLength,"amountLength",stake.amount,"stake.amount",defaultCurrencyRound+1,"defaultCurrencyRound+1");
            if(amountLength[1].length >= defaultCurrencyRound+1){


                stake.amount = (Number(stake.amount).toFixed(defaultCurrencyRound));
                console.log(amountLength,"amountLength",stake.amount,"stake.amount2222");

            }
        }

        if(amountLength && amountLength[0]){
            if( amountLength[0].length >= 10 ){
                if(amountLength[1]){
                    stake.amount = ( Number( stake.amount/10 + (amountLength[1] / Math.pow(10, amountLength[1].length)).toFixed(defaultCurrencyRound) ) );

                }else{

                    stake.amount = Math.floor(stake.amount/10);

                }

            }
        }





        stake.price == 0 ? stake.price = "" : stake.price;
        stake.amount == 0 ? stake.amount = "" : stake.amount;

        $scope.placeBetIsActive = true;
        var amount  = stake.unstableAmount  = Number(stake.amount);
        var price  = stake.unstablePrice =   Number(stake.price);
        stake.betProfit = getProfit(amount,price);
        //stake.gameId = this.game.id;

        console.log(stake.type,"stake");

        if(stake.type == 1){
            if(amount >=  $scope.minBid  && amount <=  $scope.maxBid  && price > 1){
                //console.log(this,"broadcast");
                $scope.placeBetIsActive = false;
                $rootScope.$broadcast('NewBetBroadcastToMarket', stake );
            }
        }else {
            if((amount*price) <=  $scope.maxWin && amount >= $scope.minBid && amount <=  $scope.maxBid && price > 1){
                //console.log(this,"broadcast");
                $scope.placeBetIsActive = false;
                $rootScope.$broadcast('NewBetBroadcastToMarket', stake );
            }
        }


    };
    $scope.calculateProfit = function (){

        //console.log("calculateProfit",this);
        //debugger;
        this.betFairEvent.amount = changeAmount(this.betFairEvent.amount);

        if(typeof  this.betFairEvent.price !== "undefined"){
            //debugger
            console.log(this.betFairEvent ,"calculateProfit");

            this.betFairEvent.price = changeDownPrice(this.betFairEvent.price);

        }else{
            //debugger

            console.log(this.betFairEvent ,"elsedfhsg");
            //this.betFairEvent.price = changeDownPrice(0);
            console.log(this.betFairEvent.price ,"elsedfhsgprice");


        }
        var amount = this.betFairEvent.unstableAmount = Number(this.betFairEvent.amount);
        var price = this.betFairEvent.unstablePrice =  Number(this.betFairEvent.price);
        this.betFairEvent.betProfit = getProfit(amount,price);
        this.betFairEvent.gameId = this.game.id;
        if(amount >= 1 && price > 1){
            //console.log(this);

            $rootScope.$broadcast('NewBetBroadcastToMarket', this.betFairEvent );

        }


    };
    $scope.validatePrice = function (){

        var stake;
        var errorText = "";
        console.log(this);
        if(this.fairBid){
            stake = this.fairBid;
            stake.gameId = this.fairBid.gameId;
        }else if(this.betFairEvent){
            stake = this.betFairEvent;
            stake.gameId = this.game.id;
        }
        var result = validate(stake.price,stake.amount,stake.type);

        //console.log(stake.amount ,"stake.amount ", result.amount," result.amount");
        if(stake.amount < result.amount){

                if($scope.defaultCurrencyShortName == 'AMD'){
                    errorText = "800 AMD";
                }else{
                    errorText = result.amount+$scope.defaultCurrencyShortName;
                }

        }else if(stake.amount > result.amount){
            errorText = result.amount+$scope.defaultCurrencyShortName;
        }

        stake.unstablePrice = stake.price = result.price;
        stake.unstableAmount = stake.amount = result.amount;
        stake.betProfit = result.betProfit;
        if(stake.unstableAmount >= (1*$scope.defaultCurrencyCoinRate) && stake.unstablePrice > 1){
            console.log(this,"broadcast");
            //$scope.placeBetIsActive = false;
            $rootScope.$broadcast('NewBetBroadcastToMarket', stake );
        }
        $scope.doBids = result.isValid;
        //$scope.placeBetIsActive = false;
        if(!$scope.doBids){
            $scope.betSlipResponseDynamicMessage = errorText;
            $scope.betSlipResponseMessage = "Your bet have been updated automatically. Modified Bet Amount ";
            //$scope.betSlipResponseMessage += errorText;
            $timeout(function () {
                $scope.betSlipResponseMessage = undefined;
                $scope.doBids = true;
                $scope.placeBetIsActive = false;
                //$scope.betIsActive = "";
            }, 4000);
        }
        return true;

    };
    var validate = function (price,amount,type){

        var nPrice,
            nBetProfit,
            isValid,
            nAmount;


        if( price != "" && typeof  price !== "undefined"){
            nPrice = changeDownPrice(price);
        }else{
            nPrice = price;
        }

        if(  amount != "" && typeof  amount !== "undefined"){
            nAmount = changeAmount(amount,type);
        }else{
            nAmount = amount;
        }
        //console.log(nPrice,"nPrice",price,"price",isValid,"amount",amount,"nAmount",nAmount,"nAmount",nPrice == price,"nAmount",amount==nAmount);
        //console.log(nPrice , price,"nPrice == price"," nAmount == amount", nAmount , amount);
        Number(nPrice) == Number(price) && Number(nAmount) == Number(amount) ? isValid = true : isValid = false ;
        console.log(nPrice,"nPrice",price,"price",isValid);

        nBetProfit = getProfit(nAmount,nPrice);

        return  {
            amount:nAmount,
            price:nPrice,
            betProfit:nBetProfit,
            isValid:isValid
        };




    };

    var getProfit = function(amount,price){
        //console.log(amount,"{{getProfit()}}",price);
        if(isNaN(amount/(1*$scope.defaultCurrencyCoinRate)) || isNaN(price/1)){
            return ""

        }else if(((price !== "") && (price !== 0)) && (((amount/$scope.defaultCurrencyCoinRate) !== "") && ((amount/$scope.defaultCurrencyCoinRate) !== 0)) ){
            return  ((amount) *(price - 1)).toFixed(2)+" "+$scope.defaultCurrencyShortName
        }
    };

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
                    var sportId = Object.keys(result.data.sport)[0];
                    var regionId = Object.keys(result.data.sport[sportId].region)[0];
                    var competitionId = Object.keys(result.data.sport[sportId].region[regionId].competition)[0];
                    $location.path("exchange/" + $rootScope.gameType + "/" + sportId + "/" + regionId + "/" + competitionId + "/" + id + "/");
                }
            })['catch'](function (reason) {
            console.log('Error:', reason);
        });

    };
    //$scope.bidUpdateStatus = "";
    $scope.placeBet = function () {

        $scope.placeBetIsActive = true;
        if($scope.doBids){

        var bids = [];



        var validateResult;
        //var bid = ;
        //console.log(this,"this");
        for (var gameId in this.games) {
            //console.log(this.games[gameId]);
            for (var fairEventType in this.games[gameId].betFairEvent) {
                //console.log(this.games[gameId].fairEvent[fairEventType]);
                for (var betFairEvent in this.games[gameId].betFairEvent[fairEventType]) {

                    if(typeof this.games[gameId].betFairEvent[fairEventType][betFairEvent] == "object" ){
                        var fEvenet = this.games[gameId].betFairEvent[fairEventType][betFairEvent];
                        fEvenet.amount = Number((fEvenet.amount/$scope.defaultCurrencyCoinRate).toFixed(4));
                        console.log(fEvenet);
                        if (fEvenet.type == 0) {
                            fEvenet.type = 1
                        } else if(fEvenet.type == 1){
                            fEvenet.type = 0
                        }else{
                        }

                        //validateResult = validate(fEvenet.price,fEvenet.amount);
                        //console.log(validateResult.isValid);
                        //if(!validateResult.isValid){
                        //    doBids = false
                        //}

                        bids.push(fEvenet);
                    }
                }
            }
        }


        var request = {
            'bids': bids
        };

            Zergling.get(request, 'do_bids')
                .then(function (result) {
                    if (result) {

                        if(result.result == "3003"){
                            $scope.betSlipResponseMessage = "You cannot make a bet with yourself";
                        }else if(result.result == "Ok"){
                            $scope.betSlipResponseMessage = "Your bet is accepted.";

                        }else{
                            $scope.betSlipResponseMessage = "Technical error";
                        }
                        //$scope.betSlipResponseMessage = result.result;

                        $timeout(function () {
                            $scope.betSlipResponseMessage = undefined;
                            $scope.betIsActive = "";
                            $scope.cancelAllIsActive = true;
                            $scope.placeBetIsActive = true;
                        }, 4000);
                        //console.log(result, "result");



                        for (var game in $scope.games) {

                            for (var betFairEvent in  $scope.games[game].betFairEvent) {


                                $scope.games[game].betFairEvent[betFairEvent] = undefined;

                            }
                        }

                    }
                })['catch'](function (reason) {
                if(reason.code == 12){
                    $scope.betSlipResponseMessage = "To place your bet, please sign in or register";
                }else{
                    $scope.betSlipResponseMessage = "Technical error";
                }

                $timeout(function () {
                    $scope.betSlipResponseMessage = undefined;
                    $scope.betIsActive = "";
                    $scope.placeBetIsActive = true;
                }, 4000);
                console.log('Error:', reason);
            });
        }else{

        }

        //console.log(this.games ,"bet bet bet");
    };

    $scope.bidUpdate = function () {

        console.log(this,"bidUpdate_bidUpdatebidUpdatebidUpdatebidUpdate");
        if (this.fairBid.bidUpdateStatus == "") {
            this.fairBid.bidUpdateStatus = "refresh";
        } else {
            this.fairBid.bidUpdateStatus = "";

            $scope.betIsActive = "active";
            var activeBid = {
                "amount": Number((Number(this.fairBid.userCurrencyCleanAmount/$scope.defaultCurrencyCoinRate)).toFixed(4)),
                "price": Number((Number(this.fairBid.unstablePrice)).toFixed(2)),
                "event_id": this.fairBid.id
            };

            console.log(activeBid,"activeBid");
            var request = {
                "bids": [activeBid]
            };
            //  {"command": "update_bids", "params": {"bids": [{"amount": 10, 'price': 1.60, "event_id": 11231232}]}}
            Zergling.get(request, 'update_bids')
                .then(function (result) {
                    if (result) {
                        console.log(result,"updateresult");

                        if(result.result == "3003"){
                            $scope.bidEditResponseMessage = "You cannot make a bet with yourself";
                            getUserOpenBeds();
                        }else if(result.result ==  -1){
                            $scope.bidEditResponseMessage = "Your update is approved";

                        }else{
                            $scope.bidEditResponseMessage = "Technical error";
                            getUserOpenBeds();
                        }


                        $timeout(function () {
                            $scope.bidEditResponseMessage = undefined;
                            $scope.betIsActive = "";
                        }, 4000);


                    }
                })['catch'](function (reason) {
                console.log(reason,"updatereason");

                if(reason.code == 12){
                    $scope.bidEditResponseMessage = "To place your bet, please sign in or register";
                    getUserOpenBeds();
                }else{
                    $scope.bidEditResponseMessage = "Technical error";
                    getUserOpenBeds();
                }

                $timeout(function () {
                    $scope.bidEditResponseMessage = undefined;
                    $scope.betIsActive = "";
                }, 4000);


                console.log('Error:', reason);
            });
        }

        //console.log(this.fairBid.amount, "open bidsupdate bidsupdate bidsupdate bidsupdate bidsupdate bids");
    };

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
            //game($scope.gameId, $scope.sportId);
        }
        if (args.type) {
            $scope.gameType = parseInt(args.type)
        }


    });
    $scope.$on("submitOpenGame",  function (event, data) {
        $scope.openGame = data;
            console.info("$scope.openGame$scope.openGame$scope.openGame",$scope.openGame);
    });

    $scope.removeOpenBet = function () {

        //console.log(this);



        var bidIds = [];
        bidIds.push(this.fairBid.id);
        var request = {
            "bid_ids": bidIds

        };
        Zergling.get(request, 'cancel_bids')
            .then(function (result) {
                //console.log(result,"sdghdreasoncancel_bidsresult");


                if (result) {
                    if(result.result == "3003"){
                        $scope.bidEditResponseMessage = "You cannot make a bet with yourself";
                    }else if(result.result ==  -1){
                        $scope.bidEditResponseMessage = "Your bid is canceled";

                    }else{
                        $scope.bidEditResponseMessage = "Technical error";
                    }


                    $timeout(function () {
                        $scope.bidEditResponseMessage = undefined;
                        $scope.betIsActive = "";
                    }, 4000);


                }
            })['catch'](function (reason) {
            console.log(reason,"reasonreasonreasoncancel_bidsreson");


            if(reason.code == 12){
                $scope.bidEditResponseMessage = "To place your bet, please sign in or register";
            }else if(reason.code == -1){

            }else{
                $scope.bidEditResponseMessage = "Technical error";
            }

            $timeout(function () {
                $scope.bidEditResponseMessage = undefined;
                $scope.betIsActive = "";
            }, 4000);


            console.log('Error:', reason);
        });

    };


    $scope.getBidProfit = function () {
        //console.log(this, "ttttttttttttttttttttttttttttttrrrr");
        //( ((betFairEvent.price !== "") && (betFairEvent.price !== 0)) && ((betFairEvent.amount !== "") && (betFairEvent.amount !== 0)) ) ? (betFairEvent.amount *(betFairEvent.price - 1)).toFixed(2)+" C": ""
    };
    $scope.openBids = function (userId) {
        var request = {
            "source": "fair_bets",
            "what": {
                "fairBet": []
            },
            "where": {
                "fairBet": {
                    "client_id": userId
                }
            }
        };

        Zergling.subscribe(request, function (data) {
            //console.log(data,"$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$dataupdate");
            if (data) {
                //console.log(data,"refair_bidsfair_bidsfair_bidsfair_bidsfairsubscribe");
                //if(!$scope.fairBids){$scope.fairBids = []}
                if (!$scope.fairBets) {
                    $scope.fairBets = []
                }

                $scope.fairBets = data.fairBet;
                //$scope.fairBids = result.data.fairBid;
                //console.log("isUpdate true");
                getUserOpenBets(true);

            }
        })
            .then(function (result) {
                if (result) {
                    //console.log(result.data,"refair_bidsfair_bidsfair_bidsfair_bidsfair_bidssult");
                    //if(!$scope.fairBids){$scope.fairBids = []}
                    if (!$scope.fairBets) {
                        $scope.fairBets = []
                    }

                    $scope.fairBets = result.data.fairBet;
                    //console.log("isUpdate false");
                    //$scope.fairBids = result.data.fairBid;
                    getUserOpenBets(false);


                }
            })['catch'](function (reason) {
            console.log('Error:', reason);
        });


    };

    var getUserOpenBets = function (isUpdate) {

        //console.log($scope.fairBets ,"tttttttttttttttttttttt");

        var fairBets = [];


        var betEventIds = [];


        for (var fairBetsId in $scope.fairBets) {
            betEventIds.push($scope.fairBets[fairBetsId].event_id);
            //console.log(betEventIds,"__________________________________________________________***");
        }


        var betRequest = {
            "source": "betting",
            "what": {

                "game": ["id", "team1_name", "team2_name"],
                "market": [],
                "event": [
                    "id",
                    "price",
                    "type",
                    "name",
                    "base"
                ]
            },
            "where": {
                "event": {
                    "id": {"@in": betEventIds}
                }
            }
        };
        var defaultCurrencyRound;
        if($scope.defaultCurrencyRound <= 0 ){
            defaultCurrencyRound = Math.abs($scope.defaultCurrencyRound)
        }else{
            defaultCurrencyRound = $scope.defaultCurrencyRound
        }

        Zergling.get(betRequest)
            .then(function (result) {
                if (result) {


                    for (var fairBet in $scope.fairBets) {

                        if($scope.fairBets[fairBet].amount && $scope.defaultCurrencyCoinRate){
                            $scope.fairBets[fairBet].userCurrencyAmount = (Number($scope.fairBets[fairBet].amount * $scope.defaultCurrencyCoinRate)).toFixed(defaultCurrencyRound)
                        }

                        for (var gameId in result.data.game) {
                            for (var marketId in result.data.game[gameId].market) {
                                for (var eventId in result.data.game[gameId].market[marketId].event) {

                                    //console.log($scope.fairBets[fairBet],"____888");


                                    if (result.data.game[gameId].market[marketId].event[eventId].id == $scope.fairBets[fairBet].event_id) {

                                        //console.log(result.data.game[gameId].market[marketId].event[eventId],"result.data.game[gameId].market[marketId].event[eventId]");
                                        if (result.data.game[gameId].market[marketId].event[eventId].base) {

                                            if (!$scope.fairBets[fairBet].base) {
                                                $scope.fairBets[fairBet].base = result.data.game[gameId].market[marketId].event[eventId].base
                                            }

                                        } else {
                                            if (!$scope.fairBets[fairBet].base && $scope.fairBets[fairBet].base != 0  ) {
                                                $scope.fairBets[fairBet].base = ""
                                            }
                                        }

                                        if (!$scope.fairBets[fairBet].eventName) {
                                            $scope.fairBets[fairBet].eventName
                                        }
                                        $scope.fairBets[fairBet].eventName = result.data.game[gameId].market[marketId].event[eventId].name;
                                        //console.log(fairBets[fairBet],"_______________________________",fairBets[fairBet].event_id,"_______________!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!***____________");
                                        if (!$scope.fairBets[fairBet].marketId) {
                                            $scope.fairBets[fairBet].marketId
                                        }
                                        $scope.fairBets[fairBet].marketId = result.data.game[gameId].market[marketId].id;

                                        if (!$scope.fairBets[fairBet].marketName) {
                                            $scope.fairBets[fairBet].marketName
                                        }
                                        $scope.fairBets[fairBet].marketName = result.data.game[gameId].market[marketId].name;

                                        if (!$scope.fairBets[fairBet].gameId) {
                                            $scope.fairBets[fairBet].gameId
                                        }
                                        $scope.fairBets[fairBet].gameId = result.data.game[gameId].id;

                                        if (!$scope.fairBets[fairBet].gameName) {
                                            $scope.fairBets[fairBet].gameName
                                        }
                                        if (result.data.game[gameId].team1_name && result.data.game[gameId].team2_name) {
                                            $scope.fairBets[fairBet].gameName = result.data.game[gameId].team1_name + " - " + result.data.game[gameId].team2_name;
                                        } else if (result.data.game[gameId].team1_name && !result.data.game[gameId].team2_name) {
                                            $scope.fairBets[fairBet].gameName = result.data.game[gameId].team1_name;
                                        } else if (!result.data.game[gameId].team1_name && result.data.game[gameId].team2_name) {
                                            $scope.fairBets[fairBet].gameName = result.data.game[gameId].team2_name;
                                        } else {
                                            $scope.fairBets[fairBet].gameName = "";
                                        }
                                    }

                                }
                            }
                        }

                        if (!$scope.fairBets[fairBet].gameId) {
                            $scope.fairBets[fairBet] = undefined;
                        } else {
                            if ($scope.fairBets[fairBet].gameId == $scope.gameId) {
                                fairBets.unshift($scope.fairBets[fairBet]);
                            } else {
                                fairBets.push($scope.fairBets[fairBet]);
                            }

                        }


                    }


                    $scope.fairBets = fairBets;
                    //console.log($scope,"isUpdateisUpdate");
                    $rootScope.$broadcast('BetBroadcastToMarket', $scope.fairBets ,isUpdate);
                }
            })['catch'](function (reason) {
            console.log('Error:', reason);
        });

    };
    // Use the relatively new watchCollection().
    $scope.betSlipType = function (type) {
        //console.log("type",type);
        if (type == 0) {
            $scope.betSlipId = 0;
            $scope.betSlip = "active";
            $scope.openBets = "";
            $scope.openBids = "";
        } else if (type == 1) {
            $scope.betSlipId = 1;
            $scope.betSlip = "";
            $scope.openBets = "active";
            $scope.openBids = "";
        } else {
            $scope.betSlipId = 2;
            $scope.betSlip = "";
            $scope.openBets = "";
            $scope.openBids = "active";
        }
    };


    //console.log($rootScope.env.authorized);
    //if( $rootScope.env.authorized){
    //    var data = AuthData.get();
    //    data.user_id;
    //    console.log($rootScope.env.authorized);
    //}

    //exchange.getGames();
    $scope.$on('EventBroadcastToBetSlip', function (events, args, game, eventName, marketBase,marketId,type) {

        //console.log(marketId," this.$parent.$parent.market.id,");
        args.marketId = marketId;

        $scope.addbetSlip( args, game, eventName, marketBase,type);
        $scope.betSlipId = 0;
        args.eventName = eventName;
    });


    var getUserOpenBeds = function () {

        var fairBids = [];
        var eventIds = [];
        for (var fairBid in $scope.fairBids) {
            eventIds.push($scope.fairBids[fairBid].event_id);
        }

        var request = {
            "source": "betting",
            "what": {

                "game": ["id", "team1_name", "team2_name"],
                "market": [],
                "event": [
                    "id",
                    "price",
                    "type",
                    "name",
                    "base"
                ]
            },
            "where": {
                "event": {
                    "id": {"@in": eventIds}
                }
            }
        };

        var defaultCurrencyRound;
        if($scope.defaultCurrencyRound <= 0 ){
            defaultCurrencyRound = Math.abs($scope.defaultCurrencyRound)
        }else{
            defaultCurrencyRound = $scope.defaultCurrencyRound
        }

        Zergling.get(request)
            .then(function (result) {
                if (result) {

                    for (var gameId in result.data.game) {
                        for (var marketId in result.data.game[gameId].market) {
                            for (var fairBid in $scope.fairBids) {
                                $scope.fairBids[fairBid].cleanAmount = $scope.fairBids[fairBid].amount -  $scope.fairBids[fairBid].bet_amount;

                                if($scope.fairBids[fairBid].cleanAmount && $scope.defaultCurrencyCoinRate){
                                    $scope.fairBids[fairBid].userCurrencyCleanAmount = (Number($scope.fairBids[fairBid].cleanAmount * $scope.defaultCurrencyCoinRate)).toFixed(defaultCurrencyRound)
                                }
                                $scope.fairBids[fairBid].bidUpdateStatus = "";
                                for (var eventId in result.data.game[gameId].market[marketId].event) {


                                    if (result.data.game[gameId].market[marketId].event[eventId].id == $scope.fairBids[fairBid].event_id) {


                                        if (result.data.game[gameId].market[marketId].event[eventId].base) {

                                            if (!$scope.fairBids[fairBid].base) {
                                                $scope.fairBids[fairBid].base = result.data.game[gameId].market[marketId].event[eventId].base
                                            }
                                        } else {
                                            if (!$scope.fairBids[fairBid].base) {
                                                $scope.fairBids[fairBid].base = ""
                                            }

                                        }

                                        if (!$scope.fairBids[fairBid].eventName) {
                                            $scope.fairBids[fairBid].eventName
                                        }
                                        $scope.fairBids[fairBid].eventName = result.data.game[gameId].market[marketId].event[eventId].name;

                                        if (!$scope.fairBids[fairBid].marketName) {
                                            $scope.fairBids[fairBid].marketName
                                        }
                                        $scope.fairBids[fairBid].marketName = result.data.game[gameId].market[marketId].name;

                                        if (!$scope.fairBids[fairBid].marketId) {
                                            $scope.fairBids[fairBid].marketId
                                        }
                                        $scope.fairBids[fairBid].marketId = result.data.game[gameId].market[marketId].id;

                                        if (!$scope.fairBids[fairBid].gameId) {
                                            $scope.fairBids[fairBid].gameId
                                        }
                                        $scope.fairBids[fairBid].gameId = result.data.game[gameId].id;

                                        if (!$scope.fairBids[fairBid].gameName) {
                                            $scope.fairBids[fairBid].gameName
                                        }
                                        if (result.data.game[gameId].team1_name && result.data.game[gameId].team2_name) {
                                            $scope.fairBids[fairBid].gameName = result.data.game[gameId].team1_name + " - " + result.data.game[gameId].team2_name;
                                        } else if (result.data.game[gameId].team1_name && !result.data.game[gameId].team2_name) {
                                            $scope.fairBids[fairBid].gameName = result.data.game[gameId].team1_name;
                                        } else if (!result.data.game[gameId].team1_name && result.data.game[gameId].team2_name) {
                                            $scope.fairBids[fairBid].gameName = result.data.game[gameId].team2_name;
                                        } else {
                                            $scope.fairBids[fairBid].gameName = "";
                                        }


                                        if ($scope.fairBids[fairBid].gameId == $scope.gameId) {
                                            fairBids.unshift($scope.fairBids[fairBid]);
                                        } else {
                                            fairBids.push($scope.fairBids[fairBid]);
                                        }
                                    }

                                }
                            }

                        }
                    }

                    $scope.fairBids = fairBids;
                    //console.log( $scope.fairBids,"dsfghdghfd",$scope.gameId,"ghfdgnfgh");


                }
            })['catch'](function (reason) {
            console.log('Error:', reason);
        });

    };

    $scope.openBets = function (userId) {


        var request = {
            "source": "fair_bids",
            "what": {
                "fairBid": []
            },
            "where": {
                "fairBid": {
                    "client_id": userId,
                    "status": {'@in': [0, 1]}
                }
            }
        };


        Zergling.subscribe(request, function (data) {
            //console.log(data,"$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$dataupdate");
            if (data) {
                //console.log(data, "refair_bidsfair_bidsfair_bidsfair_bidsfairsubscribe");
                //if(!$scope.fairBids){$scope.fairBids = []}
                if (!$scope.fairBids) {
                    $scope.fairBids = []
                }

                $scope.fairBids = data.fairBid;
                getUserOpenBeds();

            }
        })
            .then(function (result) {
                if (result) {
                    //console.log(result.data,"refair_bidsfair_bidsfair_bidsfair_bidsfair_bidssult");
                    //if(!$scope.fairBids){$scope.fairBids = []}
                    if (!$scope.fairBids) {
                        $scope.fairBids = []
                    }

                    $scope.fairBids = result.data.fairBid;
                    getUserOpenBeds();


                }
            })['catch'](function (reason) {
            console.log('Error:', reason);
        });


    };


    $scope.removeBet = function () {

        var betFairEvents;

        for (var game in $scope.games) {

            for (var betFairEvent in  $scope.games[game].betFairEvent) {

                for (var betFairEventBody in $scope.games[game].betFairEvent[betFairEvent]) {

                    if (typeof  $scope.games[game].betFairEvent[betFairEvent][betFairEventBody] !== 'function') {
                        betFairEvents = $scope.games[game].betFairEvent[betFairEvent][betFairEventBody];


                        if (betFairEvents.id === this.betFairEvent.id && betFairEvents.event_id == this.betFairEvent.event_id && betFairEvents.type == this.betFairEvent.type) {
                            $scope.games[game].betFairEvent[betFairEvent].splice(betFairEventBody, 1);

                            //console.log(this.betFairEvent,"this.betFairEvent");
                            if(this.betFairEvent.unstablePrice >= 1.01 && this.betFairEvent.unstableAmount >= 1){
                                $rootScope.$broadcast('RemovePossibleBetBroadcastToMarket', this.betFairEvent);
                            }

                        }


                    }

                }


            }



            if(typeof $scope.games[game] !== 'function'){
                var event = $scope.games[game].betFairEvent;
                //console.log(event,"event",$scope.games[game]);

                if (((event['down'] && event['down'].length == 0 ) || typeof event['down'] == 'undefined') && ((event['up'] && event['up'].length == 0) || (typeof event['up'] == 'undefined'))) {
                    //console.log("placeBetIsActive cancelAllIsActive");
                    $scope.placeBetIsActive = true;
                    $scope.cancelAllIsActive = true
                }
            }


        }
    };

    $scope.addbetSlip = function (fairEvent, game, fairEventName, marketBase ,type) {

        // console.log(fairEvent,game);
        // console.log(fairEvent.amount);
        //$scope.betHistory();
        var mBase;
        if (typeof marketBase == "number") {
            mBase = marketBase;
        }


        var betFairEvent = {
            //amount: fairEvent.amount,
            eventName: fairEventName,
            event_id: fairEvent.event_id,
            marketId:fairEvent.marketId,
            price: fairEvent.price,
            fBase: mBase,
            type: fairEvent.type
        };

        betFairEvent.amount = '';
        betFairEvent.betProfit = '';
        var gId = game.id;
        var pointer = 0;

        if (!$scope.games) {
            $scope.games = [];
            $scope.games.unshift(game);
        }

        for (var gameElement in $scope.games) {

            if ($scope.games[gameElement].id == game.id) {
                pointer = 1
            }
        }
        if (pointer == 0) {
            $scope.games.unshift(game);
        }
        for (var gameId in $scope.games) {


            if ($scope.games[gameId].id == game.id) {
                //console.log($scope.games[gameId].betFairEvent,"$scope.games[gameId].betFairEvent")

                if (!$scope.games[gameId].betFairEvent) $scope.games[gameId].betFairEvent = [];


                if (betFairEvent.type == 0) {
                    //console.log($scope.games[gameId].betFairEvent.down,"$scope.games[gameId].betFairEvent.down")
                    if (!$scope.games[gameId].betFairEvent.down || $scope.games[gameId].betFairEvent.down.length == 0) {$scope.games[gameId].betFairEvent.down = [] ; $scope.cancelAllIsActive = false }
                   if(type){
                       $scope.games[gameId].betFairEvent.down.push(betFairEvent);
                   }else{
                       $scope.games[gameId].betFairEvent.down.unshift(betFairEvent);

                   }

                } else {
                    if (!$scope.games[gameId].betFairEvent.up || $scope.games[gameId].betFairEvent.up.length == 0) {$scope.games[gameId].betFairEvent.up = []; $scope.cancelAllIsActive = false }
                    if(type){
                        $scope.games[gameId].betFairEvent.up.push(betFairEvent);

                    }else{
                        $scope.games[gameId].betFairEvent.up.unshift(betFairEvent);

                    }

                }

            }

        }

    };

    $scope.cancelAll = function (){
        //console.log($scope.games,"sadf");
        for (var game in $scope.games) {

            for (var betFairEvent in  $scope.games[game].betFairEvent) {

                $scope.games[game].betFairEvent = undefined ;

            }
        }
        $scope.cancelAllIsActive = true;
        $scope.placeBetIsActive = true;
    };


    $rootScope.$watchCollection(
        "env.authorized",
        function (newValue, oldValue) {
            if (newValue == true) {
                var data = AuthData.get();
                if (data.user_id) {
                    $scope.userIsLogin = true;
                    $scope.openBids(data.user_id);
                    $scope.openBets(data.user_id);
                }
            }else{
                $scope.userIsLogin = false;
            }
            //console.log("__________________________________________________________+++",newValue, oldValue);
        }
    );

    //$rootScope.partnerConfig

    $scope.testGame = {
        sport: {
            alias: "Soccer"
        },
        info: {
            add_info: "",
            current_game_state: "set1",
            field: "0",
            pass_team: "team2",
            score1: "0",
            score2: "0",
            shirt1_color: "ccc",
            shirt2_color: "f00",
            short1_color: "CCCCCC",
            short2_color: "CCCCCC"
        },
        last_event: {
            aces_score: "0:0",
            double_fault_score: "1:3",
            event_id: "3624938",
            game_score: "0:0",
            id: "13135938",
            score: "1:0",
            game_score_team1: "30",
            game_score_team2: "30",
            sequence: "1",
            serve: "2",
            set_score: "1:0",
            side: "1",
            time_utc: "2015-07-24T12:59:26.3853797",
            type: "Goal",
            type_id: "208",
            value: "1"

        }
    };


    $scope.downArrow = function(price){
        var price = price;
        if(price/1 != price){
            price = 1.01
        }

        if(price){
            price = Number(price).toFixed(2);
        }
        if (price < 1.01) {
            price = Number(price);
            price = 1.01;
            price = Number(price)
        }else if (price >1.01 && price < 2) {
            price = Number(price);
            price = price - 0.01;
            price = price.toFixed(2);
            price = Number(price)
        }else if (price >= 2 && price < 3) {
            price = Number(price);
            price = price - 0.02;
            price = price.toFixed(2);
            price = Number(price)
        }else if (price >= 3 && price < 4) {
            price = Number(price);
            price = price - 0.05;
            price = price.toFixed(2);
            price = Number(price)
        }else if (price >= 4 && price < 6) {
            price = Number(price);
            price = price - 0.1;
            price = price.toFixed(2);
            price = Number(price)
        }else if (price >= 6 && price < 10) {
            price = Number(price);
            price = price - 0.2;
            price = price.toFixed(2);
            price = Number(price)
        }else if (price >= 10 && price < 20) {
            price = Number(price);
            price = price - 0.5;
            price = price.toFixed(2);
            price = Number(price)
        }else if (price >= 20 && price < 30) {
            price = Number(price);
            price = price - 1;
            price = price.toFixed(2);
            price = Number(price)
        }else if (price >= 30 && price < 50) {
            price = Number(price);
            price = price - 2;
            price = price.toFixed(2);
            price = Number(price)
        }else if (price >= 50 && price < 100) {
            price = Number(price);
            price = price - 5;
            price = price.toFixed(2);
            price = Number(price)
        }else if (price >= 100 && price <= 990) {
            price = Number(price);
            price = price - 10;
            price = price.toFixed(2);
            price = Number(price)
        }
        return price;
    };

    $scope.upArrow = function(price){

        var price = price;
        if(price/1 != price){
            price = 1.01
        }

        if(price){
            price = Number(price).toFixed(2);
        }
        if (price >=1.01 && price < 2) {
            price = Number(price);
            price = price + 0.01;
            price = price.toFixed(2);
            price = Number(price)
        }else if (price >= 2 && price < 3) {
            price = Number(price);
            price = price + 0.02;
            price = price.toFixed(2);
            price = Number(price)
        }else if (price >= 3 && price < 4) {
            price = Number(price);
            price = price + 0.05;
            price = price.toFixed(2);
            price = Number(price)
        }else if (price >= 4 && price < 6) {
            price = Number(price);
            price = price + 0.1;
            price = price.toFixed(2);
            price = Number(price)
        }else if (price >= 6 && price < 10) {
            price = Number(price);
            price = price + 0.2;
            price = price.toFixed(2);
            price = Number(price)
        }else if (price >= 10 && price < 20) {
            price = Number(price);
            price = price + 0.5;
            price = price.toFixed(2);
            price = Number(price)
        }else if (price >= 20 && price < 30) {
            price = Number(price);
            price = price + 1;
            price = price.toFixed(2);
            price = Number(price)
        }else if (price >= 30 && price < 50) {
            price = Number(price);
            price = price + 2;
            price = price.toFixed(2);
            price = Number(price)
        }else if (price >= 50 && price < 100) {
            price = Number(price);
            price = price + 5;
            price = price.toFixed(2);
            price = Number(price)
        }else if (price >= 100 && price < 990) {
            price = Number(price);
            price = price + 10;
            price = price.toFixed(2);
            price = Number(price)
        }
        price = changeDownPrice(price);
        return price;
    };


    var changeAmount = function (up,type){


        //if(up/(1*$scope.defaultCurrencyCoinRate) != up){
        //    return 1*$scope.defaultCurrencyCoinRate;
        //}
        if($scope.defaultCurrencyShortName == 'AMD' && !$scope.minBid){
            if (up < 800) {
                return  800;
            }else{
                return up
            }
        }else{
            console.log($scope.minBid,type,"$locationChangeSuccess', function(event");

            if (up < $scope.minBid) {
                return  $scope.minBid;
            }else if(up > $scope.maxBid){
                return  $scope.maxBid;
            }else{
                return up
            }
        }


    };

    //var intervalConfigs= {
    //    2:  0.01,
    //    3:  0.02,
    //    4:  0.05,
    //    6:  0.1,
    //    10: 0.2,
    //    20: 0.5,
    //    30: 1,
    //    50: 2,
    //    100:5,
    //    990:10
    //};
    //
    //$scope.changeDownPrice = function(down){
    //
    //    if (down < 1.01) {
    //        this.betFairEvent.price = down = 1.01;
    //    }
    //    if (down > 990) {
    //        this.betFairEvent.price = down = 990;
    //    }
    //    for(var i in intervalConfigs){
    //        if (down < i) {
    //            if (Number(down).toFixed(2) % (intervalConfigs[i])) {
    //                var remainder = Number(down).toFixed(2) % (intervalConfigs[i]);
    //                this.betFairEvent.price = ((((down) - remainder )+ (intervalConfigs[i])) ).toFixed(2);
    //            }else{
    //                this.betFairEvent.price = down;
    //            }
    //            break;
    //        }
    //    }
    //};

    var changeDownPrice = function(down ){


        if(isNaN(down/1)){

            return 1.01
        }
        if (down <= 1.01) {
            return 1.01;
        }else if(down >1.01 && down <= 2){
            if (Number(down*100).toFixed(2) ) {
                return (((down*100) ) / 100).toFixed(2);
            }else{
                return down;
            }
        }else if(down >2 && down <=3){
            if (Number(down*100).toFixed(2) % 2) {
                return (((down*100) + 1) / 100).toFixed(2);
            }else{
                return down;
            }
        }else if(down >3 && down <=4){
            if (Number(down*100).toFixed(2) % 5) {
                var remainder = Number(down*100).toFixed(2) % 5;
                return ((((down*100) - remainder) + 5) /100).toFixed(2);
            }else{
                return down;
            }
        }else if (down >4 && down<=6) {
            if (Number(down*100).toFixed(2) % 10) {
                var remainder = Number(down*100).toFixed(2) % 10;
                return ((((down*100) - remainder) + 10) / 100).toFixed(2);
            }else{
                return down;
            }
        }else if (down >6 && down<=10) {
            if (Number(down*100).toFixed(2) % 20) {
                var remainder = Number(down*100).toFixed(2) % 20;
                return ((((down*100) - remainder) + 20) / 100).toFixed(2);
            }else{
                return down;
            }
        }else if (down >10 && down<=20) {
            if (Number(down*100).toFixed(2) % 50) {
                var remainder = Number(down*100).toFixed(2) % 50;
                return ((((down*100) - remainder) + 50) / 100).toFixed(2);
            }else{
                return down;
            }
        }else if (down >20 && down<=30) {
            if (Number(down*100).toFixed(2) % 100) {
                var remainder = Number(down*100).toFixed(2) % 100;
                return ((((down*100) - remainder) + 100) / 100).toFixed(2);
            }else{
                return down;
            }
        }else if (down >30 && down<=50) {
            if (Number(down*100).toFixed(2) % 200) {
                var remainder = Number(down*100).toFixed(2) % 200;
                return ((((down*100) - remainder) + 200) / 100).toFixed(2);
            }else{
                return down;
            }
        }else if (down >50 && down<=100) {
            if (Number(down*100).toFixed(2) % 500) {
                var remainder = Number(down*100).toFixed(2) % 500;
                return ((((down*100) - remainder) + 500) / 100).toFixed(2);
            }else{
                return down;
            }
        }else if (down >100 && down<=990) {
            if (Number(down*100).toFixed(2) % 1000) {
                var remainder = Number(down*100).toFixed(2) % 1000;
                return ((((down*100) - remainder) + 1000) / 100).toFixed(2);
            }else{
                return down;
            }
        }else if (down >990) {
            if (down > 990) {
                return 990;
            }
        }
    };

    $scope.changePrice = function(price){
        if(price/1 != price){
            this.betFairEvent.price = 1.01
        }
        if (price < 1.01) {
            this.betFairEvent.price = 1.01;
        }else if(price >2 && price < 3 ){
            if(Number(price*100).toFixed(2) % 2){
                this.betFairEvent.price  = (((price*100) - 1)/100).toFixed(2);

            }else{
                this.betFairEvent.price  = price ;
            }
        }else if (price >3 && price < 4){
            if(Number(price*100).toFixed(2) % 5){
                var remainder = Number(price*100).toFixed(2) % 5;
                this.betFairEvent.price  = (((price*100) - remainder )/100).toFixed(2);

            }else{
                this.betFairEvent.price  = price ;
            }
        }else if (price >4 && price < 6){
            if(Number(price*100).toFixed(2) % 10){
                var remainder = Number(price*100).toFixed(2) % 10;
                this.betFairEvent.price  = (((price*100) - remainder )/100).toFixed(2);

            }else{
                this.betFairEvent.price  = price ;
            }
        }else if (price >6 && price < 10){
            if(Number(price*100).toFixed(2) % 20){
                var remainder = Number(price*100).toFixed(2) % 20;
                this.betFairEvent.price  = (((price*100) - remainder )/100).toFixed(2);

            }else{
                this.betFairEvent.price  = price ;
            }
        }else if (price >10 && price < 20){
            if(Number(price*100).toFixed(2) % 50){
                var remainder = Number(price*100).toFixed(2) % 50;
                this.betFairEvent.price  = (((price*100) - remainder )/100).toFixed(2);

            }else{
                this.betFairEvent.price  = price ;
            }
        }else if (price >20 && price < 30){
            if(Number(price*100).toFixed(2) % 100){
                var remainder = Number(price*100).toFixed(2) % 100;
                this.betFairEvent.price  = (((price*100) - remainder )/100).toFixed(2);

            }else{
                this.betFairEvent.price  = price ;
            }
        }else if (price >30 && price < 50){
            if(Number(price*100).toFixed(2) % 200){
                var remainder = Number(price*100).toFixed(2) % 200;
                this.betFairEvent.price  = (((price*100) - remainder )/100).toFixed(2);

            }else{
                this.betFairEvent.price  = price ;
            }
        }else if (price >50 && price < 100){
            if(Number(price*100).toFixed(2) % 500){
                var remainder = Number(price*100).toFixed(2) % 500;
                this.betFairEvent.price  = (((price*100) - remainder )/100).toFixed(2);

            }else{
                this.betFairEvent.price  = price ;
            }
        }else if (price >100 && price < 1000){
            if(Number(price*100).toFixed(2) % 1000){
                var remainder = Number(price*100).toFixed(2) % 1000;
                this.betFairEvent.price  = (((price*100) - remainder )/100).toFixed(2);

            }else{
                this.betFairEvent.price  = price ;
            }
        }else if (price >990) {
            if (price > 990) {
                this.betFairEvent.price = 990;
            }
        }
    };
}]);

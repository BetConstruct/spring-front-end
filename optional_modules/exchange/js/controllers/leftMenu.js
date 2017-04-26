angular.module('exchange').controller('leftMenu', ['$rootScope', '$scope', '$location', '$route', '$routeParams',  'Zergling', 'lodash', function ($rootScope, $scope, $location, $route, $routeParams, Zergling, _) {
    'use strict';


    $rootScope.gameType = 0;
    $scope.sportId = [];
    $scope.regionId = [];
    $scope.competitionId = [];


//console.log($route.current,"$route.current$route.current$route.current$route.current")

    $scope.sportType = function (type) {
       var type = parseInt(type);
        $rootScope.gameType = type;
        //console.log(type,"sdfgsdf xRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRFCCCCCCCCR");

        var request = {
            "source": "betting",
            "what": {
                "game": "@count"
            },
            "where": {
                "game": {
                    "is_started": type
                }
            }
        };

        Zergling.get(request)
            .then(function (result) {
                if (result) {
                   // console.log(result,"asasasaaaaaaaRRRRRRRRRRRRRRRRRRRRRRRRRR");

                }
            })['catch'](function (reason) {
            console.log('Error:', reason);
        });

       // $routeParams.type = $scope.gameType;
       // console.log($routeParams,"$routeParams$routeParams");
        $location.path("exchange/" + $scope.gameType + "/");
        // +$scope.sportId+"/"+$scope.regionId+"/"+$scope.competitionId+"/"+$scope.gameId+"/"
    };


    $scope.$on('RouteChange', function (events, args) {

        //   console.log(args);
        if(!$scope.gameId){
            if (args.type) {
                $rootScope.gameType = parseInt(args.type)
            }
            if($scope.gameType == 0){
                $scope.preMatch = "active";
                $scope.live = "";
            }else{
                $scope.preMatch = "";
                $scope.live = "active";
            }
            $scope.SportInit();
            if (args.sportId && args.sportId != 0) {
                $scope.sportId = parseInt(args.sportId);
            }
            if (args.regionId && args.regionId !=0) {
                $scope.regionId = parseInt(args.regionId);
            }
            if (args.competitionId && args.competitionId != 0) {
                $scope.competitionId = parseInt(args.competitionId);
            }
            if (args.gameId && args.gameId != 0) {
                $scope.gameId = parseInt(args.gameId)
            }
        }

        $scope.next = function (nextFunction) {
            if ($scope.gameId) {
                nextFunction();
            }
        };
        // openMenu($scope.gameId)
        //      console.log($scope.gameType,$scope.sportId,$scope.regionId,$scope.competitionId,$scope.gameId);


    });


    $scope.SportInit = function () {
        $scope.sportList();
    };

    $scope.gameMarket = function (a, sportId, regionId, competitionId, gameId) {

    console.log("exchange/"+ $routeParams['sportId']);

        //debugger;
        //$routeParams['sportId'] = sportId;
        //$routeParams['regionId'] = regionId;
        //$routeParams['competitionId'] = competitionId;
        //$routeParams['regionId'] = regionId;

        $location.path("exchange/" + $scope.gameType + "/" + sportId + "/" + regionId + "/" + competitionId + "/" + gameId + "/");

        // $rootScope.$broadcast('GameBroadcastToMarket', a.game);
    };

    // $scope.$on('GameBroadcastToMarket', function (events, args) {
    //     $scope.sportList();
    //     //console.log('ARGS', args);
    //     var sportId = parseInt(args.sportId);
    //     var regionId = parseInt(args.regionId);
    //     var competitionId = parseInt(args.competitionId);
    //     var gameId = parseInt(args.gameId);
    //     openMenu(sportId, regionId, competitionId, gameId);

    // });


    var isActive = function (obj) {
        //console.log(obj,"competitioncompetitioncompetitioncompetitioncompetition");

        if (obj.isActive) {
            obj.isActive = "";
        } else {
            obj.isActive = "active";
        }
        //  console.log(obj,"objecttttttttttttttttttttttt")
    };

    $scope.sportList = function () {


        var request = {
            "source": "betting",
            "what": {
                "sport": ["id", "name", "alias", "order", "active"],
                "game": "@count"
            },
            "where": {
                "game": {
                    "is_fair": 1,
                    "is_started": $scope.gameType
                }
            }
        };

        var requestLive = {
            "source": "betting",
            "what": {
                "sport": ["id", "name"],
                "game": "@count"
            },
            "where": {
                "game": {
                    "is_fair": 1,
                    "is_started": 1
                }
            }
        };

        var requestPrematch = {
            "source": "betting",
            "what": {
                "sport": ["id", "name"],
                "game": "@count"
            },
            "where": {
                "game": {
                    "is_fair": 1,
                    "is_started": 0
                }
            }
        };

        var gameCount = function (sports) {
            var gamesCount = 0;
            var sportCount = 0;
            for (var sport in sports) {
                gamesCount += sports[sport].game;
                sportCount++;
            }
            if (!$scope.sports.gamesCount) {
                $scope.gamesCount = gamesCount;
                $scope.sportCount = sportCount
            }
            // console.log($scope.sports.length);
            return gamesCount;

        };
        Zergling.get(request)
            .then(function (result) {
                if (result) {
                    $scope.sports = result.data.sport;
                    $scope.next($scope.regionList);
                }
            })['catch'](function (reason) {
            console.log('Error:', reason);
        });
        Zergling.get(requestLive)
            .then(function (result) {
                if (result) {
                    $scope.sport = result.data.sport;
                    $scope.liveGamesCount = gameCount($scope.sport);
                }
            })['catch'](function (reason) {
            console.log('Error:', reason);
        });
            Zergling.get(requestPrematch)
            .then(function (result) {
                if (result) {
                    $scope.sport = result.data.sport;
                    $scope.prematchGamesCount = gameCount($scope.sport);
                }
            })['catch'](function (reason) {
            console.log('Error:', reason);
        });

    };

    $scope.regionList = function (id) {


        id ? id : id = $scope.sportId;
        // console.log(typeof id);
        //console.log(id);
        // var sport = this.sport;
        var request = {
            "source": "betting",
            "what": {
                "region": [],
                "game": "@count"
            },
            "where": {
                "sport": {
                    "id": id
                },
                "game": {
                    "is_fair": 1,
                    "type": $scope.gameType,
                    "is_fair_blocked": 0
                }
            },
            "subscribe": true
        };

        Zergling.get(request)
            .then(function (result) {
                if (result) {
                    //console.log(result.data.region);
                    if (!$scope.sports[id].regions) {
                        $scope.sports[id].regions = []
                    }
                    //var regions = _.sortBy(result.data.region, 'order'),
                    //    regionsObj = [];
                    //console.log(regions,"regionssssssssssssssssssssssssssssssss");
                    //for(var i = 0 ; i < regions.length ; i++){
                    //    console.info(regions[i]);
                    //    regionsObj[regions[i].id] = regions[i];
                    //    console.log(regionsObj);
                    //}

                    $scope.sports[id].regions = _.sortBy(result.data.region, 'order');

             //       $scope.sports[id].regions = result.data.region;
             //       console.log($scope.sports[id].regions,"regionssssssssssssssssssssssssssssssss");
                  //  console.log(_.sortBy(result.data.region, 'order'),"regionssssssssssssssssssssssssssssssss");

                    $scope.next($scope.competitionList);

                    isActive($scope.sports[id]);
                }
            })['catch'](function (reason) {
            console.log('Error:', reason);
        });
    };

    $scope.competitionList = function (id) {

        //console.log(this,"ttttttttttttttttttttttttttttttttttttttttttrrrrrrrrrrrrrr");

        if (id) {
            var id = id;
            var region = this.region;
        } else {
            var sporId = $scope.sportId;
            var id = $scope.regionId;
           // console.log($scope.sports[sporId].regions[id],$scope.sportId,$scope.regionId,"regionsssssssssssssssssssssssssssssssscompetitionList");
            var region;
            for(var nextRegion in $scope.sports[sporId].regions){
                //console.log($scope.sports[sporId].regions[nextRegion].id , id , "region compatition" );
                if($scope.sports[sporId].regions[nextRegion].id == id){
                    region = $scope.sports[sporId].regions[nextRegion];
                }
            }

        }


        var request = {
            "source": "betting",
            "what": {
                "competition": [
                    "id",
                    "name",
                    "order"
                ]
            },
            "where": {
                "game": {
                    "is_fair": 1,
                    "type": $scope.gameType,
                    "is_fair_blocked": 0
                },
                "region": {
                    "id": id
                }
            },
            "subscribe": true
        };

        Zergling.get(request)
            .then(function (result) {
                if (result) {
                    // console.log(result);
                    if (!region.competitions) {
                        region.competitions = [];
                    }
                    region.competitions = _.sortBy(result.data.competition, 'order');
                   // region.competitions = result.data.competition;
                   // console.log(region.competitions ,"competitionsssssssssssssssssssssssssssss");
                    $scope.next($scope.gameList);
                    isActive(region);
                }
            })['catch'](function (reason) {
            console.log('Error:', reason);
        });
    };


    $scope.gameList = function (competition) {


        //console.log(competition);

        if (competition) {
            var id = competition.id;
             competition = competition;
        } else {
            var competition;
            var id = $scope.competitionId;

            for(var regionIndex in $scope.sports[$scope.sportId].regions){
                if($scope.sports[$scope.sportId].regions[regionIndex].id == $scope.regionId){
                    for(var competitionIndex in $scope.sports[$scope.sportId].regions[regionIndex].competitions){
                        if($scope.sports[$scope.sportId].regions[regionIndex].competitions[competitionIndex].id == $scope.competitionId){
                            competition =  $scope.sports[$scope.sportId].regions[regionIndex].competitions[competitionIndex]
                        }

                    }
                }
            }

        }

        var request = {
            "source": "betting",
            "what": {
                "game": [
                    []
                ]


            },
            "where": {
                "competition": {
                    "id": id
                },
                "game": {
                    "is_fair": 1,
                    "type": $scope.gameType,
                    "is_fair_blocked": 0
                }
            },
            "subscribe": true
        };


        Zergling.get(request)
            .then(function (result) {
                if (result) {
                           //console.log(result.data.game,"dsfghsdfg");
                    if (!competition.games)
                        competition.games = [];
                    competition.games = _.sortBy(result.data.game, 'start_ts');
                    // region.competitions = _.sortBy(result.data.game, 'start_ts');
                   // console.log(competition.games,"dsfghsdfg");
                    isActive(competition);
                   // console.log(competition,"dsfghsdfg");

                }
            })['catch'](function (reason) {
            console.log('Error:', reason);
        });
    };


}]);

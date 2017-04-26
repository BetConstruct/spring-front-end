//
//
//
//var MainCtrl = function ($rootScope, $route, $scope, $routeParams, $location, $timeout) {
//
//
//    var gameId = $routeParams.gameId;
//    var competitionId = $routeParams.competitionId;
//    var sportId = $routeParams.sportId;
//    var regionId = $routeParams.regionId;
//
//    $scope.menuIsActive = "";
//    $scope.menuToggle =function(){
//        if($scope.menuIsActive == ""){
//            $scope.menuIsActive = "closed"
//        }else if($scope.menuIsActive == "closed"){
//            $scope.menuIsActive = "";
//        }
//    };
//    //console.log($routeParams, "$routeParams MAIN");
//
//    $scope.$on("$routeChangeSuccess", function handleRouteChangeEvent(event) {
//      //  $scope.pageType = 0;
//      //  console.log($routeParams, "$routeParams MAIN");
//        $timeout(function () {
//            $rootScope.$broadcast('RouteChange', $routeParams);
//        }, 400);
//
//    });
//
//};
//
//MainCtrl.prototype.onInit = function () {
//
//};

angular.module('exchange').controller('MainCtrl', ["$rootScope", "$route", "$scope", "$routeParams", "$location", "$timeout", function ($rootScope, $route, $scope, $routeParams, $location, $timeout) {
    'use strict';

    var gameId = $routeParams.gameId;
    var competitionId = $routeParams.competitionId;
    var sportId = $routeParams.sportId;
    var regionId = $routeParams.regionId;

    //console.log($rootScope.conf.registration.defaultCurrency,"$rootScope");
    //console.log($rootScope.conf.registration.defaultCurrency,"$rootScope");


    $scope.menuIsActive = "";
    $scope.menuToggle =function(){
        if($scope.menuIsActive == ""){
            $scope.menuIsActive = "closed"
        }else if($scope.menuIsActive == "closed"){
            $scope.menuIsActive = "";
        }
    };
    //console.log($routeParams, "$routeParams MAIN");

    $scope.$on("$routeChangeSuccess", function handleRouteChangeEvent(event) {
        //  $scope.pageType = 0;
          console.log($routeParams, "$routeParams MAIN");
        //debugger;
        $timeout(function () {
            $rootScope.$broadcast('RouteChange', $routeParams);
        }, 400);

    });

}]);

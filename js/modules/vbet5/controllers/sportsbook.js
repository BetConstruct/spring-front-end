/**
 * @ngdoc controller
 * @name vbet5.controller:sportsbookCtrl
 */
VBET5.controller('sportsbookCtrl', ['$rootScope', '$scope', function($rootScope, $scope) {
    'use strict';

    //move all duplicated data from all sports views to this parent scope

   $scope.openBetBuilder = function openBetBuilder(game) {
       if ($rootScope.env.authorized) {
           $scope.betBuilderGame = game;
       } else {
           $rootScope.$broadcast("openLoginForm", {
              callback: function () {
                  $scope.betBuilderGame = game;
              }
           });
       }
   };

   $scope.closeBetBuilder = function closeBetBuilder() {
       $scope.betBuilderGame = undefined;
   };
}]);

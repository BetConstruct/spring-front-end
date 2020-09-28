/**
 * @ngdoc controller
 * @name vbet5.controller:sportsbookCtrl
 */
VBET5.controller('sportsbookCtrl', ['$rootScope', '$scope', 'GameInfo', function($rootScope, $scope, GameInfo) {
    'use strict';

    //move all duplicated data from all sports views to this parent scope

    $scope.vbet5AvailableAnimations  = {'Soccer': true, 'Tennis': true, 'Basketball': true};

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

   $scope.$on("stream.config.updated", function () {
       $scope.prematchChannels = GameInfo.CHANNELS;
   });

    $scope.prematchChannels = GameInfo.CHANNELS;
}]);

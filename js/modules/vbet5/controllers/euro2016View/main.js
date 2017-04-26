/**
 * @ngdoc controller
 * @name vbet5.controller:classicViewMainCtrl
 * @description
 * Classic mode view controller
 */
angular.module('vbet5.betting').controller('euro2016MainController', ['$scope', '$controller', '$location', function ($scope, $controller, $location) {
    'use strict';

//     var connectionService = new ConnectionService($scope);

    angular.extend(this, $controller('euro2016CenterController', {
        $scope: $scope
    }));

    $scope.$on("leftMenu.gameClicked", function (event, data) {
        if ($location.path() === '/multiview/') {
            return;
        }

        $scope.openGameFullDetails(data.game, data.competition, false, true);
    });
}]);
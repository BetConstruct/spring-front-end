/**
 * @ngdoc controller
 * @name vbet5.controller:sportsbookSwitchersCtrl
 */
VBET5.controller('sportsbookSwitchersCtrl', ['$scope', '$rootScope', 'Utils', 'Config', function ($scope, $rootScope, Utils, Config) {
    'use strict';
    $scope.sportsbookAvailableViews = Utils.checkForAvailableSportsbookViews(Config);
}]);

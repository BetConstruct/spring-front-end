/* global VBET5 */
/**
 * @ngdoc controller
 * @name vbet5.controller:gameDescriptionCtrl
 */
VBET5.controller('gameDetailsCtrl', ['$scope', '$location', 'casinoData', function ($scope, $location, casinoData) {
    'use strict';
    /**
     * @ngdoc method
     * @name getGameDetails
     * @methodOf vbet5.controller:gameDetailsCtrl
     * @description Get casino game details from casino data service
     */
    $scope.getGameDetails = function getGameDetails () {
        var game_skin_id = $location.search().game_skin_id;
        if (game_skin_id) {
            casinoData.getCasinoGameDetails(game_skin_id).then(function (response) {
                if (response && response.data) {
                    $scope.game = response.data;
                }
            });
        }
    };
}]);
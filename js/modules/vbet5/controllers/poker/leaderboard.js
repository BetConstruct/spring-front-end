/* global VBET5 */
/**
 * @ngdoc controller
 * @name vbet5.controller:pokerLeaderBoardCtrl
 * @description
 * Classic mode Explorer controller
 */
VBET5.controller('pokerLeaderBoardCtrl', ['$filter', '$scope', function ($filter, $scope) {
    'use strict';

    $scope.leaderBoardFormData = {
        entrants: 5,
        buyIns: [
            {value: "1.1", name: "1.1"},
            {value: "4.4", name: "4.4"},
            {value: "6.6", name: "6.6"},
            {value: "11", name: "11"}
        ],
        position: 1
    };
    $scope.leaderBoardFormData.buyIn = $scope.leaderBoardFormData.buyIns[0].value;

    /**
     * @ngdoc method
     * @name calculateLeaderBoard
     * @methodOf vbet5.controller:pokerLeaderBoardCtrl
     * @description Calculate leader board
     */
    $scope.calculateLeaderBoard = function calculateLeaderBoard() {
        $scope.leaderBoardFormData.points =  $filter('number')(Math.sqrt($scope.leaderBoardFormData.buyIn * 100 * $scope.leaderBoardFormData.entrants / $scope.leaderBoardFormData.position), 0);
    };

    $scope.calculateLeaderBoard();
}]);
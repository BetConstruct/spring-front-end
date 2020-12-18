/**
 * @ngdoc controller
 * @name vbet5.controller:blitzsurveyCtrl
 * @description
 *  blitzsurveyCtrl to send info about games user can play
 */
VBET5.controller('blitzsurveyCtrl', ['$scope', 'Zergling', function ($scope, Zergling) {
    'use strict';

    $scope.noGames = false;
    $scope.gameSurvey = {
        chinesepoker: false,
        livecasino: false,
        poker: false,
        backgammon: false,
        belote: false
    };
    $scope.active = !parseInt($scope.profile.games, 10);

    /**
     * @ngdoc method
     * @name noneSelected
     * @methodOf vbet5.controller:blitzsurveyCtrl
     * @description removes checkboxes from games options if no games selected
     */
    $scope.noneSelected = function noneSelected() {
        if ($scope.noGames) {
            for ( var key in $scope.gameSurvey){
                if($scope.gameSurvey.hasOwnProperty(key)){
                    $scope.gameSurvey[key] = false;
                }
            }
        }
    };

    $scope.sendAnswers = function () {
        var knownGames = '';
        if($scope.noGames){
            knownGames = 'none;';
        }else {
            angular.forEach( $scope.gameSurvey, function (value, key) {
                if (value) {
                    knownGames += key + ';';
                }
            });
        }

        Zergling.get({games: knownGames}, 'set_player_games').then(function (response) {
            $scope.closeSurvey();
        });
    };
    $scope.closeSurvey = function () {
        $scope.active = false;
    };
}]);

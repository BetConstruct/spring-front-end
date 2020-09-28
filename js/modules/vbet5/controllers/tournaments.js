/* global VBET5 */
/**
 * @ngdoc controller
 * @name vbet5.controller:homepageTournaments
 * @description
 *  poker login controller
 */
VBET5.controller('homepageTournaments', ['$scope', 'Zergling', 'Translator', 'Utils', function ($scope, Zergling, Translator, Utils) {
    'use strict';
    $scope.tournamentsLoadComplete = false;

    $scope.options = [
        {label: Translator.get("Backgammon"), value: 1, href: "#/backgammon/"},
        {label: Translator.get("Chinese Poker"), value: 2, href: "#/games/"}
    ];

    $scope.tournamentModel = {selectedTournament: $scope.options[0]};
    //1 backgammon
    //2 chines epoker


    /**
     * @ngdoc method
     * @name getPokerLeaderboard
     * @methodOf vbet5.controller:homepageTournaments
     * @description Get poker leaderboard from backend
     */
    $scope.getPokerLeaderboard = function getPokerLeaderboard() {
        Zergling.get({count: 6}, 'casino_get_player_points').then(function (response) {
            if (response) {
                $scope.pokerLeaderboard = response;
            }
        });
    };

    /**
     * @ngdoc method
     * @name getBackgammonTournamentList
     * @methodOf vbet5.controller:homepageTournaments
     * @description Get backgammon tournament list from backend
     */
    $scope.getBackgammonTournamentList = function getBackgammonTournamentList() {
        Zergling.get({}, 'get_skillgames_tournaments_schedule').then(function (response) {
            if (response && response.details) {
                $scope.backgammonTournamentList = Utils.objectToArray(response.details);
            }
        });
    };


}]);
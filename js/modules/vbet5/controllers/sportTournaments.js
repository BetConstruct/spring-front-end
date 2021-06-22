/**
 * @ngdoc controller
 * @name CASINO.controller:casinoTournamentsCtrl
 * @description
 * tournaments page controller
 */

VBET5.controller('sportTournamentsCtrl', ['$rootScope', '$controller', '$scope', '$location', '$timeout', 'Config', 'Translator', 'Zergling', 'AuthData', 'LanguageCodes', 'Moment', 'Geoip', 'analytics', 'Utils', function ($rootScope, $controller, $scope, $location, $timeout, Config, Translator, Zergling, AuthData, LanguageCodes, Moment, Geoip, analytics, Utils) {
    'use strict';
    angular.extend(this, $controller('tournamentBaseCtrl', {
        $scope: $scope,
        $rootScope: $rootScope,
        $location: $location,
        $timeout: $timeout,
        Config: Config,
        Translator:Translator,
        Zergling:Zergling,
        AuthData: AuthData,
        LanguageCodes: LanguageCodes,
        Moment: Moment,
        Geoip: Geoip,
        analytics: analytics,
        Utils: Utils,
        filterConfig: Config.main.sportTournaments.filters,
        productTypeId: 2
    }));

    /**
     * @ngdoc method
     * @name updateFilters
     * @methodOf CASINO.controller:casinoTournamentsCtrl
     * @description Update tournaments by filter once loaded or changed
     */
    $scope.updateFilters = function updateFilters(filterGroupSource, filterSource, okButton) {
        $scope.updateFiltersBase(filterGroupSource, filterSource, okButton, false);
    };

    /**
     * @ngdoc method
     * @name getTournamentList
     * @methodOf CASINO.controller:casinoTournamentsCtrl
     * @description Load tournaments
     */
    $scope.getTournamentList = function getTournamentList(firstTime) {
        $scope.getTournamentListBase(firstTime, false, 2);
    };

    /**
     * @ngdoc method
     * @name selectTournament
     * @methodOf CASINO.controller:casinoTournamentsCtrl
     * @description Get tournamnt detailed information
     */
    $scope.selectTournament = function selectTournament(tournamentId) {
        if ($location.path() !== '/sport-tournaments/') {
            $location.path('/sport-tournaments/');
        }
        $location.search('tournament_id', tournamentId);
    };


    /**
     * @ngdoc method
     * @name openTournamentDetails
     * @methodOf CASINO.controller:casinoTournamentsCtrl
     * @description Open tournament details
     */
    $scope.openTournamentDetails = function openTournamentDetails(tournamentId, refresh, firstTime) {
        $scope.openTournamentDetailsBase(tournamentId, refresh, firstTime);
    };

    $scope.initWatchers = function initWatchers() {

        $scope.initWatchersBase();


        $scope.$on('goToHomepage', function () {
            $location.search('tournament_id', undefined);
        });
    };

    /**
     * @ngdoc method
     * @name refreshTournamentData
     * @methodOf CASINO.controller:casinoTournamentsCtrl
     * @description Refresh data after login, logout, session restore
     */
    $scope.refreshTournamentData = function refreshTournamentData () {
        $scope.refreshTournamentDataBase();
    };

}
]);

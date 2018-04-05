/**
 * @ngdoc controller
 * @name vbet5.controller:statisticsCtrl
 */
VBET5.controller('statisticsCtrl', ['$rootScope', '$scope', '$sce', 'Config','Moment', '$location', function($rootScope, $scope, $sce, Config,Moment, $location) {
    $rootScope.footerMovable = true;
    /**
     * @ngdoc method
     * @name initStatistics
     * @methodOf vbet5.controller:statisticsCtrl
     * @description Initialization
     */
    $scope.initStatistics = function initStatistics() {
        $scope.setTitle('Statistics');

        /*
        * Temporary solution for Statistics URL
        */
        if (Config.main.header.statisticsLink && $location.host().search('betcon.net') !== -1) {
            $scope.statsUrl = $sce.trustAsResourceUrl(Config.main.header.statisticsLink + '#/' + Moment.getStatisticsLang());
        }
        else {
            $scope.statsUrl = $sce.trustAsResourceUrl(Config.main.header.statisticsLink + '/#/' + Moment.getStatisticsLang());
        }

    }
}]);

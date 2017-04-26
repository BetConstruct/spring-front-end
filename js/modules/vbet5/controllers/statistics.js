/**
 * @ngdoc controller
 * @name vbet5.controller:statisticsCtrl
 */
VBET5.controller('statisticsCtrl', ['$rootScope', '$scope', '$sce', 'Config','Moment', function($rootScope, $scope, $sce, Config,Moment) {
    $rootScope.footerMovable = true;
    /**
     * @ngdoc method
     * @name initStatistics
     * @methodOf vbet5.controller:statisticsCtrl
     * @description Initialization
     */
    $scope.initStatistics = function initStatistics() {
        $scope.setTitle('Statistics');
        $scope.statsUrl = $sce.trustAsResourceUrl(Config.main.headerStatisticsLink + '/#/' + Moment.getStatisticsLang());
    }
}]);

/**
 * @ngdoc controller
 * @name vbet5.controller:homepageCtrl
 * @description
 * Open Games controller
 */
angular.module('vbet5.betting').controller('homepageCtrl', ['$rootScope', '$scope', '$interval', '$location', 'analytics', 'Moment', 'Config', 'WPConfig', 'content', function ($rootScope, $scope, $interval, $location, analytics, Moment, Config, WPConfig, content) {
    'use strict';

    /**
     * @ngdoc method
     * @name getHomepageBanners
     * @methodOf vbet5.controller:homepageCtrl
     * @description   populates $scope's **homepageBanners** variable with banner information got from cms
     *
     * @param {string} [containerId] optional. id of container to get banner for
     */
    $scope.getHomepageRightBanners = function getHomepageRightBanners(containerId) {
        console.log('getHomepageRightBanners');
        containerId = containerId || content.getSlug('bannerSlugs.homepageRightBanners');
        content.getWidget(containerId).then(function (response) {
            if (response.data && response.data.widgets && response.data.widgets[0]) {
                $scope.homepageRightBanners = [];
                angular.forEach(response.data.widgets, function (widget) {
                    $scope.homepageRightBanners.push(widget.instance);
                });
            }

        });
    };


    var FIFA_START_DATE = '2014-06-13 00:00:01';
    function clock() {
        $scope.timer = Moment.get().diff(FIFA_START_DATE) < 0 ? Moment.get().preciseDiff(FIFA_START_DATE) : null;
    }
    if (Config.env.showFifaCountdown) {
        $interval(clock, 1000);
    }

    /**
     * @ngdoc method
     * @name bannerClick
     * @methodOf CMS.controller:homepageCtrl
     * @description sends ga message
     *
     * @param {Object} [banner]  current object of slider
     */
    $scope.bannerClick = function bannerClick(banner) {
        analytics.gaSend('send', 'event', 'news', {'page': $location.path(), 'eventLabel': 'homepage small banner click: ' + banner.title});
    };


}]);
/**
 * @ngdoc controller
 * @name vbet5.controller:idTokenCtrl
 * @description
 * login controller
 */
angular.module('vbet5').controller('homepageCountdown', ['$scope', 'content', function ($scope, content) {
    'use strict';

    (function init() {
        $scope.now  = new Date().getTime() / 1000;
        $scope.isLoading = true;
        content.getWidget($scope.countdownWidgetName || 'bannerSlugs.countdownBanner').then(function (response) {
            if (response.data && response.data.widgets && response.data.widgets[0]) {
                $scope.banners = [];
                angular.forEach(response.data.widgets, function (widget) {
                    $scope.banners.push(widget.instance);
                });
            }
            $scope.isLoading = false;
        });
    })();

}]);

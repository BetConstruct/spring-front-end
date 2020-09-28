/**
 * @ngdoc controller
 * @name VBET5.controller:pinnacleCtrl
 * @description
 * pinnacle controller
 */

VBET5.controller('pinnacleCtrl', ['$rootScope', '$scope', '$sce',   'Config', 'Zergling', function ($rootScope, $scope, $sce, Config, Zergling) {
    'use strict';


    $rootScope.footerMovable = true; // make footer movable
    var ODD_TYPE_MAP = {
        'decimal': 0,
        'fractional': 1,
        'american': 2,
        'hongkong': 3,
        'malay': 4,
        'indo': 5
    };

    function constructUrl () {
        $scope.loadingUserData = true;

        Zergling.get({odd_type: ODD_TYPE_MAP[$rootScope.env.oddFormat]}, "pinnacle_login").then(function(response) {
            if (response.details && response.details.loginUrl) {
                $scope.frameUrl = $sce.trustAsResourceUrl(response.details.loginUrl);
            }
        })['finally'](function () {
            $scope.loadingUserData = false;
        });
    }

    $scope.$watch('env.authorized', function (newValue) {
        if (!newValue) {
            $rootScope.env.showSlider = true;
            $rootScope.env.sliderContent = 'login';
            $scope.frameUrl = null;
        } else {
            constructUrl();
        }
    });

    $scope.$on("$destroy", function () {
        $scope.frameUrl = null;
    });
}]);

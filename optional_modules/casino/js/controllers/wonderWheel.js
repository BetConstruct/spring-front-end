/**
 * @ngdoc controller
 * @name VBET5.controller:pinnacleCtrl
 * @description
 * pinnacle controller
 */

VBET5.controller('wonderWheelCtrl', ['$rootScope', '$scope', '$sce', '$timeout', 'LanguageCodes', 'AuthData', 'Config', function ($rootScope, $scope, $sce, $timeout, LanguageCodes, AuthData, Config) {
    'use strict';

    $rootScope.footerMovable = true; // make footer movable

    var BASE_URL = "https://luckywheel.vivarobet.am";

    function constructUrlForLoggedInUser() {
        $scope.frameUrl = $sce.trustAsResourceUrl(BASE_URL + "/?langId=" + LanguageCodes[$rootScope.env.lang] + "&partnerId=" + Config.main.site_id + "&token=" + AuthData.getAuthToken());
    }

    function constructUrlForLoggedOutUser() {
        $scope.frameUrl = $sce.trustAsResourceUrl(BASE_URL + "/?langId=" + LanguageCodes[$rootScope.env.lang] + "&partnerId=" + Config.main.site_id);
    }

    $scope.$on('loggedIn', function() {
        $scope.frameUrl = null;
        $timeout(constructUrlForLoggedInUser, 100);
    });

    $scope.$on('login.loggedOut', function() {
        $scope.frameUrl = null;
        $timeout(constructUrlForLoggedOutUser, 100);
    });


    if (!$rootScope.loginInProgress) {
        //$sce.trustAsResourceUrl
        if ($rootScope.profile) {
            constructUrlForLoggedInUser();
        } else {
            constructUrlForLoggedOutUser();
        }
    }

    $scope.$on("$destroy", function () {
        $scope.frameUrl = null;
    });
}]);

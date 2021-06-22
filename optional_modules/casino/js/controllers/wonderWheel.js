/**
 * @ngdoc controller
 * @name VBET5.controller:pinnacleCtrl
 * @description
 * pinnacle controller
 */

VBET5.controller('wonderWheelCtrl', ['$rootScope', '$scope', '$sce', '$timeout', '$window', 'LanguageCodes', 'AuthData', 'CConfig', function ($rootScope, $scope, $sce, $timeout, $window, LanguageCodes, AuthData, CConfig) {
    'use strict';

    $rootScope.footerMovable = true; // make footer movable

    var BASE_URL = (function() {
        if (CConfig.wonderWheel.apiUrl) {
            return CConfig.wonderWheel.apiUrl;
        }
        if ($window.location.hostname === "localhost") {
            return "https://luckywheel.vivarobet.am";
        }
        return $window.location.protocol + "//luckywheel." + $window.location.hostname.replace('www.','') + "/";
    })();

    function constructUrl() {
        $scope.frameUrl = $sce.trustAsResourceUrl(BASE_URL + "?langId=" + LanguageCodes[$rootScope.env.lang] + "&partnerId=" + $rootScope.conf.site_id + ($rootScope.env.authorized ? "&token=" + AuthData.getAuthToken() : ""));
    }

    $scope.$on('loggedIn', function() {
        $scope.frameUrl = null;
        $timeout(constructUrl, 100);
    });

    $scope.$on('login.loggedOut', function() {
        $scope.frameUrl = null;
        $timeout(constructUrl, 100);
    });


    if (!$rootScope.loginInProgress) {
        constructUrl();
    }

    $scope.$on("$destroy", function () {
        $scope.frameUrl = null;
    });
}]);

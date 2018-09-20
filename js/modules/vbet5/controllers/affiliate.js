/**
 * @ngdoc controller
 * @name vbet5.controller:betStatusCtrl
 */
VBET5.controller('affiliateCtrl', ['$scope', '$window', '$http', '$location', '$q', '$timeout', 'Config', '$cookies', 'Storage', function ($scope, $window, $http, $location, $q, $timeout, Config, $cookies, Storage) {
    'use strict';
    (function() {
        var btag = Storage.get('promo_code') || $cookies.get('promo_code');
        var defaultPath = '#/sport/';
        var defaultLocation = $window.origin + defaultPath;
        if (!btag) {
            $location.path(defaultPath);
            return;
        }

        var apiUrl =  'https://betco.link/global/api/linkCreator/getRedirectUrl';
        var canceller = $q.defer();
        var timeoutPrimise;

        var cancelTimeOut = function() {
            if (timeoutPrimise) {
                $timeout.cancel(timeoutPrimise);
                timeoutPrimise = undefined;
            }
        };
        var handleRedirection = function(path) {
            cancelTimeOut();
            $window.location = path;
        };

        $http({
            method: 'POST',
            url: apiUrl,
            data: {
                btag: btag,
                partnerId: Config.main.site_id
            },
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            timeout : canceller.promise
        }).success(function(response) {
            var path = defaultLocation;
            if (response.status && response.result) {
                if (response.result.indexOf($window.origin) === -1 || response.result.indexOf('#') !== -1) {
                    path = response.result;
                    return;
                } else {
                    path = $window.origin + response.result.replace($window.origin, '/#');
                }
            }
            handleRedirection(path);
        }).error(function() {
            handleRedirection(defaultLocation);
        });

        timeoutPrimise = $timeout(function() {
            canceller.resolve();
        }, 2000);

        $scope.$on('$destroy', function() {
            cancelTimeOut();
            $location.search('btag', undefined);
        });
    })();
}]);

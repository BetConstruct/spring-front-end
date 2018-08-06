/**
 * @ngdoc controller
 * @name vbet5.controller:betStatusCtrl
 */
VBET5.controller('affiliateCtrl', ['$scope', '$window', '$http', '$location', '$q', '$timeout', 'Config', '$cookies', 'Storage', function ($scope, $window, $http, $location, $q, $timeout, Config, $cookies, Storage) {
    'use strict';
    (function() {
        var btag = Storage.get('promo_code') || $cookies.get('promo_code');
        var defaultPath = '/sport/';

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
            $location.path(path);
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
            var path = defaultPath;
            if (response.status && response.result) {
                if (response.result.indexOf($window.origin) === -1) {
                    $window.location = response.result;
                    return;
                } else if (response.result.indexOf('#') !== -1) {
                    path = response.result;
                } else {
                    path = $window.origin + response.result.replace($window.origin, '/#');
                }
            }
            handleRedirection(path);
        }).error(function() {
            handleRedirection(defaultPath);
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

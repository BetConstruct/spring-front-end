/* global VBET5 */
/**
 * @ngdoc service
 * @name vbet5.service:Geoip
 * @description
 *
 * service to get geolocation data by ip.  uses ipinfodb.com public API
 * account login/password is vbetcom/vbetcom
 *
 */

VBET5.service('Geoip', ['$http', '$q', '$location', 'Config', '$timeout', function ($http, $q, $location, Config, $timeout) {
    'use strict';
    var Geoip = {}, data = null, promise = null;

    if ($location.search().nogeoip) {
        Config.geoIP.callbackUrl = '';
        Config.geoIP.callbackUrlCity = '';
    }

    /**
     * @ngdoc method
     * @name getCountry
     * @methodOf vbet5.service:Geoip
     * @description returns promise that will be resolved with object containing geo data (country).
     */
    Geoip.getCountry = function getCountry() {
        var promise = $q.defer();

        $http.get(Config.geoIP.callbackUrl)
             .then(function (response) {
                return promise.resolve(response.data);
            }, function (reason) {
                return $q.reject(reason.data);
            });
        return promise.promise;
    };


    /**
     * @ngdoc method
     * @name getGeoData
     * @methodOf vbet5.service:Geoip
     * @description returns promise that will be resolved with object containing geo data.
     *
     * example:
     *
     *    {
     *     "statusCode" : "OK",
     *     "statusMessage" : "",
     *     "ipAddress" : "91.103.58.142",
     *     "countryCode" : "AM",
     *     "countryName" : "ARMENIA",
     *     "regionName" : "YEREVAN",
     *     "cityName" : "YEREVAN",
     *     "zipCode" : "-",
     *     "latitude" : "40.1811",
     *     "longitude" : "44.5136",
     *     "timeZone" : "+05:00"
     *   }
     *
     * @param {Boolean} noCache if true, requests will be done on every call, if no, only once and response will be cached
     * @returns {Object} promise
     */
    Geoip.getGeoData = function getGeoData(noCache) {
        var deferred = $q.defer();
        if (!noCache && data) {
            deferred.resolve(data);
            return deferred.promise;
        }

        if (promise) {
            return promise;
        }
        $http.get(Config.geoIP.callbackUrlCity)
            .then(function (response) {
                if (promise !== null) {
                    promise = null;
                    if (response.data && response.data.statusCode === 'OK') {
                        data = response.data;
                        deferred.resolve(response.data);
                    } else {
                        deferred.resolve();
                    }
                }
            }, function (reason) {
                 if (promise !== null) {
                     promise = null;
                     deferred.reject(reason.data);
                 }
            });
        $timeout(function () {
            if (promise !== null) {
                promise = null;
                deferred.reject();
            }
        }, 5000);
        promise = deferred.promise;
        return promise;
    };

    return Geoip;

}]);

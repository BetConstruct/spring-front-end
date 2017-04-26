/* global VBET5 */
/**
 * @ngdoc service
 * @name vbet5.service:AuthData
 * @description  Authentication data storage (stores in local storage or memory depending on integration mode)
 */
VBET5.service('AuthData', ['$window', '$cookies', 'Config', 'Storage', function ($window, $cookies, Config, Storage) {
    'use strict';
    var AuthData = {};
    AuthData.partnerAuthData = null;
    AuthData.integrationMode = false;

    /**
     * @ngdoc method
     * @name set
     * @methodOf vbet5.service:AuthData
     * @description setter
     *
     * @param {Object} data auth data object
     */
    AuthData.set = function set(data) {
        if (AuthData.integrationMode) {
            AuthData.partnerAuthData = data;
        } else {
            Storage.set('auth_data', data, data.never_expires ? null : Config.main.authSessionLifetime);
            if (Config.main.useAuthCookies) {
                var cookieOptions = {
                    domain: $window.location.hostname.split(/\./).slice(-2).join("."),
                    path: "/",
                    expires: new Date((new Date()).getTime() + (data.never_expires ? Config.main.saveLoginDataLifeTime : Config.main.authSessionLifetime))
                };
                $cookies.putObject("auth_data", data, cookieOptions);
            }
        }

    };

    /**
     * @ngdoc method
     * @name get
     * @methodOf vbet5.service:AuthData
     * @description getter
     *
     * @returns {Object} data auth data object
     */
    AuthData.get = function get() {
        return AuthData.integrationMode ? AuthData.partnerAuthData : (Config.main.useAuthCookies ?  $cookies.getObject('auth_data') : Storage.get('auth_data'));
    };

    /**
     * @ngdoc method
     * @name clear
     * @methodOf vbet5.service:AuthData
     * @description removes stored auth data
     *
     * @returns {Object} data auth data object
     */
    AuthData.clear = function clear() {
        if (AuthData.integrationMode) {
            AuthData.partnerAuthData = null;
        } else {
            Storage.remove('auth_data');
            if (Config.main.useAuthCookies) {
                $cookies.remove('auth_data');
                AuthData.set('');
            }
        }
    };

    /**
     * @ngdoc method
     * @name getAuthToken
     * @methodOf vbet5.service:AuthData
     * @description returns auth token if present in auth data
     *
     * @returns {String} auth token
     */
    AuthData.getAuthToken = function getAuthToken() {
        var data = AuthData.get();
        return data ? data.auth_token : null;
    };

    return AuthData;

}]);

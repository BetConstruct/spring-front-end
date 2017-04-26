/* global VBET5 */
/**
 * @ngdoc controller
 * @name vbet5.controller:pokerLoginCtrl
 * @description
 *  poker login controller
 */
VBET5.controller('pokerLoginCtrl', ['$rootScope', '$scope', '$filter', 'AuthData',  function ($rootScope, $scope, $filter, AuthData) {
    'use strict';
    $scope.$on("profile", function (event, data) {
        var authData = AuthData.get() || {};
        var profileData = data && data.profile ? $filter('firstElement')(data.profile) : {};
        $rootScope.pokerLoginData = {
            "UserID": authData.user_id,
            "userName": authData.login,
            "UniqueID": profileData.unique_id,
            "PasswordHash": authData.auth_token
        };
    });

    $scope.$on('login.loggedOut', function () {
        $rootScope.pokerLoginData = {};
    });
}]);
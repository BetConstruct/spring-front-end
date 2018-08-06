/**
 * @ngdoc controller
 * @name vbet5.controller:betOnPolitics
 */
VBET5.controller('betOnPoliticsCtrl', ['$rootScope', '$scope', '$sce', 'Config', 'AuthData', 'LanguageCodes', function($rootScope, $scope, $sce, Config, AuthData, LanguageCodes) {
    'use strict';
    $rootScope.footerMovable = true;
    var iframe, canLogIn = false;

    function initBetOnPolitics() {
        $scope.frameUrl = '';
        $scope.loading = true;

        var url = Config.main.betOnPolitics;
        url = url.substring(url.length-1) === '/' ? url : url + '/';
        var lang = 'en';
        if ($rootScope.env) {
            lang = LanguageCodes[$rootScope.env.lang];
        }
        url += lang + '/iframe-sportsbook/?show-layout=body'; // hides header and footer of iframe content
        if ($rootScope.profile) {
            var authToken = AuthData.getAuthToken();
            var userId = $rootScope.profile.id;
            url += '&userID=' + userId + '&authToken=' + authToken;
            canLogIn = true;
        }
        $scope.frameUrl = $sce.trustAsResourceUrl(url);
        iframe = document.querySelector('#bet-on-politics');

        iframe.onload = function stopLoader() {
            $scope.loading = false;
        };

        if (!canLogIn) {
            window.addEventListener('message', listenForOpenSocket);
            angular.element(iframe).on('$destroy', function onDestroy() {
                window.removeEventListener('message', listenForOpenSocket);
            });
        }
    }

    function listenForOpenSocket(message) {
        if (message.data && message.data.info === "socketConnected") {
            canLogIn = true;
            login();
            window.removeEventListener('message', listenForOpenSocket);
        }
    }

    function login() {
        if (canLogIn && $rootScope.profile) {
            var authToken = AuthData.getAuthToken();
            var userId = $rootScope.profile.id;
            iframe.contentWindow.postMessage({
                action: 'login',
                credentials: {
                    playerId: userId,
                    authToken: authToken
                }
            }, '*');
        }
    }

    function logout() {
        iframe.contentWindow.postMessage({ action: 'logout'}, '*');
    }

    (function init() {
        initBetOnPolitics();
    })();

    $scope.$on('loggedIn', login);
    $scope.$on('login.loggedIn', login);
    $scope.$on('login.loggedOut', logout);
}]);

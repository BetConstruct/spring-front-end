/**
 * @ngdoc controller
 * @name vbet5.controller:betOnPolitics
 */
VBET5.controller('betOnPoliticsCtrl', ['$rootScope', '$scope', '$sce', '$location', 'Config', 'AuthData', 'LanguageCodes', function($rootScope, $scope, $sce, $location, Config, AuthData, LanguageCodes) {
    'use strict';
    $rootScope.footerMovable = true;
    var iframe, socketConnected = false;

    function createUrl() {
        var url = Config.main.betOnPolitics;
        url = url.substring(url.length-1) === '/' ? url : url + '/';
        var lang = 'en';
        if ($rootScope.env) {
            lang = LanguageCodes[$rootScope.env.lang];
        }
        url += lang + '/iframe-sportsbook';// hides header and footer of iframe content

        //handle and add deeplinking parameters
        var params = $location.search();
        if (params.page) {
            url += '/' + params.page;
        }
        if (params.category) {
            url += '/' + params.category;
        }
        if (params.alias) {
            url += '/' + params.alias;
        }
        url += '?show-layout=body';

        return $sce.trustAsResourceUrl(url);
    }

    function initBetOnPolitics() {
        $scope.loading = true;
        $scope.frameUrl = createUrl();
        iframe = document.querySelector('#bet-on-politics');

        iframe.onload = function stopLoader() {
            $scope.loading = false;
        };

        window.addEventListener('message', listenForOpenSocket);
        angular.element(iframe).on('$destroy', function onDestroy() {
            window.removeEventListener('message', listenForOpenSocket);
        });
    }

    function listenForOpenSocket(message) {
        if (message.data && message.data.info === "socketConnected") {
            socketConnected = true;
            login();
        }
    }

    function login() {
        if (socketConnected && $rootScope.profile) {
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
    $scope.$on('login.loggedOut', logout);
}]);

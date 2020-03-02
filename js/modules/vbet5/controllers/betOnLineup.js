/**
 * @ngdoc controller
 * @name vbet5.controller:pmuCtrl
 */
VBET5.controller('lineupCtrl', ['$rootScope', '$scope', '$sce', '$timeout', '$location', '$window', 'AuthData', 'Config', function ($rootScope, $scope, $sce, $timeout, $location, $window, AuthData, Config) {
    'use strict';

    $rootScope.footerMovable = true;
    var frame = document.getElementById('lineup-frame');

    function sendMessageTo(message) {
        frame.contentWindow.postMessage(message, '*');
    }

    function sendAuthData() {
        var authData = AuthData.get();
        sendMessageTo({action: 'restore_login', data: {user_id: authData.user_id, auth_token: authData.auth_token}});
    }

    function onLoadHandler(message) {
        if (message.data && message.data.action === 'appReady') {
            $window.removeEventListener('message', onLoadHandler);

            //send initial settings to the frame
           /* sendMessageTo({
                action: 'initialConfig',
                data: {
                    site_id: Config.main.site_id,
                    lang: $rootScope.env.lang
                }
            });*/
            // sendMessageTo({action: 'setRouteState', data: $location.search()});

            /*if ($rootScope.env.authorized) {
                sendAuthData();
            }*/

            /*$scope.$watch('env.sliderContent', function (newValue, oldValue) {
                if (newValue || oldValue) { // skipping initial state
                    sendMessageTo({action: 'slider', data: {content: newValue || oldValue, isOpen: !!newValue}});
                }
            });*/

            $scope.$watch('env.authorized', function (newValue, oldValue) {
                if (newValue || oldValue) { // skipping initial state
                    if (newValue) {
                        sendAuthData();
                    } else {
                        sendMessageTo({action: 'logout'});
                    }
                }
            });
        }
    }

    (function init() {
        $scope.lineupUrl = $sce.trustAsResourceUrl((Config.betOnlineup && Config.betOnlineup.url || "https://betonlineups.betcoapps.com/iframe/bet-on-lineups/home") + "?lang=" + $rootScope.env.lang);
        $window.addEventListener('message', onLoadHandler);
    })();

    $scope.$on("$destroy", function () {
        $scope.lineupUrl = null;
    });
}]);

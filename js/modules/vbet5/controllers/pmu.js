/**
 * @ngdoc controller
 * @name vbet5.controller:pmuCtrl
 */
VBET5.controller('pmuCtrl', ['$rootScope', '$scope', '$sce', '$timeout', '$location', '$window', 'AuthData', 'Config', function ($rootScope, $scope, $sce, $timeout, $location, $window, AuthData, Config) {
    'use strict';

    $rootScope.footerMovable = true;
    var frame = document.getElementById('pmu-frame');

    function sendMessageToPMU(message) {
        frame.contentWindow.postMessage(message, '*');
    }

    function sendAuthData() {
        var authData = AuthData.get();
        sendMessageToPMU({action: 'restore_login', data: {user_id: authData.user_id, auth_token: authData.auth_token}});
    }

    function onLoadHandler(message) {
        if (message.data && message.data.action === 'appReady') {
            $window.removeEventListener('message', onLoadHandler);

            //send initial settings to the frame
            sendMessageToPMU({
                action: 'initialConfig',
                data: {
                    site_id: Config.main.site_id,
                    lang: $rootScope.env.lang
                }
            });
            sendMessageToPMU({action: 'setRouteState', data: $location.search()});

            if ($rootScope.env.authorized) {
                sendAuthData();
            }

            $scope.$watch('env.sliderContent', function (newValue, oldValue) {
                if (newValue || oldValue) { // skipping initial state
                    sendMessageToPMU({action: 'slider', data: {content: newValue || oldValue, isOpen: !!newValue}});
                }
            });

            $scope.$watch('env.authorized', function (newValue, oldValue) {
                if (newValue || oldValue) { // skipping initial state
                    if (newValue) {
                        sendAuthData();
                    } else {
                        sendMessageToPMU({action: 'logout'});
                    }
                }
            });
        }
    }

    (function init() {
        $scope.pmuUrl = $sce.trustAsResourceUrl(Config.pmu.url);
        $window.addEventListener('message', onLoadHandler);
    })();

    $scope.$on("$destroy", function () {
        $scope.pmuUrl = null;
        $window.removeEventListener('message', onLoadHandler);
    });
}]);

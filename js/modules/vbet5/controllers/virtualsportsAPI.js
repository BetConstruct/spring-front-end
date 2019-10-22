/**
 * @ngdoc controller
 * @name vbet5.controller:virtualSportsAPICtrl
 */
VBET5.controller('virtualSportsAPICtrl', ['$rootScope', '$scope', '$sce', '$timeout', '$location', '$window', 'AuthData', 'Config', function ($rootScope, $scope, $sce, $timeout, $location, $window, AuthData, Config) {
    'use strict';

    $rootScope.footerMovable = true;
    var frame = document.getElementById('vs-frame');

    function sendMessageToVirtualAPI(message) {
        frame.contentWindow.postMessage(message, '*');
    }

    function sendAuthData() {
        var authData = AuthData.get();
        sendMessageToVirtualAPI({action: 'login', user_id: authData.user_id, auth_token: authData.auth_token});
    }

    function onLoadHandler(message) {
        if (message.data && message.data.type === 'applicationReady') {
            $window.removeEventListener('message', onLoadHandler);

            $scope.$watch('env.authorized', function (newValue, oldValue) {
                if (newValue || oldValue) {
                    if (newValue) {
                        sendAuthData();
                    } else {
                        sendMessageToVirtualAPI({action: 'logout'});
                    }
                }
            });
        }
    }

    (function init() {
        $scope.vsUrl = $sce.trustAsResourceUrl("http://virtual.staging-web.xyz/#/virtualsports"); //Config.virtualAPIUrl
        $window.addEventListener('message', onLoadHandler);
    })();

    $scope.$on("$destroy", function () {
        $scope.vsUrl = null;
    });
}]);

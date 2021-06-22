/* global VBET5 */
/**
 * @ngdoc directive
 * @name vbet5.directive: casinoIframeProduct
 *
 * @description display selected product as iframe
 *
 */
VBET5.directive('integratedIframeProduct', ['$rootScope', '$sce', '$timeout', '$location', '$window', 'AuthData', 'Config', 'WPConfig', function ($rootScope, $sce, $timeout, $location, $window, AuthData, Config, WPConfig) {
    'use strict';

    return {
        restrict: 'E',
        replace: false,
        templateUrl: 'templates/integratedIframeProducts/iframe.html',
        scope: {
            configKey: '@'
        },
        link: function ($scope) {
            var config = null;

            var ODD_TYPE_MAP = {
                'decimal': 0,
                'fractional': 1,
                'american': 2,
                'hongkong': 3,
                'malay': 4,
                'indo': 5
            };

            $rootScope.footerMovable = true;
            var frame = document.getElementById('sport-frame');

            function sendMessageToFrame(message) {
                frame.contentWindow.postMessage(message, '*');
            }

            function sendAuthData() {
                var authData = AuthData.get();
                sendMessageToFrame({action: 'restore_login', data: {user_id: authData.user_id, auth_token: authData.auth_token}});
            }

            function onLoadHandler(message) {
                if (message.data && message.data.action === 'appReady') {
                    $window.removeEventListener('message', onLoadHandler);
                    var cmsBaseHost = WPConfig.wpBaseHost[$location.host()] || WPConfig.wpBaseHost['default'] || WPConfig.wpBaseHost;

                    var authData = AuthData.get();
                    var lang = $rootScope.env.lang;
                    if (config.langMap && config.langMap[lang]) {
                        lang= config.langMap[lang];
                    }
                    var data = {
                        site_id: Config.main.site_id,
                        lang: lang,
                        oddType: ODD_TYPE_MAP[$rootScope.env.oddFormat],
                        cmsBaseHost: cmsBaseHost,
                        socketUrl: Config.swarm.websocket[0].url
                    };
                    if (authData) {
                        data.authData = {
                            user_id: authData.user_id,
                            auth_token: authData.auth_token
                        };
                    }
                    if (Config.partner.balanceRefreshPeriod) {
                        data.partner = {
                            balanceRefreshPeriod: Config.partner.balanceRefreshPeriod
                        };
                    }
                    //send initial settings to the frame
                    sendMessageToFrame({
                        action: 'initialConfig',
                        data: data
                    });
                    sendMessageToFrame({action: 'setRouteState', data: $location.search()});

                    if ($rootScope.env.authorized) {
                        sendAuthData();
                    }

                    $scope.$watch('$root.env.sliderContent', function (newValue, oldValue) {
                        if (newValue || oldValue) { // skipping initial state
                            sendMessageToFrame({action: 'slider', data: {content: newValue || oldValue, isOpen: !!newValue}});
                        }
                    });

                    $scope.$watch('$root.env.oddFormat', function (newValue, oldValue) {
                        if (newValue || oldValue) { // skipping initial state
                            sendMessageToFrame({ action: "setConfig", data: { oddType: ODD_TYPE_MAP[$rootScope.env.oddFormat] } });
                            sendMessageToFrame({ action: "setPreferences", data: { oddFormat: ODD_TYPE_MAP[$rootScope.env.oddFormat] } });
                        }
                    });

                    $scope.$watch('$root.env.timeFormat', function (newValue, oldValue) {
                        if (newValue || oldValue) { // skipping initial state
                            sendMessageToFrame({ action: "setPreferences", data: { timeFormat: $rootScope.env.timeFormat } });
                        }
                    });

                    $scope.$watch('$root.env.authorized', function (newValue, oldValue) {
                        if (newValue || oldValue) { // skipping initial state
                            if (newValue) {
                                sendAuthData();
                            } else {
                                sendMessageToFrame({action: 'logout'});
                            }
                        }
                    });
                }
            }

            (function init() {
                if(Config[$scope.configKey]) {
                    config = Config[$scope.configKey];

                    var url = (function() {
                        if (config.url) {
                            return config.url;
                        }
                        if ($window.location.hostname === "localhost") {
                            return "https://" + config.name + ".betcoapps.com/";
                        }

                        return $window.location.protocol + "//" + config.name + "." + $window.location.hostname.replace('www.','') + "/";
                    })();

                    $scope.iframeUrl = $sce.trustAsResourceUrl(url);
                    $window.addEventListener('message', onLoadHandler);
                }
            })();

            $scope.$on("$destroy", function () {
                $scope.productIframeUrl = null;
                $window.removeEventListener('message', onLoadHandler);
            });
        }
    };
}]);

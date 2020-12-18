/* global VBET5 */
/**
 * @ngdoc factory
 * @name vbet5.factory:homeworkService
 * @description homework service
 */

VBET5.factory('HomeworkService', ['$rootScope', '$http', '$sce', '$cookies', '$window', '$location', 'AuthData', 'Config', 'Storage', 'Utils', function betService($rootScope, $http, $sce, $cookies, $window, $location, AuthData, Config, Storage, Utils) {
    'use strict';

    var HomeworkService = {};
    var status;
    var statusCallBacks = [];
    var setPopupUrlCallBack;
    var setIsReadyCallBack;

    var API_URL = (function() {
        if (Config.main.homework.apiUrl) {
            return Config.main.homework.apiUrl;
        }
        if ($window.location.hostname === "localhost") {
            return "https://homework.betconstruct.com/";
        }

        return $window.location.protocol + "//homework." + $window.location.hostname.replace('www.','') + "/";
    })();

    function updateHomework(data) {
        status = data;

        //update all subscriptions
        statusCallBacks.forEach(function(callBack) {
            callBack(data);
        })
    }

    function isStored() {
        //store data
        var key = "logged" + ($rootScope.env.authorized ? 'In' : 'Out') + "PopupLifetime";

        if (Config.main.useAuthCookies) {
            var data = $cookies.get(key);

            if (data) {
                return data;
            }
        }

        return Storage.get(key);
    }

    function getHomeworkStatus() {
        var statusUrl = API_URL + "gameEngine/service.php?request=getHomework&partnerId=" + Config.main.site_id + "&platform=web&lan=" + $rootScope.env.lang;
        if ($rootScope.env.authorized) {
            statusUrl += "&token=" + AuthData.get().auth_token;
        }
        return  $http.get(statusUrl).then(function(response) {
            return response.data && response.data.code === 0 && response.data.data;
        });
    }

    function closeHomeworkPopup() {
        if (setPopupUrlCallBack) {
            setPopupUrlCallBack(null);
        }
        //store data
        var key = "logged" + ($rootScope.env.authorized ? 'In' : 'Out') + "PopupLifetime";

        Storage.set(key, true, Config.main.homework[key]);
        Utils.checkAndSetCookie(key, true, Config.main.homework[key]);
    }

    function handleWindowMessage(event, data) {
        if (data.target === 'homework') {
            switch (data.action) {
                case "appReady":
                    if (setIsReadyCallBack) {
                        setIsReadyCallBack(true);
                    }
                    break;
                case "close":
                    closeHomeworkPopup();
                    break;
                case "loginRequired":
                    $rootScope.$broadcast("openLoginForm", {
                        callback: function () {
                            getHomeworkStatus().then(function(data) {
                                if (data) {
                                    updateHomework(data);
                                    HomeworkService.openHomeworkPopup();
                                }
                            });
                        }
                    });
                    closeHomeworkPopup();
                    break;
                case "verificationRequired":
                    /*$rootScope.$broadcast("globalDialogs.addDialog", {
                        type: "info",
                        title: "Info",
                        content: 'homework-verification-text'
                    });*/

                    closeHomeworkPopup();
                    $location.search('settingspage', 'verifyaccount');
                    $rootScope.$broadcast('toggleSliderTab', 'settings');
                    break;
            }
        }
    }

    function handleLoggedIn() {
        getHomeworkStatus().then(function(data) {
            if (data) {
                updateHomework(data);
                if (!isStored()) {
                    HomeworkService.openHomeworkPopup();
                }
            }
        });
    }

    function handleLoggedOut() {
        getHomeworkStatus().then(function(data) {
            if (data) {
                updateHomework(data);
            }
        })
    }

    HomeworkService.openHomeworkPopup = function openHomeworkPopup() {
        if (setPopupUrlCallBack) {
            var url = API_URL + "?partnerId=" + Config.main.site_id + "&platform=web&lan=" + $rootScope.env.lang;

            if ($rootScope.env.authorized) {
                url += "&token=" + AuthData.get().auth_token;
            }

            setPopupUrlCallBack($sce.trustAsResourceUrl(url));
        }
    };


    HomeworkService.init = function init(scope, popupUrlCallBack, isReadyCallBack) {
        var processToGetHomework = function() {
            getHomeworkStatus().then(function (data) {
                if (data) {
                    setPopupUrlCallBack = popupUrlCallBack;
                    setIsReadyCallBack = isReadyCallBack;
                    updateHomework(data);

                    if (!isStored()) {
                        HomeworkService.openHomeworkPopup();
                    }

                    scope.$on("loggedIn", handleLoggedIn);
                    scope.$on("login.loggedOut", handleLoggedOut);
                    scope.$on("window.message", handleWindowMessage);
                }
            })
        };

        if (!$rootScope.loginInProgress) {
            processToGetHomework();
        } else {
            var loginProcessWatcher = $rootScope.$watch('loginInProgress', function(value) {
                if (!value) {
                    loginProcessWatcher();
                    processToGetHomework();
                }
            });
        }
    };

    HomeworkService.subscribeForStatus = function subscribeForStatus(listener) {
        statusCallBacks.push(listener);

        //initial
        listener(status);
    };

    HomeworkService.unsubscribeFromStatus = function unsubscribeForStatus(listener) {
        statusCallBacks = statusCallBacks.filter(function (l) {
            return l !== listener;
        })
    };

    return HomeworkService;
}]);

/* global VBET5 */
/**
 * @ngdoc controller
 * @name vbet5.controller:mainHeaderCtrl
 * @description
 * Main header controller
 */
VBET5.controller('notificationCtrl', ['$rootScope', '$scope', '$location', 'Config', 'Storage', 'content', 'TimeoutWrapper', function ($rootScope, $scope, $location, Config, Storage, content, TimeoutWrapper) {
    'use strict';
    $scope.dontShowLayoutSwitcherHint = Storage.get('dontShowLayoutSwitcherHint') || {};
    TimeoutWrapper = TimeoutWrapper($scope);

    /**
     * @ngdoc method
     * @name checkSportsBookPage
     * @methodOf vbet5.controller:notificationCtrl
     * @description  Check for right conditions to show notifications (if in sportsbook  e.t.c.)
     *
     */
    var checkSportsBookPage = function (notification) {
        if (notification.type !== 'sportsbookLayout') {
            return;
        }
        if ($location.path() !== '/sport/') {
            notification.visible = false;
            return;
        }
        notification.visible = Config.env.showSportsbookToolTip;
        Config.env.showSportsbookToolTip = false;
        TimeoutWrapper(function () {
            notification.visible = false;
        }, Config.main.sportsbookLayoutSwitcherTooltipTimeout);
    };

    $rootScope.$on("notification", function notificationReceived(event, data) {
        $scope.showNotification = true;
        if ($scope.dontShowLayoutSwitcherHint[data.type]) {
            return false;
        }
        if (!$scope.notifications) {
            $scope.notifications = [];
        }

        var notification = {
            title: data.title,
            content: data.content,
            visible: !$scope.dontShowLayoutSwitcherHint[data.type],
            type: data.type,
            hideCheckBox: !!data.hideCheckBox
        };
        $scope.notifications.push(notification);
        checkSportsBookPage(notification);
    });

    /**
     * @ngdoc method
     * @name closeLayoutSwitcherHint
     * @methodOf vbet5.controller:notificationCtrl
     * @description  closes the layout switcher hint tooltip and sets a local storage value not to show it again(if checked)
     *
     */
    $scope.closeLayoutSwitcherHint = function closeLayoutSwitcherHint(notification) {
        if (notification.type === 'sportsbookLayout') {
            Config.env.showSportsbookToolTip = false;
        }
        notification.visible = false;
        if (notification.dontShowLayoutSwitcherHintAgain) {
            $scope.dontShowLayoutSwitcherHint[notification.type] = true;
            Storage.set('dontShowLayoutSwitcherHint', $scope.dontShowLayoutSwitcherHint);
        }
    };

    /**
     * @ngdoc method
     * @name loadNotifications
     * @methodOf CMS.controller:notificationCtrl
     * @description loads notification(s) from CMS
     *
     */
    $scope.loadNotifications = function loadNotifications() {
        $scope.notificationsLoaded = false;
        var notifications = {};
        if (Config.main.loadNotificationsFromWP) {
            content.getPage('notifications-' + Config.env.lang, true).then(function (data) {
                $scope.mainPage = data.data.page;
                notifications = data.data.page ? data.data.page.children : {};
                $scope.notificationsLoaded = true;

                var i, notificationType;
                for (i = 0; i < notifications.length; i++) {
                    notificationType = 'backendNotification_' + notifications[i].slug;
                    $rootScope.$broadcast("notification", {
                        title: notifications[i].title,
                        content: notifications[i].content,
                        type: notificationType
                    });
                }
            });
        }
    };

    if (!$scope.showNotification) {
        $scope.loadNotifications();
    }

    /**
     * @description Show notification based on GEOloacation
     */
    $rootScope.geoDataAvailable.then(function () {
        if (Config.dialog && Config.dialog.runtimePopup && !Storage.get('runtimePopupShowed')) {
            if (!Config.dialog.runtimePopup.countryAllow || ($rootScope.geoCountryInfo && Config.dialog.runtimePopup.countryAllow.indexOf($rootScope.geoCountryInfo.countryCode) === -1)) {
                $rootScope.globalDialog = Config.dialog.runtimePopup;
                Storage.set('runtimePopupShowed', true);
            }
        }
    });

    /**
     * @description Show notification based on config
     */
    if (Config.customLoginDialog) {
        $rootScope.$watch("profile", function (newValue, oldValue) {
            if (newValue && !oldValue) {
                if (Config.customLoginDialog.info) {
                    $rootScope.$broadcast("globalDialogs.addDialog", Config.customLoginDialog.info);
                }
                if (Config.customLoginDialog.unreadMessages && $rootScope.profile.unread_count && $rootScope.profile.unread_count > 0) {
                    $rootScope.$broadcast("globalDialogs.addDialog", Config.customLoginDialog.unreadMessages);
                }
            }
        });
    }
}]);

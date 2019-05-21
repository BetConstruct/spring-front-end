/* global VBET5 */
/**
 * @ngdoc controller
 * @name vbet5.controller:whatsNewNotificationsCtrl
 * @description
 *  What`s new notifications controller
 */
VBET5.controller('whatsNewNotificationsCtrl', ['$scope', 'Config', 'Storage', 'Moment', 'Translator', 'Utils', 'content', '$location', '$window', function ($scope, Config, Storage, Moment, Translator, Utils, content, $location, $window) {
    $scope.notifications = {
        toggled: false,
        count: 0,
        showed: Storage.get('whats_new_notifications') || {}
    };

    /**
     * @ngdoc method
     * @name init
     * @methodOf vbet5.controller:whatsNewNotificationsCtrl
     * @description Initialization
     */
    function init() {
        content.getWidget('whats-new-' + Config.env.lang).then(function (response) {
            if (response && response.data && response.data.page && response.data.page.children) {
                $scope.notifications.title = response.data.page.title;
                $scope.notifications.count = 0;
                $scope.notificationsGrouped = {};
                angular.forEach(response.data.page.children, function (notification) {
                    if ($scope.notifications.showed[notification.id] !== 1) {
                        var notificationDate = Moment.get(notification.date), group;
                        if (Config.env.lang === 'arm') {
                            group = notificationDate.format('DD') + ' ' + Translator.get(notificationDate.format('MMMM')) + ', ' + notificationDate.format('YYYY');
                        } else {
                            group = notificationDate.format('DD MMMM, YYYY');
                        }

                        $scope.notificationsGrouped[group] = $scope.notificationsGrouped[group] || {
                                items: []
                            };
                        $scope.notificationsGrouped[group].items.push(notification);
                    }
                });
                $scope.notificationsGrouped = Utils.objectToArray($scope.notificationsGrouped, 'date');
            }
            calculateNotificationsCount();
        });
    }

    init();

    /**
     * @ngdoc method
     * @name toggleProfileMenu
     * @methodOf vbet5.controller:openNotification
     * @description Toggle profile menu
     * @param {Object} event not used
     * @param {String} state if defined
     */
    $scope.toggleNotificationsMenu = function toggleNotificationsMenu(event, state) {
        $scope.notifications.toggled = !$scope.notifications.toggled;
        event.stopPropagation();
    };

    /**
     * @ngdoc method
     * @name init
     * @methodOf vbet5.controller:calculateNotificationsCount
     * @description Calculate notifications count
     */
    function calculateNotificationsCount() {
        $scope.notifications.count = 0;
        angular.forEach($scope.notificationsGrouped, function (group) {
            angular.forEach(group.items, function (notification) {
                if ($scope.notifications.showed[notification.id] !== 2) {
                    $scope.notifications.count++;
                }
            });
        });
    }

    /**
     * @ngdoc method
     * @name init
     * @methodOf vbet5.controller:openNotification
     * @description Open notification
     */
    $scope.openNotification = function openNotification(notification) {
        if (notification.url) {
            if (notification.target) {
                window.open(notification.url);
            } else {
                $window.location = notification.url;
            }
            $scope.notifications.toggled = false;
        }
        $scope.notifications.showed[notification.id] = 2;
        Storage.set('whats_new_notifications', $scope.notifications.showed);
        calculateNotificationsCount();
    };

    /**
     * @ngdoc method
     * @name init
     * @methodOf vbet5.controller:clearNotifications
     * @description Clear notifications
     */
    $scope.clearNotifications = function clearNotifications(notificationId, dateGroup) {
        angular.forEach($scope.notificationsGrouped, function (notificationsGroup, notificationsGroupKey) {
            angular.forEach(notificationsGroup.items, function (notification, key) {
                if (notificationId) {
                    if (notification && notification.id === notificationId) {
                        notificationsGroup.items.splice(key, 1);
                        $scope.notifications.showed[notification.id] = 1;
                        $scope.notifications.count--;
                    }
                }
            });
            if ($scope.notificationsGrouped && notificationsGroup.items && notificationsGroup.items.length === 0) {
                $scope.notificationsGrouped.splice(notificationsGroupKey, 1);
                angular.forEach(notificationsGroup.items, function (notification) {
                    $scope.notifications.showed[notification.id] = 1;
                });
            } else if (dateGroup && dateGroup === notificationsGroup.date) {
                $scope.notificationsGrouped.splice(notificationsGroupKey, 1);
                angular.forEach(notificationsGroup.items, function (notification) {
                    $scope.notifications.showed[notification.id] = 1;
                });
            }
        });

        Storage.set('whats_new_notifications', $scope.notifications.showed);
        calculateNotificationsCount();
    };
}]);

/**
 * @ngdoc controller
 * @name vbet5.controller:subscriptionsCtrl
 * @desacription Subscription landing page controller
 */
VBET5.controller('subscriptionsCtrl', ['$rootScope', '$scope', '$location', 'Config', 'Zergling', 'Translator', 'analytics', function ($rootScope, $scope, $location, Config, Zergling, Translator, analytics) {
    'use strict';
    $scope.prop = {
        unsubscribeEmail: false,
        unsubscribeSms: false,
        hash: $location.search().hash || '',
        userId: parseInt($location.search().userId, 10) || null
    };

    analytics.gaSend('send', 'event', 'page', 'subscriptions', {'page': $location.path(), 'eventLabel': 'Open'});

    if (!$scope.prop.hash && !$scope.prop.userId) {
        $location.path('/');
    }
    /**
     * @ngdoc method
     * @name saveSubscription
     * @methodOf vbet5.controller:subscriptionsCtrl
     * @description Save subscription data
     */
    $scope.saveSubscription = function saveSubscription () {
        var request = {
            hash: $scope.prop.hash,
            user_id: $scope.prop.userId,
            is_subscribe_to_email: $scope.prop.unsubscribeEmail ? 0 : 1,
            is_subscribe_to_sms: $scope.prop.unsubscribeSms ? 0 : 1
        };

        var dialog = {
            type: "info",
            title: "Info",
            content: '<b>' + Translator.get('The inquiry is successfully sent') + '</b><br><hr><br>' + Translator.get('If you have unsubscribed by mistake, change your settings in your {1} account', [Config.main.skin])
        };

        Zergling.get(request, 'update_client_notifications')
            .then(
                function (response) {
                    console.log(response);
                    dialog.type = 'error';
                    dialog.title = 'Error';


                    switch (response && response.result && Math.abs(parseInt(response.result, 10) || -1)) {
                        case 0:
                            dialog.type = 'info';
                            dialog.title = 'Info';
                            $location.search('userId', undefined);
                            $location.search('hash', undefined);
                            $location.path('/');
                            analytics.gaSend('send', 'event', 'page', 'subscriptions', {'page': $location.path(), 'eventLabel': 'Success'});
                            break;
                        case 2430:
                            dialog.content = Translator.get('Error') + '</b><br><hr><br>' + Translator.get('Wrong hash or user id.');
                            analytics.gaSend('send', 'event', 'page', 'subscriptions', {'page': $location.path(), 'eventLabel': 'Failed'});
                            break;
                        default:
                            analytics.gaSend('send', 'event', 'page', 'subscriptions', {'page': $location.path(), 'eventLabel': 'Failed'});
                    }
                },
                function (failResponse) {
                    dialog.type = 'error';
                    dialog.title = 'Error';
                    dialog.content = Translator.get('Error') + '</b><br><hr><br>' + Translator.get('Please try again later.');
                    console.log('failed unsubscribe', failResponse);
                }
            )['finally'](function () {
                $rootScope.$broadcast("globalDialogs.addDialog", dialog);
            });


    };

}]);
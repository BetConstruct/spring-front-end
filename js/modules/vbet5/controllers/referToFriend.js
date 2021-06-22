VBET5.controller('referToFriendCtrl', ['$scope', '$rootScope', 'Zergling', 'Utils', 'Config', function ($scope, $rootScope, Zergling, Utils, Config) {
    'use strict';

    function creatLink(code) {
        return window.location.origin + '/#/?action=register&reference_code=' + code;
    }


    function loadReferrals() {
        $scope.data.referralsLoading = true;
        Zergling.get({}, 'get_refer_friend_bonuses').then(function (res) {
            if (res.result === 0 ) {
                $scope.data.referrals = res.details;
            }
        })['finally'](function () {
            $scope.data.referralsLoading = false;
        });

    }

    (function init() {
        $scope.data = {};
        $scope.data.loading = true;
        Zergling.get({}, 'get_reference_code').then(function (res) {
            if (res.result === 0 && res.details && res.details.length &&  res.details[0].Code ) {
                $scope.data.link = creatLink(res.details[0].Code);
                loadReferrals();
            }
            $scope.data.loading = false;
        });
    })();


    $scope.generateLink = function generateLink() {
        if ($scope.data.link) {
            return;
        }
        $scope.data.loading = true;
        Zergling.get({}, 'create_reference_code').then(function (data) {
            if (data.result === 0) {
                $scope.data.link = creatLink(data.details.ReferenceCode);
                return;
            }
            $rootScope.$broadcast('globalDialogs.addDialog', {
                type: 'warning',
                title: 'Warning',
                content: data.result_text
            });
        }, function () {
            $rootScope.$broadcast('globalDialogs.addDialog', {
                type: 'warning',
                title: 'Warning',
                content: 'There was an error processing your request.'
            });
        })['finally'](function () {
            $scope.data.loading = false;
        });
    };

    $scope.copyLink = function copyLink() {
        if (!$scope.data.link) {
            return;
        }
        Utils.copyToClipboard($scope.data.link);
    };

    $scope.shareLink = function shareLink() {
        if (!$scope.data.link) {
            return;
        }
        window.open('https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent($scope.data.link), 'Refer to friend', 'scrollbars=1,width=1000,height=600,resizable=yes');
    };

}

]);

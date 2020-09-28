/* global VBET5 */
/**
 * @ngdoc directive
 * @name vbet5.directive:greyhoundsStreaming
 *
 * @description prematch greyhounds streaming
 *
 */
VBET5.directive('preMatchStreamChannels', ['$rootScope', 'GameInfo', 'Config', function ($rootScope, GameInfo, Config) {
    'use strict';

    return {
        restrict: 'E',
        replace: true,
        templateUrl: 'templates/directive/pre-match-stream-channels.html',
        link: function ($scope) {
            $scope.selectedChannel= $scope.selectedChannel || $scope.prematchChannels[0];
            $scope.data = {};
            $scope.getChannelVideo = function () {
                $scope.data.tv_type = $scope.selectedChannel.provider_id;
                $scope.data.video_id = $scope.selectedChannel.channel;
                var promise =  GameInfo.getVideoData($scope.data, false);
                if (promise) {
                    $scope.loading = true;
                    promise.then(function () {
                        if (!Config.env.authorized) {
                            $scope.data.video_data = undefined;
                        }
                        $scope.loading = false;
                    });
                }
            };

            $scope.$watch('profile.balance', function (newValue, oldValue) {
                    if ($scope.data.video_data && !newValue) {
                        $scope.data.video_data = undefined;
                    } else if (Config.main.video.autoPlay && !oldValue && newValue > 0 && !$scope.data.video_data) {
                        $scope.getChannelVideo();
                    }
            });
            $scope.getChannelVideo();
        }

    };

}] );

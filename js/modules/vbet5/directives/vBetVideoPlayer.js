/* global VBET5 */
/**
 * @author Narek Mamikonyn
 * @ngdoc directive
 * @name VBET5.directive:vbetVideoPlayer
 * @description
 * @restrict E
 * @example
 <example>
 <vbet-video-player play="true" set-duration="fn" url="video.mp4" on-end-fn="fn"></vbet-video-player>
 </example>
 */
VBET5.directive('vbetVideoPlayer', ['$timeout', '$q', function ($timeout, $q) {
    'use strict';
    return {
        template: '<video id="vbet-baner-video-player" width="100%"> ' +
              '<source type="video/mp4">   ' +
              'Your browser does not support HTML5 video.   ' +
              '</video>',
        restrict: 'E',
        scope: {
            url: '@',
            play: '=',
            onEndFn: '&',
            setDuration:  '&'
        },
        replace: true,
        link: function postLink($scope, $element) {
            if (!$scope.url) {
                return;
            }
            var videoElement = $element[0],
                durationDefer = $q.defer();
            videoElement.src = $scope.url;
            videoElement.load();
            videoElement.onended = function () {
                videoElement.currentTime = 0;
                if ($scope.onEndFn) {
                    $scope.onEndFn();
                }
            };

            function getVideoDuration() {
                if (videoElement.readyState > 0) {
                    durationDefer.resolve(Math.round(videoElement.duration * 1000));
                } else {
                    $timeout(getVideoDuration, 500);
                }
                return durationDefer.promise;
            }

            if ($scope.setDuration) {
                getVideoDuration().then(function (resp) {
                    $scope.setDuration()(resp);
                });
            }
            if ($scope.play) {
                videoElement.play();
            }


            $scope.$watch('play', function (newVal, oldVal) {
                if (newVal === oldVal) {
                    return;
                }
                if ($scope.play) {
                    videoElement.play();
                }
            });
        }
    };
}]);


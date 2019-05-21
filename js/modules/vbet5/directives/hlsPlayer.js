/* global VBET5, Hls  */
/* jshint -W024 */


VBET5.directive('hlsPlayer', ['Translator', function(Translator) {
    'use strict';
    return {
        restrict: 'E',
        replace: true,
        template: '<video id="hls-video" width="100%" height="100%"></video>',
        link: function($scope) {
            var video, soundWatcher, hls;

            function handleStreamingFailure() {
                hls.destroy();
                var warnText = document.createElement('p');
                warnText.innerHTML = Translator.get('Something went wrong with the stream. Sorry for the inconvenience');
                warnText.style.cssText = 'color: #ffffff; position: absolute; top: 50%; left: 50%; transform: translate3d(-50%,-50%,0); text-align: center;';
                video.parentNode.replaceChild(warnText, video);
            }

            function handleErrors(event, data) {
                if (data.fatal) {
                    switch (data.type) {
                        case Hls.ErrorTypes.NETWORK_ERROR: // try to recover network error
                            hls.startLoad();
                            break;
                        case Hls.ErrorTypes.MEDIA_ERROR:
                            hls.recoverMediaError();
                            break;
                        default: // cannot recover
                            $scope.vPlayerState.isLoaded = false; // Hiding controls
                            handleStreamingFailure();
                            break;
                    }
                }
            }

            function onVideoLoaded() {
                var videoLoaded = function success() {
                    $scope.vPlayerState.isLoaded = true;
                    hls.on(Hls.Events.ERROR, handleErrors);
                    if (!soundWatcher) {
                        soundWatcher = $scope.$watch('env.sound', function(newVal) {
                            video.volume = newVal;
                            video.muted = newVal === 0;
                        });
                    }
                };

                video.play().then(videoLoaded).catch(function muteVideo() {
                    // https://developers.google.com/web/updates/2017/09/autoplay-policy-changes
                    $scope.env.sound = 0;
                    video.muted = true;
                    video.play().then(videoLoaded).catch(handleStreamingFailure);
                });

            }

            (function init() {
                $scope.vPlayerState.isLoaded = false;
                video = document.getElementById('hls-video');
                if (Hls.isSupported()) {
                    hls = new Hls();
                    hls.attachMedia(video); // binding video element and hls.js together
                    hls.on(Hls.Events.MEDIA_ATTACHED, function () {
                        hls.loadSource($scope.vPlayerState.data);
                        hls.once(Hls.Events.MANIFEST_PARSED, onVideoLoaded);
                    });
                } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = $scope.vPlayerState.data;
                    video.addEventListener('loadedmetadata', function onLoadedMetaData() {
                        onVideoLoaded();
                        video.removeEventListener('loadedmetadata', onLoadedMetaData);
                    });
                }
            })();


            $scope.$on('$destroy', function hlsDestroy() {
                if (hls) { hls.destroy(); }
                if (soundWatcher) { soundWatcher(); }
            });
        }
    };
}]);

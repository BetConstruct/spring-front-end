/* global VBET5, Hls  */
/* jshint -W024 */
/* For more information(API) about HLS player you can find here ->  https://github.com/video-dev/hls.js/blob/master/docs/API.md */
/* TODO --> There are issue related to IE11/Edge (black screen), in the future development we should to fix it. The opened issue you can find here -> https://github.com/video-dev/hls.js/issues/1989 */


VBET5.directive('hlsPlayer', ['$http', 'X2js', '$rootScope', 'Translator', function($http, X2js, $rootScope, Translator) {
    'use strict';

    return {
        restrict: 'E',
        replace: true,
        template: '<video id="hls-video" width="100%" height="100%" ng-show="videoIsLoaded"></video>',
        link: function($scope, element, $attrs) {
            var video, soundWatcher, hls;
            var parent = $scope.$parent;
            var connectionAttemptsCount = 0;
            if($scope.videoStreaming === undefined) {
                $scope.videoStreaming = {};
            }
            /**
             * @ngdoc method
             * @name stopVideo
             * @methodOf vbet5.controller:virtualSportsCtrl
             * @description Stop video streaming
             */
            $scope.videoStreaming.stopVideo = function pauseStream() {
                $scope.videoStreaming.stopped = true;
                parent.videoIsLoaded = false;
                hlsDestroy();
            };

            /**
             * @ngdoc method
             * @name playVideo
             * @methodOf vbet5.controller:virtualSportsCtrl
             * @description Initialize video player
             */
            $scope.videoStreaming.playVideo = function playStream() {
                $scope.videoStreaming.stopped = false;
                initPlayer($attrs.streamUrl);
            };

            /**
             * @ngdoc method
             * @name playVideo
             * @methodOf vbet5.controller:virtualSportsCtrl
             * @description Toggle for mute and unmute streaming
             */
            parent.toggleMute = function toggleMute(value) {
                $rootScope.env.sound = value ? 0 : 0.75;
                parent.mute = (value !== undefined) ? value : !parent.mute;
            };

            /**
             * @ngdoc method
             * @name playVideo
             * @methodOf vbet5.controller:virtualSportsCtrl
             * @description Toggle for pausing and playing streaming
             */
            parent.togglePause = function () {
                parent.paused
                    ? video.play()
                    : video.pause();
                parent.paused = !parent.paused;
            };

            function handleStreamingFailure() {
                if (hls) {
                    hls.destroy();
                }

                if (video.parentNode) {
                    $scope.videoStreaming.stopped = false;
                    var warnText = document.createElement('p');
                    warnText.innerHTML = Translator.get('Something went wrong with the stream. Sorry for the inconvenience');
                    warnText.style.cssText = 'color: #ffffff; position: absolute; top: 50%; left: 50%; transform: translate3d(-50%,-50%,0); text-align: center;';
                    video.parentNode.replaceChild(warnText, video);
                }
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
                            parent.videoIsLoaded = false; // Hiding controls
                            handleStreamingFailure();
                            break;
                    }
                }
            }

            function onSuccess() {
                parent.videoIsLoaded = true;
                hls.on(Hls.Events.ERROR, handleErrors);
                if (!soundWatcher) {
                    soundWatcher = $scope.$watch('env.sound', function(newVal) {
                        video.volume = newVal;
                        video.muted = newVal === 0;
                    });
                }
            }

            function onError() {
                // https://developers.google.com/web/updates/2017/09/autoplay-policy-changes
                $scope.env.sound = 0;
                video.muted = true;

                // If the player will not be able to connect to the stream URl,
                // video player will be destroyed.
                connectionAttemptsCount++;
                (connectionAttemptsCount > 2) ? handleStreamingFailure() :  video.play();
            }

            function onVideoLoaded() {
                video.addEventListener('play', onSuccess, true);
                video.addEventListener('error', onError, true);

                video.play();
            }

            function initPlayer(streamUrl) {
                video = document.getElementById('hls-video');
                if (Hls.isSupported()) {
                    hls = new Hls({
                        enableWorker: false
                    });
                    hls.attachMedia(video); // binding video element and hls.js together
                    hls.on(Hls.Events.MEDIA_ATTACHED, function () {
                        hls.loadSource(streamUrl);
                        hls.once(Hls.Events.MANIFEST_PARSED, onVideoLoaded);
                    });
                } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = streamUrl;
                    video.addEventListener('loadedmetadata', function onLoadedMetaData() {
                        onVideoLoaded();
                        video.removeEventListener('loadedmetadata', onLoadedMetaData);
                    });
                }

                if ($attrs.controls !== undefined) {
                    video.controls = true;

                }
            }

            function getPerformStreamUrl() {
                $http.get($attrs.streamUrl)
                    .then(function (response) {
                        try {
                            var data = X2js.xml_str2json(response.data);
                            var streams = data.eventInfo.availableMediaFormats.mediaFormat;
                            if (streams.stream && streams.stream.streamLaunchCode) {
                                initPlayer(streams.stream.streamLaunchCode.__cdata);
                            } else {
                                var urls = {};

                                for (var i = streams.length; i--;) {
                                    if (streams[i]._id === '791') {
                                        urls[791] = streams[i].stream.streamLaunchCode.__cdata;
                                    } else if (streams[i]._id === '1012') {
                                        urls[1012] = streams[i].stream.streamLaunchCode.__cdata;
                                    }
                                }

                                if (urls[1012]) {
                                    initPlayer(urls[1012]);
                                } else if(urls[791]) {
                                    initPlayer(urls[791]);
                                } else {
                                    handleStreamingFailure();
                                }
                            }
                        } catch (e) {
                            handleStreamingFailure();
                        }
                    }, function () {
                        handleStreamingFailure();
                    });
            }

            function getIMGStreamUrl() {
                $http.get($attrs.streamUrl)
                    .then(function (response) {
                        if (response.data && response.data.hlsUrl) {
                            initPlayer(response.data.hlsUrl);
                        } else {
                            handleStreamingFailure();
                        }
                    }, function () {
                        handleStreamingFailure();
                    });
            }

            (function init() {
                if($scope.videoStreaming.stopped) {return}
                parent.videoIsLoaded = false;
                parent.mute = !$rootScope.env.sound;

                switch ($attrs.providerId) {
                    case "1": // perform streaming
                        getPerformStreamUrl();
                        break;
                    case "5":
                        getIMGStreamUrl();
                        break;
                    default:
                        initPlayer($attrs.streamUrl);
                }
            })();

            /**
             * @ngdoc method
             * @name hlsDestroy
             * @desc Destroy hls player context. Should clean-up all used resources
             */
            function hlsDestroy() {
                if (hls) {
                    hls.destroy();
                    video.removeEventListener('play', onSuccess, true);
                    video.removeEventListener('error', onError, true);
                }
                if (soundWatcher) { soundWatcher(); }
            }

            $scope.$on('$destroy', hlsDestroy);
        }
    };
}]);

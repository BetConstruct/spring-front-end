/* global VBET5, Hls  */
/* jshint -W024 */


VBET5.directive('hlsPlayer', ['$http', 'X2js', 'Translator', function($http, X2js, Translator) {
    'use strict';

    return {
        restrict: 'E',
        replace: true,
        template: '<video id="hls-video" width="100%" height="100%"></video>',
        link: function($scope, element, $attrs) {
            var video, soundWatcher, hls;
            var parent = $scope.$parent;

            function handleStreamingFailure() {
                if (hls) {
                    hls.destroy();
                }

                if (video.parentNode) {
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

            function onVideoLoaded() {
                var videoLoaded = function success() {
                    parent.videoIsLoaded = true;
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
            }

            function getPerformStreamUrl() {
                $http.get($attrs.streamUrl)
                    .then(function (response) {
                        try {
                            var data = X2js.xml_str2json(response.data);
                            var mediaFormats = data.eventInfo.availableMediaFormats.mediaFormat;
                            var urls = {};

                            for (var i = mediaFormats.length; i--;) {
                                if (mediaFormats[i]._id === '791') {
                                    urls[791] = mediaFormats[i].stream.streamLaunchCode.__cdata;
                                } else if (mediaFormats[i]._id === '1012') {
                                    urls[1012] = mediaFormats[i].stream.streamLaunchCode.__cdata;
                                }
                            }

                            if (urls[1012]) {
                                initPlayer(urls[1012]);
                            } else if(urls[791]) {
                                initPlayer(urls[791]);
                            } else {
                                handleStreamingFailure();
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
                parent.videoIsLoaded = false;

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

            $scope.$on('$destroy', function hlsDestroy() {
                if (hls) { hls.destroy(); }
                if (soundWatcher) { soundWatcher(); }
            });
        }
    };
}]);

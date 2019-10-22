/* global VBET5 */
/**
 * @ngdoc directive
 * @name vbet5.directive:videoPlayer
 *
 * @description places a flash player which starts playing as soon as loaded.
 * adds  following functions to scope to control player:
 *
 *      - play
 *      - pause
 *      - resume
 *      - togglePause
 *      - setSoundValue (accepting value from 0 to 1)
 *
 * @param {String} stream-url stream URL, e.g. rtmp://streams.betconstruct.com/livedealer
 * @param {String} provider-id provider id
 * @param {String} initially-muted if set, video will be muted initially
 * @param {String} id unique element id is required
 */
VBET5.directive('videoPlayer', ['$window', '$timeout', '$rootScope', '$sce', 'Translator', function ($window, $timeout, $rootScope, $sce, Translator) {
    'use strict';
    return {
        restrict: 'E',
        templateUrl: 'templates/directive/videoPlayer.html',

        link: function (scope, element, attrs) {
            scope.customStreaming = !!attrs.customStreaming;

            var initPlayer = function () {
                var attributes = {};
                attributes.id = attrs.playerId + 'obj';

                scope.playerId = attrs.playerId;
                scope.videoState = {};
                var streamUrl = attrs.streamUrl.toString();
                var providerId = attrs.providerId.toString();
                if (scope.customStreaming || $rootScope.conf.videoProvidersThatWorkWithIframe[+providerId]) { // for dota and windbet stream we must show streams in iframe
                    scope.videoState.frameUrl = $sce.trustAsResourceUrl(streamUrl);
                    scope.videoState.videoIsLoaded = false; // for hiding player controlls
                    if (scope.customStreaming) {
                        attrs.$observe('streamUrl', function () {
                            if (streamUrl === attrs.streamUrl.toString()) {
                                return; //  don't update if it's same
                            }
                            streamUrl = attrs.streamUrl.toString();
                            scope.videoState.frameUrl = $sce.trustAsResourceUrl(streamUrl);
                        });
                    }

                } else { // for another all streams
                    var swfPath = providerId === '5' ? "swf/imgStream.swf" : "swf/LiveVideo.swf?anticache=" + $rootScope.env.appVersion;
                    var callbackGlobalFuncName = 'flashPlayerCallback' + scope.$id;

                    var params = {};
                    params.movie = swfPath;
                    params.quality = "high";
                    params.allowScriptAccess = "always";
                    params.wmode = "transparent";
                    scope.$on('flashplayer.newSingleInstance', function (event, scopeId) {
                        if (scopeId !== scope.$id) { //message is from another player
                            swfobject.removeSWF(attributes.id);
                            scope.$emit('flashplayer.playerRemoved');
                        }
                    });

                    scope.$on('flashplayer.newInstance', function (event, scopeId) {
                        if (scopeId !== scope.$id) { //message is from another player
                            scope.mute = true;
                            if (scope.soundVolume !== undefined) { // if sound volume depends on slider volume
                                scope.soundVolume = 0;
                            } else if (scope.swfObj && scope.swfObj.setSoundValue) {
                                scope.swfObj.setSoundValue(0);
                            }
                        }
                    });

                    if (attrs.singleInstance !== undefined) { // let others know about this player, so other players can close if there's only 1 allowed
                        $rootScope.$broadcast('flashplayer.newSingleInstance', scope.$id);
                    }
                    $rootScope.$broadcast('flashplayer.newInstance', scope.$id);

                    var embedSwf = function () {
                        if ($window.document.getElementById(attrs.playerId)) { //wait until element becomes available
                            swfobject.embedSWF(swfPath, attrs.playerId, "100%", "100%", "11.1", "swf/playerProductInstall.swf", {}, params, attributes, function (obj) {
                                if (obj.success === false) {
                                    var iconUrl = ((document.location.protocol == "https:") ? "https://" : "http://") + "www.adobe.com/images/shared/download_buttons/get_flash_player.gif";
                                    var htmlTemplate = '<div class="flash-download-b"><a href="http://www.adobe.com/go/getflashplayer" class="not-this"><img src="' + iconUrl + '" alt="Get Adobe Flash player"/></a></div>';
                                    angular.element($window.document.getElementById(attrs.playerId)).html(htmlTemplate);
                                    return;
                                }
                                var setStream = function () {
                                    if (obj.ref && obj.ref.setStreamOptions !== undefined) { //wait until it becomes available
                                        scope.swfObj = obj.ref;
                                        // console.log('PARENT', parent);
                                        obj.ref.setStreamOptions(streamUrl, providerId);

                                        if (obj.ref.setSoundValue) {
                                            obj.ref.setSoundValue(scope.mute ? 0 : 1);
                                        }

                                        obj.ref.setErrorMessages(
                                            Translator.get('Cannot play this video in your region.'),
                                            Translator.get('Sorry, there is no live stream at the moment. Please check back later.')
                                        );
                                        scope.videoState.videoIsLoaded = false;

                                        $window[callbackGlobalFuncName] = function (event) {
                                            console.log('video Player callback function', event);
                                            if (event === "NetStream.Buffer.Full") {
                                                scope.videoState.videoIsLoaded = true;
                                            }
                                        };
                                        obj.ref.setCallBackFunction(callbackGlobalFuncName);

                                        scope.togglePause = function () {
                                            scope.swfObj.togglePause();
                                            scope.paused = !scope.paused;
                                        };
                                        scope.pause = function () {
                                            scope.swfObj.pause();
                                            scope.paused = true;
                                        };
                                        scope.play = function () {
                                            scope.swfObj.play();
                                            scope.paused = false;
                                        };
                                        scope.resume = function () {
                                            scope.swfObj.resume();
                                            scope.paused = false;
                                        };
                                        scope.toggleMute = function (value) {
                                            $rootScope.env.sound = value ? 0 : 0.75;
                                            if (value !== undefined) {
                                                scope.mute = value;
                                            } else {
                                                scope.mute = !scope.mute;
                                            }
                                            if (scope.swfObj.setSoundValue) {
                                                scope.swfObj.setSoundValue(scope.mute ? 0 : 1);
                                            }
                                        };
                                        scope.setSoundValue = function (val) {
                                            if (scope.swfObj.setSoundValue) {
                                                scope.swfObj.setSoundValue(val);
                                            }
                                            scope.mute = val === 0;
                                        };
                                        scope.stopVideo = function () {
                                            scope.swfObj.stopVideo();
                                        };
                                        if (attrs.initiallyMuted) {
                                            scope.setSoundValue(attrs.initiallyMuted);
                                        }
                                    } else {
                                        $timeout(setStream, 100);
                                    }
                                };
                                setStream();
                            });
                        } else {
                            $timeout(embedSwf, 100);
                        }
                    };

                    embedSwf();

                    var updateStreamUrl = function () {
                        if (!initPlayer || streamUrl === attrs.streamUrl.toString()) {
                            return; //  don't update if it's same
                        }
                        streamUrl = attrs.streamUrl.toString();
                        if (scope.swfObj && scope.swfObj.setStreamOptions) {
                            scope.swfObj.setStreamOptions(streamUrl, providerId);
                            console.log('stream URL updated', streamUrl);
                        } else {
                            $timeout(updateStreamUrl, 100);
                        }

                    };
                    attrs.$observe('streamUrl', updateStreamUrl);

                    attrs.$observe('initiallyMuted', function () {
                        if (scope.toggleMute) {
                            scope.setSoundValue(attrs.initiallyMuted);
                        }
                    });

                    scope.$on('$destroy', function () {
                        if ($window[callbackGlobalFuncName]) {
                            delete $window[callbackGlobalFuncName];
                        }
                        swfobject.removeSWF(attrs.playerId);
                    });
                }
            };

            scope.embedPlayer = function embedPlayer() {
                initPlayer();
            };
        }
    };
}]);

/* global VBET5 */
/**
 * @ngdoc directive
 * @name vbet5.directive:flashplayer
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
VBET5.directive('flashplayer', ['$window', '$timeout', '$rootScope', 'Translator', function ($window, $timeout, $rootScope, Translator) {
    'use strict';

    return {
        restrict: 'E',
        link: function (scope, element, attrs) {
            var frame, attributes = {};
            attributes.id = attrs.id + 'obj';
            var streamUrl = attrs.streamUrl.toString();
            var providerId = attrs.providerId.toString();
            var parent = scope.$parent;
            if ($rootScope.conf.videoProvidersThatWorkWithIframe[+providerId]) { // for dota and windbet stream we must show streams in iframe
                frame = angular.element('<iframe  src="'+streamUrl+'" width="100%" height="100%" frameborder="0" scrolling="no" allowfullscreen></iframe>');
                element.append(frame);
                parent.videoIsLoaded = false; // for hiding player controls
            } else { // for another all streams
                var swfPath = providerId === '5' ? "swf/imgStream.swf" : "swf/LiveVideo.swf?anticache=" + $rootScope.env.appVersion;
                var callbackGlobalFuncName = 'flashPlayerCallback' + scope.$id;

                var params = {};
                params.movie = swfPath;
                params.quality = "high";
                params.allowScriptAccess = "always";
                params.wmode = "transparent";
                params.bgColor = '000000';
                scope.$on('flashplayer.newSingleInstance', function (event, scopeId) {
//                console.log('\n\n\n------------', scopeId, scope.$id);
                    if (scopeId !== scope.$id) { //message is from another player
                        swfobject.removeSWF(attributes.id);
                        scope.$emit('flashplayer.playerRemoved');
                    }
                });

                scope.$on('flashplayer.newInstance', function (event, scopeId) {
                    if (scopeId !== scope.$id) { //message is from another player
                        parent.mute = true;
                        if (parent.soundVolume !== undefined) { // if sound volume depends on slider volume
                            parent.soundVolume = 0;
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
                    if ($window.document.getElementById(attrs.id)) { //wait until element becomes available
                        swfobject.embedSWF(swfPath, attrs.id, "100%", "100%", "11.1", "swf/playerProductInstall.swf", {}, params, attributes, function (obj) {
                            if (obj.success === false) {
                                var iconUrl = ((document.location.protocol == "https:") ? "https://" : "http://") + "www.adobe.com/images/shared/download_buttons/get_flash_player.gif";
                                var htmlTemplate = '<div class="no-flash-player"><a href="http://www.adobe.com/go/getflashplayer"><img src="' + iconUrl + '" alt="Get Adobe Flash player"/></a></div>';
                                angular.element($window.document.getElementById(attrs.id)).html(htmlTemplate);
                                return;
                            }
                            var setStream = function () {
                                if (obj.ref && obj.ref.setStreamOptions !== undefined) { //wait until it becomes available
                                    scope.swfObj = obj.ref;
                                    console.log('PARENT', parent);
                                    obj.ref.setStreamOptions(streamUrl, providerId);

                                    if (obj.ref.setSoundValue) {
                                        obj.ref.setSoundValue(parent.mute ? 0 : 1);
                                    }

                                    obj.ref.setErrorMessages(
                                        Translator.get('Cannot play this video in your region.'),
                                        Translator.get('Sorry, there is no live stream at the moment. Please check back later.')
                                    );
                                    parent.videoIsLoaded = false;

                                    $window[callbackGlobalFuncName] = function (event) {
                                        console.log('video Player callback function', event);
                                        if (event === "NetStream.Buffer.Full") {
                                            parent.videoIsLoaded = true;
                                        }
                                    };
                                    obj.ref.setCallBackFunction(callbackGlobalFuncName);

                                    parent.togglePause = function () {
                                        scope.swfObj.togglePause();
                                        parent.paused = !parent.paused;
                                    };
                                    parent.pause = function () {
                                        scope.swfObj.pause();
                                        parent.paused = true;
                                    };
                                    parent.play = function () {
                                        scope.swfObj.play();
                                        parent.paused = false;
                                    };
                                    parent.resume = function () {
                                        scope.swfObj.resume();
                                        parent.paused = false;
                                    };
                                    parent.toggleMute = function (value) {
                                        if (value !== undefined) {
                                            parent.mute = value;
                                        } else {
                                            parent.mute = !parent.mute;
                                        }
                                        if (scope.swfObj.setSoundValue) {
                                            scope.swfObj.setSoundValue(parent.mute ? 0 : 1);
                                        }
                                    };
                                    parent.setSoundValue = function (val) {
                                        if (scope.swfObj.setSoundValue) {
                                            scope.swfObj.setSoundValue(val);
                                        }
                                        parent.mute = val === 0;
                                    };
                                    parent.stopVideo = function () {
                                        scope.swfObj.stopVideo();
                                    };
                                    if (attrs.initiallyMuted) {
                                        parent.setSoundValue(attrs.initiallyMuted);
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

                attrs.$observe('initiallyMuted', function () {
                    if (parent.toggleMute) {
                        //var globalValue = attrs.initiallyMuted === 'off';
                        parent.setSoundValue(attrs.initiallyMuted);
                    }
                });
            }

            var updateStreamUrl = function () {
                if (streamUrl === attrs.streamUrl.toString()) {
                    return; //  don't update if it's same
                }
                streamUrl = attrs.streamUrl.toString();
                if ($rootScope.conf.videoProvidersThatWorkWithIframe[+providerId]) {
                    frame && frame.remove();
                    frame = angular.element('<iframe  src="'+streamUrl+'" width="100%" height="100%" frameborder="0" scrolling="no" allowfullscreen></iframe>');
                    element.append(frame);
                } else {
                    if (scope.swfObj && scope.swfObj.setStreamOptions) {
                        scope.swfObj.setStreamOptions(streamUrl, providerId);
                        console.log('stream URL updated', streamUrl);
                    } else {
                        $timeout(updateStreamUrl, 100);
                    }
                }
            };
            attrs.$observe('streamUrl', updateStreamUrl);

            function flashPlayerDestroy() {
                if ($window[callbackGlobalFuncName]) {
                    delete $window[callbackGlobalFuncName];
                }
                swfobject.removeSWF(attrs.id);

                frame && frame.remove();
            }

            scope.$on('$destroy', flashPlayerDestroy);
        }
    };
}]);

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
        templateUrl: 'templates/directive/pre-match-stream-channels.html',
        scope: {
            channels: '=',
            env: '=',
            availability: '='
        },
        link: function (scope) {

            scope.data = {};
            scope.tabs = {
              channel: false,
              stream: false
            };

            scope.channelTab = 'Channel';
            scope.streamTab = "Stream";

            scope.getVideo = function (tab) {
                if (tab) {
                    scope.selectedTab = tab;
                }
                if (scope.selectedTab ===  scope.channelTab) {
                    if (!scope.selectedChannel) {
                        scope.data.video_data = null;
                        return;
                    }
                    scope.data.tv_type = scope.selectedChannel.provider_id;
                    scope.data.video_id = scope.selectedChannel.channel;
                } else {
                    scope.data.tv_type = scope.selectedStream.provider_id;
                    scope.data.video_id = scope.selectedStream.video_id;
                }
                scope.data.video_data = null;
                var promise =  GameInfo.getVideoData(scope.data, false);
                if (promise) {
                    scope.loading = true;
                    promise.then(function () {
                        if (!Config.env.authorized) {
                            scope.data.video_data = undefined;
                        }
                        scope.loading = false;
                    });
                }
            };

            scope.$watch('availability', function (newValue, oldValue) {
                    if (scope.data.video_data && !newValue) {
                        scope.data.video_data = undefined;
                    } else if (scope.selectedTab && Config.main.video.autoPlay && !oldValue && newValue && !scope.data.video_data) {
                        scope.getVideo();
                    }
            });

            scope.$on("setPrematchStream", function (event, data) {
                scope.selectedStream = data[0];
                scope.tabs.stream = true;
                scope.getVideo(scope.streamTab);
            });

            scope.$on("removePrematchStream", function () {
                scope.selectedStream = null;
                scope.tabs.stream = false;
                if (scope.selectedTab === scope.streamTab) {
                    if (scope.tabs.channel) {
                        scope.getVideo(scope.channelTab);
                    } else {
                        scope.selectedTab = undefined;
                    }
                }
            });

            scope.$watch('channels', function(newValue) {
               if (newValue) {
                   if (newValue.length) {
                       scope.tabs.channel = true;
                       if (!scope.selectedTab) {
                           scope.selectedChannel = newValue[0];
                           scope.getVideo(scope.channelTab);
                       }
                   } else {
                       scope.tabs.channel = false;
                       if (scope.selectedTab === scope.channelTab) {
                           if (scope.selectedStream) {
                               scope.getVideo(scope.streamTab);
                           } else {
                               scope.selectedTab = undefined;
                           }
                       }
                   }
               }
            });
        }
    };
}] );

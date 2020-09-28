/* global VBET5 */
/**
 * @ngdoc service
 * @name vbet5.service:stream
 * @description stream service
 *
 */
VBET5.service('StreamService', ['$rootScope', '$http',  'GameInfo', 'Config', function ($rootScope, $http, GameInfo, Config) {
    'use strict';

    /**
     * @ngdoc method
     * @name StreamService
     * @methodOf vbet5.service:StreamService
     * @description Responsible for the visibility of streaming
     *
     * @param {Object} Scope
     */
    function StreamService($scope) {
        var self = this;


        //make video available as soon as user logs in
        $scope.$on('loggedIn', checkVideoAvailability);     //login case

        /**
         * @ngdoc method
         * @name checkVideoAvailability
         * @methodOf vbet5.service:StreamService
         * @description Check video availability
         */
        function checkVideoAvailability() {
            if (self.game && Config.main.video.autoPlay) {
                if (!self.game.video_id) {
                    if (Config.main.defaultStreaming && Config.main.defaultStreaming.enabled) {
                        self.game.tv_type = Config.main.defaultStreaming.tvType;
                        self.game.video_data = Config.main.defaultStreaming.streamUrl;
                    }
                } else if (!self.game.is_guest) {
                    GameInfo.getVideoData(self.game);
                }
            }
        }

        //and unavailable when he logs out
        $scope.$on('login.loggedOut', function () {
            if (self.game && !self.game.is_guest && self.game.video_data !== undefined) {
                self.game.video_data = undefined;
            }
            if (self.pinnedGames) {
                Object.keys(self.pinnedGames).forEach(function (gameId) {
                    if (!self.pinnedGames[gameId].is_guest) {
                        delete self.pinnedGames[gameId];
                    }
                });
            }
            if (self.enlargedGame && !self.enlargedGame.is_guest) {
                self.enlargedGame = null;
            }
        });

        //synchronize video with user balance
        $scope.$watch('profile.balance', function (newValue, oldValue) {
            if (self.game && !self.game.is_guest && !self.game.allow_zero_balance) {
                if (self.game.video_data && newValue === 0) {
                    self.game.video_data = undefined;
                } else if (Config.main.video.autoPlay && oldValue === 0 && newValue > 0 && !self.game.video_data) {
                    checkVideoAvailability();
                }
            }
        });

        /**
         * @ngdoc method
         * @name restoreVideo
         * @methodOf service:StreamService
         * @description Restore video
         */
        $scope.$on('game.restoreVideo', function (event, gameId) {
            if (self.game && gameId === self.game.id)  {
                self.game.video_data = null;
                GameInfo.getVideoData(self.game);
            }
        });

        if (Config.main.video.customStreamingURL) {
            /**
             * @ngdoc method
             * @name selectStreamingItem
             * @description Select streaming item
             * @methodOf vbet5.service:stream
             * @param {Object} item
             */
            $scope.selectStreamingItem = function selectStreamingItem(item) {
                $scope.selectedStreamingItem = item;
            };

            /**
             * @ngdoc method
             * @name loadStreamingItems
             * @description Load streaming items
             * @methodOf vbet5.service:stream
             * @param {Boolean} init
             */
            $scope.loadStreamingItems = function loadStreamingItems(init) {

                if (init) {
                    $scope.selectedStreamingItem = null;
                    $scope.isLoadingCustomStreaming = true;
                } else {
                    $scope.isLoadingStreamingDropdown = true;
                }
                $http.get(Config.main.video.customStreamingURL).then(function (response) {
                    var responseMatchList = response.data.MatchList;
                    if (responseMatchList.length === 1 && !responseMatchList[0].FrameLink) {
                        responseMatchList = [];
                    }
                    $scope.streamingItems = responseMatchList;
                    if (init) {
                        $scope.selectedStreamingItem = $scope.streamingItems[0] || null;
                    } else {
                        var contains = false;
                        for (var j = $scope.streamingItems.length; j--;) {
                            if ($scope.selectedStreamingItem.matchid === $scope.streamingItems[j].matchid) {
                                contains = true;
                                break;
                            }
                        }
                        if (!contains) {
                            $scope.selectedStreamingItem = $scope.streamingItems[0] || null;
                        }
                    }
                    $scope.isLoadingCustomStreaming = false;
                    $scope.isLoadingStreamingDropdown = false;
                }, function () {
                    $scope.isLoadingCustomStreaming = false;
                    $scope.isLoadingStreamingDropdown = false;


                });

            };
        }
    }

    /**
     * @ngdoc method
     * @name subscribe
     * @methodOf vbet5.service:StreamService
     * @description monitoring game's streaming availibilaty
     * @param {String} gameKey the selected game key
     * @param {String} pinnedGamesKey the pinned games key
     * @param {String} enlargedGameKey the enlarged game key
     */
    StreamService.prototype.monitoring = function monitoring(scope, gameKey, pinnedGamesKey, enlargedGameKey) {
        var hasVideo = GameInfo.hasVideo(scope[gameKey]);

        if (Config.main.sportsLayout === "modern") {
            if (scope[gameKey].has_animation && scope[gameKey].activeFieldType !== "video") {
                scope[gameKey].activeFieldType = "field";
            } else if (scope[gameKey].has_animation && scope[gameKey].activeFieldType !== "field") {
                scope[gameKey].activeFieldType = "video";
            }
        }

        if (hasVideo) {
            if (scope[gameKey].video_data === undefined) {
                if (!scope[pinnedGamesKey] || !scope[pinnedGamesKey][scope[gameKey].id]) {
                    if (scope[enlargedGameKey] && scope[enlargedGameKey].id !== scope[gameKey].id) {
                        scope[enlargedGameKey] = !Config.main.detachedVideoSizes[scope[gameKey].tv_type] ? scope[gameKey] : null;
                    }
                    if (scope[enlargedGameKey] || Config.main.video.autoPlay) {
                        scope[gameKey].video_data = null; //not to call this several times before getVideoData fills the field
                        GameInfo.getVideoData(scope[gameKey], false);
                    }
                } else {
                    scope[gameKey].activeFieldType = 'field';
                }

            }
        } else {
            //reset streaming data
            if (scope[gameKey].video_data) {
                scope[gameKey].video_data = undefined;
                if (scope[gameKey].activeFieldType === "video") {
                    scope[gameKey].activeFieldType = undefined;
                }
            }
            if (scope[gameKey].type === 1 && Config.main.defaultStreaming && Config.main.defaultStreaming.enabled) {
                scope[gameKey].tv_type = Config.main.defaultStreaming.tvType;
                scope[gameKey].video_data = Config.main.defaultStreaming.streamUrl;
                if (scope[enlargedGameKey]) {
                    scope[enlargedGameKey] = scope[gameKey];
                }
                hasVideo = true;
            } else if(scope[enlargedGameKey]) {
                scope[enlargedGameKey] = null;
            }
        }

        if (scope[gameKey].activeFieldType === undefined) {
            if (this.game && this.game.activeFieldType === 'customStreaming') {
                scope[gameKey].activeFieldType = 'customStreaming';
            } else {
                scope[gameKey].activeFieldType = hasVideo && !scope[enlargedGameKey] && (Config.main.alwaysOpenVideo || Config.env.authorized || scope[gameKey].is_guest ||  $rootScope.loginInProgress || !scope[gameKey].has_animation) ? 'video' : 'field';
            }
        }

        this.game = scope[gameKey];
        this.pinnedGames = scope[pinnedGamesKey];
        this.enlargedGame = scope[enlargedGameKey];
    };



    return StreamService;
}]);

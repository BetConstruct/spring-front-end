/* global VBET5 */
/**
 * @ngdoc service
 * @name vbet5.service:stream
 * @description stream service
 *
 */
VBET5.service('StreamService', ['$rootScope', 'GameInfo', 'Config', function ($rootScope, GameInfo, Config) {
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
        $scope.$on('loggedIn', checkVideoAvailability);     // restoring login case
        $scope.$on('login.loggedIn', checkVideoAvailability); //normal login case

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
                } else {
                    if ($rootScope.profile) {
                        GameInfo.getVideoData(self.game);
                    } else {
                        var profilePromise = $rootScope.$watch('profile', function () {
                            if ($rootScope.profile) {
                                profilePromise();
                                GameInfo.getVideoData(self.game);
                            }
                        });
                    }
                }
            }
        }

        //and unavailable when he logs out
        $scope.$on('login.loggedOut', function () {
            if (self.game && self.game.video_data !== undefined) {
                self.game.video_data = undefined;
            }
            if (self.pinnedGames) {
                self.pinnedGames = {};
            }
            if (self.enlargedGame) {
                self.enlargedGame = null;
            }
        });

        //synchronize video with user balance
        $scope.$watch('profile.balance', function (newValue, oldValue) {
            if (self.game) {
                if (self.game.video_data && newValue === 0 && $rootScope.profile.initial_balance === 0) {
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
            if (!gameId || !self.game || gameId !== self.game.id) return;

            self.game.video_data = null;
            GameInfo.getVideoData(self.game);
        });
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
        } else if (scope[gameKey].type === 1 && Config.main.defaultStreaming && Config.main.defaultStreaming.enabled) {
            scope[gameKey].tv_type = Config.main.defaultStreaming.tvType;
            scope[gameKey].video_data = Config.main.defaultStreaming.streamUrl;
            if (scope[enlargedGameKey]) {
                scope[enlargedGameKey] = scope[gameKey];
            }
            hasVideo = true;
        } else if(scope[enlargedGameKey]) {
            scope[enlargedGameKey] = null;
        }

        if (scope[gameKey].activeFieldType === undefined) {
            scope[gameKey].activeFieldType = hasVideo && !scope[enlargedGameKey] && (Config.main.alwaysOpenVideo || Config.env.authorized || $rootScope.loginInProgress || !scope[gameKey].has_animation) ? 'video' : 'field';
        }

        this.game = scope[gameKey];
        this.pinnedGames = scope[pinnedGamesKey];
        this.enlargedGame = scope[enlargedGameKey];
    };

    return StreamService;
}]);
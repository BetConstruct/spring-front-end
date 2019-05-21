/* global VBET5 */
/**
 * @ngdoc directive
 * @name vbet5.directive:liveGameScores
 * @description Live game score directive
 *
 */
VBET5.directive('liveGameScores', ['$window', 'Config', 'Storage', 'GameInfo', 'Utils','$rootScope', function ($window, Config, Storage, GameInfo, Utils,$rootScope) {
    'use strict';
    return {
        restrict: 'AE',
        scope: {
            openGame: '=',
            enlargedGame: '=',
            showStatsBlock: '=',
            marketsInOneColumn: '='
        },
        templateUrl: 'templates/directive/live-game-scores.html',
        link: function (scope,element,attr) {
            scope.Math = Math;
            scope.liveGamesSoccerTemplate = GameInfo.liveGamesSoccerTemplate;
            scope.dotaGamesList = GameInfo.dotaGamesList;
            scope.framesCount = Utils.memoize(GameInfo.framesCount);
            scope.showFrameAlias = Utils.memoize(GameInfo.showFrameAlias);
            scope.slideSets = GameInfo.slideSets;
            scope.getCurrentTime = Utils.memoize(GameInfo.getCurrentTime);
            scope.visibleSetsNumber = 5;
            scope.openGameLoading = false;

            /**
             * @ngdoc method
             * @name toggleLiveSectionPin
             * @methodOf vbet5.directive:liveGameScores
             * @description pins/unpin live score section at the top of middle section
             */
            scope.toggleLiveSectionPin = function toggleLiveSectionPin() {
                $rootScope.env.isLiveGamePinned = !$rootScope.env.isLiveGamePinned;
                if ($rootScope.env.isLiveGamePinned && Config.env.hideLiveStats) {
                    Config.env.hideLiveStats = false;
                    scope.setStatsBlockState(!Config.env.hideLiveStats);
                }
                Storage.set('LiveGamePin', $rootScope.env.isLiveGamePinned);
            };

            /**
             * @ngdoc method
             * @name switchMarketsInOneColumn
             * @methodOf vbet5.controller:classicViewMainCtrl
             * @description  switch markets to one or two columns
             * @param {boolean} enabled
             */
            scope.switchMarketsInOneColumn = function switchMarketsInOneColumn(enabled) {
                if (scope.marketsInOneColumn.enabled !== enabled) {
                    scope.marketsInOneColumn.enabled = enabled;
                    Storage.set('markets_in_one_column', enabled);
                }
            };

            /**
             * @ngdoc method
             * @name changeStatsMode
             * @methodOf vbet5.directive:liveGameScores
             * @description  changes live games stats mode from chart to details and back
             */
            scope.changeStatsMode = function changeStatsMode(mode) {
                scope.flipMode = mode;
            };

            $rootScope.env.isLiveGamePinned = !!Storage.get('LiveGamePin');

            /**
             * @ngdoc method
             * @name toggleStatsVisibility
             * @methodOf vbet5.directive:liveGameScores
             * @description  toggles live game statistics visibility
             */
            scope.toggleStatsVisibility = function toggleStatsVisibility() {
                Config.env.hideLiveStats = !Config.env.hideLiveStats;
                scope.setStatsBlockState(!scope.showStatsBlock);
            };

            /**
             * @ngdoc method
             * @name openStatistics
             * @methodOf @methodOf vbet5.directive:liveGameScores
             * @description
             * Opens statistics in popup window
             *
             * @param {Object} game game object
             */
            scope.openStatistics = function openStatistics(game) {
                $window.open(GameInfo.getStatsLink(game), game.id, "width=940,height=600,resizable=yes,scrollbars=yes");
            };

            scope.setStatsBlockState = function setStatsBlockState(state) {
                if (state !== undefined) {
                    scope.showStatsBlock = !!state;
                    scope.$emit('sportsbook.updateStatsBlockState', !!state);
                }
            };

            if (scope.openGame && (!Config.main.disableITFGamesInfo || !scope.openGame.is_itf)) {
                scope.$watch("openGame", function () {
                    var outputText = "";
                    if (scope.openGame) {
                        if(scope.openGame.is_live){
                            outputText =
                                (scope.openGame.text_info ? (scope.openGame.text_info.split(';').join().replace(/,\s*$/, "")) + ", " : "") +
                                (scope.openGame.add_info_name ? scope.openGame.add_info_name + " " : "") +
                                (scope.openGame.info && scope.openGame.info.add_info ? scope.openGame.info.add_info + ", " : "") +
                                (scope.openGame.tv_info ? scope.openGame.tv_info + "," : "");
                            outputText = outputText ? outputText.replace(/,\s*$/, "") : "";
                        }else{
                            outputText =
                                (scope.openGame.text_info ? (scope.openGame.text_info) + " " : "") +
                                (scope.openGame.add_info_name ? scope.openGame.add_info_name + " " : "") +
                                (scope.openGame.info && scope.openGame.info.add_info ? scope.openGame.info.add_info + " " : "");
                        }
                    }
                    scope.getGameAdditionalInfoV3 = outputText;
                }, true);
            }
        }
    };
}]);

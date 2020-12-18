/* global VBET5 */
/**
 * @ngdoc directive
 * @name vbet5.directive:basketballShootsLive
 *
 * @description Basketball Shoots Live
 *
 */
VBET5.directive('basketballShootsLive', function () {
    'use strict';
    return {
        restrict: 'E',
        templateUrl: 'templates/directive/basketball-shots.html',
        scope: {
            openGame: '='
        },
        link: function (scope, elem) {
            var element = elem[0];
            scope.shotsSlider = {
                untouched: true,
                visibleCount: 10,
                scrollIndex: 0,
                needScroll: false,
                next: function () {
                    if (scope.shotsSlider.scrollIndex < (scope.openGame.info.total_attempts - scope.shotsSlider.visibleCount)) {
                        scope.shotsSlider.untouched = false;
                        scope.shotsSlider.scrollIndex++;
                    }
                },
                previous: function () {
                    if (scope.shotsSlider.scrollIndex > 0) {
                        scope.shotsSlider.untouched = false;
                        scope.shotsSlider.scrollIndex--;
                    }
                }
            };
            var firstTime = true;
            var autoScroll = function () {
                if (scope.shotsSlider.untouched) {
                    return true;
                }
                var lastEventIndex = scope.openGame.live_events ? scope.openGame.live_events.length - 1 : 0;
                var firstVisibleIndex = scope.shotsSlider.scrollIndex;
                var lastVisibleIndex = scope.shotsSlider.scrollIndex + scope.shotsSlider.visibleCount;

                return scope.shotsSlider.needScroll && (lastEventIndex >= firstVisibleIndex && lastVisibleIndex - lastEventIndex < 3 && lastVisibleIndex >= lastEventIndex);
            };

            var calculateScrollIndex = function calculateScrollIndex() {
                var eventsCount = scope.openGame.live_events && scope.openGame.live_events.length ? scope.openGame.live_events.length : 0;
                var totalAttempts = scope.openGame.info.total_attempts;
                var visibleCount = scope.shotsSlider.visibleCount;
                var bufferSize = 3;
                var scrollIndex = 0;

                if(eventsCount){
                    if(eventsCount >= (visibleCount - bufferSize)){
                        scrollIndex = eventsCount - visibleCount + bufferSize
                    }
                    if(scrollIndex + visibleCount >= totalAttempts){
                        scrollIndex = totalAttempts - visibleCount;
                    }
                }else {
                    scrollIndex = 0;
                }

                scope.shotsSlider.scrollIndex = parseInt(scrollIndex);
            };
            scope.$watch(function () {   //shots container width watcher
                if (element && element.getElementsByClassName('status-short-l')[0]) {
                    return element.getElementsByClassName('status-short-l')[0].clientWidth;
                }
            }, function (newVal, oldVal) {
                if (newVal !== oldVal || firstTime) {
                    firstTime = false;
                    var autoScrollValue = autoScroll();
                    scope.shotsSlider.visibleCount = Math.floor(newVal / 37); // item width 37px
                    scope.shotsSlider.needScroll = scope.openGame.info.total_attempts > scope.shotsSlider.visibleCount;
                    if (autoScrollValue) {
                        calculateScrollIndex();
                    }
                }
            });

            scope.$watch('openGame.live_events.length', function (newVal, oldVal) {
                if (newVal !== oldVal && autoScroll()) {
                    calculateScrollIndex();
                }
            });
        }

    }
});

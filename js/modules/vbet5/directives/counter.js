/* global VBET5 */
/**
 * @ngdoc directive
 * @name vbet5.directive:capitaliseinput
 *
 * @description capitalises the strings first letter
 *
 */
VBET5.directive('counter', ['$rootScope', 'Translator', '$interval', 'Moment', function ($rootScope, Translator, $interval, Moment) {
    'use strict';
    return {
        templateUrl: 'templates/directive/counter.html',
        scope: {},
        link: function (scope, elem, attrs) {
            var counterInterval, doBroadcast = false;
            scope.timer = {};

            function initTimer () {
                scope.finishText = attrs.finishText;
                scope.timer.start = attrs.start;
                scope.timer.time = -Moment.get().diff(Moment.moment.utc(attrs.start), 'seconds');

                if (scope.timer.time > 0) {
                    $interval.cancel(counterInterval);
                    counterInterval = $interval(updateTimer, 1000);
                    doBroadcast = true;
                } else {
                    doBroadcast = false;
                }

                updateTimerValues();
            }

            function updateTimerValues () {
                scope.timer.s = scope.timer.time % 60;
                scope.timer.m = Math.floor(scope.timer.time / 60) % 60;
                scope.timer.h = Math.floor(scope.timer.time / 3600) % 24;
                scope.timer.d = Math.floor(scope.timer.time / 86400);
            }

            function updateTimer() {
                scope.timer.time -= 1;
                if (scope.timer.time < 0) {
                    $interval.cancel(counterInterval);
                    if (doBroadcast && attrs.name) {
                        $rootScope.$broadcast('counterFinished.' + attrs.name);
                    }
                    return;
                }
                updateTimerValues();
            }

            initTimer();

            scope.timerText = Translator.get('D H M S').split(' ');

            attrs.$observe('start', initTimer);

            scope.$on('$destroy', function () {
                $interval.cancel(counterInterval);
                counterInterval = undefined;
            });
        }
    };
}]);

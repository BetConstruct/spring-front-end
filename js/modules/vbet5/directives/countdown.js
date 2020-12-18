/* global VBET5 */
/**
 * @ngdoc directive
 * @name vbet5.directive:countdown
 * @description a countdown timer
 *
 * @param {string} time till the start of the event (unix)
 * @returns {Object} countdown - an object containing days, hours, minutes and seconds till the start of the event
 */
VBET5.directive('countdown', ['$timeout', 'Moment', 'Translator', function ($timeout, Moment, Translator) {
    'use strict';
    return {
        restrict: 'A',
        link: function ($scope, element, attrs) {
            var timeoutPromise;

            $scope.timerText = Translator.get('D H M S').split(' ');

            function calcRemainingTime() {
                var currTime = (new Date().getTime() / 1000);
                var eventTime = attrs.countdown;
                var diffTime = eventTime - currTime;
                if (diffTime >= 0) {
                    var duration = Moment.moment.duration(diffTime, 'seconds');
                    var days = Math.floor(duration.asDays());
                    var hours = Math.floor(duration.asHours()) - days * 24;
                    var minutes = Math.floor(duration.asMinutes()) - days * 24 * 60 - hours * 60;
                    var seconds = Math.floor(duration.asSeconds()) - days * 24 * 60 * 60 - hours * 60 * 60 - minutes * 60;

                    $scope.countdown = {
                        days: format(days),
                        hours: format(hours),
                        minutes: format(minutes),
                        seconds: format(seconds)
                    };
                    timeoutPromise = $timeout(calcRemainingTime, 1000);
                } else {
                    $scope.countdown = {
                        days: '00',
                        hours: '00',
                        minutes: '00',
                        seconds: '00'
                    };

                    if (attrs.completedCallback) {
                        $scope[attrs.completedCallback]();
                    }
                }
            }

            function format(number) {
                return number < 10 ? '0' + number : number;
            }

            attrs.$observe('countdown', calcRemainingTime);
            $scope.$on('$destroy', function cancelTimeout() { $timeout.cancel(timeoutPromise); });
        }
    };
}]);

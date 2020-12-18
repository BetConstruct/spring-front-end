/* global VBET5 */
/**
 * @ngdoc directive
 * @name vbet5.directive:soccertimeline
 *
 * @description Draws soccer timeline
 *
 */
VBET5.directive('soccertimeline', function () {
    'use strict';
    return {
        restrict: 'E',
        replace: 'true',
        templateUrl: 'templates/directive/soccer-time-line.html',
        scope: {
            openGame: '=',
            showOnlyOne: '=',
            showEventsOnTlHover: '='
        },
        link: function (scope, elem) {
           var element = elem[0];

            scope.drawTimeLine = function drawTimeLine(isExtra) {
                var containerClass = 'main-time';

                var matchLength = (scope.openGame.match_length > 90 ? scope.openGame.match_length - 30 : scope.openGame.match_length * 1);
                if (isExtra) {
                    containerClass = 'extra-time';
                    matchLength = 30;
                }
                var container = element.getElementsByClassName(containerClass)[0];

                var halfTime = matchLength / 2;
                var step;

                if (halfTime % 15 === 0) {
                    step = 15
                } else if (halfTime % 10 === 0) {
                    step = 10
                } else {
                    step = halfTime / 2;
                }

                for (var i = 0; i <= matchLength; i += step / 2) {

                    var span = document.createElement('SPAN');
                    var isSpecial = false;
                    var time = i > 10 ? (i / 10).toFixed(1).replace('.', '  ') : ' ' + i;
                    span.dataset.content = '';

                    if (i === 0) { // start
                        span.className = 'start-separator';
                        isSpecial = true;
                    } else if (i === halfTime) { // half
                        span.className = 'ht-separator';
                        span.dataset.content = 'HT';
                        isSpecial = true;
                    } else if (i === matchLength) { // full
                        span.className = 'ft-separator';
                        span.dataset.content = 'FT';
                        isSpecial = true;
                    }

                    if (i % step === 0 || isSpecial) {
                        span.dataset.content += '\n' + time;
                        span.className += ' big-separator';
                    } else {
                        span.className += ' small-separator';
                    }

                    span.style.left = 'calc(' + (i / matchLength * 100) + '%' + ' - 10px)';
                    span.style.width = '10px';
                    container.appendChild(span);
                }
            }

        }
    };
});

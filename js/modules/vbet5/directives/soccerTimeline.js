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
        template: '<div class="timeline-control"></div>',
        scope: {
            matchLength: '=',
            isExtra: '='
        },
        link: function (scope, element) {
            element = element[0];
            var matchLength = (scope.matchLength > 90 ? scope.matchLength - 30 : scope.matchLength * 1) ;
            if (scope.isExtra) {
                matchLength = 30;
            }


            var halfTime = matchLength / 2;
            var step;

            if(halfTime % 15 === 0){
                step = 15
            }else if(halfTime % 10 === 0){
                step = 10
            }else{
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
                element.appendChild(span);
            }

        }
    };
});

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
        template: '<div class="timeline-control" >' +
            '<span class="tl-15"></span>' +
            '<span class="tl-18"></span>' +
            '<span class="tl-30"></span>' +
            '<span class="tl-35"></span>' +
            '<span class="tl-45"></span>' +
            '<span class="tl-52"></span>' +
            '<span class="tl-60"></span>' +
            '<span class="tl-70"></span>' +
            '<span class="tl-75"></span>' +
            '<span class="tl-90"></span>' +

            '<span class="tl-20"></span>' +
            '<span class="tl-40"></span>' +
            '<span class="tl-6-0"></span>' +
            '<span class="tl-80"></span>' +

            '<span class="ht-ft"></span>' +
            '</div>'
    };
});

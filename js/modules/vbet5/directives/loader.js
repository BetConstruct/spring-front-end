/* global VBET5 */
/**
 * @ngdoc directive
 * @name vbet5.directive:loader
 *
 * @description adds custom loader control to the page
 *
 */
VBET5.directive('vbetLoader', function () {
    'use strict';
    return {
        restrict: 'E',
        replace: 'true',
        
        template: '<div class="md-progress-circular md-theme">' +
                   '<div class="md-spinner-wrapper">' +
                       '<div class="md-inner">' +
                           '<div class="md-gap"></div>' +
                           '<div class="md-left">' +
                               '<div class="md-half-circle"></div>' +
                           '</div>' +
                           '<div class="md-right">' +
                               '<div class="md-half-circle"></div>' +
                           '</div>' +
                       '</div>' +
                   '</div>' +
                '</div>'
    };
});

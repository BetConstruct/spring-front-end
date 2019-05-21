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
        
        template: '<div class="md-progress-circular md-theme"></div>'
    };
});

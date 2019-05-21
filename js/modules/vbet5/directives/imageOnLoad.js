/* global VBET5 */
/**
 * @ngdoc directive
 * @name vbet5.directive:imageOnLoad
 * @description When binding ended call function
 *
 * @param {String} bigger value
 */
VBET5.directive('imageOnLoad', function () {
    'use strict';
    return {
        restrict: 'A',
        scope: {
            successCallBack: '&',
            imageWidth: "="
        },
        link: function (scope, element) {
            element.on('load', function () {
                    scope.successCallBack();
                    scope.imageWidth = element[0].clientWidth;
            });

            scope.$on('$destroy', function() {
                element.off('load');
            })
        }
    };
});
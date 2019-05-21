/* global VBET5 */
/**
 * @ngdoc directive
 * @name vbet5.directive:errorsrc
 * @description replaces image src in case of error
 *
 * @param {String} bigger value
 */
VBET5.directive('errSrc', ['$$sanitizeUri', function($$sanitizeUri) {
    'use strict';
    return {
        link: function (scope, element, attrs) {
            element.bind('error', function () {
                if (attrs.src !== attrs.errSrc) {
                    attrs.$set('src', $$sanitizeUri(attrs.errSrc));
                }
            });

            scope.$on('$destroy', function() {
                element.unbind('error');
            });
        }
    };
}]);

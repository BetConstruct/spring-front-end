/* global VBET5 */
/**
 * @ngdoc directive
 * @name vbet5.directive:match
 * @description checks form element value to match with  another model value
 *
 * @param {String} match model to watch
 */
VBET5.directive('match', function () {
    'use strict';
    return {
        require: 'ngModel',
        restrict: 'A',
        scope: {
            match: '='
        },
        link: function (scope, elem, attrs, ctrl) {
            scope.$watch(function () {
                return (ctrl.$pristine && angular.isUndefined(ctrl.$modelValue)) || scope.match === ctrl.$modelValue;
            }, function (currentValue) {
                ctrl.$setValidity('match', currentValue);
            });
        }
    };
});
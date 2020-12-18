/* global VBET5 */
/**
 * @ngdoc directive
 * @name vbet5.directive:bigger
 * @description compares 2 values and detects if one is bigger
 *
 * @param {String} bigger value
 */
VBET5.directive('bigger', function () {
    'use strict';
    return {
        require: 'ngModel',
        restrict: 'A',
        scope: {
            bigger: '='
        },
        link: function (scope, elem, attrs, ctrl) {
            scope.$watch(function () {
                return ((ctrl.$pristine || attrs.validUndefined) && angular.isUndefined(ctrl.$modelValue)) || scope.bigger <= ctrl.$modelValue;
            }, function (currentValue) {
                ctrl.$setValidity('bigger', !!(currentValue || !scope.bigger));
            });
        }
    };
});
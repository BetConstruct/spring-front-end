/* global VBET5 */
/**
 * @ngdoc directive
 * @name vbet5.directive:rangeValidation
 * @description validate text input numeric ranges
 */
VBET5.directive('rangeValidation', function () {
    'use strict';
    return {
        require: 'ngModel',
        restrict: 'A',
        link: function (scope, elem, attr, ngModel) {
            ngModel.$validators.rangeValidation = function (modelValue, viewValue) {
                var value = parseFloat(modelValue || viewValue);
                var min = parseFloat(attr.rangeMin);
                var max = parseFloat(attr.rangeMax);
                var isValid = false;

                if(!isNaN(value)){
                    if ((isNaN(min) || value >= min) && (isNaN(max) || value <= max)) {
                        isValid = true;
                    }
                }else {
                    isValid = true;
                }
                return isValid;
            };
        }
    };
});
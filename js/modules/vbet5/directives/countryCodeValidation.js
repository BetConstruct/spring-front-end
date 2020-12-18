/* global VBET5 */
/**
 * @ngdoc directive
 * @name vbet5.directive:countryCodeValidate
 * @description Validates country code
 */
angular.module('vbet5').directive('countryCodeValidate', ['Utils', 'CountryCodes', function (Utils, CountryCodes) {
    'use strict';

    return {
        require: 'ngModel',
        scope: {},
        link: function (scope, elm, attrs, ctrl) {
            var codesArray = [], parsed;
            if (codesArray.length === 0) {
                angular.forEach(CountryCodes, function (item) {
                    codesArray.push(item.code.replace(' ', ''));
                });
            }
            ctrl.$parsers.unshift(function (viewValue) {
                if (!viewValue) {
                    ctrl.$setValidity('countryCode', false);
                    return;
                }
                parsed = viewValue.replace(' ', '');
                if (Utils.isInArray(codesArray, parsed) !== -1) {
                    // it is valid
                    ctrl.$setValidity('countryCode', true);
                    return viewValue;
                } else {
                    // it is invalid, return undefined (no model update)
                    ctrl.$setValidity('countryCode', false);
                    return viewValue;
                }
            });
        }
    };
}]);
/**
 * @ngdoc directive
 * @name vbet5.directive:preventInput
 * @description prevents symbols specified with regex to be entered into input
 *
 * example:  <input ng-model="modelVar" prevent-input="[^0-9]+"> - will bprevent input of anything but numbers
 *
 * @param {String} prevent-input regular expression
 */
angular.module("vbet5").directive('preventInput', [ 'Utils', function (Utils) {
    'use strict';
    return {
        require: '?ngModel',
        link: function (scope, element, attrs, ngModelCtrl) {
            if (!ngModelCtrl || !attrs.preventInput) {
                return;
            }
            var commaValues = ['.', ','];


                ngModelCtrl.$parsers.push(function (val) {
                if (angular.isUndefined(val)) {
                    val = '';
                }
                var clean = val.replace(new RegExp(attrs.preventInput, "g"), '');
                if (attrs.preventRounding && attrs.commaEnable !== 'true') {
                    var currencyRounding = +attrs.preventRounding;
                    var length = clean.length;
                    if (length ) {
                        if (commaValues.indexOf(clean[0]) > -1) {
                            clean = clean.substr(1);
                        } else {
                            if (commaValues.indexOf(clean[length - 1]) === -1) {
                                clean = Utils.cutDecimalNumberAfterPlace(clean,  currencyRounding);
                            } else {
                                if (currencyRounding === 0) {
                                    clean = clean.substr(0, length - 1);
                                }
                            }
                        }
                    }

                }
                if (attrs.commaEnable !== 'true' && val !== clean) {
                    ngModelCtrl.$setViewValue(clean);
                    ngModelCtrl.$render();
                }



                return clean;
            });

            if (!attrs.allowSpaces) {
                element.bind('keypress', function (event) {
                    if (event.keyCode === 32) {
                        event.preventDefault();
                    }
                });

                scope.$on('$destroy', function() {
                    element.unbind('keypress');
                });
            };
        }
    };
}]);

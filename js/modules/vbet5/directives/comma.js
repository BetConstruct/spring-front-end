/* global VBET5 */
/**
 * @ngdoc directive
 * @name vbet5.directive:comma
 * @description comma separated number
 */
VBET5.directive('comma', ['$filter', function ($filter) {
    'use strict';
    return {
        require: '?ngModel',
        link: function (scope, elem, attrs, ctrl) {

            var viewRender = function viewRender(val1, val2) {
                ctrl.$formatters.unshift(function () {
                    return ctrl.$modelValue;
                });

                ctrl.$parsers.unshift(function (viewValue) {
                    var plainNumber = viewValue.replace(val1, val2);
                    elem.val($filter('number')(plainNumber));
                    return plainNumber;
                });
            };

            if (!ctrl) {
                return;
            }

            if (attrs.commaEnable) {
                scope.$watch(attrs.ngModel, function (newVal) {

                    if (newVal !== undefined && newVal !== null) {
                        var inputVal = String(newVal);
                        inputVal = inputVal.replace(",", ".");

                        if (attrs.commaDecimal && (attrs.commaDecimal === 'enable')) {
                            inputVal = inputVal.replace(/[^\d\.\,]+/g, '');
                        } else {
                            inputVal = inputVal.replace(/[^\d\,]+/g, '');
                        }

                        //clearing left side zeros
                        if (inputVal.charAt(0) === '0' && inputVal.charAt(1)) {
                            inputVal = inputVal.substr(1);
                        }

                        if (inputVal.charAt(0) === '.') {
                            inputVal = '0' + inputVal;
                        }

                        if (attrs.commaEnable === 'true') {
                            var point = inputVal.indexOf(".");

                            if (point >= 0) {
                                inputVal = inputVal.slice(0, point + 3);
                            }
                        }

                        var decimalSplit = inputVal.split(".");
                        var intPart = decimalSplit[0];
                        var decPart = decimalSplit[1];

                        if (attrs.commaEnable === 'true') {
                            intPart = intPart.replace(/[^\d]/g, '');
                            if (intPart.length > 3) {
                                var intDiv = Math.floor(intPart.length / 3);
                                while (intDiv > 0) {
                                    var lastComma = intPart.indexOf(",");
                                    if (lastComma < 0) {
                                        lastComma = intPart.length;
                                    }

                                    if (lastComma - 3 > 0) {
                                        intPart = intPart.slice(0, lastComma - 3) + "," + intPart.slice(lastComma - 3);
                                    }
                                    intDiv--;
                                }
                            }
                        }

                        if (decPart === undefined) {
                            decPart = "";
                        } else {
                            if (attrs.preventRounding) {
                                var currencyRounding = +attrs.preventRounding;
                                if(currencyRounding === 0) {
                                  decPart = "";
                                } else {
                                  decPart = decPart.substr(0, currencyRounding);
                                  decPart = "." + decPart;
                                }
                            } else{
                                decPart = "." + decPart;
                            }
                        }
                        var res = intPart + decPart;

                        ctrl.$setViewValue(res);
                        ctrl.$render();
                    }
                });
                if (attrs.commaEnable === 'true') {
                    viewRender(/[^\d|\-+|\.+]/g, '');
                } else if (attrs.commaDot === 'true') {
                    viewRender(/,/g, '.');
                }
            }
        }
    };
}]);

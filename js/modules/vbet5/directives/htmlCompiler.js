/* global VBET5 */
/**
 * @ngdoc directive
 * @name vbet5.directive:vbHtmlCompiler
 * @description This directive is responsible for compiling custom attributes(directives, etc ..) to existing html
 * @param {Array} customAttrs - should be array of directives
 * @param {string} htmlTemplate should be html text which will be compiled and replaced
 */
VBET5.directive('vbHtmlCompiler', ['$compile', '$parse', function ($compile, $parse) {
    'use strict';
    return {
        restrict: 'A',
        replace: true,
        link: function ($scope, $element, $attrs) {
            $scope.$watch('$attrs.vbHtmlCompiler', function () {
                var customAttrs = $parse($attrs.customAttrs)($scope),
                    htmlTemplate = angular.element($attrs.vbHtmlCompiler);

                if (customAttrs) {
                    customAttrs.forEach(function (attribute) {
                        for (var key in attribute) {
                            if (angular.isDefined(attribute[key])) {
                                htmlTemplate.attr(key, attribute[key]);
                            }
                        }
                    });
                }
                if ($attrs.appendToHtml) {
                    htmlTemplate[0].innerHTML = $attrs.appendToHtml;
                }
                $element.html(htmlTemplate[0].outerHTML);

                if ($attrs.insertAfter) {
                    $element[0].innerHTML =  $element[0].innerHTML + $attrs.insertAfter;
                }
                $compile($element.contents())($scope);
            });
        }
    };
}]);
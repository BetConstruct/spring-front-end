/* global VBET5 */
/**
 * @ngdoc directive
 * @name vbet5.directive:tooltipElement
 * @element ANY
 * @description shows a tooltip on mouseover
 *
 * @param {String} tooltip-element tooltip element id (which will be shown and moved to cursor when cursor comes over element containing attribute)
 * @param {Number} tooltip-delay delay after which tooltip will be hidden after mouse leaves element
 * @param {String} manual-position manual position
 * @param {Expression} tooltip-if if specified, tooltip directive will work only if this expression is true
 *
 */
VBET5.directive('tooltipElement', ['$timeout', '$window', function ($timeout, $window) {
    'use strict';

    var delay = 500;

    return {
        restrict: 'A',
        scope: {
            tooltipDelay: '@',
            manualPosition: '@',  //optional
            tooltipElement: '@',
            tooltipIf: "="
        },
        link: function (scope, element, attr) {
            if (attr.tooltipIf && !scope.tooltipIf) {
                return;
            }
            var isHovered = false;
            var manualPosition = false;
            if (attr.tooltipDelay !== undefined) {
                delay = parseInt(attr.tooltipDelay, 10);
            }
            if (attr.manualPosition !== undefined) {
                manualPosition = true;
            }
            var retries = 0;

            function setUp() {

                var elem = $window.document.getElementById(attr.tooltipElement);

                if (elem) {
                    var toolTip = angular.element(elem);
                    toolTip.addClass('tooltip').css({display: 'none'});
                } else {
                    if (retries++ < 5) {
                        $timeout(setUp, 500);
                    }
                }
            }

            setUp();

            element.bind('mouseover', function hover(event) {
                var toolTip = angular.element($window.document.getElementById(attr.tooltipElement));
                isHovered = true;
                if (toolTip && toolTip.css('display') !== 'block') {
                    if (manualPosition) {
                        toolTip.parent().css({ position: 'relative' });
                        toolTip.css({
                            position: 'absolute',
                            display: 'block',
                            zIndex: '9999999999999',
                            left: '50%',
                            bottom: '110%'
                        });
                    } else {
                        toolTip.css({
                            position: 'fixed',
                            display: 'block',
                            zIndex: '9999999999999',
                            left: event.clientX + 'px',//'auto',
                            top: event.clientY + 'px'//'auto',
                            //margin: '12px 0 0 0'
                        });
                    }
                }
            });

            element.bind('mouseout', function hoverEnd() {
                var toolTip = angular.element($window.document.getElementById(attr.tooltipElement));
                isHovered = false;

                if (toolTip) {
                    $timeout(function () {
                        if (!isHovered) {
                            toolTip.css({display: 'none'});
                        }
                    }, delay);

                }
            });

            scope.$on('$destroy', function() {
                element.unbind('mouseover');
                element.unbind('mouseout');
            });
        }
    };
}]);


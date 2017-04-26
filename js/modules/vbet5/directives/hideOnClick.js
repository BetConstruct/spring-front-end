/* global VBET5 */
/**
 * @ngdoc directive
 * @name vbet5.directive:hideOnClick
 * @element ANY
 *
 * @description
 * Will hide element when user clicks somewhere outside it
 *
 * @param {String} [state-flag-var]  flag variable(optional).
 * If specified, hiding element will be done by setting variable with this name to false.
 * If not, 'ng-hide' class will be added to element
 *
 * @param {String} [broadcast-on-close] optional. message to broadcast from $rootScope
 * when element is hidden by click and state-flag-var is defined(and is true)
 * element object will be broadcasted as message data
 *
 * @param {String} [except] optional. id of another element click on which will not hide our element
 *
 * @param {String} [dontHide] optional. id of element that, when having this directive will not be hidden
 */
VBET5.directive('hideOnClick', ['$window',  '$rootScope', 'Config', function ($window, $rootScope, Config) {
    'use strict';

    var elements = [];

    /**
     * Hides element by adding ng-hide class or changing specified scope flag variable
     * @param {Object} element
     * @param {Object} attr
     * @param {Object} scope
     */
    function hideElement(element, attr, scope) {
        if (attr.hideOnClick !== 'false') {
            if (attr.stateFlagVar !== undefined) {
                if (attr.broadcastOnClose !== undefined && scope.$eval(attr.stateFlagVar)) {
                    $rootScope.$broadcast(attr.broadcastOnClose, element);
                }
                scope.$eval(attr.stateFlagVar + '= false');
            } else {
                element.addClass('ng-hide');
            }
        }

    }

    /**
     * Hides all other elements having this directive
     *
     * @param {Object} element
     * @param {String} attr
     */
    function hideOthers(element, attr) {
        angular.forEach(elements, function (elObj) {
            if (elObj.element !== element) {
                if (attr && attr.dontHide && elObj.element.attr('id') && elObj.element.attr('id') === attr.dontHide) {
                    return;
                }
                hideElement(elObj.element, elObj.attr, elObj.scope);
            }
        });
    }

    return function (scope, element, attr) {
        elements.push({scope: scope, element: element, attr: attr});
        angular.element($window).bind("click", function () {
            if (!Config.env.isGlobalDialog) {
                hideElement(element, attr, scope);
            }
        });

        // prevent propagation of event to $window not to hide it
        element.bind("click", function (event) {
            hideOthers(element, attr);
            event.stopPropagation();
        });

        // clicking on this element will also prevent hiding
        if (attr.except) {
            var exceptElem = angular.element($window.document.getElementById(attr.except));
            exceptElem.bind("click", function (event) {
                hideOthers(element, attr);
                event.stopPropagation();
            });
        }


    };
}]);

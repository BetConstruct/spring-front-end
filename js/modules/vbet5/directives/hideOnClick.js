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
        if (attr.hideOnClick === 'false') {
            return;
        }
        function windowClickHandler(event) {
            if (event.button !== 2 && !Config.env.isGlobalDialog) { //event.button 2 is right button
                hideElement(element, attr, scope);
            }
        }

        elements.push({scope: scope, element: element, attr: attr});
        angular.element($window).on("click", windowClickHandler);

        // prevent propagation of event to $window not to hide it
        element.on("click", function (event) {
            hideOthers(element, attr);
            event.stopPropagation();
        });

        // clicking on this element will also prevent hiding
        var exceptElem;
        if (attr.except) {
            exceptElem = angular.element($window.document.getElementById(attr.except));
            exceptElem.on("click", function (event) {
                hideOthers(element, attr);
                event.stopPropagation();
            });
        }

        scope.$on('$destroy', function() {
            angular.element($window).off("click", windowClickHandler);
            element.off("click");
            exceptElem && exceptElem.off("click");
        });
    };
}]);

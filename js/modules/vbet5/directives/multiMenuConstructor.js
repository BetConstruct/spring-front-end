/* global VBET5 */
/**
 * @ngdoc directive
 * @name vbet5.directive:topPosAdder
 * @description Position  dropdown menu according on window size and current list items
 */
VBET5.directive('multiMenuConstructor', ['$window', function ($window) {
    'use strict';
    /**
     * @description finds element by given classname inside the dom list of givent element
     * NOTE its will return only one element
     * @param element <HTMLElement>
     * @param className <String>
     * @returns {*} <HTMLElement>
     */
    function getElementByClassName(element, className) {
        var foundedElement;

        function findElement(element, className) {
            var i,
                length = element.childNodes.length;
            if (foundedElement) {
                return;
            }
            for (i = 0; i < length; i++) {
                if (element.childNodes[i].nodeType && element.childNodes[i].nodeType === 1) {
                    if (element.childNodes[i].classList.contains(className)) {
                        foundedElement = element.childNodes[i];
                        break;
                    }
                    else {
                        findElement(element.childNodes[i], className);
                    }
                }
            }
        }

        findElement(element, className);

        return foundedElement;
    }

    return {
        restrict: 'A',
        replace: false,
        scope: {
            elementToAddClass: '@',
            containerClass: '@',
            defaultOffset: '@'
        },
        link: function (scope, element) {
            var elementToAdd = getElementByClassName(element[0], scope.elementToAddClass),
                containerElement = document.getElementsByClassName(scope.containerClass)[0],
                containerOffsetTop = containerElement.offsetTop || 0,
                PADDING = 10;

            function updateTopPosition() {
                elementToAdd.style.bottom = '';
                var boundingBox = element[0].getBoundingClientRect(),
                    elementToAddHeight = elementToAdd.clientHeight,
                    winHeight = $window.innerHeight,
                    marginFromTop = boundingBox.top - containerOffsetTop,
                    avialableSpace = winHeight - boundingBox.top,
                    differenceRest = avialableSpace - elementToAddHeight;

                if (differenceRest < 0) {
                    marginFromTop = marginFromTop + differenceRest - PADDING;
                }
                if (marginFromTop < 0) {
                    marginFromTop = PADDING;
                    elementToAdd.style.bottom = 0;
                }
                if(scope.defaultOffset) {
                    marginFromTop = (marginFromTop - parseInt(scope.defaultOffset, 10)) < 0 ? 0 : marginFromTop - parseInt(scope.defaultOffset, 10);
                }
                elementToAdd.style.top = marginFromTop + 'px';
            }

            element.on('mouseenter ', updateTopPosition);

            scope.$on('$destroy', function() {
                element.off('mouseenter ', updateTopPosition);
            })
        }
    };
}]);
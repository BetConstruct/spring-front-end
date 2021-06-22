/* global VBET5 */
/**
 * @ngdoc directive
 * @name vbet5.directive:resizer
 * @element ANY
 * @param {String} target target element id
 * @param {Number} initial-width initial width of target element
 * @param {Number} initial-height initial height of target element
 * @param {Number} [min-height] optional. minimal height that target element can be resized to
 * @param {Number} [min-width]  optional. minimal width  that target element can be resized to
 * @param {String} [preserve-aspect-ratio]  optional. if specified, aspect ratio will be preserved when resizing
 *
 * @description Makes **target** resizable. Element having the "resizer" attribute becomes resize handle
  */
VBET5.directive('resizer', ['$document', '$rootScope', '$window', '$timeout', function ($document, $rootScope, $window, $timeout) {
    'use strict';
    return function (scope, element, attr) {
        var initialPointerCoords = {}, initialSize = {}, x, y, aspectRatio, targetElement;

        function mousemove(event) {
             var leftButtonIsDown = event.buttons === undefined ? event.which === 1 : event.buttons === 1;
            if (!leftButtonIsDown) {
                mouseup();
                return;
            }
            x = event.pageX - initialPointerCoords.x;
            y = event.pageY - initialPointerCoords.y;

            var minHeight = parseInt(attr.minHeight, 10),
                minWidth = parseInt(attr.minWidth, 10),
                maxHeight = parseInt(attr.maxHeight, 10),
                maxWidth = parseInt(attr.maxWidth, 10);

            if (minHeight  && (initialSize.y + y < minHeight)) {
                y = minHeight - initialSize.y;
            }
            if (minWidth && (initialSize.x + x < minWidth)) {
                x = minWidth - initialSize.x;
            }
            if (maxHeight && (initialSize.y + y > maxHeight)) {
                y = maxHeight - initialSize.y;
            }
            if (maxWidth && (initialSize.x + x > maxWidth)) {
                x = maxWidth - initialSize.x;
            }

            if (attr.preserveAspectRatio !== undefined) {
                if (x > y) {
                    x = y * aspectRatio;
                } else if (x < y) {
                    y = x / aspectRatio;
                }
            }
            targetElement.css({ width: initialSize.x + x + 'px', height: initialSize.y + y + 'px'});
        }

        function mouseup() {
            initialSize.x += x;
            initialSize.y += y;
            $document.unbind('mousemove', mousemove);
            $document.unbind('mouseup', mouseup);
        }

        function setUp() {
            targetElement = angular.element($window.document.getElementById(attr.target));
            if (targetElement[0] === undefined) { //it may not be available immediately, try waiting a moment
                $timeout(setUp, 100);
                return;
            }
            initialSize.x = parseInt(attr.initialWidth, 10);
            initialSize.y = parseInt(attr.initialHeight, 10);
            targetElement.css({ width: initialSize.x + 'px', height: initialSize.y +  'px'});
            aspectRatio = initialSize.x / initialSize.y;

            element.on('mousedown', function (event) {
                console.log(initialSize);
                initialPointerCoords.x = event.pageX;
                initialPointerCoords.y = event.pageY;
                event.preventDefault();
                event.stopPropagation();
                $document.on('mousemove', mousemove);
                $document.on('mouseup', mouseup);
            });
        }

        setUp();

        scope.$on('$destroy', function() {
            element.off('mousedown');
        })

    };
}]);

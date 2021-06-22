/* global VBET5 */
/**
 * @ngdoc directive
 * @name vbet5.directive:draggable
 * @element ANY
 * @param {String} [container] container element id, optional.
 *
 * If specified, when toggling dragging, element will be moved to DOM element specified container(when draggable)
 * or back.  This is needed when draggable element parent may become unavailable but it still have to be shown
 * (e.g. game is closed, but it's monitor should remain pinned)
 *
 * @description Makes element draggable.
 *
 * Also adds toggleDragging() function to scope, which enables/disables dragging.
 *
 * When toggling dragging,  a message **'draggable.on'**  or **'draggable.off'** is broadcasted.
 * Message data is an object of element attributes.
 *
 */
VBET5.directive('draggable', ['Config', '$document', '$rootScope', '$window', 'DomHelper',  function (Config, $document, $rootScope, $window, DomHelper) {
    'use strict';
    return function (scope, element, attr) {

        var startX = 0, startY = 0, x = 0, y = 0, initialX = 0, initialY = 0, backup = {}, isNowDraggable = false, container = null, leftShift = $window.innerWidth - 660;
        scope.isDraggable = false;

        if (attr.container !== undefined) {
            container = $window.document.getElementById(attr.container);
        }

        scope.toggleDragging = function toggleDragging() {

            isNowDraggable = !isNowDraggable;
            if (isNowDraggable) {
                scope.isDraggable = true;
                startX = 0;
                startY = 0;
                backup.parent   = element.parent()[0];
                backup.position = element.css('position');
                backup.cursor   = element.css('cursor');
                backup.top      = element.css('top');
                backup.left     = element.css('left');
                x = leftShift;
                y = DomHelper.getOffset(element[0]).top;
                if (y < 0) {
                    if (Config.main.sportsLayout === "combo") {
                        y = $window.innerHeight / 4 // at what height to show the popup on browser window "px"
                    } else if (Config.main.sportsLayout === "modern") {
                        y = $window.innerHeight / 4;  // at what height to show the popup on browser window "px"
                        x = leftShift = $window.innerWidth - 960;
                    }
                }
                if (container) {
                    angular.element(container).append(element);
                }
                element.css({
                    position: 'fixed',
                    cursor: 'pointer',
                    top: y + 'px',
                    left: x + 'px',
                    zIndex: 999999
                });
                element.addClass('draggable');
                $rootScope.$broadcast('draggable.on', attr);
            } else {
                scope.isDraggable = false;
                //restore
                element.css(backup);
                if (container) {
                    angular.element(backup.parent).append(element);
                }
                element.removeClass('draggable');
                $rootScope.$broadcast('draggable.off', attr);
            }
        };

        scope.toggleDragging();

        function mousemove(event) {
            if (!isNowDraggable) {
                return;
            }
            var leftButtonIsDown = event.buttons === undefined ? event.which === 1 : event.buttons === 1;
            if (!leftButtonIsDown) {
                mouseup();
                return;
            }
            scope.dragging = true;

            y = event.screenY - startY;
            x = event.screenX - startX;
            console.log("event.screenX = "+event.screenX);
            console.log("startX = "+startX);
            element.css({
                top: y + 'px',
                left: x + 'px'
            });
        }

        function isInViewport(el) {
            var rect = el[0].getBoundingClientRect();
            return (
                rect.top >= 0 &&
                rect.left >= 0 &&
                rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
                rect.right <= (window.innerWidth || document.documentElement.clientWidth)

            );
        }

        function mouseup() {
            if (!isNowDraggable) {
                return;
            }
            scope.dragging = false;


            $document.off('mousemove', mousemove);
            $document.off('mouseup', mouseup);
            if (!isInViewport(element)) {
                element.css({
                    left: initialX + "px",
                    top: initialY + "px"
                });
                x = initialX;
                y = initialY;
            }
        }


        element.on('mousedown', function (event) {
            if (!isNowDraggable || (attr.dragFrom && event.target.parentElement.id !== attr.dragFrom)) {
                return;
            }
            if (attr.allowOtherMouseEvents === undefined)
            {
                event.preventDefault();
            }
            initialX = x;
            initialY = y;
            startX = event.screenX - x;
            startY = event.screenY - y;
            $document.on('mousemove', mousemove);
            $document.on('mouseup', mouseup);
        });

        scope.$on('$destroy', function() {
            element.off('mousedown');
        });
    };
}]);

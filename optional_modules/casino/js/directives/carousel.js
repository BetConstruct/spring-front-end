/**
 * @ngdoc directive
 * @name CASINO.directive:carouselSlider
 *
 * @description Carousel Slider
 */
CASINO.directive('carouselSlider', ['$window', function ($window) {
    'use strict';

    return {
        restrict: 'E',
        replace: true,
        template: '<ul  class="slider-main"><li class="slider-arrow" ng-click="changeActiveSlide(-1)" ></li><li><div class="slider-wrapper" ></div></li><li class="slider-arrow" ng-click="changeActiveSlide(+1)"></li></ul>',
        scope: {
            items: '=',
            selectedItem: '=',
            itemsToShow: '=',
            changeCallback: '='
        },
        link: function (scope, element, attr) {
            var body = $window.document.body;
            var container = element[0].getElementsByClassName('slider-wrapper')[0];
            var itemNodes = [];
            var transitionEnabled = true;
            var position = 0;
            var currentIndex = 0;
            var timeout;

            scope.changeActiveSlide = function changeActiveSlide(arrow, index) {
                clearTimeout(timeout);
                var length = processedItems.length;

                if (index) {
                    arrow = index - currentIndex;
                }

                processedItems[currentIndex].selected = false;
                itemNodes[currentIndex].className = itemNodes[currentIndex].className.replace(' active', '');

                if (arrow < 0 && currentIndex <= scope.items.length) {
                    currentIndex = length - scope.items.length;
                    setTransition(false);
                    setPosition(currentIndex);
                    timeout = setTimeout(move, 0);
                } else if (arrow > 0 && currentIndex >= length - scope.items.length - 1) {
                    currentIndex = scope.items.length - 1;
                    setTransition(false);
                    setPosition(currentIndex);
                    timeout = setTimeout(move, 0);
                } else {
                    move();
                }

                function move() {
                    setTransition(true);
                    currentIndex += arrow;

                    scope.selectedItem = processedItems[currentIndex].name;
                    itemNodes[currentIndex].className += ' active';


                    if (scope.changeCallback && typeof scope.changeCallback === 'function') {
                        scope.changeCallback(scope.selectedItem);
                    }

                    processedItems[currentIndex].selected = true;
                    setPosition(currentIndex);
                }
            };

            function setPosition(index, value) {
                if (index) {
                    currentIndex = index;
                    value = position = index * -20 + 40;
                }
                container.style.transform = "translate3d(" + value + "%,0,0)";

            }

            function setTransition(value) {
                if (transitionEnabled !== value) {
                    container.style.transition = value ? null : "none";
                    transitionEnabled = value;
                }

            }

            var processedItems = [];

            function processItemsList() {
                var hasSelected = false;

                var length = scope.items.length;
                processedItems = [];
                var index = 0;

                var K = Math.ceil(scope.itemsToShow * 4 / length);

                for (var i = 0; i < length * K; i++) {
                    var item = {
                        name: scope.items[index % length].name,
                        image: scope.items[index % length].image,
                        order: index
                    };
                    if (item.name === scope.selectedItem && index >= scope.itemsToShow && index < length + scope.itemsToShow) {
                        item.selected = true;
                        hasSelected = true;
                        setPosition(index);
                    }
                    processedItems.push(item);
                    index++;
                }

                if (!hasSelected) {
                    processedItems[scope.itemsToShow].selected = true;
                    setPosition(scope.itemsToShow);
                    scope.selectedItem = processedItems[scope.itemsToShow].name;
                    scope.changeCallback(scope.selectedItem);
                }

                return processedItems;
            }

            function drawItems(items) {
                itemNodes = [];
                if (container) {
                    container.innerHTML = "";
                    items.forEach(function (item, $index) {
                        var div = document.createElement('DIV');
                        div.className = 'item item-' + item.name;
                        if (item.selected) {
                            div.className += ' active';
                        }

                        div.dataset.index = $index;
                        // div.innerHTML = '<br> '+ item.name + '<br>'+ $index;
                        container.appendChild(div);
                        itemNodes.push(div);
                    });
                }
            }

            function init() {
                var startX = 0;
                var xDiff = 0;

                function mouseMove(e) {
                    var positionK = -100 / container.offsetWidth;
                    xDiff = startX - e.clientX;

                    setPosition(null, position + parseInt((xDiff) * positionK));
                    console.log("**********", "mouseMove");
                }

                function mouseUp(e) {
                    container.className = container.className = 'slider-wrapper';

                    e.target.style.border = null;
                    var itemWidth = itemNodes[0].offsetWidth;
                    body.removeEventListener('mousemove', mouseMove);
                    body.removeEventListener('mouseup', mouseUp);
                    setTransition(true);

                    if (Math.abs(xDiff) > 5) {
                        var step = Math.round(xDiff / itemWidth);
                        if (Math.abs(step) === 0) {
                            step = xDiff > 0 ? 1 : -1;
                        }
                        scope.changeActiveSlide(step);
                    } else {
                        scope.changeActiveSlide(null, e.target.dataset.index);
                    }

                    startX = 0;
                    xDiff = 0;
                    console.log("**********", "mouseUp");
                }

                function mouseDown(e) {
                    container.className += ' grabbing';
                    setTransition(false);

                    startX = e.clientX;
                    body.addEventListener('mousemove', mouseMove);
                    body.addEventListener('mouseup', mouseUp);
                    console.log("**********", "mouseDown");
                }
                drawItems(processItemsList());

                function removeAllEvents() {
                    console.log("**********", "removeAllEvents");
                    container.removeEventListener('mousedown', mouseDown);
                    body.removeEventListener('mousemove', mouseMove);
                    body.removeEventListener('mouseup', mouseUp);
                }

                removeAllEvents();

                container.addEventListener('mousedown', mouseDown);
                scope.$on('$destroy', function () {
                    removeAllEvents();
                    if (timeout) {
                        clearTimeout(timeout);
                        timeout = undefined;
                    }
                });
            }

            init();

        }
    };
}]);
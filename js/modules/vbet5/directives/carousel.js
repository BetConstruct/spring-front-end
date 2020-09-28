/* global VBET5 */
/**
 * @ngdoc directive
 * @name vbet5.directive:carousel
 * @description A carousel slider is created, the elements are obtained from the config
 */
VBET5.directive('carousel', ['$interval',
    function ($interval) {
        // 'use strict';
        return {
            templateUrl: 'templates/directive/footer-slider.html',
            restrict: 'E',
            scope: {
                itemsPerPage: '=',
                items: '=',
                htmlToInclude: '='
            },
            compile: function compile() {
                return {
                    post: function (scope, element) {
                        var slideInterval,
                            slides,
                            currentPage = 0;
                        scope.sliderDirection = 'right';

                        function groupingItems(items, size) {
                            var chunked_arr = [];
                            var index = 0;
                            while (index < items.length) {
                                chunked_arr.push(items.slice(index, size + index));
                                index += size;
                            }
                            var lastGroup = chunked_arr[chunked_arr.length - 1];
                            var refillCount = scope.itemsPerPage - lastGroup.length;
                            if (refillCount > 0) {
                                var refillItems = chunked_arr[0].slice(chunked_arr[0].length - refillCount);
                                chunked_arr[chunked_arr.length - 1] = lastGroup.concat(refillItems);
                            }
                            return chunked_arr;

                        }

                        function autoPlaySlide() {
                            scope.addClass = true;
                            scope.$broadcast("toggleAnimation", true);
                            slideInterval = $interval(function () {
                                scope.playSlide(scope.sliderDirection, true);
                            }, 4000);
                        }

                        function stopSlide() {
                            $interval.cancel(slideInterval);
                        }

                        scope.playSlide = function playSlide(direction, notAddClass) {
                            scope.sliderDirection = direction;
                            if (!notAddClass) {
                                scope.addClass = false;
                                scope.$broadcast("toggleAnimation", false);

                            }
                            if (direction === 'right') {
                                currentPage++;
                            } else if (direction === 'left') {
                                currentPage = currentPage - 1 + slides.length;
                            }
                            currentPage = currentPage % (slides ? slides.length : 0);
                            scope.currentSlide = slides ? slides[currentPage] : [];
                        };

                        if (scope.items && scope.items.length) {
                            if (scope.itemsPerPage >= scope.items.length) {
                                scope.currentSlide = scope.items;
                            } else {
                                slides = groupingItems(scope.items, scope.itemsPerPage);
                                scope.currentSlide = slides[currentPage];
                                autoPlaySlide();
                                element.on('mouseover', stopSlide);
                                element.on('mouseleave', autoPlaySlide);
                            }
                        }

                        scope.$on('$destroy', function () {
                            element.off('mouseover');
                            element.off('mouseleave');
                        });
                    }
                };
            }
        };
    }
]);

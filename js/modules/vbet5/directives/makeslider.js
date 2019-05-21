/* global VBET5 */
/**
 * @ngdoc directive
 * @name vbet5.directive:betslipscroll
 * @description keep betslip visible in case of page scrolling
 *
 * @param {string} scrollable-area-id id of element containing the scrollable area which must be watched
 * @param {string} footer-id id of footer element
 * @param {string} watch-elements space delimited list of additional elements ids to monitor and reposition betslip on height change
 */
VBET5.directive('makeSlider', ['Config', '$interval', function (Config, $interval) {
    'use strict';
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {

            scope.moveSliderTo = function modeSliderTo(index) {
                if (index !== undefined) {
                    scope.currentIndex = index;
                } else {
                    if (scope.currentIndex === attrs.itemsCount - 1) {
                        scope.currentIndex = 0;
                    } else {
                        scope.currentIndex++;
                    }
                }
            };

            scope.nextSlide = function nextSlide() {
                if (scope.currentIndex !== attrs.itemsCount - 1) {
                    scope.currentIndex++;
                } else if (attrs.moveRoundly) {
                    scope.currentIndex = 0;
                }
            };

            scope.prevSlide = function prevSlide() {
                if (scope.currentIndex !== 0) {
                    scope.currentIndex--;
                } else if (attrs.moveRoundly) {
                    scope.currentIndex = attrs.itemsCount - 1;
                }
            };

            scope.togglePausingMultiSlideRotation = function togglePausingMultiSlideRotation(customPausing) {
                if(undefined !== customPausing) {
                    scope.multiSlideRotationPaused = customPausing;
                } else {
                    scope.multiSlideRotationPaused = !scope.multiSlideRotationPaused;
                }
            };

            function prepareMultiSlideFeaturedGames() {
                if (scope.currentIndex === undefined) {
                    scope.currentIndex = 0;
                    scope.multiSlideRotationPaused = false;
                    multiSlideInterval = $interval(function () {
                        if (!scope.multiSlideRotationPaused) {
                            scope.moveSliderTo();
                        }
                    },  attrs.sliderRotatingInterval || 5000);
                }
            }

            if (undefined !== attrs.autoRotateSlides) {
                var multiSlideInterval;
                prepareMultiSlideFeaturedGames();
            } else {
                scope.currentIndex = 0;
            }

            scope.$on('$destroy', function () {
                if (multiSlideInterval) {
                    $interval.cancel(multiSlideInterval);
                    multiSlideInterval = undefined;
                }
            });

        }
    }
}]);
/* global VBET5 */
/**
 * @ngdoc directive
 * @name vbet5.directive:vbetBigSlider
 * @description Big slider widget
 */
VBET5.directive('casinoGameSlider', ['$interval', '$window', 'Config', function ($interval, $window, Config) {
    'use strict';
    return {
        restrict: 'E',
        replace: true,
        templateUrl: 'templates/directive/casino-game-slider.html',
        scope: {
            productSlides: '=',
            pageName: '@'
        },
        link: function (scope) {
            var bannersInterval;
            scope.selectedIndex = 0;

            /**
             * @ngdoc method
             * @name rotateSlides
             * @description Automatically start slides animation
             */
            function rotateSlides() {
                if (scope.rotationPaused) {
                    return;
                }
                if (scope.selectedIndex < scope.productSlides.length - 1) {
                    scope.selectedIndex++;
                } else {
                    scope.selectedIndex = 0;
                }
            }

            /**
             * @ngdoc method
             * @name selectSlide
             * @description Automatically start slides animation
             */
            scope.selectSlide = function selectSlide(index) {
                if (bannersInterval) {
                    $interval.cancel(bannersInterval);
                    bannersInterval = $interval(rotateSlides, Config.main[scope.pageName + 'SlidesRotationPeriod'] || 5000);
                }
                scope.selectedIndex = index;
            };

            /**
             * create time interval in that case when pages of slides more than 1
             */
            if (scope.productSlides) {
                createInterval();
            } else {
                var productSlidesWatcherPromise = scope.$watch('productSlides', function() {
                    if (scope.productSlides) {
                        createInterval();
                        productSlidesWatcherPromise();
                    }
                });
            }

            function createInterval() {
                if (scope.productSlides.length > 1) {
                    bannersInterval = $interval(rotateSlides, Config.main[scope.pageName + 'SlidesRotationPeriod'] || 5000);
                }
            }


            scope.openUrl = function openUrl(url, target) {
                url && $window.open(url, target || '_self');
            };
            /**
             * clear interval
             */
            scope.$on('$destroy', function () {
                $interval.cancel(bannersInterval);
            });
        }
    };
}]);
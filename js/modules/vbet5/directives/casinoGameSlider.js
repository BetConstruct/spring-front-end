/* global VBET5 */
/**
 * @ngdoc directive
 * @name vbet5.directive:vbetBigSlider
 * @description Big slider widget
 */
VBET5.directive('casinoGameSlider', ['$interval', '$window', '$location', 'Config', function ($interval, $window, $location, Config) {
    'use strict';
    return {
        restrict: 'E',
        replace: true,
        templateUrl: 'templates/directive/casino-game-slider.html',
        scope: {
            productSlides: '=',
            jackpotSource: '=',
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
                    bannersInterval = $interval(rotateSlides, Config.main[scope.pageName && scope.pageName.replace(/\s/g, '') + 'SlidesRotationPeriod'] || 5000);
                }
                scope.selectedIndex = index;
                scope.selectedIndex = scope.selectedIndex > scope.productSlides.length - 1 ? 0 : scope.selectedIndex;
                scope.selectedIndex = scope.selectedIndex < 0 ? scope.productSlides.length - 1 : scope.selectedIndex;
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
                    bannersInterval = $interval(rotateSlides, Config.main[scope.pageName && scope.pageName.replace(/\s/g, '') + 'SlidesRotationPeriod'] || 5000);
                }
            }


            scope.openUrl = function openUrl(url) {
                if (url.indexOf($location.path()) !== -1) { // url path and current path is same
                    var locationChangePromise = scope.$on('$locationChangeSuccess', function () {
                        locationChangePromise();
                        var searchParams = $location.search();
                        if (searchParams.game !== undefined || searchParams.provider !== undefined) {
                            var data = {};
                            if (searchParams.game) {
                                data.gameId = searchParams.game;
                                data.playMode = searchParams.type;
                                data.studio = searchParams.studio;
                            }
                            if (searchParams.provider) {
                                data.provider = searchParams.provider;
                            }
                            scope.$emit('casinoGamesList.openGame', data);
                        }
                    });
                }
            };
            /**
             * clear interval
             */
            scope.$on('$destroy', function () {
                $interval.cancel(bannersInterval);
                bannersInterval = undefined;
            });
        }
    };
}]);

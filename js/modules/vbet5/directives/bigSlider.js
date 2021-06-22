/* global VBET5 */
/**
 * @ngdoc directive
 * @name vbet5.directive:vbetBigSlider
 * @description Big slider widget
 */
VBET5.directive('vbetBigSlider', ['$rootScope', '$timeout', '$route', '$interval', 'Config', function ($rootScope, $timeout, $route, $interval, Config) {
    'use strict';
    return {
        restrict: 'E',
        replace: false,
        templateUrl: 'templates/directive/big-slider.html',
        scope: {
            sliderTemplate: '=',
            images: '=',
            additionalData: '=',
            linkClickHandler: '&'
        },
        link: function (scope) {
            scope.index = 0;
            var stopInterval;
            /**
             * @description Slides click handler
             * @param {String} banner the banner Object
             * @param {String} currentRoute the current route
             */
            scope.linkClick = function (banner, currentRoute) {
                if (banner.isYouTubeVideo) {
                    $rootScope.$broadcast('youtube.videourl', banner.link);
                } else if (banner.link) {
                    if (scope.linkClickHandler) {
                        scope.linkClickHandler()(banner.link);
                    }

                    //in these cases no need reload route
                    if (currentRoute !== '/casino/' && currentRoute !== '/' && banner.link.indexOf(currentRoute) > -1) {
                        $timeout(function () { $route.reload(); }, 100);
                    }
                }
            };

            scope.changeActiveBanner = function changeActiveBanner(activeIndex) {
                scope.index = activeIndex < 0 ? scope.images.length - 1 : activeIndex > scope.images.length - 1 ? 0 : activeIndex;
            };

            /**
             * @description Automatically start slides animation
             */
            function animateBanners() {
                if (scope.rotationPaused || !scope.images) {
                    return;
                }
                if (scope.index === scope.images.length - 1) {
                    scope.index = 0;
                } else {
                    scope.index++;
                }
            }
            stopInterval = $interval(animateBanners, Config.main.featuredGames.rotationPeriod);

            scope.$on('$destroy', function () {
                $interval.cancel(stopInterval);
                stopInterval = undefined;
            });

            scope.$watch('images', function () {
                if (scope.images && scope.index > scope.images.length -1) {
                    scope.index = 0;
                }
            });



        }
    };
}]);

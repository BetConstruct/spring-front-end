/**
 * @ngdoc directive
 * @name CASINO.directive:frameControl
 * @element ANY
 * @param {Number} initial-width initial width of target element
 * @param {Number} initial-height initial height of target element
 * @param {String} [aspect-ratio]  aspect ratio of target element
 * @param {String} number-of-window  Number of windows in initial window
 *
 * @description Makes **target** resizable. Element having the "frame-control" attribute becomes resize handle
 */
CASINO.directive('frameControl', ['$window', '$timeout', 'UserAgent', function ($window, $timeout, UserAgent) {
    'use strict';
    return function (scope, element, attr) {
        var scaleWidth, scaleHeight, scale;
        var definitiveWidth, definitiveHeight;
        var resizeWatcherPromise;

        var windowResize = function () {
            var wWidth, wHeight;

            switch (attr.numberOfWindow) {
                case "1":
                    wWidth = $window.innerWidth - 60;
                    wHeight = $window.innerHeight - 95;
                    if (attr.aspectRatio && attr.aspectRatio !== '0' && attr.aspectRatio !== '') {
                        var ratios = attr.aspectRatio.split(':');
                        var originWidth = wHeight * ratios[0] / ratios[1];

                        scaleWidth = wWidth / originWidth;
                        scaleHeight = 1;
                        scale = scaleWidth <= scaleHeight ? scaleWidth : scaleHeight;

                        definitiveWidth = scale * originWidth;
                        definitiveHeight = scale * wHeight;
                    } else {
                        if (attr.initialWidth && attr.initialHeight) {

                            scaleWidth = wWidth / attr.initialWidth;
                            scaleHeight = wHeight / attr.initialHeight;
                            scale = scaleWidth <= scaleHeight ? scaleWidth : scaleHeight;

                            definitiveWidth = scale * attr.initialWidth;
                            definitiveHeight = scale * attr.initialHeight;
                        } else {
                            definitiveWidth = wWidth - 50;
                            definitiveHeight = wHeight - 50;
                        }
                    }

                    break;

                case "2":
                case "4":
                    wWidth = $window.innerWidth - 120;
                    wHeight = $window.innerHeight - (attr.numberOfWindow == "2" ? 0 : 160);

                    definitiveWidth = wWidth / 2;
                    definitiveHeight = wHeight / (attr.numberOfWindow == "4" ? 2 : 3 / 2);

                    if (definitiveWidth / definitiveHeight > 16 / 9 || definitiveWidth / definitiveHeight < 4 / 3) {
                        var ratio = definitiveWidth / definitiveHeight > 16 / 9 ? 16 / 9 : 4 / 3;
                        var originWidth = definitiveHeight * ratio;

                        scaleWidth = definitiveWidth / originWidth;
                        scaleHeight = 1;
                        scale = scaleWidth <= scaleHeight ? scaleWidth : scaleHeight;

                        definitiveWidth = scale * originWidth;
                        definitiveHeight = scale * definitiveHeight;
                    }

                    break;
            }

            element.css({ width: definitiveWidth + 'px', height: definitiveHeight + 'px'});
        };

        attr.$observe('numberOfWindow', function (value) {
            windowResize();
        });

        windowResize();

        angular.element($window).bind('resize', function () {
            if (resizeWatcherPromise) {
                $timeout.cancel(resizeWatcherPromise);
            }
            resizeWatcherPromise = $timeout(windowResize, 200);
        });

        //ie 11 bug fix
        if (UserAgent.IEVersion()) {
            scope.$on("$destroy", function() {
                element[0].src = "about:blank";
                element[0].parentNode.removeChild(element[0]);
            });
        }
    };
}]);

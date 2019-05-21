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

        var SIDEBAR_WIDTH = 220;
        var BOTTOM_BAR_HEIGHT = 68;

        var windowResize = function () {
            var wWidth, wHeight, aspectRationNumber;



            console.info('ratio',attr.allRatio);

            switch (attr.numberOfWindow) {
                case "1":
                    wWidth = $window.innerWidth - 60; // 60px - game controls
                    wHeight = $window.innerHeight - 95; // 95px - header
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
                            definitiveWidth = wWidth; //- 50;
                            definitiveHeight = wHeight; //- 50;
                        }
                    }
                    if (attr.hasBottomBar === "true") {
                        aspectRationNumber = definitiveWidth / definitiveHeight;
                        definitiveHeight = definitiveHeight - BOTTOM_BAR_HEIGHT;
                        definitiveWidth = definitiveHeight * aspectRationNumber;
                    }
                    break;
                case "2":
                case "4":
                    wWidth = $window.innerWidth - 120;
                    wHeight = $window.innerHeight - (attr.numberOfWindow == "2" ? 0 : 160);

                    definitiveWidth = wWidth / 2;
                    definitiveHeight = wHeight / (attr.numberOfWindow == "4" ? 2 : 3 / 2);

                    if (attr.allRatio || definitiveWidth / definitiveHeight > 16 / 9 || definitiveWidth / definitiveHeight < 4 / 3) {

                        var ratio, originWidth;

                        if (attr.allRatio) {
                            ratios = attr.allRatio.split(':');
                            originWidth = definitiveHeight * ratios[0] / ratios[1];
                        } else {
                            ratio = definitiveWidth / definitiveHeight > 16 / 9 ? 16 / 9 : 4 / 3;
                            originWidth = definitiveHeight * ratio;
                        }


                        scaleWidth = definitiveWidth / originWidth;
                        scaleHeight = 1;
                        scale = scaleWidth <= scaleHeight ? scaleWidth : scaleHeight;


                        definitiveWidth = scale * originWidth;
                        definitiveHeight = scale * ( definitiveHeight);
                    }
                    break;
            }

            if (attr.hasSidebar === "true") {
                aspectRationNumber = definitiveWidth / definitiveHeight;
                definitiveWidth = definitiveWidth - SIDEBAR_WIDTH;
                definitiveHeight = definitiveWidth / aspectRationNumber;
            }

            element.css({width: definitiveWidth + 'px', height: definitiveHeight + 'px'});
        };

        attr.$observe('hasSidebar', windowResize);
        attr.$observe('hasBottomBar', windowResize);
        attr.$observe('allRatio', windowResize);

        attr.$observe('numberOfWindow', windowResize);

        windowResize();

        scope.$on('onWindowResize', function () {
            if (resizeWatcherPromise) {
                $timeout.cancel(resizeWatcherPromise);
            }
            resizeWatcherPromise = $timeout(windowResize, 200);
        });

        //ie 11 bug fix
        if (UserAgent.IEVersion()) {
            scope.$on("$destroy", function () {
                element[0].src = "about:blank";
                element[0].parentNode.removeChild(element[0]);
            });
        }

        scope.$on('$destroy', function () {
            if (resizeWatcherPromise) {
                $timeout.cancel(resizeWatcherPromise);
                resizeWatcherPromise = undefined;
            }
        })
    };
}]);

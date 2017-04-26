/* global VBET5 */
/**
 * @ngdoc directive
 * @name vbet5.directive:watchResize
 * @element ANY
 * @description
 * watches window resize and broadcasts 'widescreen.on' and 'widescreen.off' messages to the scope.
 * also broadcasts the message on init
 */
VBET5.directive('watchResize', ['Config', 'DomHelper', function (Config, DomHelper) {
    'use strict';
    return function (scope, element, attr) {
        var wideScreen, middleScreen;
        var broadcastWindowSize = function () {
            var windowWidth = DomHelper.getWindowSize().width;
            if (windowWidth >= Config.main.wideScreenModeWidth && wideScreen !== 'on') {
                wideScreen = 'on';
                scope.$parent.$broadcast('widescreen.on');
            } else if (windowWidth < Config.main.wideScreenModeWidth && wideScreen !== 'off') {
                wideScreen = 'off';
                scope.$parent.$broadcast('widescreen.off');
            }
            if (attr.middleScreenMode) {
                if (windowWidth >= Config.main.middleScreenModeWidth && middleScreen !== 'on') {
                    middleScreen = 'on';
                    scope.$parent.$broadcast('middlescreen.on');
                } else if (windowWidth < Config.main.middleScreenModeWidth && middleScreen !== 'off') {
                    middleScreen = 'off';
                    scope.$parent.$broadcast('middlescreen.off');
                }
            }
        };
        DomHelper.onWindowResize(broadcastWindowSize);
        broadcastWindowSize();
    };
}]);
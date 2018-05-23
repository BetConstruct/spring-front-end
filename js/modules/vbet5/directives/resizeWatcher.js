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
        function broadcastWindowSize() {
            var windowWidth = DomHelper.getWindowSize().width;
            if (windowWidth >= 1833 && wideScreen !== 'on') {
                wideScreen = 'on';
                scope.$parent.$broadcast('widescreen.on');
            } else {
                wideScreen = 'off';
                scope.$parent.$broadcast('widescreen.off');
            }
            if (attr.middleScreenMode) {
                if (windowWidth >= 1340 && middleScreen !== 'on') {
                    middleScreen = 'on';
                    scope.$parent.$broadcast('middlescreen.on');
                } else {
                    middleScreen = 'off';
                    scope.$parent.$broadcast('middlescreen.off');
                }
            }
        }

        scope.$on('onWindowResize', broadcastWindowSize);
        broadcastWindowSize();
    };
}]);
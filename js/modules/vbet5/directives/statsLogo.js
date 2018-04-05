/* global VBET5 */
/**
 * @ngdoc directive
 * @name vbet5.directive:statsLogo
 *
 * @description Draws statistics team logo
 *
 */
VBET5.directive('statsLogo', ['Config', function (Config) {
    'use strict';

    return {
        restrict: 'EA',
        replace: false,
        scope: {
            teamId: '=',
            competitionId: '=',
            imageSize: '@size',
            cssClass: '@class',
            cssStyle: '@style'
        },
        template: '<img ng-show="logoId" ng-src="{{logoSrc}}" class="{{cssClass}}" style="width:{{imageSize}}px;height:{{imageSize}}px;{{cssStyles}}" />',
        link: function (scope, elem, attrs) {
            scope.imageSize = scope.imageSize || 16;
            var imageSize,
                style = scope.cssStyle ? [scope.cssStyle] : [],
                logoType = 'e';

            if (scope.imageSize <= 16) {
                imageSize = 's';
            } else if (scope.imageSize <= 48) {
                imageSize = 'm';
            } else {
                imageSize = 'b';
            }

            if (scope.competitionId) {
                scope.logoId = scope.competitionId;
                logoType = 'c';
            } else if (scope.teamId) {
                scope.logoId = scope.teamId;
            }

            if (attrs.right) {
                style.push('float:right');
            }

            scope.cssStyles = style.join(';');
            if (scope.logoId) {
                scope.logoSrc = Config.main.teamLogosPath + logoType + '/' + imageSize + '/' + Math.floor(scope.logoId / 2000) + '/' + scope.logoId + '.png';
            }
        }
    };
}]);

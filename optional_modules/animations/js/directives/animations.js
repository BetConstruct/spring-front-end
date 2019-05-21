VBET5.directive('feedconstructAnimations', ['$rootScope', function ($rootScope) {
    'use strict';

    return {
        restrict: 'E',
        replace: true,
        templateUrl: 'optional_modules/animations/templates/animations.html',
        scope: {
            openGame: '=?'
        },
        link: function (scope) {
            scope.env = $rootScope.env;
         }
    };
}]);
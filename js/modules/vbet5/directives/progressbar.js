VBET5.directive('progressbar', ['$rootScope', function ($rootScope) {
     return {
        templateUrl: function templateUrl (el, attr) {
            return $rootScope.getTemplate(attr.templatePath);
        },
        scope: {
            progressbarPosition: '<?',
            templatePath: '='
        },
        link: function (scope, element, attr) {
            scope.progressbarPositionLocal = scope.progressbarPosition;

            if (scope.progressbarPosition < 0) {
                scope.progressbarPositionLocal = 0;
            }

            if (!scope.progressbarPosition) {
                scope.progressbarPositionLocal = 0;
            }

            if (scope.progressbarPosition > 100) {
                scope.progressbarPositionLocal = 100;
            }
        }
     };
 }]);
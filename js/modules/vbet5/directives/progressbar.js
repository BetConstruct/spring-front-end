VBET5.directive('progressbar', ['$filter', function ($filter) {
     return {
        templateUrl: function templateUrl (el, attr) {
            return $filter('fixPath')(attr.templatePath);
        },
        scope: {
            progressbarPosition: '<?',
            templatePath: '='
        },
        link: function (scope) {
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
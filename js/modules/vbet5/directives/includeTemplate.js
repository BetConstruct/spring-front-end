/* global VBET5 */
/**
 * @ngdoc directive
 * @name vbet5.directive:row
 *
 * @description directive for including template files
 * useful for including templates withing ng-repeats, to avoid using ng-includes
 * as they are non efficient:
 * 1. http://www.bennadel.com/blog/2738-using-ngrepeat-with-nginclude-hurts-performance-in-angularjs.htm
 * 2. http://www.bennadel.com/blog/2740-replacing-nginclude-with-component-directives-in-angularjs.htm
 *
 */
 VBET5.directive('includeTemplate', ['$filter', function ($filter) {
     return {
        templateUrl: function templateUrl (el, attr) {
            return $filter('fixPath')(attr.templatePath);
        }
     };
 }]);
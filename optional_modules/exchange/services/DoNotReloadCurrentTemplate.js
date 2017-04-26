/**
 * Created by arman on 9/7/15.
 * HACK Do not reload the current template if it is not needed.
 */
angular.module('exchange').factory('DoNotReloadCurrentTemplate', [
    '$route',
    '$rootScope',
    function ($route, $rootScope) {
        return function () {
            //var lastRoute = $route.current;
            //var un = $rootScope.$on('$locationChangeSuccess', function () {
            //    $route.current = lastRoute;
            //    un();
            //});
        };
    }
]);

